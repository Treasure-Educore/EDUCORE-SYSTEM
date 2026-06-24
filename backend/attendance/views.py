from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsTeacher, RolePermission
from core.pagination import NoPagination
from students.models import Student

from .models import AttendanceRecord
from .serializers import (
    AttendanceRowSerializer,
    AttendanceSummarySerializer,
    BulkAttendanceSerializer,
)


class CanViewAttendance(RolePermission):
    allowed_roles = ("teacher", "dos", "admin", "head_teacher")


class AttendanceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = NoPagination

    def get_permissions(self):
        if self.action == "bulk_mark":
            permission_classes = (IsTeacher,)
        else:
            permission_classes = (CanViewAttendance,)
        return [permission() for permission in permission_classes]

    def list(self, request):
        stream_id = request.query_params.get("streamId")
        if not stream_id:
            return Response(
                {"detail": "streamId is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        date_str = request.query_params.get("date", str(timezone.localdate()))
        attendance_date = parse_date(date_str)
        if attendance_date is None:
            return Response(
                {"detail": "date must use YYYY-MM-DD format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = Student.objects.filter(
            stream_id=stream_id,
            status=Student.Status.ACTIVE,
        ).order_by("full_name")
        records = AttendanceRecord.objects.filter(
            student__in=students,
            date=attendance_date,
        )
        records_by_student = {record.student_id: record for record in records}

        result = []
        for student in students:
            record = records_by_student.get(student.id)
            result.append(
                {
                    "studentId": student.id,
                    "studentNumber": student.student_number,
                    "studentName": student.full_name,
                    "date": attendance_date,
                    "status": record.status if record else None,
                    "remarks": record.remarks if record else "",
                }
            )

        serializer = AttendanceRowSerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="bulk-mark")
    def bulk_mark(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        stream = data["stream"]
        attendance_date = data["date"]

        with transaction.atomic():
            for record in data["records"]:
                AttendanceRecord.objects.update_or_create(
                    student=record["student"],
                    date=attendance_date,
                    defaults={
                        "stream": stream,
                        "status": record["status"],
                        "remarks": record.get("remarks", ""),
                        "marked_by": request.user,
                    },
                )

        saved = len(data["records"])
        return Response(
            {"detail": f"Attendance marked for {saved} students on {attendance_date}."}
        )

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        stream_id = request.query_params.get("streamId")
        if not stream_id:
            return Response(
                {"detail": "streamId is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = (
            Student.objects.filter(stream_id=stream_id, status=Student.Status.ACTIVE)
            .annotate(
                total_days=Count("attendance"),
                present_count=Count(
                    "attendance",
                    filter=Q(attendance__status="present"),
                ),
                absent_count=Count(
                    "attendance",
                    filter=Q(attendance__status="absent"),
                ),
                late_count=Count(
                    "attendance",
                    filter=Q(attendance__status="late"),
                ),
            )
            .order_by("full_name")
        )

        result = []
        for student in students:
            present = student.present_count
            late = student.late_count
            total = student.total_days
            attendance_percent = round((present + late) / total * 100, 1) if total else 0
            result.append(
                {
                    "studentId": student.id,
                    "studentNumber": student.student_number,
                    "studentName": student.full_name,
                    "totalDays": total,
                    "present": present,
                    "absent": student.absent_count,
                    "late": late,
                    "attendancePercent": attendance_percent,
                }
            )

        serializer = AttendanceSummarySerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="student-summary")
    def student_summary(self, request):
        student_id = request.query_params.get("studentId")
        if not student_id:
            return Response(
                {"detail": "studentId is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(Student, id=student_id)
        totals = AttendanceRecord.objects.filter(student=student).aggregate(
            total=Count("id"),
            present=Count("id", filter=Q(status="present")),
            absent=Count("id", filter=Q(status="absent")),
            late=Count("id", filter=Q(status="late")),
        )
        total = totals["total"]
        present = totals["present"]
        late = totals["late"]
        attendance_percent = round((present + late) / total * 100, 1) if total else 0

        return Response(
            {
                "studentId": str(student.id),
                "studentNumber": student.student_number,
                "studentName": student.full_name,
                "totalDays": total,
                "present": present,
                "absent": totals["absent"],
                "late": late,
                "attendancePercent": attendance_percent,
            }
        )

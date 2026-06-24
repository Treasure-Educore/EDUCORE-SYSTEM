from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsTeacher, RolePermission
from staff.models import Subject
from students.models import Student

from .models import (
    ASSESSMENT_DEFAULTS,
    Assessment,
    ContinuousAssessment,
    Mark,
    MarksSummary,
)
from .serializers import (
    BulkMarkSubmitSerializer,
    ContinuousAssessmentSerializer,
    MarkRowSerializer,
    MarksListQuerySerializer,
    MarksStatusQuerySerializer,
    MarksStatusSerializer,
)


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from core.pagination import NoPagination
from .models import Term


class TermListView(generics.ListAPIView):
    """
    GET /api/terms/
    Returns all terms. Frontend uses this to populate the term dropdown in MarksEntry.
    """
    queryset = Term.objects.all().order_by("academic_year", "name")
    permission_classes = [IsAuthenticated]
    pagination_class = NoPagination

    def list(self, request):
        terms = self.get_queryset()
        return Response([
            {
                "id": str(t.id),
                "name": t.name,
                "academicYear": t.academic_year,
                "isCurrent": t.is_current,
                "displayName": f"{t.name} — {t.academic_year}",
            }
            for t in terms
        ])


class CanViewMarks(RolePermission):
    allowed_roles = ("teacher", "dos", "admin", "head_teacher")


class CanViewMarksStatus(RolePermission):
    allowed_roles = ("dos", "admin", "head_teacher")


class MarksViewSet(viewsets.ViewSet):
    pagination_class = NoPagination

    def get_permissions(self):
        if self.action == "submit":
            permission_classes = (IsTeacher,)
        elif self.action == "status":
            permission_classes = (CanViewMarksStatus,)
        else:
            permission_classes = (CanViewMarks,)
        return [permission() for permission in permission_classes]

    def list(self, request):
        query_serializer = MarksListQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        stream = query_serializer.validated_data["stream"]
        subject = query_serializer.validated_data["subject"]
        term = query_serializer.validated_data["term"]

        students = Student.objects.filter(stream=stream).order_by("student_number")
        summaries = MarksSummary.objects.filter(
            student__in=students,
            subject=subject,
            term=term,
        )
        summary_by_student = {summary.student_id: summary for summary in summaries}

        serializer = MarkRowSerializer(
            students,
            many=True,
            context={"summary_by_student": summary_by_student},
        )
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="submit")
    def submit(self, request):
        serializer = BulkMarkSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        stream = data["stream"]
        subject = data["subject"]
        term = data["term"]
        assessment_label = data["assessment_label"]
        assessment_defaults = ASSESSMENT_DEFAULTS[assessment_label]

        with transaction.atomic():
            assessment, _ = Assessment.objects.get_or_create(
                label=assessment_label,
                term=term,
                defaults={
                    "max_score": assessment_defaults["max_score"],
                    "order": assessment_defaults["order"],
                },
            )

            for mark_data in data["marks"]:
                student = mark_data["student"]
                Mark.objects.update_or_create(
                    student=student,
                    subject=subject,
                    assessment=assessment,
                    defaults={
                        "score": mark_data["score"],
                        "teacher": request.user,
                        "is_submitted": True,
                        "submitted_at": timezone.now(),
                    },
                )
                _rebuild_summary(student, subject, term)

        return Response(
            {"detail": f'Marks submitted for {len(data["marks"])} students.'},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="status")
    def status(self, request):
        query_serializer = MarksStatusQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        stream = query_serializer.validated_data["stream"]
        term = query_serializer.validated_data["term"]

        result = []
        for subject in Subject.objects.all():
            test1_submitted = Mark.objects.filter(
                student__stream=stream,
                subject=subject,
                assessment__label="Test 1",
                assessment__term=term,
                is_submitted=True,
            ).exists()
            test2_submitted = Mark.objects.filter(
                student__stream=stream,
                subject=subject,
                assessment__label="Test 2",
                assessment__term=term,
                is_submitted=True,
            ).exists()
            exam_submitted = Mark.objects.filter(
                student__stream=stream,
                subject=subject,
                assessment__label="Exam",
                assessment__term=term,
                is_submitted=True,
            ).exists()
            result.append(
                {
                    "subjectId": subject.id,
                    "subjectName": subject.name,
                    "test1Submitted": test1_submitted,
                    "test2Submitted": test2_submitted,
                    "examSubmitted": exam_submitted,
                }
            )

        serializer = MarksStatusSerializer(result, many=True)
        return Response(serializer.data)


def _rebuild_summary(student, subject, term):
    marks = {
        mark.assessment.label: mark
        for mark in Mark.objects.select_related("assessment").filter(
            student=student,
            subject=subject,
            assessment__term=term,
        )
    }
    test1 = marks.get("Test 1")
    test2 = marks.get("Test 2")
    exam = marks.get("Exam")

    test1_score = test1.score if test1 else None
    test2_score = test2.score if test2 else None
    exam_score = exam.score if exam else None

    submitted_marks = (test1, test2, exam)
    is_submitted = all(
        mark is not None and mark.is_submitted and mark.score is not None
        for mark in submitted_marks
    )

    if is_submitted:
        total = test1_score + test2_score + exam_score
        grade = MarksSummary.compute_grade(total)
    else:
        total = None
        grade = ""

    summary, _ = MarksSummary.objects.update_or_create(
        student=student,
        subject=subject,
        term=term,
        defaults={
            "test1_score": test1_score,
            "test2_score": test2_score,
            "exam_score": exam_score,
            "total": total,
            "grade": grade,
            "is_submitted": is_submitted,
        },
    )
    return summary


class ContinuousAssessmentViewSet(viewsets.ModelViewSet):
    """
    GET /api/assessments/?streamId=UUID&subjectId=UUID&termId=UUID
    POST /api/assessments/bulk-submit/
    """

    serializer_class = ContinuousAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ContinuousAssessment.objects.select_related(
            "student__stream__class_level",
            "subject",
            "term",
            "teacher",
        ).all()
        stream_id = self.request.query_params.get("streamId")
        subject_id = self.request.query_params.get("subjectId")
        term_id = self.request.query_params.get("termId")
        if stream_id:
            qs = qs.filter(student__stream_id=stream_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if term_id:
            qs = qs.filter(term_id=term_id)
        if self.request.user.role == "teacher":
            qs = qs.filter(teacher=self.request.user)
        return qs.order_by("student__student_number")

    @action(detail=False, methods=["post"], url_path="bulk-submit")
    def bulk_submit(self, request):
        stream_id = request.data.get("streamId")
        subject_id = request.data.get("subjectId")
        term_id = request.data.get("termId")
        records = request.data.get("records", [])

        if not stream_id or not subject_id or not term_id:
            return Response(
                {"detail": "streamId, subjectId, and termId are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(records, list) or not records:
            return Response(
                {"detail": "records must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_student_ids = set(
            Student.objects.filter(stream_id=stream_id).values_list("id", flat=True)
        )

        with transaction.atomic():
            for record in records:
                student_id = record.get("studentId")
                if student_id not in {str(value) for value in valid_student_ids}:
                    return Response(
                        {"detail": f"Student {student_id} is not in the selected stream."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                ContinuousAssessment.objects.update_or_create(
                    student_id=student_id,
                    subject_id=subject_id,
                    term_id=term_id,
                    defaults={
                        "teacher": request.user,
                        "activity1": record.get("activity1"),
                        "activity2": record.get("activity2"),
                        "project": record.get("project"),
                        "remarks": record.get("remarks", ""),
                        "is_submitted": True,
                    },
                )

        return Response({"detail": f"CA records saved for {len(records)} students."})

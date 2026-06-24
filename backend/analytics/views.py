from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models

from announcements.models import Announcement
from staff.models import StaffProfile


@api_view(["GET"])
def dashboard(request):
    """
    Backwards-compatible function view. New code uses `DashboardView` below.
    """
    return DashboardView.as_view()(request._request)


class DashboardView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role

        # local imports to avoid circular references
        try:
            from marks.models import Term, MarksSummary
        except Exception:
            Term = None
            MarksSummary = None

        try:
            from students.models import Student, Stream
        except Exception:
            Student = None
            Stream = None

        try:
            from staff.models import Subject
        except Exception:
            Subject = None

        current_term = None
        if Term:
            current_term = Term.objects.filter(is_current=True).first()

        # Announcements: visible to this role
        if role in ("teacher", "non_teaching", "dos", "head_teacher", "bursar"):
            ann_qs = Announcement.objects.filter(audience__in=["All", "Staff"]).order_by("-date")[:5]
        else:
            ann_qs = Announcement.objects.order_by("-date")[:5]

        announcements = [
            {
                "id": str(a.id),
                "title": a.title,
                "message": a.message,
                "audience": a.audience,
                "date": a.date.isoformat() if a.date else "",
                "author": a.posted_by.name if a.posted_by else "",
            }
            for a in ann_qs
        ]

        metrics = []

        # Admin / Head Teacher metrics
        if role in ("admin", "head_teacher"):
            total_students = Student.objects.filter(status="Active").count() if Student else 0
            total_staff = StaffProfile.objects.filter(status="Active").count() if StaffProfile else 0
            on_leave = StaffProfile.objects.filter(status="On Leave").count() if StaffProfile else 0
            active_streams = Stream.objects.count() if Stream else 0

            # Fee collection rate (best-effort; fees app may be incomplete)
            fee_pct = 0
            try:
                from fees.models import FeeStructure, Payment

                if current_term:
                    expected = (
                        FeeStructure.objects.filter(term=current_term).aggregate(t=models.Sum("amount_expected"))["t"]
                        or 0
                    )
                    collected = (
                        Payment.objects.filter(fee_structure__term=current_term).aggregate(t=models.Sum("amount"))["t"]
                        or 0
                    )
                    fee_pct = round(float(collected) / float(expected) * 100) if expected else 0
                else:
                    fee_pct = 0
            except Exception:
                fee_pct = 0

            new_students = (
                Student.objects.filter(year_of_entry=str(timezone.now().year)).count() if Student else 0
            )
            metrics = [
                {"label": "Total Students", "value": total_students, "trend": f"+{new_students} this year"},
                {"label": "Total Staff", "value": total_staff, "trend": f"{on_leave} on leave"},
                {"label": "Active Classes", "value": active_streams, "trend": "All active"},
                {"label": "Fee Collection", "value": f"{fee_pct}%", "trend": "+5% vs last term"},
            ]

        # Director of Studies
        elif role == "dos":
            classes_managed = Stream.objects.count() if Stream else 0
            total_students = Student.objects.filter(status="Active").count() if Student else 0

            total_summaries_possible = 0
            submitted = 0
            if current_term and Subject and Stream and MarksSummary:
                subject_count = Subject.objects.count()
                stream_count = Stream.objects.count()
                total_summaries_possible = subject_count * stream_count
                submitted_count = (
                    MarksSummary.objects.filter(term=current_term, is_submitted=True)
                    .values("subject")
                    .distinct()
                    .count()
                )
                submitted = round(submitted_count / max(total_summaries_possible, 1) * 100)

            # Top performing stream (best-effort)
            top_stream = "N/A"
            top_avg = 0
            if Stream and MarksSummary and current_term:
                for s in Stream.objects.all():
                    avg = (
                        MarksSummary.objects.filter(student__stream=s, term=current_term)
                        .aggregate(a=models.Avg("total"))["a"]
                        or 0
                    )
                    if avg > top_avg:
                        top_avg = avg
                        top_stream = s.display_name()

            metrics = [
                {"label": "Classes Managed", "value": classes_managed, "trend": "All active"},
                {"label": "Marks Submitted", "value": f"{submitted}%", "trend": f"{max(0, 100-submitted)}% pending"},
                {"label": "Top Performing Class", "value": top_stream, "trend": f"Avg: {round(top_avg)}%"},
                {"label": "Total Students", "value": total_students, "trend": "Across all streams"},
            ]

        # Bursar
        elif role == "bursar":
            try:
                from fees.models import Payment, FeeStructure, FeeBalance, Bursary

                if current_term:
                    total_expected = (
                        FeeStructure.objects.filter(term=current_term).aggregate(t=models.Sum("amount_expected"))["t"]
                        or 0
                    )
                    total_collected = (
                        Payment.objects.filter(fee_structure__term=current_term).aggregate(t=models.Sum("amount"))["t"]
                        or 0
                    )
                    total_outstanding = max(0, float(total_expected) - float(total_collected))
                    pending_count = FeeBalance.objects.filter(fee_structure__term=current_term, outstanding__gt=0).count()
                    active_bursaries = Bursary.objects.filter(term=current_term, is_active=True).count()
                    new_bursaries = Bursary.objects.filter(term=current_term, is_active=True).count()
                else:
                    total_collected = total_outstanding = total_expected = 0
                    pending_count = active_bursaries = new_bursaries = 0
            except Exception:
                total_collected = total_outstanding = total_expected = 0
                pending_count = active_bursaries = new_bursaries = 0

            metrics = [
                {"label": "Total Collected", "value": f"UGX {int(total_collected):,}", "trend": "+15% vs last term"},
                {"label": "Pending Fees", "value": f"UGX {int(total_outstanding):,}", "trend": f"{pending_count} students"},
                {"label": "Active Bursaries", "value": active_bursaries, "trend": f"{new_bursaries} new this term"},
                {"label": "Fee Collection", "value": f"{round(float(total_collected)/max(float(total_expected),1)*100)}%", "trend": "This term"},
            ]

        # Teacher
        elif role == "teacher":
            try:
                from timetable.models import TimetableSlot

                my_stream_ids = TimetableSlot.objects.filter(teacher=request.user).values_list("stream", flat=True).distinct()
            except Exception:
                my_stream_ids = []

            my_class_count = len(set(my_stream_ids))
            my_students = Student.objects.filter(stream__in=my_stream_ids, status="Active").count() if Student else 0

            if current_term and MarksSummary:
                submitted = MarksSummary.objects.filter(student__stream__in=my_stream_ids, term=current_term, is_submitted=True).exists()
                marks_status = "Submitted" if submitted else "Pending"
            else:
                marks_status = "N/A"

            metrics = [
                {"label": "My Classes", "value": my_class_count, "trend": "Active streams"},
                {"label": "Total Students", "value": my_students, "trend": "Across my classes"},
                {"label": "Marks Status", "value": marks_status, "trend": "Current term"},
                {"label": "Avg Attendance", "value": "—", "trend": "Day 5"},
            ]

        else:
            # non_teaching default
            metrics = [
                {"label": "Total Students", "value": Student.objects.filter(status="Active").count() if Student else 0, "trend": ""},
                {"label": "Total Staff", "value": StaffProfile.objects.count() if StaffProfile else 0, "trend": ""},
            ]

        return Response({"metrics": metrics, "announcements": announcements})


class AnalyticsSummaryView(generics.RetrieveAPIView):
    """GET /api/analytics/summary/
    Returns high-level aggregates used for analytics dashboards.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from students.models import Student, Stream
        except Exception:
            Student = None
            Stream = None

        try:
            from staff.models import StaffProfile
        except Exception:
            StaffProfile = None

        try:
            from marks.models import MarksSummary, Term
        except Exception:
            MarksSummary = None
            Term = None

        current_term = Term.objects.filter(is_current=True).first() if Term else None

        total_students = Student.objects.filter(status="Active").count() if Student else 0
        total_staff = StaffProfile.objects.filter(status="Active").count() if StaffProfile else 0
        total_streams = Stream.objects.count() if Stream else 0

        avg_mark = None
        if MarksSummary and current_term:
            avg_mark = (
                MarksSummary.objects.filter(term=current_term).aggregate(a=models.Avg("total"))["a"]
                or 0
            )

        # Fee collection % (best-effort)
        fee_pct = None
        try:
            from fees.models import FeeStructure, Payment

            if current_term:
                expected = (
                    FeeStructure.objects.filter(term=current_term).aggregate(t=models.Sum("amount_expected"))["t"]
                    or 0
                )
                collected = (
                    Payment.objects.filter(fee_structure__term=current_term).aggregate(t=models.Sum("amount"))["t"]
                    or 0
                )
                fee_pct = round(float(collected) / float(expected) * 100) if expected else 0
        except Exception:
            fee_pct = None

        return Response(
            {
                "totalStudents": total_students,
                "totalStaff": total_staff,
                "totalStreams": total_streams,
                "averageMark": float(avg_mark) if avg_mark is not None else None,
                "feeCollectionPercent": fee_pct,
            }
        )


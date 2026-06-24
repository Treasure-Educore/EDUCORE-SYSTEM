import io

from django.db import models
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from students.models import Student


def build_student_report_card(student_id, term_id=None):
    from marks.models import MarksSummary, Term

    if not term_id:
        term = Term.objects.filter(is_current=True).first()
        term_id = str(term.id) if term else None

    student = get_object_or_404(
        Student.objects.select_related("stream__class_level"),
        id=student_id,
    )
    summaries = MarksSummary.objects.filter(
        student=student,
        term_id=term_id,
    ).select_related("subject")

    stream_students = Student.objects.filter(stream=student.stream)
    student_totals = []
    for stream_student in stream_students:
        total = (
            MarksSummary.objects.filter(
                student=stream_student,
                term_id=term_id,
            ).aggregate(total=models.Sum("total"))["total"]
            or 0
        )
        student_totals.append((str(stream_student.id), float(total)))
    student_totals.sort(key=lambda item: -item[1])
    position_map = {
        stream_student_id: index + 1
        for index, (stream_student_id, _) in enumerate(student_totals)
    }

    subjects_data = []
    for summary in summaries.order_by("subject__name"):
        subjects_data.append(
            {
                "subject": summary.subject.name,
                "test1": (
                    float(summary.test1_score)
                    if summary.test1_score is not None
                    else None
                ),
                "test2": (
                    float(summary.test2_score)
                    if summary.test2_score is not None
                    else None
                ),
                "exam": (
                    float(summary.exam_score)
                    if summary.exam_score is not None
                    else None
                ),
                "total": float(summary.total) if summary.total is not None else None,
                "grade": summary.grade,
            }
        )

    return {
        "studentId": str(student.id),
        "studentNumber": student.student_number,
        "studentName": student.full_name,
        "stream": student.stream.display_name() if student.stream else "",
        "position": position_map.get(str(student.id)),
        "outOf": stream_students.count(),
        "overallTotal": sum(subject["total"] or 0 for subject in subjects_data),
        "subjects": subjects_data,
    }


class StudentReportCardView(generics.RetrieveAPIView):
    """
    GET /api/reports/student/{student_id}/?termId=UUID
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        data = build_student_report_card(pk, request.query_params.get("termId"))
        return Response(data)


class ReportCardPDFView(generics.RetrieveAPIView):
    """
    GET /api/reports/student/{student_id}/pdf/?termId=UUID
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

        from marks.models import Term

        data = build_student_report_card(pk, request.query_params.get("termId"))
        term_id = request.query_params.get("termId")
        term = (
            Term.objects.get(id=term_id)
            if term_id
            else Term.objects.filter(is_current=True).first()
        )
        term_name = f"{term.name} {term.academic_year}" if term else "Term 1"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        navy = colors.HexColor("#0F172A")
        story = []

        header_data = [
            ["GREENFIELD SECONDARY SCHOOL"],
            ["P.O. Box 123, Kampala - Tel: +256 414 000 000"],
            [f"STUDENT REPORT CARD - {term_name.upper()}"],
        ]
        header_table = Table(header_data, colWidths=[17 * cm])
        header_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 1), navy),
                    ("TEXTCOLOR", (0, 0), (-1, 1), colors.white),
                    ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#1D4ED8")),
                    ("TEXTCOLOR", (0, 2), (-1, 2), colors.white),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (0, 0), 16),
                    ("FONTSIZE", (0, 1), (0, 1), 9),
                    ("FONTSIZE", (0, 2), (0, 2), 12),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(header_table)
        story.append(Spacer(1, 0.4 * cm))

        info_data = [
            ["Student Name:", data["studentName"], "Student No:", data["studentNumber"]],
            [
                "Class / Stream:",
                data["stream"],
                "Position:",
                f"{data.get('position') or '-'} / {data.get('outOf') or '-'}",
            ],
        ]
        info_table = Table(info_data, colWidths=[3.5 * cm, 5 * cm, 3 * cm, 5.5 * cm])
        info_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#E2E8F0")),
                ]
            )
        )
        story.append(info_table)
        story.append(Spacer(1, 0.4 * cm))

        marks_rows = [["Subject", "Test 1 (30)", "Test 2 (30)", "Exam (40)", "Total (100)", "Grade"]]
        for subject in data["subjects"]:
            marks_rows.append(
                [
                    subject["subject"],
                    subject["test1"] if subject["test1"] is not None else "-",
                    subject["test2"] if subject["test2"] is not None else "-",
                    subject["exam"] if subject["exam"] is not None else "-",
                    subject["total"] if subject["total"] is not None else "-",
                    subject["grade"] or "-",
                ]
            )
        marks_rows.append(["OVERALL TOTAL", "", "", "", round(data["overallTotal"], 1), ""])
        marks_table = Table(
            marks_rows,
            colWidths=[5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2 * cm],
        )
        marks_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), navy),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                    ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EFF6FF")),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F8FAFC")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(marks_table)
        story.append(Spacer(1, 0.6 * cm))

        comment_data = [
            ["Class Teacher's Comment:", "_" * 80],
            ["Head Teacher's Comment:", "_" * 80],
        ]
        comment_table = Table(comment_data, colWidths=[4.5 * cm, 12.5 * cm])
        comment_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(comment_table)
        story.append(Spacer(1, 1 * cm))

        story.append(Paragraph("_" * 25 + " " * 25 + "_" * 25))
        story.append(Paragraph("Class Teacher" + " " * 45 + "Head Teacher"))

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="report_card_{data["studentNumber"]}.pdf"'
        )
        return response

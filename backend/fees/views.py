from django.db import models
from rest_framework import generics, status, viewsets
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsBursar, IsHeadTeacher
from marks.models import Term
from students.models import Student

from .models import Bursary, FeeBalance, FeeStructure, Payment
from .serializers import (
    BursarySerializer,
    FeeRecordSerializer,
    FeeSummarySerializer,
    PaymentCreateSerializer,
)


def build_fee_record(student, fee_structure, balance=None):
    if fee_structure is None:
        total_expected = amount_paid = outstanding = 0
    else:
        total_expected = float(fee_structure.amount_expected)
        amount_paid = float(balance.amount_paid) if balance else 0
        outstanding = (
            float(balance.outstanding)
            if balance
            else float(fee_structure.amount_expected)
        )

    return {
        "studentId": str(student.id),
        "studentNumber": student.student_number,
        "studentName": student.full_name,
        "stream": student.stream.display_name() if student.stream else "",
        "totalExpected": total_expected,
        "amountPaid": amount_paid,
        "outstanding": outstanding,
    }


class FeeListView(generics.ListAPIView):
    """
    GET /api/fees/
    Returns FeeRecord rows for students in the requested or current term.
    """

    serializer_class = FeeRecordSerializer
    permission_classes = [IsBursar | IsAdmin | IsHeadTeacher]

    def get(self, request):
        term_id = request.query_params.get("termId")
        stream_id = request.query_params.get("streamId")
        search = request.query_params.get("search", "")

        if not term_id:
            current_term = Term.objects.filter(is_current=True).first()
            term_id = str(current_term.id) if current_term else None

        students_qs = Student.objects.select_related("stream__class_level").all()
        if stream_id:
            students_qs = students_qs.filter(stream_id=stream_id)
        if search:
            students_qs = students_qs.filter(
                models.Q(full_name__icontains=search)
                | models.Q(student_number__icontains=search)
            )

        result = []
        for student in students_qs.order_by("student_number"):
            fee_structure = None
            balance = None
            if student.stream_id and term_id:
                fee_structure = FeeStructure.objects.filter(
                    stream=student.stream,
                    term_id=term_id,
                ).first()
                if fee_structure:
                    balance = FeeBalance.objects.filter(
                        student=student,
                        fee_structure=fee_structure,
                    ).first()
            result.append(build_fee_record(student, fee_structure, balance))

        serializer = self.get_serializer(result, many=True)
        return Response(serializer.data)


class PaymentCreateView(generics.CreateAPIView):
    """
    POST /api/fees/payments/
    Records a payment and returns the updated fee row.
    """

    serializer_class = PaymentCreateSerializer
    permission_classes = [IsBursar | IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(received_by=request.user)
        balance = FeeBalance.objects.get(
            student=payment.student,
            fee_structure=payment.fee_structure,
        )
        record = build_fee_record(payment.student, payment.fee_structure, balance)
        output = FeeRecordSerializer(record)
        return Response(output.data, status=status.HTTP_201_CREATED)


class FeeSummaryView(generics.RetrieveAPIView):
    """
    GET /api/fees/summary/
    Returns financial aggregation for the current term.
    """

    serializer_class = FeeSummarySerializer
    permission_classes = [IsBursar | IsAdmin | IsHeadTeacher]

    def get(self, request):
        current_term = Term.objects.filter(is_current=True).first()
        if not current_term:
            return Response({"detail": "No current term set."}, status=400)

        fee_structures = FeeStructure.objects.filter(term=current_term)
        total_expected = (
            fee_structures.aggregate(total=models.Sum("amount_expected"))["total"] or 0
        )
        total_collected = (
            Payment.objects.filter(fee_structure__term=current_term).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0
        )
        total_outstanding = max(0, float(total_expected) - float(total_collected))
        active_bursaries = Bursary.objects.filter(
            term=current_term,
            is_active=True,
        ).count()
        students_fully_paid = FeeBalance.objects.filter(
            fee_structure__term=current_term,
            outstanding=0,
        ).count()
        students_pending = FeeBalance.objects.filter(
            fee_structure__term=current_term,
            outstanding__gt=0,
        ).count()

        serializer = self.get_serializer(
            {
                "totalExpected": float(total_expected),
                "totalCollected": float(total_collected),
                "totalOutstanding": total_outstanding,
                "activeBursaries": active_bursaries,
                "studentsFullyPaid": students_fully_paid,
                "studentsPending": students_pending,
            }
        )
        return Response(serializer.data)


class BursaryViewSet(viewsets.ModelViewSet):
    serializer_class = BursarySerializer
    permission_classes = [IsBursar | IsAdmin]
    filterset_fields = ["term", "is_active"]

    def get_queryset(self):
        return Bursary.objects.select_related("student", "term").all()

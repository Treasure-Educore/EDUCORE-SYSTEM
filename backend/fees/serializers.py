from decimal import Decimal

from django.db import models
from rest_framework import serializers

from students.models import Student

from .models import Bursary, FeeBalance, FeeStructure, Payment


def decimal_to_number(value):
    if value is None:
        return None
    value = Decimal(value)
    return int(value) if value == value.to_integral_value() else float(value)


class FeeRecordSerializer(serializers.Serializer):
    studentId = serializers.CharField()
    studentNumber = serializers.CharField()
    studentName = serializers.CharField()
    stream = serializers.CharField(allow_blank=True)
    totalExpected = serializers.FloatField()
    amountPaid = serializers.FloatField()
    outstanding = serializers.FloatField()


class PaymentCreateSerializer(serializers.ModelSerializer):
    studentId = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.select_related("stream").all(),
        source="student",
        write_only=True,
    )
    feeStructureId = serializers.PrimaryKeyRelatedField(
        queryset=FeeStructure.objects.select_related("stream", "term").all(),
        source="fee_structure",
        write_only=True,
    )
    referenceNumber = serializers.CharField(
        source="reference_number",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Payment
        fields = (
            "studentId",
            "feeStructureId",
            "amount",
            "method",
            "referenceNumber",
            "notes",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, attrs):
        student = attrs["student"]
        fee_structure = attrs["fee_structure"]
        amount = attrs["amount"]

        if student.stream_id != fee_structure.stream_id:
            raise serializers.ValidationError(
                {"feeStructureId": "Fee structure does not match the student's stream."}
            )

        balance = FeeBalance.objects.filter(
            student=student,
            fee_structure=fee_structure,
        ).first()
        if balance:
            outstanding = balance.outstanding
        else:
            total_paid = (
                Payment.objects.filter(
                    student=student,
                    fee_structure=fee_structure,
                ).aggregate(total=models.Sum("amount"))["total"]
                or Decimal("0")
            )
            outstanding = max(Decimal("0"), fee_structure.amount_expected - total_paid)

        if amount > outstanding:
            raise serializers.ValidationError(
                {"amount": "Amount cannot exceed the student's outstanding balance."}
            )

        return attrs


class FeeSummarySerializer(serializers.Serializer):
    totalExpected = serializers.FloatField()
    totalCollected = serializers.FloatField()
    totalOutstanding = serializers.FloatField()
    activeBursaries = serializers.IntegerField()
    studentsFullyPaid = serializers.IntegerField()
    studentsPending = serializers.IntegerField()


class BursarySerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source="student.full_name", read_only=True)
    studentNumber = serializers.CharField(source="student.student_number", read_only=True)
    termName = serializers.CharField(source="term.name", read_only=True)

    class Meta:
        model = Bursary
        fields = (
            "id",
            "student",
            "studentName",
            "studentNumber",
            "sponsor",
            "amount",
            "term",
            "termName",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        )

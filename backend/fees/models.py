from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.base_model import BaseModel


class FeeStructure(BaseModel):
    stream = models.ForeignKey(
        "students.Stream",
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )
    term = models.ForeignKey(
        "marks.Term",
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )
    amount_expected = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ("stream", "term")

    def __str__(self):
        return f"{self.stream} - {self.term}: {self.amount_expected}"


class Payment(BaseModel):
    METHODS = [
        ("cash", "Cash"),
        ("bank", "Bank Transfer"),
        ("mobile", "Mobile Money"),
    ]

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=10, choices=METHODS, default="cash")
    reference_number = models.CharField(max_length=100, blank=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-payment_date", "-created_at"]
        indexes = [
            models.Index(fields=["student", "fee_structure"], name="idx_payment_student_fee"),
            models.Index(fields=["payment_date"], name="idx_payment_date"),
        ]

    def __str__(self):
        return f"{self.student} paid {self.amount}"


class FeeBalance(BaseModel):
    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="fee_balance",
    )
    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.CASCADE,
        related_name="balances",
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outstanding = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ("student", "fee_structure")

    def __str__(self):
        return f"{self.student} - {self.fee_structure}: {self.outstanding}"


class Bursary(BaseModel):
    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="bursaries",
    )
    sponsor = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    term = models.ForeignKey(
        "marks.Term",
        on_delete=models.CASCADE,
        related_name="bursaries",
    )
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        verbose_name_plural = "bursaries"

    def __str__(self):
        return f"{self.sponsor} - {self.student}: {self.amount}"


@receiver(post_save, sender=Payment)
def rebuild_fee_balance(sender, instance, **kwargs):
    fee_structure = instance.fee_structure
    student = instance.student
    total_paid = (
        Payment.objects.filter(student=student, fee_structure=fee_structure).aggregate(
            total=models.Sum("amount")
        )["total"]
        or 0
    )
    outstanding = max(0, fee_structure.amount_expected - total_paid)
    FeeBalance.objects.update_or_create(
        student=student,
        fee_structure=fee_structure,
        defaults={"amount_paid": total_paid, "outstanding": outstanding},
    )

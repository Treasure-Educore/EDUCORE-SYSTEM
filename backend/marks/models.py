from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import models

from core.base_model import BaseModel


ASSESSMENT_DEFAULTS = {
    "Test 1": {"max_score": 30, "order": 1},
    "Test 2": {"max_score": 30, "order": 2},
    "Exam": {"max_score": 40, "order": 3},
}


class Term(BaseModel):
    name = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=9)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ["-academic_year", "name"]
        unique_together = ("name", "academic_year")

    def save(self, *args, **kwargs):
        if self.is_current:
            Term.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


class Assessment(BaseModel):
    label = models.CharField(max_length=20)
    max_score = models.PositiveIntegerField()
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]
        unique_together = ("label", "term")

    def __str__(self):
        return f"{self.label} - {self.term}"


class Mark(BaseModel):
    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="marks",
    )
    subject = models.ForeignKey(
        "staff.Subject",
        on_delete=models.CASCADE,
        related_name="marks",
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="marks",
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marks_entered",
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_submitted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "subject", "assessment")

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.assessment}: {self.score}"


class MarksSummary(BaseModel):
    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="summaries",
    )
    subject = models.ForeignKey(
        "staff.Subject",
        on_delete=models.CASCADE,
        related_name="summaries",
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="summaries",
    )
    test1_score = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    test2_score = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    exam_score = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    total = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    grade = models.CharField(max_length=2, blank=True)
    position = models.PositiveIntegerField(null=True, blank=True)
    is_submitted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "subject", "term")
        indexes = [
            models.Index(fields=["student", "term"], name="idx_summary_student_term"),
            models.Index(fields=["subject", "term"], name="idx_summary_subject_term"),
            models.Index(fields=["is_submitted"], name="idx_summary_submitted"),
        ]

    @staticmethod
    def compute_grade(total):
        if total is None:
            return ""
        if total >= 80:
            return "A"
        if total >= 70:
            return "B"
        if total >= 60:
            return "C"
        if total >= 50:
            return "D"
        return "F"

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.term}: {self.total}"


class ContinuousAssessment(BaseModel):
    """CBC-style continuous assessment with two activities and a project."""

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="ca_records",
    )
    subject = models.ForeignKey(
        "staff.Subject",
        on_delete=models.CASCADE,
        related_name="ca_records",
    )
    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="ca_records",
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="ca_records",
    )
    activity1 = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
    )
    activity2 = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
    )
    project = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    total = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
    )
    grade = models.CharField(max_length=15, blank=True)
    remarks = models.CharField(max_length=300, blank=True)
    is_submitted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "subject", "term")

    def save(self, *args, **kwargs):
        if (
            self.activity1 is not None
            and self.activity2 is not None
            and self.project is not None
        ):
            activity_average = (self.activity1 + self.activity2) / Decimal("2")
            total = (activity_average / Decimal("3")) * Decimal("10") + self.project
            self.total = total.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            if self.total >= Decimal("16"):
                self.grade = "Outstanding"
            elif self.total >= Decimal("12"):
                self.grade = "Moderate"
            else:
                self.grade = "Basic"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.term}: {self.total}"

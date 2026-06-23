from django.conf import settings
from django.db import models

from core.base_model import BaseModel


class AttendanceRecord(BaseModel):
    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="attendance",
    )
    date = models.DateField()
    stream = models.ForeignKey(
        "students.Stream",
        on_delete=models.CASCADE,
        related_name="attendance",
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ("present", "Present"),
            ("absent", "Absent"),
            ("late", "Late"),
        ],
        default="present",
    )
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    remarks = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-date"]
        unique_together = ("student", "date")

    def __str__(self):
        return f"{self.student} - {self.date}: {self.status}"

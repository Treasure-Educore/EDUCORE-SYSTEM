from django.conf import settings
from django.db import models

from core.base_model import BaseModel


class PortfolioItem(BaseModel):
    """Student work sample used by the portfolio module."""

    ITEM_TYPES = [
        ("Assignment", "Assignment"),
        ("Project", "Project"),
        ("Practical", "Practical"),
    ]

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="portfolio_items",
    )
    title = models.CharField(max_length=300)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    date = models.DateField()
    teacher_comment = models.TextField(blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.student} - {self.title}"

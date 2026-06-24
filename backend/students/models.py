from django.db import models
from django.utils import timezone

from core.base_model import BaseModel


class Dormitory(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "dormitories"

    def __str__(self):
        return self.name


class Club(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ClassLevel(BaseModel):
    name = models.CharField(max_length=10, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Stream(BaseModel):
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="streams",
    )
    name = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=9, default="2026")

    class Meta:
        ordering = ["class_level__name", "name"]
        unique_together = ("class_level", "name", "academic_year")

    def display_name(self):
        return f"{self.class_level.name} {self.name}"

    def __str__(self):
        return self.display_name()


class Student(BaseModel):
    class Gender(models.TextChoices):
        MALE = "Male", "Male"
        FEMALE = "Female", "Female"

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    student_number = models.CharField(max_length=20, unique=True, editable=False)
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    parent_details = models.CharField(max_length=500)
    year_of_entry = models.CharField(max_length=4)
    stream = models.ForeignKey(
        Stream,
        on_delete=models.SET_NULL,
        null=True,
        related_name="students",
    )
    dormitory = models.ForeignKey(
        Dormitory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    club = models.ForeignKey(
        Club,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    class Meta:
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["student_number"], name="idx_student_number"),
            models.Index(fields=["stream", "status"], name="idx_student_stream_status"),
            models.Index(fields=["year_of_entry"], name="idx_student_year"),
            models.Index(fields=["full_name"], name="idx_student_name"),
        ]
    def _get_class_code(self):
        """Map stream class level name to O/A level code."""
        if not self.stream or not self.stream.class_level:
            return "XX"
        level_map = {
            "S.1": "O1",
            "S.2": "O2",
            "S.3": "O3",
            "S.4": "O4",
            "S.5": "A1",
            "S.6": "A2",
        }
        return level_map.get(self.stream.class_level.name, "XX")

    @property
    def education_level(self):
        """Returns 'O-Level' or 'A-Level' based on stream class level."""
        if not self.stream or not self.stream.class_level:
            return "Unknown"
        o_level = ["S.1", "S.2", "S.3", "S.4"]
        return "O-Level" if self.stream.class_level.name in o_level else "A-Level"

    def save(self, *args, **kwargs):
        if not self.student_number:
            # New format: YY/STU/<ClassCode>/<seq>
            year = str(self.year_of_entry or timezone.now().year)
            year_short = year[-2:]
            class_code = self._get_class_code() if hasattr(self, '_get_class_code') else 'XX'
            # Count is sequential per year + class level
            count = Student.objects.filter(
                year_of_entry=year,
                stream__class_level__name=(self.stream.class_level.name if self.stream and self.stream.class_level else '')
            ).count() + 1
            self.student_number = f"{year_short}/STU/{class_code}/{count:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.student_number})"

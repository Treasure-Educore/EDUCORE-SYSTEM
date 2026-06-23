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

    def save(self, *args, **kwargs):
        if not self.student_number:
            year = self.year_of_entry or str(timezone.now().year)
            count = Student.objects.filter(year_of_entry=year).count() + 1
            self.student_number = f"STU/{year}/{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.student_number})"

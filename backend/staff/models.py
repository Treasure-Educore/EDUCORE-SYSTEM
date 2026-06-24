from django.db import models
from django.utils import timezone
from core.base_model import BaseModel


class Department(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Subject(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='subjects'
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class StaffProfile(BaseModel):
    user = models.OneToOneField(
        'accounts.User', 
        on_delete=models.CASCADE, 
        related_name='staff_profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(
        max_length=10, 
        choices=[('Male', 'Male'), ('Female', 'Female')], 
        blank=True
    )
    tin = models.CharField(max_length=20, blank=True)  # Tax Identification Number
    bank_account = models.CharField(max_length=50, blank=True)
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='staff_members'
    )
    subjects = models.ManyToManyField(Subject, blank=True, related_name='teachers')
    staff_number = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    status = models.CharField(
        max_length=20,
        choices=[('Active', 'Active'), ('On Leave', 'On Leave'), ('Inactive', 'Inactive')],
        default='Active'
    )
    class_teacher_stream = models.CharField(max_length=20, blank=True, default='—')
    patron_club = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['user__name']

    def __str__(self):
        return f"{self.user.name} ({self.user.role})"

    def save(self, *args, **kwargs):
        if not self.staff_number:
            year_short = str(timezone.now().year)[-2:]
            count = StaffProfile.objects.filter(
                created_at__year=timezone.now().year
            ).count() + 1
            self.staff_number = f"{year_short}/STA/{count:03d}"
        super().save(*args, **kwargs)

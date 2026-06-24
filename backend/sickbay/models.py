from django.db import models

from core.base_model import BaseModel


class NurseProfile(BaseModel):
    """Extends staff — a nurse is a non_teaching staff member with a sickbay profile."""
    staff_profile = models.OneToOneField(
        'staff.StaffProfile', on_delete=models.CASCADE,
        related_name='nurse_profile'
    )
    qualification = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100, blank=True)
    on_duty = models.BooleanField(default=True)


class SickbayVisit(BaseModel):
    VISIT_TYPES = [
        ('outpatient', 'Outpatient'),
        ('admitted', 'Admitted'),
        ('referred', 'Referred to Hospital'),
    ]
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE,
                                 related_name='sickbay_visits')
    date = models.DateField(auto_now_add=True)
    time_in = models.TimeField(auto_now_add=True)
    time_out = models.TimeField(null=True, blank=True)
    complaint = models.TextField()
    diagnosis = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    medication_given = models.TextField(blank=True)
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPES, default='outpatient')
    referred_to = models.CharField(max_length=200, blank=True)
    attended_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL,
                                     null=True, related_name='sickbay_visits_attended')
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', '-time_in']


class MedicalRecord(BaseModel):
    """Permanent medical history per student."""
    student = models.OneToOneField('students.Student', on_delete=models.CASCADE,
                                    related_name='medical_record')
    blood_type = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    doctor_name = models.CharField(max_length=200, blank=True)
    doctor_phone = models.CharField(max_length=20, blank=True)
    insurance_provider = models.CharField(max_length=200, blank=True)
    insurance_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

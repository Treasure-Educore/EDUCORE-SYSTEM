from django.contrib import admin

from .models import NurseProfile, SickbayVisit, MedicalRecord


@admin.register(NurseProfile)
class NurseProfileAdmin(admin.ModelAdmin):
    list_display = ('staff_profile', 'qualification', 'on_duty')


@admin.register(SickbayVisit)
class SickbayVisitAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'visit_type', 'attended_by')


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'blood_type', 'emergency_contact_name')

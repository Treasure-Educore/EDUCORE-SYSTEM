from django.contrib import admin

from .models import AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "stream", "date", "status", "marked_by")
    list_filter = ("status", "date", "stream")
    search_fields = ("student__full_name", "student__student_number")

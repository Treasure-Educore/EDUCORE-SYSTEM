from django.contrib import admin
from .models import Department, Subject, StaffProfile


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department', 'created_at')
    search_fields = ('name', 'code')
    list_filter = ('department',)


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'get_email', 'get_role', 'department', 'status', 'class_teacher_stream')
    list_filter = ('status', 'department', 'user__role')
    search_fields = ('user__name', 'user__email', 'tin')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('subjects',)

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Personal Info', {'fields': ('phone', 'gender', 'tin', 'bank_account')}),
        ('Department & Subjects', {'fields': ('department', 'subjects')}),
        ('Assignment', {'fields': ('class_teacher_stream', 'patron_club')}),
        ('Status', {'fields': ('status',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def get_full_name(self, obj):
        return obj.user.name
    get_full_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    def get_role(self, obj):
        return obj.user.role
    get_role.short_description = 'Role'

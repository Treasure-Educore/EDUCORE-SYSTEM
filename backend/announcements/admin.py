from django.contrib import admin
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'audience', 'posted_by', 'date', 'created_at')
    list_filter = ('audience', 'date')
    search_fields = ('title', 'message', 'posted_by__name')
    readonly_fields = ('date', 'created_at', 'updated_at')

    fieldsets = (
        ('Content', {'fields': ('title', 'message')}),
        ('Distribution', {'fields': ('audience', 'posted_by')}),
        ('Metadata', {'fields': ('date', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

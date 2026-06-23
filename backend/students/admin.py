from django.contrib import admin

from .models import ClassLevel, Club, Dormitory, Stream, Student


@admin.register(Dormitory)
class DormitoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(Stream)
class StreamAdmin(admin.ModelAdmin):
    list_display = ("display_name", "class_level", "name", "academic_year")
    list_filter = ("class_level", "academic_year")
    search_fields = ("name", "class_level__name")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "student_number",
        "full_name",
        "year_of_entry",
        "stream",
        "status",
    )
    list_filter = ("status", "year_of_entry", "stream", "dormitory", "club")
    search_fields = ("student_number", "full_name", "parent_details")
    readonly_fields = ("student_number", "created_at", "updated_at")

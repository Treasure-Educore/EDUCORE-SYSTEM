from django.contrib import admin

from .models import Assessment, Mark, MarksSummary, Term


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ("name", "academic_year", "is_current")
    list_filter = ("academic_year", "is_current")
    search_fields = ("name", "academic_year")


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("label", "term", "max_score", "order")
    list_filter = ("term",)
    search_fields = ("label", "term__name", "term__academic_year")


@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "subject",
        "assessment",
        "score",
        "is_submitted",
        "submitted_at",
    )
    list_filter = ("subject", "assessment__term", "assessment__label", "is_submitted")
    search_fields = (
        "student__full_name",
        "student__student_number",
        "subject__name",
    )


@admin.register(MarksSummary)
class MarksSummaryAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "subject",
        "term",
        "total",
        "grade",
        "position",
        "is_submitted",
    )
    list_filter = ("term", "subject", "grade", "is_submitted")
    search_fields = (
        "student__full_name",
        "student__student_number",
        "subject__name",
    )

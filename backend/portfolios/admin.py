from django.contrib import admin

from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ("student", "title", "item_type", "date", "score")
    list_filter = ("item_type", "date")
    search_fields = ("student__full_name", "student__student_number", "title")

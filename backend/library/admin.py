from django.contrib import admin

from .models import BookCategory, Book, LibraryCard, BookIssue


@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'education_level', 'subject')


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'education_level', 'available_copies')


@admin.register(LibraryCard)
class LibraryCardAdmin(admin.ModelAdmin):
    list_display = ('student', 'card_number', 'issued_date', 'expiry_date', 'is_active')


@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = ('book', 'library_card', 'issue_date', 'due_date', 'status')

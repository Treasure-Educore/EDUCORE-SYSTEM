from datetime import date

from django.db import models

from core.base_model import BaseModel


EDUCATION_LEVEL_CHOICES = [('O-Level', 'O-Level'), ('A-Level', 'A-Level'), ('Both', 'Both')]


class BookCategory(BaseModel):
    name = models.CharField(max_length=100)
    education_level = models.CharField(max_length=10, choices=EDUCATION_LEVEL_CHOICES)
    subject = models.ForeignKey('staff.Subject', on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='book_categories')
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ('name', 'education_level')

    def __str__(self):
        return f"{self.name} ({self.education_level})"


class Book(BaseModel):
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20, blank=True, unique=True, null=True)
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL,
                                  null=True, related_name='books')
    education_level = models.CharField(max_length=10, choices=EDUCATION_LEVEL_CHOICES)
    subject = models.ForeignKey('staff.Subject', on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='books')
    publisher = models.CharField(max_length=200, blank=True)
    year_published = models.CharField(max_length=4, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=100, blank=True)
    condition = models.CharField(max_length=20, choices=[
        ('Good', 'Good'), ('Fair', 'Fair'), ('Poor', 'Poor'), ('Damaged', 'Damaged')
    ], default='Good')
    date_acquired = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def is_available(self):
        return self.available_copies > 0


class LibraryCard(BaseModel):
    student = models.OneToOneField('students.Student', on_delete=models.CASCADE,
                                    related_name='library_card')
    card_number = models.CharField(max_length=30, unique=True, editable=False)
    issued_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)
    issued_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL,
                                   null=True, related_name='library_cards_issued')

    def save(self, *args, **kwargs):
        if not self.card_number:
            sn = self.student.student_number if self.student_id else 'XXX'
            self.card_number = f"LIB/{sn}"
        if not self.expiry_date:
            try:
                self.expiry_date = date.today().replace(year=date.today().year + 1)
            except Exception:
                # Fallback to adding 365 days
                from datetime import timedelta

                self.expiry_date = date.today() + timedelta(days=365)
        super().save(*args, **kwargs)


class BookIssue(BaseModel):
    STATUS = [
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
        ('lost', 'Lost'),
    ]
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    library_card = models.ForeignKey(LibraryCard, on_delete=models.CASCADE,
                                      related_name='issues')
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default='issued')
    issued_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL,
                                   null=True, related_name='books_issued')
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        from datetime import date as _date
        from django.db import models as dj_models

        # Auto-set status to overdue if due_date passed and not returned
        if self.due_date and self.due_date < _date.today() and self.status == 'issued':
            self.status = 'overdue'
        # Decrement book available_copies on issue, increment on return
        if not self.pk:  # New issue
            Book.objects.filter(pk=self.book_id).update(
                available_copies=dj_models.F('available_copies') - 1
            )
        super().save(*args, **kwargs)

    def mark_returned(self):
        from datetime import date as _date
        from django.db import models as dj_models

        self.return_date = _date.today()
        self.status = 'returned'
        Book.objects.filter(pk=self.book_id).update(
            available_copies=dj_models.F('available_copies') + 1
        )
        self.save()

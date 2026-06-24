from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from students.models import ClassLevel, Stream, Student
from .models import Book, LibraryCard, BookIssue, BookCategory


class LibraryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.user = User.objects.create_user(email='libstaff@example.com', password='pass1234', name='Lib Staff', role=User.Role.NON_TEACHING)
        self.class_level = ClassLevel.objects.create(name='S.1')
        self.stream = Stream.objects.create(class_level=self.class_level, name='A', academic_year='2026')
        # Create students
        self.students = [
            Student.objects.create(full_name=f'Student {i}', date_of_birth='2010-01-01', gender=Student.Gender.MALE, parent_details='P', year_of_entry='2026', stream=self.stream)
            for i in range(1, 6)
        ]
        self.category = BookCategory.objects.create(name='Mathematics', education_level='O-Level')

    def test_create_book(self):
        self.client.force_authenticate(user=self.user)
        payload = {'title': 'Algebra I', 'author': 'Author', 'education_level': 'O-Level', 'total_copies': 3, 'available_copies': 3}
        resp = self.client.post('/api/library/books/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 1)

    def test_issue_to_class_creates_cards(self):
        # Ensure no students have cards yet
        for s in self.students:
            if hasattr(s, 'library_card'):
                s.library_card.delete()

        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/library/cards/issue-to-class/', {'streamId': str(self.stream.id)}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        created = LibraryCard.objects.filter(student__stream=self.stream).count()
        self.assertEqual(created, len(self.students))

    def test_bookissue_decrements_and_return_increments(self):
        # Create book and card
        book = Book.objects.create(title='Bio 1', author='X', education_level='O-Level', total_copies=2, available_copies=2)
        card = LibraryCard.objects.create(student=self.students[0], issued_by=self.user)

        # Issue book
        issue = BookIssue.objects.create(book=book, library_card=card, due_date=date.today() + timedelta(days=7))
        book.refresh_from_db()
        self.assertEqual(book.available_copies, 1)

        # Return via API
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch(f'/api/library/issues/{issue.id}/return/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        book.refresh_from_db()
        issue.refresh_from_db()
        self.assertEqual(book.available_copies, 2)
        self.assertEqual(issue.status, 'returned')

    def test_print_card_returns_pdf(self):
        card = LibraryCard.objects.create(student=self.students[0], issued_by=self.user)
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(f'/api/library/cards/{card.id}/print/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/pdf')

    def test_overdue_status_auto_set(self):
        book = Book.objects.create(title='Hist', author='Y', education_level='O-Level', total_copies=1, available_copies=1)
        card = LibraryCard.objects.create(student=self.students[1], issued_by=self.user)
        past = date.today() - timedelta(days=10)
        issue = BookIssue.objects.create(book=book, library_card=card, due_date=past)
        self.assertEqual(issue.status, 'overdue')

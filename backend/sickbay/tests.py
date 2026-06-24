from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date

from students.models import ClassLevel, Stream, Student
from .models import SickbayVisit


class SickbayAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.user = User.objects.create_user(email='nurse@example.com', password='pass1234', name='Nurse', role=User.Role.NON_TEACHING)
        self.class_level = ClassLevel.objects.create(name='S.1')
        self.stream = Stream.objects.create(class_level=self.class_level, name='A', academic_year='2026')
        self.student = Student.objects.create(full_name='Patient Zero', date_of_birth='2010-01-01', gender=Student.Gender.MALE, parent_details='P', year_of_entry='2026', stream=self.stream)

    def test_create_visit_sets_attended_by(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'studentId': str(self.student.id),
            'complaint': 'Headache',
            'diagnosis': 'Migraine',
        }
        resp = self.client.post('/api/sickbay/visits/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        visit = SickbayVisit.objects.get(pk=resp.data['id'])
        self.assertEqual(visit.attended_by_id, self.user.id)

    def test_summary_returns_totalVisitsToday(self):
        # create two visits today
        SickbayVisit.objects.create(student=self.student, complaint='C1')
        SickbayVisit.objects.create(student=self.student, complaint='C2')
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/sickbay/summary/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('totalVisitsToday'), 2)

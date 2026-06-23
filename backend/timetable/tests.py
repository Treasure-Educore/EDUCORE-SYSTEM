from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import Period, TimetableSlot
from students.models import Stream, ClassLevel


User = get_user_model()


class TimetableAPITests(APITestCase):
	def setUp(self):
		# create user and stream
		self.user = User.objects.create_user(email="teacher@example.com", password="pass", name="Teacher", role="teacher")
		self.client.force_authenticate(user=self.user)
		cl = ClassLevel.objects.create(name="S.4")
		self.stream = Stream.objects.create(class_level=cl, name="A")
		# create a period
		self.period = Period.objects.create(number=1, start_time="07:30", end_time="08:30")

	def test_create_slot(self):
		url = reverse('timetable-slot-list')
		payload = {
			'day': 'Monday',
			'periodId': str(self.period.id),
			'streamId': str(self.stream.id),
			'academic_year': '2025/2026'
		}
		resp = self.client.post(url, payload, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


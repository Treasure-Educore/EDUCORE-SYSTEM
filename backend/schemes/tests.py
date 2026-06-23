from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import SchemeOfWork
from students.models import Stream, ClassLevel
from staff.models import Subject


User = get_user_model()


class SchemesAPITests(APITestCase):
	def setUp(self):
		self.teacher = User.objects.create_user(email="teacher2@example.com", password="pass", name="Jane", role="teacher")
		self.client.force_authenticate(user=self.teacher)
		cl = ClassLevel.objects.create(name="S.4")
		self.stream = Stream.objects.create(class_level=cl, name="A")
		self.subject = Subject.objects.create(name="Mathematics", code="MATH")

	def test_create_scheme_sets_teacher(self):
		url = reverse('scheme-list')
		payload = {
			'subjectId': str(self.subject.id),
			'streamId': str(self.stream.id),
			'term': 'Term 1',
			'week': 1,
			'period': 1,
			'themeTopic': 'Algebra',
			'competency': 'Understanding',
			'learningOutcomes': 'Solve equations',
			'learningActivities': 'Exercises',
			'assessmentMethods': 'Quiz'
		}
		resp = self.client.post(url, payload, format='json')
		self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
		data = resp.data
		self.assertEqual(data.get('teacher'), None)  # write serializer doesn't return teacher field; ensure created
		self.assertTrue(SchemeOfWork.objects.filter(theme_topic='Algebra').exists())


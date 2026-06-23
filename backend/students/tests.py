from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import ClassLevel, Club, Dormitory, Stream, Student


class StudentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()

        self.admin = self.User.objects.create_user(
            email="admin@example.com",
            password="password123",
            name="Admin User",
            role=self.User.Role.ADMIN,
        )
        self.teacher = self.User.objects.create_user(
            email="teacher@example.com",
            password="password123",
            name="Teacher User",
            role=self.User.Role.TEACHER,
        )

        self.class_level = ClassLevel.objects.create(name="S.1")
        self.other_class_level = ClassLevel.objects.create(name="S.2")
        self.stream = Stream.objects.create(
            class_level=self.class_level,
            name="A",
            academic_year="2026",
        )
        self.other_stream = Stream.objects.create(
            class_level=self.other_class_level,
            name="B",
            academic_year="2026",
        )
        self.dormitory = Dormitory.objects.create(name="Mandela")
        self.club = Club.objects.create(name="Debate")

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.admin)

    def create_student(self, full_name="Amara Okello", stream=None):
        return Student.objects.create(
            full_name=full_name,
            date_of_birth="2012-04-10",
            gender=Student.Gender.FEMALE,
            parent_details="Grace Okello - 0772 100 200",
            year_of_entry="2026",
            stream=stream or self.stream,
            dormitory=self.dormitory,
            club=self.club,
        )

    def valid_payload(self):
        return {
            "full_name": "Amara Okello",
            "date_of_birth": "2012-04-10",
            "gender": Student.Gender.FEMALE,
            "parent_details": "Grace Okello - 0772 100 200",
            "year_of_entry": "2026",
            "stream": str(self.stream.id),
            "dormitory": str(self.dormitory.id),
            "club": str(self.club.id),
        }

    def get_results(self, response):
        return response.data["results"]

    def test_student_auto_number_generation_format(self):
        first_student = self.create_student(full_name="Amara Okello")
        second_student = self.create_student(full_name="Brian Kato")

        self.assertEqual(first_student.student_number, "STU/2026/0001")
        self.assertEqual(second_student.student_number, "STU/2026/0002")

    def test_get_students_returns_200_for_authenticated_user(self):
        self.authenticate()

        response = self.client.get("/api/students/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_students_returns_401_for_unauthenticated_request(self):
        response = self.client.get("/api/students/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_students_with_valid_payload_returns_201_and_creates_student(self):
        self.authenticate()

        response = self.client.post("/api/students/", self.valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 1)
        self.assertEqual(Student.objects.first().student_number, "STU/2026/0001")

    def test_post_students_with_missing_full_name_returns_400(self):
        self.authenticate()
        payload = self.valid_payload()
        payload.pop("full_name")

        response = self.client.post("/api/students/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_student_updates_status(self):
        student = self.create_student()
        self.authenticate()

        response = self.client.patch(
            f"/api/students/{student.id}/",
            {"status": Student.Status.INACTIVE},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        student.refresh_from_db()
        self.assertEqual(student.status, Student.Status.INACTIVE)

    def test_delete_student_returns_403_for_teacher_role(self):
        student = self.create_student()
        self.authenticate(self.teacher)

        response = self.client.delete(f"/api/students/{student.id}/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Student.objects.filter(id=student.id).exists())

    def test_get_students_search_returns_only_matching_students(self):
        self.create_student(full_name="Amara Okello")
        self.create_student(full_name="Brian Kato")
        self.authenticate()

        response = self.client.get("/api/students/?search=Amara")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["fullName"], "Amara Okello")

    def test_get_students_stream_filter_returns_only_students_in_stream(self):
        self.create_student(full_name="Amara Okello", stream=self.stream)
        self.create_student(full_name="Brian Kato", stream=self.other_stream)
        self.authenticate()

        response = self.client.get("/api/students/?stream=S.1%20A")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["stream"], "S.1 A")

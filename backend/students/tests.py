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

        year_short = str(self.admin.date_joined.year)[-2:] if hasattr(self.admin, 'date_joined') else str(self.admin.created_at.year)[-2:]
        # For S.1 students class code is O1
        self.assertTrue(first_student.student_number.startswith(f"{year_short}/STU/O1/"))
        self.assertTrue(second_student.student_number.startswith(f"{year_short}/STU/O1/"))

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
        # student number should follow new YY/STU/<ClassCode>/<seq> pattern
        sn = Student.objects.first().student_number
        self.assertIn('/STU/', sn)

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

    def test_education_level_property_and_filters(self):
        # Create S.3 and S.5 students
        s3_level = ClassLevel.objects.create(name='S.3')
        s5_level = ClassLevel.objects.create(name='S.5')
        s3_stream = Stream.objects.create(class_level=s3_level, name='X', academic_year='2026')
        s5_stream = Stream.objects.create(class_level=s5_level, name='Y', academic_year='2026')
        s3_student = Student.objects.create(full_name='S3 Student', date_of_birth='2010-01-01', gender=Student.Gender.MALE, parent_details='P', year_of_entry='2026', stream=s3_stream)
        s5_student = Student.objects.create(full_name='S5 Student', date_of_birth='2008-01-01', gender=Student.Gender.MALE, parent_details='P', year_of_entry='2026', stream=s5_stream)

        # education_level property
        self.assertEqual(s3_student.education_level, 'O-Level')
        self.assertEqual(s5_student.education_level, 'A-Level')

        # Filter by level via API
        self.authenticate()
        resp_o = self.client.get('/api/students/?level=O-Level')
        resp_a = self.client.get('/api/students/?level=A-Level')
        self.assertEqual(resp_o.status_code, 200)
        self.assertEqual(resp_a.status_code, 200)
        # Check presence of expected students
        results_o = resp_o.data.get('results', [])
        results_a = resp_a.data.get('results', [])
        self.assertTrue(any(r['fullName'] == 'S3 Student' for r in results_o))
        self.assertTrue(any(r['fullName'] == 'S5 Student' for r in results_a))

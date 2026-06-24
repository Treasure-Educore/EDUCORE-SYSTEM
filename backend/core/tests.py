from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from attendance.models import AttendanceRecord
from marks.models import MarksSummary, Term
from staff.models import Department, Subject
from students.models import ClassLevel, Stream, Student


class CoreIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        self.password = "password123"
        self.admin = self.create_user("admin@example.com", self.User.Role.ADMIN)
        self.head_teacher = self.create_user(
            "head@example.com",
            self.User.Role.HEAD_TEACHER,
        )
        self.dos = self.create_user("dos@example.com", self.User.Role.DOS)
        self.bursar = self.create_user("bursar@example.com", self.User.Role.BURSAR)
        self.teacher = self.create_user("teacher@example.com", self.User.Role.TEACHER)
        self.non_teaching = self.create_user(
            "nonteaching@example.com",
            self.User.Role.NON_TEACHING,
        )

        self.class_level = ClassLevel.objects.create(name="S.2")
        self.stream = Stream.objects.create(
            class_level=self.class_level,
            name="A",
            academic_year="2026",
        )
        self.department = Department.objects.create(name="Sciences")
        self.subject = Subject.objects.create(
            name="Mathematics",
            code="MATH",
            department=self.department,
        )
        self.term = Term.objects.create(
            name="Term 1",
            academic_year="2026",
            is_current=True,
        )

    def create_user(self, email, role):
        return self.User.objects.create_user(
            email=email,
            password=self.password,
            name=email.split("@")[0].title(),
            role=role,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def student_payload(self):
        return {
            "full_name": "Amara Okello",
            "date_of_birth": "2011-04-10",
            "gender": Student.Gender.FEMALE,
            "parent_details": "Grace Okello - 0772 100 200",
            "year_of_entry": "2026",
            "stream": str(self.stream.id),
        }

    def test_full_student_lifecycle_register_attendance_marks_report_card(self):
        self.authenticate(self.admin)
        create_response = self.client.post(
            "/api/students/",
            self.student_payload(),
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        student_id = create_response.data["id"]

        self.authenticate(self.teacher)
        attendance_date = timezone.localdate() - timedelta(days=1)
        attendance_response = self.client.post(
            "/api/attendance/bulk-mark/",
            {
                "streamId": str(self.stream.id),
                "date": str(attendance_date),
                "records": [
                    {
                        "studentId": student_id,
                        "status": "present",
                        "remarks": "",
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(attendance_response.status_code, status.HTTP_200_OK)
        self.assertEqual(AttendanceRecord.objects.count(), 1)

        for assessment_label, score in (
            ("Test 1", 24),
            ("Test 2", 18),
            ("Exam", 40),
        ):
            marks_response = self.client.post(
                "/api/marks/submit/",
                {
                    "streamId": str(self.stream.id),
                    "subjectId": str(self.subject.id),
                    "termId": str(self.term.id),
                    "assessmentLabel": assessment_label,
                    "marks": [{"studentId": student_id, "score": score}],
                },
                format="json",
            )
            self.assertEqual(marks_response.status_code, status.HTTP_200_OK)

        summary = MarksSummary.objects.get(
            student_id=student_id,
            subject=self.subject,
            term=self.term,
        )
        self.assertEqual(str(summary.total), "82.0")
        self.assertEqual(summary.grade, "A")

        report_response = self.client.get(
            f"/api/reports/student/{student_id}/",
            {"termId": str(self.term.id)},
        )
        self.assertEqual(report_response.status_code, status.HTTP_200_OK)
        self.assertEqual(report_response.data["studentName"], "Amara Okello")
        self.assertEqual(report_response.data["overallTotal"], 82.0)
        self.assertEqual(report_response.data["subjects"][0]["grade"], "A")

    def test_health_check_returns_ok_without_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["db"], "ok")

    def test_students_list_without_token_returns_401(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/students/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_for_each_role_returns_metrics_list(self):
        for user in (
            self.admin,
            self.head_teacher,
            self.dos,
            self.bursar,
            self.teacher,
            self.non_teaching,
        ):
            with self.subTest(role=user.role):
                self.authenticate(user)
                response = self.client.get("/api/dashboard/")
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertIn("metrics", response.data)
                self.assertIsInstance(response.data["metrics"], list)

    def test_login_wrong_password_returns_401(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.teacher.email,
                "password": "wrong-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

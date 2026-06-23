from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from staff.models import Department, Subject
from students.models import ClassLevel, Stream, Student

from .models import Mark, MarksSummary, Term


class MarksAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()

        self.teacher = self.User.objects.create_user(
            email="teacher@example.com",
            password="password123",
            name="Teacher User",
            role=self.User.Role.TEACHER,
        )
        self.dos = self.User.objects.create_user(
            email="dos@example.com",
            password="password123",
            name="DOS User",
            role=self.User.Role.DOS,
        )

        self.class_level = ClassLevel.objects.create(name="S.4")
        self.stream = Stream.objects.create(
            class_level=self.class_level,
            name="A",
            academic_year="2026",
        )
        self.other_stream = Stream.objects.create(
            class_level=self.class_level,
            name="B",
            academic_year="2026",
        )
        self.students = [
            self.create_student("Amara Nkosi"),
            self.create_student("Brian Kato"),
            self.create_student("Clara Achieng"),
        ]
        self.other_student = self.create_student(
            "Other Stream",
            stream=self.other_stream,
        )

        self.department = Department.objects.create(name="Mathematics")
        self.math = Subject.objects.create(
            name="Mathematics",
            code="MATH",
            department=self.department,
        )
        self.english = Subject.objects.create(
            name="English",
            code="ENG",
            department=self.department,
        )
        self.term = Term.objects.create(
            name="Term 1",
            academic_year="2025/2026",
            is_current=True,
        )

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.teacher)

    def create_student(self, full_name, stream=None):
        return Student.objects.create(
            full_name=full_name,
            date_of_birth="2010-04-10",
            gender=Student.Gender.FEMALE,
            parent_details="Parent - 0772 100 200",
            year_of_entry="2026",
            stream=stream or self.stream,
        )

    def submit_payload(self, assessment_label, scores, subject=None):
        return {
            "streamId": str(self.stream.id),
            "subjectId": str((subject or self.math).id),
            "termId": str(self.term.id),
            "assessmentLabel": assessment_label,
            "marks": [
                {"studentId": str(student.id), "score": score}
                for student, score in scores
            ],
        }

    def submit_marks(self, assessment_label, scores, subject=None):
        self.authenticate(self.teacher)
        return self.client.post(
            "/api/marks/submit/",
            self.submit_payload(assessment_label, scores, subject=subject),
            format="json",
        )

    def test_teacher_submit_creates_mark_records_and_summary(self):
        response = self.submit_marks(
            "Test 1",
            [(self.students[0], 24), (self.students[1], 18)],
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Mark.objects.count(), 2)
        summary = MarksSummary.objects.get(
            student=self.students[0],
            subject=self.math,
            term=self.term,
        )
        self.assertEqual(summary.test1_score, Decimal("24.0"))
        self.assertIsNone(summary.total)
        self.assertFalse(summary.is_submitted)

    def test_grade_thresholds_match_frontend(self):
        self.assertEqual(MarksSummary.compute_grade(82), "A")
        self.assertEqual(MarksSummary.compute_grade(72), "B")
        self.assertEqual(MarksSummary.compute_grade(62), "C")
        self.assertEqual(MarksSummary.compute_grade(52), "D")
        self.assertEqual(MarksSummary.compute_grade(42), "F")

    def test_dos_cannot_submit_marks(self):
        self.authenticate(self.dos)

        response = self.client.post(
            "/api/marks/submit/",
            self.submit_payload("Test 1", [(self.students[0], 24)]),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Mark.objects.count(), 0)

    def test_list_returns_rows_for_all_students_in_stream(self):
        self.submit_marks("Test 1", [(self.students[0], 24)])
        self.authenticate(self.teacher)

        response = self.client.get(
            "/api/marks/",
            {
                "streamId": str(self.stream.id),
                "subjectId": str(self.math.id),
                "termId": str(self.term.id),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]["studentNumber"], "STU/2026/0001")
        self.assertEqual(response.data[0]["test1"], 24)
        self.assertIsNone(response.data[1]["test1"])
        self.assertEqual(response.data[1]["grade"], "")

    def test_status_returns_per_subject_submission_status(self):
        self.submit_marks("Test 1", [(self.students[0], 24)])
        self.authenticate(self.dos)

        response = self.client.get(
            "/api/marks/status/",
            {
                "streamId": str(self.stream.id),
                "termId": str(self.term.id),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        math_status = next(
            row for row in response.data if row["subjectId"] == str(self.math.id)
        )
        english_status = next(
            row for row in response.data if row["subjectId"] == str(self.english.id)
        )
        self.assertTrue(math_status["test1Submitted"])
        self.assertFalse(math_status["test2Submitted"])
        self.assertFalse(math_status["examSubmitted"])
        self.assertFalse(english_status["test1Submitted"])

    def test_partial_submission_keeps_total_null_and_summary_unsubmitted(self):
        self.submit_marks("Test 1", [(self.students[0], 24)])
        self.submit_marks("Test 2", [(self.students[0], 18)])

        summary = MarksSummary.objects.get(
            student=self.students[0],
            subject=self.math,
            term=self.term,
        )
        self.assertEqual(summary.test1_score, Decimal("24.0"))
        self.assertEqual(summary.test2_score, Decimal("18.0"))
        self.assertIsNone(summary.exam_score)
        self.assertIsNone(summary.total)
        self.assertFalse(summary.is_submitted)

    def test_full_submission_computes_total_grade_and_submitted_status(self):
        self.submit_marks("Test 1", [(self.students[0], 24)])
        self.submit_marks("Test 2", [(self.students[0], 18)])
        self.submit_marks("Exam", [(self.students[0], 40)])

        summary = MarksSummary.objects.get(
            student=self.students[0],
            subject=self.math,
            term=self.term,
        )
        self.assertEqual(summary.total, Decimal("82.0"))
        self.assertEqual(summary.grade, "A")
        self.assertTrue(summary.is_submitted)

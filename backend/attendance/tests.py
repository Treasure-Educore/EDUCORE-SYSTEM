from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from students.models import ClassLevel, Stream, Student

from .models import AttendanceRecord


class AttendanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()

        self.teacher = self.User.objects.create_user(
            email="teacher@example.com",
            password="password123",
            name="Teacher User",
            role=self.User.Role.TEACHER,
        )
        self.bursar = self.User.objects.create_user(
            email="bursar@example.com",
            password="password123",
            name="Bursar User",
            role=self.User.Role.BURSAR,
        )
        self.class_level = ClassLevel.objects.create(name="S.1")
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
            self.create_student("Amara Okello"),
            self.create_student("Brian Kato"),
            self.create_student("Clara Achieng"),
        ]
        self.inactive_student = self.create_student(
            "Inactive Student",
            status=Student.Status.INACTIVE,
        )
        self.date = timezone.localdate() - timedelta(days=1)

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.teacher)

    def create_student(self, full_name, stream=None, status=Student.Status.ACTIVE):
        return Student.objects.create(
            full_name=full_name,
            date_of_birth="2011-04-10",
            gender=Student.Gender.FEMALE,
            parent_details="Parent - 0772 100 200",
            year_of_entry="2026",
            stream=stream or self.stream,
            status=status,
        )

    def bulk_payload(self, date=None, records=None):
        return {
            "streamId": str(self.stream.id),
            "date": str(date or self.date),
            "records": records
            if records is not None
            else [
                {
                    "studentId": str(student.id),
                    "status": "present",
                    "remarks": "",
                }
                for student in self.students
            ],
        }

    def test_bulk_mark_by_teacher_creates_records_for_each_student(self):
        self.authenticate()

        response = self.client.post(
            "/api/attendance/bulk-mark/",
            self.bulk_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AttendanceRecord.objects.count(), 3)
        self.assertTrue(
            AttendanceRecord.objects.filter(
                student=self.students[0],
                date=self.date,
                status="present",
                marked_by=self.teacher,
            ).exists()
        )

    def test_bulk_mark_with_future_date_returns_400(self):
        self.authenticate()
        future_date = timezone.localdate() + timedelta(days=1)

        response = self.client.post(
            "/api/attendance/bulk-mark/",
            self.bulk_payload(date=future_date),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AttendanceRecord.objects.count(), 0)

    def test_list_returns_rows_for_all_active_students_in_stream(self):
        AttendanceRecord.objects.create(
            student=self.students[0],
            stream=self.stream,
            date=self.date,
            status="late",
            remarks="Traffic",
            marked_by=self.teacher,
        )
        self.authenticate()

        response = self.client.get(
            "/api/attendance/",
            {"streamId": str(self.stream.id), "date": str(self.date)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        first_row = response.data[0]
        self.assertEqual(first_row["studentName"], "Amara Okello")
        self.assertEqual(first_row["status"], "late")
        self.assertEqual(first_row["remarks"], "Traffic")

    def test_list_without_records_returns_rows_with_null_status(self):
        self.authenticate()

        response = self.client.get(
            "/api/attendance/",
            {"streamId": str(self.stream.id), "date": str(self.date)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertTrue(all(row["status"] is None for row in response.data))
        self.assertTrue(all(row["remarks"] == "" for row in response.data))

    def test_summary_returns_attendance_percent_per_student(self):
        AttendanceRecord.objects.create(
            student=self.students[0],
            stream=self.stream,
            date=self.date - timedelta(days=2),
            status="present",
            marked_by=self.teacher,
        )
        AttendanceRecord.objects.create(
            student=self.students[0],
            stream=self.stream,
            date=self.date - timedelta(days=1),
            status="late",
            marked_by=self.teacher,
        )
        AttendanceRecord.objects.create(
            student=self.students[0],
            stream=self.stream,
            date=self.date,
            status="absent",
            marked_by=self.teacher,
        )
        self.authenticate()

        response = self.client.get(
            "/api/attendance/summary/",
            {"streamId": str(self.stream.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        row = next(
            item
            for item in response.data
            if item["studentId"] == str(self.students[0].id)
        )
        self.assertEqual(row["totalDays"], 3)
        self.assertEqual(row["present"], 1)
        self.assertEqual(row["late"], 1)
        self.assertEqual(row["absent"], 1)
        self.assertEqual(row["attendancePercent"], 66.7)

    def test_bulk_mark_by_bursar_returns_403(self):
        self.authenticate(self.bursar)

        response = self.client.post(
            "/api/attendance/bulk-mark/",
            self.bulk_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(AttendanceRecord.objects.count(), 0)

    def test_bulk_mark_same_student_twice_updates_without_duplicate(self):
        self.authenticate()
        student = self.students[0]

        first_response = self.client.post(
            "/api/attendance/bulk-mark/",
            self.bulk_payload(
                records=[
                    {
                        "studentId": str(student.id),
                        "status": "present",
                        "remarks": "",
                    }
                ]
            ),
            format="json",
        )
        second_response = self.client.post(
            "/api/attendance/bulk-mark/",
            self.bulk_payload(
                records=[
                    {
                        "studentId": str(student.id),
                        "status": "absent",
                        "remarks": "Sick",
                    }
                ]
            ),
            format="json",
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(AttendanceRecord.objects.count(), 1)
        record = AttendanceRecord.objects.get(student=student, date=self.date)
        self.assertEqual(record.status, "absent")
        self.assertEqual(record.remarks, "Sick")

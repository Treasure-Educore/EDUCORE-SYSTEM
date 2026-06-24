from django.utils import timezone
from rest_framework import serializers

from students.models import Stream, Student

from .models import AttendanceRecord


class AttendanceRowSerializer(serializers.Serializer):
    studentId = serializers.UUIDField()
    studentNumber = serializers.CharField()
    studentName = serializers.CharField()
    date = serializers.DateField()
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in AttendanceRecord._meta.get_field("status").choices],
        allow_null=True,
        required=False,
    )
    remarks = serializers.CharField(allow_blank=True)


class AttendanceInputSerializer(serializers.Serializer):
    studentId = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.select_related("stream").all(),
        source="student",
    )
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in AttendanceRecord._meta.get_field("status").choices],
    )
    remarks = serializers.CharField(required=False, allow_blank=True, default="")


class BulkAttendanceSerializer(serializers.Serializer):
    streamId = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.select_related("class_level").all(),
        source="stream",
    )
    date = serializers.DateField()
    records = AttendanceInputSerializer(many=True)

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Attendance date cannot be in the future.")
        return value

    def validate_records(self, value):
        if not value:
            raise serializers.ValidationError("At least one attendance record is required.")
        return value

    def validate(self, attrs):
        stream = attrs["stream"]
        seen_students = set()

        for record in attrs["records"]:
            student = record["student"]
            if student.id in seen_students:
                raise serializers.ValidationError(
                    {"records": f"Duplicate attendance row for {student.full_name}."}
                )
            seen_students.add(student.id)

            if student.stream_id != stream.id:
                raise serializers.ValidationError(
                    {"records": f"{student.full_name} is not in the selected stream."}
                )

        return attrs


class AttendanceSummarySerializer(serializers.Serializer):
    studentId = serializers.UUIDField()
    studentNumber = serializers.CharField()
    studentName = serializers.CharField()
    totalDays = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    attendancePercent = serializers.FloatField()

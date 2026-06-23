from decimal import Decimal

from rest_framework import serializers

from staff.models import Subject
from students.models import Stream, Student

from .models import ASSESSMENT_DEFAULTS, Assessment, Term


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ("id", "name", "academic_year", "is_current")


class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ("id", "label", "max_score", "order")


def format_score(value):
    if value is None:
        return None

    decimal_value = Decimal(value)
    if decimal_value == decimal_value.to_integral_value():
        return int(decimal_value)
    return float(decimal_value)


class MarkRowSerializer(serializers.ModelSerializer):
    studentId = serializers.UUIDField(source="id", read_only=True)
    studentNumber = serializers.CharField(source="student_number", read_only=True)
    name = serializers.CharField(source="full_name", read_only=True)
    test1 = serializers.SerializerMethodField()
    test2 = serializers.SerializerMethodField()
    exam = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    isSubmitted = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            "studentId",
            "studentNumber",
            "name",
            "test1",
            "test2",
            "exam",
            "total",
            "grade",
            "isSubmitted",
        )

    def _summary(self, student):
        return self.context.get("summary_by_student", {}).get(student.id)

    def get_test1(self, student):
        summary = self._summary(student)
        return format_score(summary.test1_score) if summary else None

    def get_test2(self, student):
        summary = self._summary(student)
        return format_score(summary.test2_score) if summary else None

    def get_exam(self, student):
        summary = self._summary(student)
        return format_score(summary.exam_score) if summary else None

    def get_total(self, student):
        summary = self._summary(student)
        return format_score(summary.total) if summary else None

    def get_grade(self, student):
        summary = self._summary(student)
        return summary.grade if summary else ""

    def get_isSubmitted(self, student):
        summary = self._summary(student)
        return summary.is_submitted if summary else False


class MarkInputSerializer(serializers.Serializer):
    studentId = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source="student",
    )
    score = serializers.DecimalField(max_digits=5, decimal_places=1)


class BulkMarkSubmitSerializer(serializers.Serializer):
    streamId = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.select_related("class_level").all(),
        source="stream",
    )
    subjectId = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source="subject",
    )
    termId = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        source="term",
    )
    assessmentLabel = serializers.ChoiceField(
        choices=list(ASSESSMENT_DEFAULTS.keys()),
        source="assessment_label",
    )
    marks = MarkInputSerializer(many=True)

    def validate_marks(self, value):
        if not value:
            raise serializers.ValidationError("At least one student mark is required.")
        return value

    def validate(self, attrs):
        stream = attrs["stream"]
        term = attrs["term"]
        assessment_label = attrs["assessment_label"]
        assessment = Assessment.objects.filter(
            term=term,
            label=assessment_label,
        ).first()
        max_score = Decimal(
            str(
                assessment.max_score
                if assessment
                else ASSESSMENT_DEFAULTS[assessment_label]["max_score"]
            )
        )

        seen_students = set()
        for mark in attrs["marks"]:
            student = mark["student"]
            score = mark["score"]

            if student.id in seen_students:
                raise serializers.ValidationError(
                    {"marks": f"Duplicate mark for {student.full_name}."}
                )
            seen_students.add(student.id)

            if student.stream_id != stream.id:
                raise serializers.ValidationError(
                    {"marks": f"{student.full_name} is not in the selected stream."}
                )

            if score < 0 or score > max_score:
                raise serializers.ValidationError(
                    {
                        "marks": (
                            f"Score for {student.full_name} must be between "
                            f"0 and {format_score(max_score)}."
                        )
                    }
                )

        return attrs


class MarksListQuerySerializer(serializers.Serializer):
    streamId = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.all(),
        source="stream",
    )
    subjectId = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source="subject",
    )
    termId = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        source="term",
    )


class MarksStatusQuerySerializer(serializers.Serializer):
    streamId = serializers.PrimaryKeyRelatedField(
        queryset=Stream.objects.all(),
        source="stream",
    )
    termId = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        source="term",
    )


class MarksStatusSerializer(serializers.Serializer):
    subjectId = serializers.UUIDField()
    subjectName = serializers.CharField()
    test1Submitted = serializers.BooleanField()
    test2Submitted = serializers.BooleanField()
    examSubmitted = serializers.BooleanField()

from rest_framework import serializers

from students.models import Student

from .models import PortfolioItem


class PortfolioItemSerializer(serializers.ModelSerializer):
    studentId = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source="student",
        write_only=True,
    )
    studentNumber = serializers.CharField(source="student.student_number", read_only=True)
    studentName = serializers.CharField(source="student.full_name", read_only=True)
    type = serializers.ChoiceField(source="item_type", choices=PortfolioItem.ITEM_TYPES)
    teacherComment = serializers.CharField(
        source="teacher_comment",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = PortfolioItem
        fields = (
            "id",
            "studentId",
            "studentNumber",
            "studentName",
            "title",
            "type",
            "date",
            "teacherComment",
            "score",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data["score"] is not None:
            value = instance.score
            data["score"] = int(value) if value == value.to_integral_value() else float(value)
        return data

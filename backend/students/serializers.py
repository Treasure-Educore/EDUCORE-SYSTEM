from rest_framework import serializers

from .models import ClassLevel, Club, Dormitory, Stream, Student


class DormitorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Dormitory
        fields = "__all__"


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = "__all__"


class StreamSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    class_level = serializers.CharField(source="class_level.name", read_only=True)

    class Meta:
        model = Stream
        fields = ("id", "display_name", "class_level", "academic_year")

    def get_display_name(self, obj):
        return obj.display_name()


class ClassLevelSerializer(serializers.ModelSerializer):
    streams = StreamSerializer(many=True, read_only=True)

    class Meta:
        model = ClassLevel
        fields = ("id", "name", "streams")


class StudentListSerializer(serializers.ModelSerializer):
    studentNumber = serializers.CharField(source="student_number", read_only=True)
    fullName = serializers.CharField(source="full_name", read_only=True)
    yearOfEntry = serializers.CharField(source="year_of_entry", read_only=True)
    parentDetails = serializers.CharField(source="parent_details", read_only=True)
    stream = serializers.SerializerMethodField()
    club = serializers.SerializerMethodField()
    dormitory = serializers.SerializerMethodField()
    educationLevel = serializers.CharField(source='education_level', read_only=True)

    class Meta:
        model = Student
        fields = (
            "id",
            "studentNumber",
            "fullName",
            "yearOfEntry",
            "parentDetails",
            "stream",
            "educationLevel",
            "club",
            "dormitory",
            "status",
        )

    def get_stream(self, obj):
        return obj.stream.display_name() if obj.stream else ""

    def get_club(self, obj):
        return obj.club.name if obj.club else ""

    def get_dormitory(self, obj):
        return obj.dormitory.name if obj.dormitory else ""


class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = (
            "id",
            "student_number",
            "full_name",
            "date_of_birth",
            "gender",
            "parent_details",
            "year_of_entry",
            "stream",
            "dormitory",
            "club",
        )
        read_only_fields = ("id", "student_number")


class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = (
            "id",
            "student_number",
            "full_name",
            "date_of_birth",
            "gender",
            "parent_details",
            "year_of_entry",
            "stream",
            "dormitory",
            "club",
            "status",
        )
        read_only_fields = ("id", "student_number")


class NameOnlySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "name")


class DormitoryOptionSerializer(NameOnlySerializer):
    class Meta(NameOnlySerializer.Meta):
        model = Dormitory


class ClubOptionSerializer(NameOnlySerializer):
    class Meta(NameOnlySerializer.Meta):
        model = Club


class ClassLevelOptionSerializer(NameOnlySerializer):
    class Meta(NameOnlySerializer.Meta):
        model = ClassLevel


class StreamOptionSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Stream
        fields = ("id", "display_name")

    def get_display_name(self, obj):
        return obj.display_name()

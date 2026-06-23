from rest_framework import serializers

from .models import Period, TimetableSlot


class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = ("id", "number", "start_time", "end_time")


class TimetableSlotReadSerializer(serializers.ModelSerializer):
    period = serializers.IntegerField(source="period.number")
    subject = serializers.CharField(source="subject.name", allow_null=True)
    teacher = serializers.CharField(source="teacher.name", allow_null=True)
    class_name = serializers.CharField(source="stream.display_name", read_only=True)

    class Meta:
        model = TimetableSlot
        fields = ("id", "day", "period", "subject", "teacher", "class_name")


class TimetableSlotWriteSerializer(serializers.ModelSerializer):
    periodId = serializers.UUIDField(write_only=True)
    streamId = serializers.UUIDField(write_only=True)
    subjectId = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    teacherId = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = TimetableSlot
        fields = (
            "id",
            "day",
            "periodId",
            "streamId",
            "subjectId",
            "teacherId",
            "academic_year",
        )

    def create(self, validated_data):
        period_id = validated_data.pop("periodId")
        stream_id = validated_data.pop("streamId")
        subject_id = validated_data.pop("subjectId", None)
        teacher_id = validated_data.pop("teacherId", None)

        validated_data["period_id"] = period_id
        validated_data["stream_id"] = stream_id
        validated_data["subject_id"] = subject_id
        validated_data["teacher_id"] = teacher_id

        slot = TimetableSlot(**validated_data)
        slot.full_clean()
        slot.save()
        return slot

    def update(self, instance, validated_data):
        # allow partial updates for subject/teacher
        if "periodId" in validated_data:
            instance.period_id = validated_data.pop("periodId")
        if "streamId" in validated_data:
            instance.stream_id = validated_data.pop("streamId")
        if "subjectId" in validated_data:
            instance.subject_id = validated_data.pop("subjectId")
        if "teacherId" in validated_data:
            instance.teacher_id = validated_data.pop("teacherId")
        instance.day = validated_data.get("day", instance.day)
        instance.academic_year = validated_data.get("academic_year", instance.academic_year)
        instance.full_clean()
        instance.save()
        return instance

    def to_representation(self, instance):
        # Return the read serializer shape
        return TimetableSlotReadSerializer(instance).data
from rest_framework import serializers

from .models import Period, TimetableSlot
from students.models import Stream
from staff.models import Subject
from accounts.models import User


class PeriodSerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = Period
        fields = ("id", "number", "start_time", "end_time")


class TimetableSlotReadSerializer(serializers.ModelSerializer):
    period = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    teacher = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    class Meta:
        model = TimetableSlot
        fields = ("id", "day", "period", "subject", "teacher", "class_name")

    def get_period(self, obj):
        return obj.period.number if obj.period else None

    def get_subject(self, obj):
        return obj.subject.name if obj.subject else ""

    def get_teacher(self, obj):
        return obj.teacher.name if obj.teacher else ""

    def get_class_name(self, obj):
        return obj.stream.display_name() if obj.stream else ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # rename class_name -> class to match frontend shape
        data["class"] = data.pop("class_name", "")
        return data


class TimetableSlotWriteSerializer(serializers.ModelSerializer):
    periodId = serializers.PrimaryKeyRelatedField(queryset=Period.objects.all(), source="period")
    streamId = serializers.PrimaryKeyRelatedField(queryset=Stream.objects.all(), source="stream")
    subjectId = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), source="subject", allow_null=True, required=False)
    teacherId = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source="teacher", allow_null=True, required=False)

    class Meta:
        model = TimetableSlot
        fields = ("id", "day", "periodId", "streamId", "subjectId", "teacherId", "academic_year")

    def create(self, validated_data):
        # validated_data has keys 'period','stream','subject','teacher'
        instance = TimetableSlot(**validated_data)
        # run model validation (clean)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.full_clean()
        instance.save()
        return instance

    def to_representation(self, instance):
        # Return the read serializer representation on success
        return TimetableSlotReadSerializer(instance, context=self.context).data

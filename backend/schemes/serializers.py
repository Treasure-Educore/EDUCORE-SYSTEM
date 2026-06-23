from rest_framework import serializers

from .models import SchemeOfWork, LessonPlan


class SchemeOfWorkListSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    class_name = serializers.CharField(source="stream.display_name")
    themeTopic = serializers.CharField(source="theme_topic")
    teacherName = serializers.SerializerMethodField()

    class Meta:
        model = SchemeOfWork
        fields = (
            "id",
            "subject",
            "class_name",
            "term",
            "week",
            "themeTopic",
            "status",
            "teacherName",
            "submitted_date",
            "reviewed_date",
        )

    def get_teacherName(self, obj):
        return obj.teacher.name if obj.teacher else ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["class"] = data.pop("class_name", "")
        data["submittedDate"] = data.pop("submitted_date", None)
        data["reviewedDate"] = data.pop("reviewed_date", None)
        data["teacherName"] = data.pop("teacherName", "")
        data["themeTopic"] = data.get("themeTopic")
        return data


class SchemeOfWorkDetailSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    stream = serializers.CharField(source="stream.display_name")
    themeTopic = serializers.CharField(source="theme_topic")
    learningOutcomes = serializers.CharField(source="learning_outcomes")
    learningActivities = serializers.CharField(source="learning_activities")
    teachingResources = serializers.CharField(source="teaching_resources")
    assessmentMethods = serializers.CharField(source="assessment_methods")
    teacherName = serializers.SerializerMethodField()

    class Meta:
        model = SchemeOfWork
        fields = '__all__'

    def get_teacherName(self, obj):
        return obj.teacher.name if obj.teacher else ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # convert snake_case keys to camelCase expected by frontend
        data["themeTopic"] = data.pop("theme_topic", "")
        data["learningOutcomes"] = data.pop("learning_outcomes", "")
        data["learningActivities"] = data.pop("learning_activities", "")
        data["teachingResources"] = data.pop("teaching_resources", "")
        data["assessmentMethods"] = data.pop("assessment_methods", "")
        data["teacherName"] = instance.teacher.name if instance.teacher else ""
        data["class"] = instance.stream.display_name() if instance.stream else ""
        return data


class SchemeOfWorkWriteSerializer(serializers.ModelSerializer):
    subjectId = serializers.UUIDField(write_only=True)
    streamId = serializers.UUIDField(write_only=True)
    themeTopic = serializers.CharField(source="theme_topic")
    learningOutcomes = serializers.CharField(source="learning_outcomes")
    learningActivities = serializers.CharField(source="learning_activities")
    teachingResources = serializers.CharField(source="teaching_resources", allow_blank=True, required=False)
    assessmentMethods = serializers.CharField(source="assessment_methods")

    class Meta:
        model = SchemeOfWork
        fields = (
            "id",
            "subjectId",
            "streamId",
            "term",
            "week",
            "period",
            "themeTopic",
            "competency",
            "learningOutcomes",
            "learningActivities",
            "teachingResources",
            "references",
            "remarks",
            "assessmentMethods",
            "status",
            "submitted_to",
        )

    def create(self, validated_data):
        subject_id = validated_data.pop("subjectId")
        stream_id = validated_data.pop("streamId")
        validated_data["subject_id"] = subject_id
        validated_data["stream_id"] = stream_id
        # set teacher from request in view
        return SchemeOfWork.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if "subjectId" in validated_data:
            instance.subject_id = validated_data.pop("subjectId")
        if "streamId" in validated_data:
            instance.stream_id = validated_data.pop("streamId")
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance


class LessonPlanListSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    class_name = serializers.CharField(source="stream.display_name")
    teacherName = serializers.SerializerMethodField()

    class Meta:
        model = LessonPlan
        fields = (
            "id",
            "subject",
            "class_name",
            "date",
            "week",
            "topic",
            "status",
            "teacherName",
            "submitted_date",
        )

    def get_teacherName(self, obj):
        return obj.teacher.name if obj.teacher else ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["class"] = data.pop("class_name", "")
        data["teacherName"] = data.pop("teacherName", "")
        data["submittedDate"] = data.pop("submitted_date", None)
        return data


class LessonPlanDetailSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    stream = serializers.CharField(source="stream.display_name")
    teacherName = serializers.SerializerMethodField()

    class Meta:
        model = LessonPlan
        fields = '__all__'

    def get_teacherName(self, obj):
        return obj.teacher.name if obj.teacher else ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["genericSkills"] = data.pop("generic_skills", "")
        data["teacherActivities"] = data.pop("teacher_activities", "")
        data["learnerActivities"] = data.pop("learner_activities", "")
        data["mainActivity"] = data.pop("main_activity", "")
        data["teachingMaterials"] = data.pop("teaching_materials", "")
        data["teacherName"] = instance.teacher.name if instance.teacher else ""
        data["class"] = instance.stream.display_name() if instance.stream else ""
        return data


class LessonPlanWriteSerializer(serializers.ModelSerializer):
    subjectId = serializers.UUIDField(write_only=True)
    streamId = serializers.UUIDField(write_only=True)
    genericSkills = serializers.CharField(source="generic_skills")
    teacherActivities = serializers.CharField(source="teacher_activities")
    learnerActivities = serializers.CharField(source="learner_activities")
    mainActivity = serializers.CharField(source="main_activity")
    teachingMaterials = serializers.CharField(source="teaching_materials", allow_blank=True, required=False)

    class Meta:
        model = LessonPlan
        fields = (
            "id",
            "scheme",
            "date",
            "subjectId",
            "streamId",
            "term",
            "week",
            "periods",
            "topic",
            "competencies",
            "learning_outcomes",
            "indicators",
            "values",
            "genericSkills",
            "introduction",
            "teacherActivities",
            "learnerActivities",
            "mainActivity",
            "assessment",
            "reflection",
            "homework",
            "teachingMaterials",
            "references",
            "status",
            "submitted_to",
        )

    def create(self, validated_data):
        subject_id = validated_data.pop("subjectId")
        stream_id = validated_data.pop("streamId")
        validated_data["subject_id"] = subject_id
        validated_data["stream_id"] = stream_id
        return LessonPlan.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if "subjectId" in validated_data:
            instance.subject_id = validated_data.pop("subjectId")
        if "streamId" in validated_data:
            instance.stream_id = validated_data.pop("streamId")
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance


class SubmissionSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    teacherName = serializers.CharField()
    subjectClass = serializers.CharField()
    submittedTo = serializers.CharField()
    submittedDate = serializers.CharField()
    status = serializers.CharField()
    feedback = serializers.CharField()

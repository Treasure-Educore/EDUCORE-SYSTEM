from rest_framework import serializers

from .models import NurseProfile, SickbayVisit, MedicalRecord
from students.models import Student


class NurseProfileSerializer(serializers.ModelSerializer):
    staffName = serializers.CharField(source='staff_profile.user.name', read_only=True)

    class Meta:
        model = NurseProfile
        fields = ('id', 'staff_profile', 'staffName', 'qualification', 'license_number', 'on_duty')


class SickbayVisitListSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source='student.full_name', read_only=True)
    studentId = serializers.UUIDField(source='student.id', read_only=True)
    attendedBy = serializers.CharField(source='attended_by.email', read_only=True)

    class Meta:
        model = SickbayVisit
        fields = ('id', 'studentId', 'studentName', 'date', 'time_in', 'time_out', 'complaint', 'visit_type', 'attendedBy')


class SickbayVisitDetailSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    attended_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SickbayVisit
        fields = '__all__'


class SickbayVisitCreateSerializer(serializers.ModelSerializer):
    # expose studentId field in camelCase for API clients
    studentId = serializers.PrimaryKeyRelatedField(source='student', queryset=Student.objects.none())

    class Meta:
        model = SickbayVisit
        fields = ('id', 'studentId', 'complaint', 'diagnosis', 'treatment', 'medication_given', 'visit_type', 'referred_to', 'follow_up_required', 'follow_up_date', 'notes')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # set queryset lazily to avoid import-time issues
        self.fields['studentId'].queryset = Student.objects.all()


class MedicalRecordSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = ('id', 'student', 'studentName', 'blood_type', 'allergies', 'chronic_conditions', 'emergency_contact_name', 'emergency_contact_phone', 'doctor_name', 'doctor_phone', 'insurance_provider', 'insurance_number', 'notes')

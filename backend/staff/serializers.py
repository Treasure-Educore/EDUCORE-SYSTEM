from rest_framework import serializers
from accounts.models import User
from .models import Department, Subject, StaffProfile


class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'department_name']


class DepartmentSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'subjects']


class StaffListSerializer(serializers.ModelSerializer):
    """Serializer for GET /api/staff/ - returns camelCase for frontend"""
    fullName = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    staffNumber = serializers.CharField(source='staff_number', read_only=True)
    subjects = serializers.SerializerMethodField()
    classTeacher = serializers.CharField(source='class_teacher_stream', read_only=True)

    class Meta:
        model = StaffProfile
        fields = ['id', 'staffNumber', 'fullName', 'email', 'role', 'tin', 'subjects', 'classTeacher', 'status']

    def get_subjects(self, obj):
        """Return list of subject names, not objects"""
        return [subject.name for subject in obj.subjects.all()]


class StaffCreateSerializer(serializers.Serializer):
    """Serializer for POST /api/staff/ - creates User and StaffProfile"""
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    tin = serializers.CharField(max_length=20, required=False, allow_blank=True)
    bank_account = serializers.CharField(max_length=50, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['teacher', 'dos', 'bursar', 'head_teacher', 'admin', 'non_teaching'])
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        many=True,
        required=False
    )
    class_teacher_stream = serializers.CharField(max_length=20, required=False, allow_blank=True)
    patron_club = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        # Extract subject_ids before creating
        subject_ids = validated_data.pop('subject_ids', [])
        
        # Create User
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['full_name'],
            role=validated_data['role']
        )
        
        # Create StaffProfile
        staff_profile = StaffProfile.objects.create(
            user=user,
            phone=validated_data.get('phone', ''),
            gender=validated_data.get('gender', ''),
            tin=validated_data.get('tin', ''),
            bank_account=validated_data.get('bank_account', ''),
            department=validated_data.get('department_id'),
            class_teacher_stream=validated_data.get('class_teacher_stream', ''),
            patron_club=validated_data.get('patron_club', '')
        )
        
        # Add subjects
        if subject_ids:
            staff_profile.subjects.set(subject_ids)
        
        return staff_profile


class StaffUpdateSerializer(serializers.Serializer):
    """Serializer for PATCH /api/staff/{id}/ - updates User and StaffProfile"""
    full_name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    tin = serializers.CharField(max_length=20, required=False, allow_blank=True)
    bank_account = serializers.CharField(max_length=50, required=False, allow_blank=True)
    role = serializers.ChoiceField(
        choices=['teacher', 'dos', 'bursar', 'head_teacher', 'admin', 'non_teaching'],
        required=False
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        many=True,
        required=False
    )
    class_teacher_stream = serializers.CharField(max_length=20, required=False, allow_blank=True)
    patron_club = serializers.CharField(max_length=100, required=False, allow_blank=True)
    status = serializers.ChoiceField(
        choices=['Active', 'On Leave', 'Inactive'],
        required=False
    )

    def update(self, instance, validated_data):
        # Extract subject_ids before updating
        subject_ids = validated_data.pop('subject_ids', None)
        
        # Update User fields
        user = instance.user
        if 'full_name' in validated_data:
            user.name = validated_data['full_name']
        if 'email' in validated_data:
            user.email = validated_data['email']
        if 'role' in validated_data:
            user.role = validated_data['role']
        user.save()
        
        # Update StaffProfile fields
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
        if 'gender' in validated_data:
            instance.gender = validated_data['gender']
        if 'tin' in validated_data:
            instance.tin = validated_data['tin']
        if 'bank_account' in validated_data:
            instance.bank_account = validated_data['bank_account']
        if 'department_id' in validated_data:
            instance.department = validated_data['department_id']
        if 'class_teacher_stream' in validated_data:
            instance.class_teacher_stream = validated_data['class_teacher_stream']
        if 'patron_club' in validated_data:
            instance.patron_club = validated_data['patron_club']
        if 'status' in validated_data:
            instance.status = validated_data['status']
        
        instance.save()
        
        # Update subjects
        if subject_ids is not None:
            instance.subjects.set(subject_ids)
        
        return instance

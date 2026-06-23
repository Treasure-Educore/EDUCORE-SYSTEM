from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdminOrHeadTeacher
from .models import Department, Subject, StaffProfile
from .serializers import (
    DepartmentSerializer,
    SubjectSerializer,
    StaffListSerializer,
    StaffCreateSerializer,
    StaffUpdateSerializer,
)


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/subjects/ - list all subjects (id + name), no auth required for seeding dropdowns"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/departments/ - list all departments with subjects"""
    queryset = Department.objects.prefetch_related('subjects').all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class StaffViewSet(viewsets.ModelViewSet):
    """
    Staff management viewset
    - list/retrieve: StaffListSerializer (IsAuthenticated)
    - create: StaffCreateSerializer (IsAdminOrHeadTeacher)
    - update/partial_update: StaffUpdateSerializer (IsAdminOrHeadTeacher)
    - delete: (IsAdminOrHeadTeacher)
    """
    queryset = StaffProfile.objects.select_related('user', 'department').prefetch_related('subjects').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['user__name', 'user__email']
    ordering_fields = ['user__name', 'created_at']
    ordering = ['user__name']
    pagination_class = None  # Disable pagination for this viewset

    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StaffUpdateSerializer
        else:
            return StaffListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrHeadTeacher]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_profile = serializer.save()
        # Return the created object serialized with StaffListSerializer
        return_serializer = StaffListSerializer(staff_profile)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED)


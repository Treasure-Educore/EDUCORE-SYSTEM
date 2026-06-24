from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdminOrHeadTeacher
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    Announcement management viewset
    - GET /api/announcements/ - list all, filter by ?audience=Staff
    - POST /api/announcements/ - create (admin and head_teacher only)
    - PATCH /api/announcements/{id}/ - update (admin and head_teacher only)
    - DELETE /api/announcements/{id}/ - delete (admin and head_teacher only)
    """
    queryset = Announcement.objects.select_related('posted_by').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['audience']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrHeadTeacher]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


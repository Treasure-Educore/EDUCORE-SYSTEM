from django.db.models import Value
from django.db.models.functions import Concat
from rest_framework import mixins, viewsets
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdminOrHeadTeacher

from .models import ClassLevel, Club, Dormitory, Stream, Student
from .serializers import (
    ClassLevelOptionSerializer,
    ClubOptionSerializer,
    DormitoryOptionSerializer,
    StreamOptionSerializer,
    StudentCreateSerializer,
    StudentListSerializer,
    StudentUpdateSerializer,
)


class StudentPagination(PageNumberPagination):
    page_size = 25


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related(
        "stream__class_level",
        "club",
        "dormitory",
    )
    filter_backends = (SearchFilter,)
    search_fields = ("full_name", "student_number")
    pagination_class = StudentPagination

    def get_queryset(self):
        queryset = super().get_queryset()

        year = self.request.query_params.get("year")
        status = self.request.query_params.get("status")
        stream = self.request.query_params.get("stream")

        if year:
            queryset = queryset.filter(year_of_entry=year)
        if status:
            queryset = queryset.filter(status=status)
        if stream:
            queryset = queryset.annotate(
                stream_display_name=Concat(
                    "stream__class_level__name",
                    Value(" "),
                    "stream__name",
                )
            ).filter(stream_display_name=stream)

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return StudentCreateSerializer
        if self.action in ("update", "partial_update"):
            return StudentUpdateSerializer
        return StudentListSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            permission_classes = (IsAuthenticated,)
        else:
            permission_classes = (IsAdminOrHeadTeacher,)
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DormitoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Dormitory.objects.all()
    serializer_class = DormitoryOptionSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = None


class ClubViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubOptionSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = None


class StreamViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = StreamOptionSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        queryset = Stream.objects.select_related("class_level")
        class_level = self.request.query_params.get("class_level")

        if class_level:
            queryset = queryset.filter(class_level__name=class_level)

        return queryset


class ClassLevelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelOptionSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = None

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import NoPagination

from .models import Period, TimetableSlot
from .serializers import (
	PeriodSerializer,
	TimetableSlotReadSerializer,
	TimetableSlotWriteSerializer,
)


class TimetableSlotViewSet(viewsets.ModelViewSet):
	serializer_class = TimetableSlotReadSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		qs = TimetableSlot.objects.select_related(
			"period", "stream__class_level", "subject", "teacher"
		).all()
		stream_id = self.request.query_params.get("streamId")
		teacher_id = self.request.query_params.get("teacherId")
		academic_year = self.request.query_params.get("year", "2025/2026")
		if stream_id:
			qs = qs.filter(stream_id=stream_id)
		if teacher_id:
			qs = qs.filter(teacher_id=teacher_id)
		return qs.filter(academic_year=academic_year)

	def get_serializer_class(self):
		if self.action in ("create", "update", "partial_update"):
			return TimetableSlotWriteSerializer
		return TimetableSlotReadSerializer

	def perform_create(self, serializer):
		serializer.save()

	def create(self, request, *args, **kwargs):
		try:
			return super().create(request, *args, **kwargs)
		except Exception as e:
			return Response({"detail": str(e)}, status=400)

	def update(self, request, *args, **kwargs):
		try:
			return super().update(request, *args, **kwargs)
		except Exception as e:
			return Response({"detail": str(e)}, status=400)


class PeriodViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = Period.objects.all()
	serializer_class = PeriodSerializer
	permission_classes = [IsAuthenticated]
	pagination_class = NoPagination


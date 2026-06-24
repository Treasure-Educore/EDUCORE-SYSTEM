from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import SchemeOfWork, LessonPlan
from .serializers import (
	SchemeOfWorkListSerializer,
	SchemeOfWorkDetailSerializer,
	SchemeOfWorkWriteSerializer,
	LessonPlanListSerializer,
	LessonPlanDetailSerializer,
	LessonPlanWriteSerializer,
	SubmissionSerializer,
)
from accounts.permissions import IsDOS, IsHeadTeacher, IsAdmin, IsTeacher


class SchemeOfWorkViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated]
	filterset_fields = ["status", "term"]

	def get_queryset(self):
		qs = SchemeOfWork.objects.select_related("subject", "stream__class_level", "teacher").all()
		if self.request.user.role == "teacher":
			qs = qs.filter(teacher=self.request.user)
		return qs

	def get_serializer_class(self):
		if self.action == "list":
			return SchemeOfWorkListSerializer
		if self.action in ("create", "update", "partial_update"):
			return SchemeOfWorkWriteSerializer
		return SchemeOfWorkDetailSerializer

	def perform_create(self, serializer):
		# Only teachers may create schemes of work
		if self.request.user.role != "teacher":
			from rest_framework.exceptions import PermissionDenied

			raise PermissionDenied("Only teachers may create schemes of work.")
		serializer.save(teacher=self.request.user)

	@action(detail=True, methods=["patch"], url_path="approve", permission_classes=[IsDOS | IsHeadTeacher | IsAdmin])
	def approve(self, request, pk=None):
		scheme = self.get_object()
		scheme.status = "Approved"
		scheme.reviewed_date = timezone.now().date()
		scheme.feedback = request.data.get("feedback", "")
		scheme.save()
		return Response(SchemeOfWorkDetailSerializer(scheme).data)

	@action(detail=True, methods=["patch"], url_path="request-revision", permission_classes=[IsDOS | IsHeadTeacher | IsAdmin])
	def request_revision(self, request, pk=None):
		scheme = self.get_object()
		scheme.status = "Revision Requested"
		scheme.reviewed_date = timezone.now().date()
		scheme.feedback = request.data.get("feedback", "")
		scheme.save()
		return Response(SchemeOfWorkDetailSerializer(scheme).data)


class LessonPlanViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		qs = LessonPlan.objects.select_related("subject", "stream__class_level", "teacher").all()
		if self.request.user.role == "teacher":
			qs = qs.filter(teacher=self.request.user)
		return qs

	def get_serializer_class(self):
		if self.action == "list":
			return LessonPlanListSerializer
		if self.action in ("create", "update", "partial_update"):
			return LessonPlanWriteSerializer
		return LessonPlanDetailSerializer

	def perform_create(self, serializer):
		serializer.save(teacher=self.request.user)

	@action(detail=True, methods=["patch"], url_path="approve", permission_classes=[IsDOS | IsHeadTeacher | IsAdmin])
	def approve(self, request, pk=None):
		plan = self.get_object()
		plan.status = "Approved"
		plan.reviewed_date = timezone.now().date()
		plan.feedback = request.data.get("feedback", "")
		plan.save()
		return Response(LessonPlanDetailSerializer(plan).data)

	@action(detail=True, methods=["patch"], url_path="request-revision", permission_classes=[IsDOS | IsHeadTeacher | IsAdmin])
	def request_revision(self, request, pk=None):
		plan = self.get_object()
		plan.status = "Revision Requested"
		plan.reviewed_date = timezone.now().date()
		plan.feedback = request.data.get("feedback", "")
		plan.save()
		return Response(LessonPlanDetailSerializer(plan).data)


class SubmissionsViewSet(viewsets.ViewSet):
	permission_classes = [IsAuthenticated]

	def list(self, request):
		user = request.user
		schemes_qs = SchemeOfWork.objects.exclude(status='Draft').select_related('subject', 'stream__class_level', 'teacher')
		plans_qs = LessonPlan.objects.exclude(status='Draft').select_related('subject', 'stream__class_level', 'teacher')

		if user.role == 'teacher':
			schemes_qs = schemes_qs.filter(teacher=user)
			plans_qs = plans_qs.filter(teacher=user)

		result = []
		for s in schemes_qs:
			result.append({
				'id': f'sow-{s.id}',
				'type': 'Scheme of Work',
				'title': s.theme_topic or 'Untitled Scheme',
				'teacherName': s.teacher.name if s.teacher else 'Unknown',
				'subjectClass': f'{s.subject.name} · {s.stream.display_name()}',
				'submittedTo': s.submitted_to or 'Director of Studies',
				'submittedDate': str(s.submitted_date) if s.submitted_date else '',
				'status': s.status,
				'feedback': s.feedback,
			})
		for p in plans_qs:
			result.append({
				'id': f'lp-{p.id}',
				'type': 'Lesson Plan',
				'title': p.topic or 'Untitled Lesson Plan',
				'teacherName': p.teacher.name if p.teacher else 'Unknown',
				'subjectClass': f'{p.subject.name} · {p.stream.display_name()}',
				'submittedTo': p.submitted_to or 'Director of Studies',
				'submittedDate': str(p.submitted_date) if p.submitted_date else '',
				'status': p.status,
				'feedback': p.feedback,
			})

		# Sort by submittedDate descending
		result.sort(key=lambda x: x['submittedDate'] or '', reverse=True)
		return Response(result)

	@action(detail=True, methods=['patch'], url_path='review', permission_classes=[IsDOS | IsHeadTeacher | IsAdmin])
	def review(self, request, pk=None):
		parts = pk.split('-', 1)
		item_type, item_id = parts[0], parts[1]
		new_status = request.data.get('status')
		feedback = request.data.get('feedback', '')
		if item_type == 'sow':
			obj = SchemeOfWork.objects.get(id=item_id)
		else:
			obj = LessonPlan.objects.get(id=item_id)
		obj.status = new_status
		obj.feedback = feedback
		obj.reviewed_date = timezone.now().date()
		obj.save()
		return Response({'id': pk, 'status': new_status, 'feedback': feedback})


from datetime import date

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NurseProfile, SickbayVisit, MedicalRecord
from .serializers import (
    NurseProfileSerializer,
    SickbayVisitListSerializer,
    SickbayVisitDetailSerializer,
    SickbayVisitCreateSerializer,
    MedicalRecordSerializer,
)


class SickbayVisitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = SickbayVisit.objects.select_related('student', 'attended_by').all()
        student_id = self.request.query_params.get('studentId')
        date_q = self.request.query_params.get('date')
        visit_type = self.request.query_params.get('visitType')
        if student_id:
            qs = qs.filter(student_id=student_id)
        if date_q:
            qs = qs.filter(date=date_q)
        if visit_type:
            qs = qs.filter(visit_type=visit_type)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return SickbayVisitCreateSerializer
        if self.action in ('retrieve', 'update', 'partial_update'):
            return SickbayVisitDetailSerializer
        return SickbayVisitListSerializer

    def perform_create(self, serializer):
        serializer.save(attended_by=self.request.user)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MedicalRecord.objects.select_related('student').all()
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('studentId')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs


class NurseProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = NurseProfile.objects.select_related('staff_profile__user').all()
    serializer_class = NurseProfileSerializer


class SickbaySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        totalVisitsToday = SickbayVisit.objects.filter(date=today).count()
        totalVisitsThisMonth = SickbayVisit.objects.filter(date__year=today.year, date__month=today.month).count()
        admittedCurrently = SickbayVisit.objects.filter(visit_type='admitted', time_out__isnull=True).count()
        referredThisMonth = SickbayVisit.objects.filter(visit_type='referred', date__year=today.year, date__month=today.month).count()
        followUpsDue = SickbayVisit.objects.filter(follow_up_required=True, follow_up_date__lte=today).count()

        return Response({
            'totalVisitsToday': totalVisitsToday,
            'totalVisitsThisMonth': totalVisitsThisMonth,
            'admittedCurrently': admittedCurrently,
            'referredThisMonth': referredThisMonth,
            'followUpsDue': followUpsDue,
        })

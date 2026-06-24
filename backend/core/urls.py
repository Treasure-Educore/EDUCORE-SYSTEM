from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import CustomTokenObtainPairView
from attendance.views import AttendanceViewSet
from staff.views import StaffViewSet, SubjectViewSet, DepartmentViewSet
from announcements.views import AnnouncementViewSet
from analytics.views import DashboardView, AnalyticsSummaryView
from core.views import health_check
from fees.views import BursaryViewSet, FeeListView, FeeSummaryView, PaymentCreateView
from marks.views import ContinuousAssessmentViewSet, TermListView
from portfolios.views import PortfolioItemViewSet
from reports.views import ReportCardPDFView, StudentReportCardView
from timetable.views import TimetableSlotViewSet, PeriodViewSet
from schemes.views import SchemeOfWorkViewSet, LessonPlanViewSet, SubmissionsViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'timetable/slots', TimetableSlotViewSet, basename='timetable-slot')
router.register(r'timetable/periods', PeriodViewSet, basename='period')
router.register(r'schemes', SchemeOfWorkViewSet, basename='scheme')
router.register(r'lesson-plans', LessonPlanViewSet, basename='lessonplan')
router.register(r'submissions', SubmissionsViewSet, basename='submissions')
router.register(r'assessments', ContinuousAssessmentViewSet, basename='assessment')
router.register(r'bursaries', BursaryViewSet, basename='bursary')
router.register(r'portfolios', PortfolioItemViewSet, basename='portfolio')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('api/fees/', FeeListView.as_view(), name='fees-list'),
    path('api/fees/payments/', PaymentCreateView.as_view(), name='fees-payment-create'),
    path('api/fees/summary/', FeeSummaryView.as_view(), name='fees-summary'),
    path('api/reports/student/<uuid:pk>/', StudentReportCardView.as_view(), name='student-report-card'),
    path('api/reports/student/<uuid:pk>/pdf/', ReportCardPDFView.as_view(), name='student-report-card-pdf'),
    path('api/', include('students.urls')),
    path('api/', include('marks.urls')),
    path('api/terms/', TermListView.as_view(), name='terms'),
]

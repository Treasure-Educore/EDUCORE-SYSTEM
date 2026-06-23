from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import CustomTokenObtainPairView
from staff.views import StaffViewSet, SubjectViewSet, DepartmentViewSet
from announcements.views import AnnouncementViewSet
from analytics.views import dashboard

# Create router and register viewsets
router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/dashboard/', dashboard, name='dashboard'),
]

from django.contrib import admin
<<<<<<< HEAD
from django.urls import path, include
from rest_framework.routers import DefaultRouter
=======
from django.urls import include, path
>>>>>>> d942dbf6110f4b0727a5b4df2439e2b1cf9fc3c0
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
<<<<<<< HEAD
    path('api/', include(router.urls)),
    path('api/dashboard/', dashboard, name='dashboard'),
=======
    path('api/', include('students.urls')),
>>>>>>> d942dbf6110f4b0727a5b4df2439e2b1cf9fc3c0
]

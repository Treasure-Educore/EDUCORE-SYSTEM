from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SickbayVisitViewSet, MedicalRecordViewSet, NurseProfileViewSet, SickbaySummaryView

router = DefaultRouter()
router.register(r'visits', SickbayVisitViewSet, basename='sickbay-visit')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'nurses', NurseProfileViewSet, basename='nurse')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', SickbaySummaryView.as_view(), name='sickbay-summary'),
]

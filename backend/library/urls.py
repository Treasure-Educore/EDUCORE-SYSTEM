from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, LibraryCardViewSet, BookIssueViewSet, LibrarySummaryView

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'cards', LibraryCardViewSet, basename='card')
router.register(r'issues', BookIssueViewSet, basename='issue')
router.register(r'summary', LibrarySummaryView, basename='library-summary')

urlpatterns = [
    path('', include(router.urls)),
]

from rest_framework.routers import DefaultRouter

from .views import MarksViewSet

router = DefaultRouter()
router.register("marks", MarksViewSet, basename="marks")

urlpatterns = router.urls

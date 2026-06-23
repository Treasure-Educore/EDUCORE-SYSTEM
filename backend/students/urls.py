from rest_framework.routers import DefaultRouter

from .views import (
    ClassLevelViewSet,
    ClubViewSet,
    DormitoryViewSet,
    StreamViewSet,
    StudentViewSet,
)

router = DefaultRouter()
router.register("students", StudentViewSet, basename="student")
router.register("dormitories", DormitoryViewSet, basename="dormitory")
router.register("clubs", ClubViewSet, basename="club")
router.register("streams", StreamViewSet, basename="stream")
router.register("class-levels", ClassLevelViewSet, basename="class-level")

urlpatterns = router.urls

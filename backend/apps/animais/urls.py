from rest_framework.routers import DefaultRouter

from .views import AnimalViewSet

router = DefaultRouter()

router.register(
    "animais",
    AnimalViewSet,
    basename="animal",
)

urlpatterns = router.urls
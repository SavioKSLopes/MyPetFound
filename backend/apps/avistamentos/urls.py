from rest_framework.routers import DefaultRouter

from .views import AvistamentoViewSet

router = DefaultRouter()

router.register(
    "avistamentos",
    AvistamentoViewSet,
    basename="avistamento",
)

urlpatterns = router.urls
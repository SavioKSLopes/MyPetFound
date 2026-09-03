from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AvistamentoViewSet, RegistrarAvistamentoPublicoView


router = DefaultRouter()

router.register(
    "avistamentos",
    AvistamentoViewSet,
    basename="avistamento",
)


urlpatterns = [
    path(
        "publico/avistamentos/",
        RegistrarAvistamentoPublicoView.as_view(),
        name="registrar-avistamento-publico",
    ),
]

urlpatterns += router.urls
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AnimalPerdidoPublicoDetalheView,
    AnimalQRCodeView,
    AnimalViewSet,
    AnimaisPerdidosPublicosView,
)

router = DefaultRouter()

router.register(
    "animais",
    AnimalViewSet,
    basename="animal",
)

urlpatterns = [
    path(
        "publico/animais-perdidos/",
        AnimaisPerdidosPublicosView.as_view(),
        name="animais-perdidos-publicos",
    ),
    path(
        "publico/animais-perdidos/<int:pk>/",
        AnimalPerdidoPublicoDetalheView.as_view(),
        name="animal-perdido-publico-detalhe",
    ),
    path(
        "animais/<int:pk>/qrcode/",
        AnimalQRCodeView.as_view(),
        name="animal-qrcode",
    ),
]

urlpatterns += router.urls
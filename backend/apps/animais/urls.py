from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.comunicacoes.views import CriarMensagemContatoView

from .views import (
    AnimalPerdidoPublicoDetalheView,
    AnimalQRCodeView,
    AnimalViewSet,
    AnimaisPerdidosPublicosView,
    AnimalIdentificacaoPublicaView,
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
    path(
        "publico/identificacao/<str:codigo>/",
        AnimalIdentificacaoPublicaView.as_view(),
        name="animal-identificacao-publica",
    ),
    path(
        "animais/<int:animal_id>/mensagens/",
        CriarMensagemContatoView.as_view(),
        name="criar-mensagem-contato",
    ),
]

urlpatterns += router.urls
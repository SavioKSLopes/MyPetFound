from django.urls import path

from .views import (
    ListarMensagensContatoView,
    MarcarMensagemComoLidaView,
    ContarMensagensNaoLidasView,
)

urlpatterns = [
    path(
        "comunicacoes/mensagens/",
        ListarMensagensContatoView.as_view(),
        name="listar-mensagens-contato",
    ),
    path(
        "comunicacoes/mensagens/<int:mensagem_id>/ler/",
        MarcarMensagemComoLidaView.as_view(),
        name="marcar-mensagem-como-lida",
    ),
    path(
        "comunicacoes/mensagens/nao-lidas/contar/",
        ContarMensagensNaoLidasView.as_view(),
        name="contar-mensagens-nao-lidas",
    ),
]
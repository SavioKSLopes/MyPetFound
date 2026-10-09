from django.urls import path

from .views import (
    CadastroUsuarioView,
    ConfirmarRedefinicaoSenhaView,
    LoginView,
    PerfilUsuarioView,
    SolicitarRedefinicaoSenhaView,
)


urlpatterns = [
    path("auth/cadastro/", CadastroUsuarioView.as_view(), name="cadastro"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", PerfilUsuarioView.as_view(), name="perfil"),
    path(
        "auth/esqueci-senha/",
        SolicitarRedefinicaoSenhaView.as_view(),
        name="esqueci-senha",
    ),
    path(
        "auth/redefinir-senha/",
        ConfirmarRedefinicaoSenhaView.as_view(),
        name="redefinir-senha",
    ),
]

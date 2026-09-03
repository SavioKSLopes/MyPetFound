from django.urls import path

from .views import CadastroUsuarioView, LoginView, PerfilUsuarioView


urlpatterns = [
    path("auth/cadastro/", CadastroUsuarioView.as_view(), name="cadastro"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", PerfilUsuarioView.as_view(), name="perfil"),
]
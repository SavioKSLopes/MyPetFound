from rest_framework import generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings

from .serializers import CadastroUsuarioSerializer, UsuarioSerializer


class CadastroUsuarioView(generics.CreateAPIView):
    serializer_class = CadastroUsuarioSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()

        token, _ = Token.objects.get_or_create(user=usuario)

        return Response(
            {
                "usuario": UsuarioSerializer(usuario).data,
                "token": token.key,
            },
            status=201,
        )


class PerfilUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

class LoginView(ObtainAuthToken):
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
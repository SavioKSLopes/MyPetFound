import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.throttling import ScopedRateThrottle

from .serializers import (
    CadastroUsuarioSerializer,
    RedefinirSenhaSerializer,
    SolicitarRedefinicaoSenhaSerializer,
    UsuarioSerializer,
)


User = get_user_model()
logger = logging.getLogger(__name__)
MENSAGEM_SOLICITACAO = (
    "Se houver uma conta ativa associada a este e-mail, enviaremos "
    "instruções para redefinir sua senha."
)
MENSAGEM_LINK_INVALIDO = (
    "O link de redefinição é inválido ou expirou. Solicite um novo link."
)


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


class SolicitarRedefinicaoSenhaView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset_request"

    def post(self, request):
        serializer = SolicitarRedefinicaoSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        usuario = User._default_manager.filter(
            email__iexact=email,
            is_active=True,
        ).exclude(email="").first()

        if usuario:
            uid = urlsafe_base64_encode(force_bytes(usuario.pk))
            token = default_token_generator.make_token(usuario)
            link = (
                f"{settings.FRONTEND_URL.rstrip('/')}/redefinir-senha/"
                f"{uid}/{token}"
            )
            mensagem = (
                "Olá,\n\n"
                "Recebemos uma solicitação para redefinir a senha da sua "
                "conta no MyPetFound.\n\n"
                "Para criar uma nova senha, acesse o link abaixo:\n\n"
                f"{link}\n\n"
                "Se você não solicitou essa alteração, ignore este e-mail.\n\n"
                "Este link é temporário e pode ser utilizado apenas uma vez."
            )
            try:
                send_mail(
                    subject="Redefinição de senha — MyPetFound",
                    message=mensagem,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[usuario.email],
                )
            except Exception:
                logger.exception("Falha ao enviar e-mail de redefinição de senha.")

        return Response({"detail": MENSAGEM_SOLICITACAO})


class ConfirmarRedefinicaoSenhaView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset_confirm"

    def post(self, request):
        serializer = RedefinirSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(dados["uid"]))
        except (TypeError, ValueError, OverflowError, UnicodeDecodeError):
            return Response(
                {"detail": MENSAGEM_LINK_INVALIDO},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                usuario = User._default_manager.select_for_update().get(pk=uid)

                if not usuario.is_active or not default_token_generator.check_token(
                    usuario,
                    dados["token"],
                ):
                    return Response(
                        {"detail": MENSAGEM_LINK_INVALIDO},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if dados["nova_senha"] != dados["confirmacao_senha"]:
                    raise serializers.ValidationError({
                        "confirmacao_senha": "As senhas informadas não conferem."
                    })

                try:
                    validate_password(dados["nova_senha"], user=usuario)
                except DjangoValidationError as error:
                    raise serializers.ValidationError({"nova_senha": error.messages}) from error

                usuario.set_password(dados["nova_senha"])
                usuario.save(update_fields=["password"])
                Token.objects.filter(user=usuario).delete()
        except User.DoesNotExist:
            return Response(
                {"detail": MENSAGEM_LINK_INVALIDO},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "detail": "Senha redefinida com sucesso. Faça login com sua nova senha."
        })

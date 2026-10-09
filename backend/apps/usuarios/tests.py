import re
from unittest.mock import patch

from django.core import mail
from django.core.cache import cache
from django.test import SimpleTestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from config.settings import obter_configuracao_email


User = get_user_model()


class ConfiguracaoEmailTests(SimpleTestCase):
    def test_sem_host_usa_backend_de_console(self):
        configuracao = obter_configuracao_email({})

        self.assertEqual(
            configuracao["EMAIL_BACKEND"],
            "django.core.mail.backends.console.EmailBackend",
        )
        self.assertEqual(configuracao["EMAIL_HOST"], "")
        self.assertEqual(configuracao["EMAIL_PORT"], 587)

    def test_host_configurado_seleciona_smtp_e_usa_variaveis(self):
        configuracao = obter_configuracao_email({
            "EMAIL_HOST": " smtp.example.test ",
            "EMAIL_PORT": "2525",
            "EMAIL_HOST_USER": "conta-teste",
            "EMAIL_HOST_PASSWORD": "senha-ficticia-de-teste",
            "EMAIL_USE_TLS": "True",
            "EMAIL_USE_SSL": "False",
            "DEFAULT_FROM_EMAIL": "nao-responda@example.test",
        })

        self.assertEqual(
            configuracao["EMAIL_BACKEND"],
            "django.core.mail.backends.smtp.EmailBackend",
        )
        self.assertEqual(configuracao["EMAIL_HOST"], "smtp.example.test")
        self.assertEqual(configuracao["EMAIL_PORT"], 2525)
        self.assertEqual(configuracao["EMAIL_HOST_USER"], "conta-teste")
        self.assertEqual(
            configuracao["EMAIL_HOST_PASSWORD"],
            "senha-ficticia-de-teste",
        )
        self.assertTrue(configuracao["EMAIL_USE_TLS"])
        self.assertFalse(configuracao["EMAIL_USE_SSL"])
        self.assertEqual(
            configuracao["DEFAULT_FROM_EMAIL"],
            "nao-responda@example.test",
        )

    def test_ssl_desativa_tls(self):
        configuracao = obter_configuracao_email({
            "EMAIL_HOST": "smtp.example.test",
            "EMAIL_USE_TLS": "True",
            "EMAIL_USE_SSL": "True",
        })

        self.assertTrue(configuracao["EMAIL_USE_SSL"])
        self.assertFalse(configuracao["EMAIL_USE_TLS"])


class CadastroUsuarioTests(APITestCase):
    def setUp(self):
        self.url = reverse("cadastro")
        self.dados = {
            "username": "tutor-teste",
            "email": "tutor@example.com",
            "password": "UmaSenhaForte!2026",
            "password_confirmation": "UmaSenhaForte!2026",
            "first_name": "Ana",
            "last_name": "Silva",
        }

    def test_cadastro_valido_cria_usuario_seguro_e_token(self):
        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 201)
        usuario = User.objects.get(username=self.dados["username"])
        self.assertTrue(usuario.check_password(self.dados["password"]))
        self.assertNotEqual(usuario.password, self.dados["password"])
        self.assertFalse(usuario.is_staff)
        self.assertFalse(usuario.is_superuser)
        self.assertNotIn("password", response.data)
        self.assertNotIn("password_confirmation", response.data)
        self.assertNotIn(self.dados["password"], str(response.data))
        self.assertEqual(response.data["token"], Token.objects.get(user=usuario).key)
        self.assertEqual(response.data["usuario"]["username"], usuario.username)

        login = self.client.post(
            reverse("login"),
            {
                "username": self.dados["username"],
                "password": self.dados["password"],
            },
            format="json",
        )

        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.data["token"], response.data["token"])

    def test_senhas_diferentes_nao_criam_usuario(self):
        self.dados["password_confirmation"] = "OutraSenhaForte!2026"

        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("password_confirmation", response.data)
        self.assertFalse(User.objects.filter(username=self.dados["username"]).exists())

    def test_email_invalido_nao_cria_usuario(self):
        self.dados["email"] = "email-invalido"

        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)
        self.assertFalse(User.objects.filter(username=self.dados["username"]).exists())

    def test_username_duplicado_nao_cria_usuario(self):
        User.objects.create_user(username=self.dados["username"], password="OutraSenhaForte!2026")

        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)
        self.assertEqual(User.objects.filter(username=self.dados["username"]).count(), 1)

    def test_email_duplicado_sem_diferenciar_maiusculas_nao_cria_usuario(self):
        User.objects.create_user(
            username="outro-tutor",
            email=self.dados["email"].upper(),
            password="OutraSenhaForte!2026",
        )

        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)
        self.assertFalse(User.objects.filter(username=self.dados["username"]).exists())

    def test_senha_fraca_nao_cria_usuario(self):
        self.dados["password"] = "12345678"
        self.dados["password_confirmation"] = "12345678"

        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertFalse(User.objects.filter(username=self.dados["username"]).exists())

    def test_endpoint_e_publico_sem_token(self):
        response = self.client.post(self.url, self.dados, format="json")

        self.assertEqual(response.status_code, 201)

    def test_token_de_cadastro_autentica_endpoint_privado(self):
        cadastro = self.client.post(self.url, self.dados, format="json")
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {cadastro.data['token']}"
        )

        perfil = self.client.get(reverse("perfil"))

        self.assertEqual(perfil.status_code, 200)
        self.assertEqual(perfil.data["username"], self.dados["username"])

    def test_rejeita_campos_de_permissao_inesperados(self):
        dados = {
            **self.dados,
            "is_staff": True,
            "is_superuser": True,
        }

        response = self.client.post(self.url, dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username=self.dados["username"]).exists())


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="https://mypetfound.example",
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [
            "rest_framework.authentication.TokenAuthentication"
        ],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
        "DEFAULT_THROTTLE_RATES": {
            "password_reset_request": "1000/hour",
            "password_reset_confirm": "1000/hour",
        },
    },
)
class RecuperacaoSenhaTests(APITestCase):
    mensagem_solicitacao = (
        "Se houver uma conta ativa associada a este e-mail, enviaremos "
        "instruções para redefinir sua senha."
    )
    mensagem_link_invalido = (
        "O link de redefinição é inválido ou expirou. Solicite um novo link."
    )
    senha_antiga = "SenhaAntigaSegura!2026"
    senha_nova = "NovaSenhaSegura!2026"

    def setUp(self):
        cache.clear()
        self.solicitacao_url = reverse("esqueci-senha")
        self.redefinicao_url = reverse("redefinir-senha")
        self.usuario = User.objects.create_user(
            username="tutor-reset",
            email="tutor-reset@example.com",
            password=self.senha_antiga,
        )

    def solicitar(self, email="tutor-reset@example.com"):
        return self.client.post(
            self.solicitacao_url,
            {"email": email},
            format="json",
        )

    def dados_redefinicao(self, senha=None, confirmacao=None, token=None):
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.usuario.pk))
        return {
            "uid": uid,
            "token": token or "token-invalido",
            "nova_senha": senha or self.senha_nova,
            "confirmacao_senha": confirmacao or senha or self.senha_nova,
        }

    def obter_link(self):
        response = self.solicitar()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        correspondencia = re.search(
            r"https://mypetfound\.example/redefinir-senha/([^/\s]+)/([^/\s]+)",
            mail.outbox[0].body,
        )
        self.assertIsNotNone(correspondencia)
        return correspondencia.groups()

    def test_email_ativo_recebe_resposta_neutra_e_link_frontend(self):
        response = self.solicitar(self.usuario.email.upper())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"detail": self.mensagem_solicitacao})
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Redefinição de senha — MyPetFound")
        self.assertIn(self.usuario.email, mail.outbox[0].to)
        self.assertRegex(
            mail.outbox[0].body,
            r"https://mypetfound\.example/redefinir-senha/[^/\s]+/[^/\s]+",
        )
        self.assertNotIn(self.senha_antiga, mail.outbox[0].body)

    def test_email_inexistente_responde_igual_sem_enviar_email(self):
        response = self.solicitar("nao-existe@example.com")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"detail": self.mensagem_solicitacao})
        self.assertEqual(len(mail.outbox), 0)

    def test_usuario_inativo_responde_igual_sem_enviar_email(self):
        self.usuario.is_active = False
        self.usuario.save(update_fields=["is_active"])

        response = self.solicitar()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"detail": self.mensagem_solicitacao})
        self.assertEqual(len(mail.outbox), 0)

    def test_email_malformado_retorna_erro_de_validacao(self):
        response = self.solicitar("email-invalido")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)

    @patch("apps.usuarios.views.send_mail", side_effect=OSError("SMTP indisponível"))
    def test_falha_smtp_e_registrada_sem_expor_detalhes_na_resposta(self, _send_mail):
        with self.assertLogs("apps.usuarios.views", level="ERROR") as registros:
            response = self.solicitar()

        self.assertTrue(registros.output)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"detail": self.mensagem_solicitacao})
        self.assertNotIn("SMTP indisponível", str(response.data))

    def test_token_valido_redefine_senha_e_revoga_token_drf(self):
        uid, token = self.obter_link()
        token_antigo = Token.objects.create(user=self.usuario)

        response = self.client.post(
            self.redefinicao_url,
            {
                "uid": uid,
                "token": token,
                "nova_senha": self.senha_nova,
                "confirmacao_senha": self.senha_nova,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["detail"], "Senha redefinida com sucesso. Faça login com sua nova senha.")
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(self.senha_nova))
        self.assertFalse(Token.objects.filter(pk=token_antigo.pk).exists())

        login_antigo = self.client.post(
            reverse("login"),
            {"username": self.usuario.username, "password": self.senha_antiga},
            format="json",
        )
        login_novo = self.client.post(
            reverse("login"),
            {"username": self.usuario.username, "password": self.senha_nova},
            format="json",
        )
        self.assertEqual(login_antigo.status_code, 400)
        self.assertEqual(login_novo.status_code, 200)
        self.assertNotEqual(login_novo.data["token"], token_antigo.key)

    def test_token_invalido_nao_altera_senha(self):
        response = self.client.post(
            self.redefinicao_url,
            self.dados_redefinicao(),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"detail": self.mensagem_link_invalido})
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(self.senha_antiga))

    def test_token_reutilizado_e_rejeitado(self):
        uid, token = self.obter_link()
        dados = self.dados_redefinicao(token=token)
        dados["uid"] = uid

        primeira = self.client.post(self.redefinicao_url, dados, format="json")
        segunda = self.client.post(self.redefinicao_url, dados, format="json")

        self.assertEqual(primeira.status_code, 200)
        self.assertEqual(segunda.status_code, 400)
        self.assertEqual(segunda.data, {"detail": self.mensagem_link_invalido})
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(self.senha_nova))

    def test_senhas_diferentes_sao_rejeitadas(self):
        uid, token = self.obter_link()
        dados = self.dados_redefinicao(token=token)
        dados["uid"] = uid
        dados["confirmacao_senha"] = "OutraSenhaSegura!2026"

        response = self.client.post(self.redefinicao_url, dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirmacao_senha", response.data)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(self.senha_antiga))

    def test_senha_fraca_e_rejeitada_pelos_validadores_django(self):
        uid, token = self.obter_link()
        dados = self.dados_redefinicao(senha="12345678", token=token)
        dados["uid"] = uid

        response = self.client.post(self.redefinicao_url, dados, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("nova_senha", response.data)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(self.senha_antiga))

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


User = get_user_model()


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

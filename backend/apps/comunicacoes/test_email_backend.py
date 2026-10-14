import json
import secrets
import traceback
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError, URLError

from django.core.mail import EmailMessage, EmailMultiAlternatives, send_mail
from django.test import SimpleTestCase, override_settings

from config.settings import obter_configuracao_email
from .email_backend import BrevoEmailBackend, BrevoEmailError


@override_settings(
    EMAIL_BACKEND="apps.comunicacoes.email_backend.BrevoEmailBackend",
    DEFAULT_FROM_EMAIL="MyPetFound <remetente@example.test>",
    EMAIL_TIMEOUT=10,
)
class BrevoEmailBackendTests(SimpleTestCase):
    def setUp(self):
        # Random test-only value, never a credential copied into the repository.
        self.chave = secrets.token_hex(24)
        self.settings_override = override_settings(BREVO_API_KEY=self.chave)
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)
        self.http_patch = patch("apps.comunicacoes.email_backend.urlopen")
        self.http = self.http_patch.start()
        self.addCleanup(self.http_patch.stop)
        self.http.return_value.__enter__.return_value.status = 201

    def test_selecao_prioriza_brevo_e_le_variaveis(self):
        config = obter_configuracao_email({
            "BREVO_API_KEY": self.chave,
            "EMAIL_HOST": "smtp.example.test",
            "DEFAULT_FROM_EMAIL": "remetente@example.test",
            "EMAIL_TIMEOUT": "7.5",
        })
        self.assertEqual(config["EMAIL_BACKEND"], BrevoEmailBackend.__module__ + ".BrevoEmailBackend")
        self.assertTrue(config["BREVO_API_KEY"] == self.chave)
        self.assertEqual(config["DEFAULT_FROM_EMAIL"], "remetente@example.test")
        self.assertEqual(config["EMAIL_TIMEOUT"], 7.5)
        self.assertIn("console", obter_configuracao_email({"BREVO_API_KEY": "  "})["EMAIL_BACKEND"])

    def test_send_mail_preserva_texto_html_assunto_e_destinatarios(self):
        enviados = send_mail("Olá — MyPetFound", "Texto com acentos", None,
                              ["Ana <ana@example.test>", "bia@example.test"],
                              html_message="<p>Olá</p>")
        self.assertEqual(enviados, 1)
        request = self.http.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.brevo.com/v3/smtp/email")
        self.assertEqual(request.get_method(), "POST")
        self.assertTrue(request.get_header("Api-key") == self.chave)
        self.assertEqual(self.http.call_args.kwargs["timeout"], 10)
        self.assertEqual(json.loads(request.data), {
            "sender": {"email": "remetente@example.test", "name": "MyPetFound"},
            "subject": "Olá — MyPetFound", "textContent": "Texto com acentos",
            "htmlContent": "<p>Olá</p>",
            "to": [{"email": "ana@example.test", "name": "Ana"}, {"email": "bia@example.test"}],
        })

    def test_html_cc_bcc_reply_to_e_timeout_explicito(self):
        mensagem = EmailMessage("Assunto", "<p>HTML</p>", to=["a@example.test"],
                                cc=["c@example.test"], bcc=["b@example.test"],
                                reply_to=["Resposta <r@example.test>"])
        mensagem.content_subtype = "html"
        self.assertEqual(BrevoEmailBackend(timeout=3).send_messages([mensagem]), 1)
        payload = json.loads(self.http.call_args.args[0].data)
        self.assertEqual(payload["htmlContent"], mensagem.body)
        self.assertNotIn("textContent", payload)
        self.assertEqual(payload["cc"], [{"email": "c@example.test"}])
        self.assertEqual(payload["bcc"], [{"email": "b@example.test"}])
        self.assertEqual(payload["replyTo"], {"email": "r@example.test", "name": "Resposta"})
        self.assertEqual(self.http.call_args.kwargs["timeout"], 3)

    def test_erros_http_e_rede_respeitam_fail_silently_sem_expor_detalhes(self):
        mensagem = EmailMessage("Assunto", "Privado", to=["a@example.test"])
        for erro in [HTTPError(BrevoEmailBackend.endpoint, code, self.chave, {}, None)
                     for code in (400, 401, 429, 500)] + [URLError(self.chave), TimeoutError(self.chave)]:
            with self.subTest(tipo=type(erro).__name__):
                self.http.side_effect = erro
                try:
                    BrevoEmailBackend().send_messages([mensagem])
                except BrevoEmailError:
                    detalhe = traceback.format_exc()
                    self.assertNotIn(self.chave, detalhe)
                    self.assertNotIn("Privado", detalhe)
                else:
                    self.fail("Era esperada uma falha de envio")
                self.assertEqual(BrevoEmailBackend(fail_silently=True).send_messages([mensagem]), 0)

    def test_resposta_inesperada_nao_conta_sucesso(self):
        self.http.return_value.__enter__.return_value.status = 202
        with self.assertRaisesMessage(BrevoEmailError, "HTTP 202"):
            send_mail("Assunto", "Texto", None, ["a@example.test"])

    def test_lote_conta_apenas_envios_aceitos(self):
        aceito = MagicMock()
        aceito.__enter__.return_value.status = 201
        self.http.side_effect = [URLError("indisponível"), aceito]
        mensagem = EmailMessage("Assunto", "Texto", to=["a@example.test"])
        self.assertEqual(BrevoEmailBackend(fail_silently=True).send_messages([mensagem, mensagem]), 1)

    def test_sem_mensagens_ou_destinatarios_nao_chama_api(self):
        backend = BrevoEmailBackend()
        self.assertEqual(backend.send_messages(None), 0)
        self.assertEqual(backend.send_messages([]), 0)
        self.assertEqual(backend.send_messages([EmailMessage("Assunto", "Texto")]), 0)
        self.http.assert_not_called()

    @override_settings(BREVO_API_KEY="")
    def test_sem_chave_falha_antes_de_chamar_api(self):
        with self.assertRaisesMessage(BrevoEmailError, "não configurada"):
            send_mail("Assunto", "Texto", None, ["a@example.test"])
        self.assertEqual(send_mail("Assunto", "Texto", None, ["a@example.test"], fail_silently=True), 0)
        self.http.assert_not_called()

    def test_anexo_nao_e_descartado_silenciosamente(self):
        mensagem = EmailMultiAlternatives("Assunto", "Texto", to=["a@example.test"])
        mensagem.attach("arquivo.txt", "dados", "text/plain")
        with self.assertRaisesMessage(BrevoEmailError, "Anexos não suportados"):
            BrevoEmailBackend().send_messages([mensagem])
        self.http.assert_not_called()

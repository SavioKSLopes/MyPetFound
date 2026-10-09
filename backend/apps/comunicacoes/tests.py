from django.core import mail
from django.db import transaction
from django.urls import reverse
from django.test import override_settings
from unittest.mock import patch

from apps.test_helpers import TemporaryMediaTestCase, criar_animal, criar_tutor
from .models import MensagemContato


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="http://frontend-teste.local/",
)
class MensagemContatoApiTests(TemporaryMediaTestCase):
    def setUp(self):
        self.tutor_a = criar_tutor("mensagem-a")
        self.tutor_b = criar_tutor("mensagem-b")
        self.animal_a = criar_animal(self.tutor_a)
        self.animal_b = criar_animal(self.tutor_b, nome="Bidu")

    def test_visitante_envia_mensagem_sem_poder_escolher_tutor_e_nova_fica_nao_lida(self):
        resposta = self.client.post(reverse("criar-mensagem-contato", args=[self.animal_a.id]), {
            "mensagem": "Encontrei este animal.", "localizacao_texto": "Centro",
            "tutor": self.tutor_b.id, "destinatario": self.tutor_b.id,
        })
        self.assertEqual(resposta.status_code, 201)
        mensagem = MensagemContato.objects.get(id=resposta.data["id"])
        self.assertEqual(mensagem.animal_id, self.animal_a.id)
        self.assertFalse(mensagem.lida)

    def test_mensagem_invalida_e_animal_encerrado_sao_rejeitados(self):
        url = reverse("criar-mensagem-contato", args=[self.animal_a.id])
        self.assertEqual(self.client.post(url, {"mensagem": "   "}).status_code, 400)
        self.animal_a.status = "REENCONTRADO"
        self.animal_a.save(update_fields=["status"])
        self.assertEqual(self.client.post(url, {"mensagem": "Olá"}).status_code, 404)

    def test_mensagens_sao_privadas_e_leitura_persistente_idempotente(self):
        resposta = self.client.post(reverse("criar-mensagem-contato", args=[self.animal_a.id]), {"mensagem": "Oi"})
        mensagem = MensagemContato.objects.get(id=resposta.data["id"])
        self.client.force_authenticate(self.tutor_b)
        self.assertEqual(self.client.get(reverse("listar-mensagens-contato")).data, [])
        self.assertEqual(self.client.patch(reverse("marcar-mensagem-como-lida", args=[mensagem.id])).status_code, 404)
        mensagem.refresh_from_db()
        self.assertFalse(mensagem.lida)

        self.client.force_authenticate(self.tutor_a)
        listagem = self.client.get(reverse("listar-mensagens-contato"))
        self.assertEqual([item["id"] for item in listagem.data], [mensagem.id])
        endpoint = reverse("marcar-mensagem-como-lida", args=[mensagem.id])
        self.assertEqual(self.client.patch(endpoint).data["lida"], True)
        self.assertEqual(self.client.patch(endpoint).data["lida"], True)
        mensagem.refresh_from_db()
        self.assertTrue(mensagem.lida)

    def test_listagem_privada_exige_autenticacao(self):
        self.assertEqual(self.client.get(reverse("listar-mensagens-contato")).status_code, 401)

    def test_nova_mensagem_envia_um_email_neutro_ao_tutor_apos_commit(self):
        url = reverse("criar-mensagem-contato", args=[self.animal_a.id])
        conteudo_privado = "TEXTO_PRIVADO_DO_VISITANTE_82731"
        email_visitante = "visitante-privado@example.test"
        telefone_visitante = "+5511999998888"

        with self.captureOnCommitCallbacks(execute=True):
            resposta = self.client.post(url, {
                "mensagem": conteudo_privado,
                "localizacao_texto": "LOCALIZACAO_PRIVADA_82731",
                "email": email_visitante,
                "telefone": telefone_visitante,
            })

        self.assertEqual(resposta.status_code, 201)
        self.assertTrue(MensagemContato.objects.filter(pk=resposta.data["id"]).exists())
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn(self.animal_a.nome, email.subject)
        self.assertEqual(email.to, [self.tutor_a.email])
        self.assertIn("http://frontend-teste.local/mensagens", email.body)
        self.assertNotIn(conteudo_privado, email.body)
        self.assertNotIn("LOCALIZACAO_PRIVADA_82731", email.body)
        self.assertNotIn(email_visitante, email.body)
        self.assertNotIn(telefone_visitante, email.body)

    def test_mensagem_e_criada_sem_enviar_email_se_tutor_nao_tem_email(self):
        self.tutor_a.email = ""
        self.tutor_a.save(update_fields=["email"])

        with self.captureOnCommitCallbacks(execute=True):
            resposta = self.client.post(
                reverse("criar-mensagem-contato", args=[self.animal_a.id]),
                {"mensagem": "Mensagem sem endereço de destino."},
            )

        self.assertEqual(resposta.status_code, 201)
        self.assertTrue(MensagemContato.objects.filter(pk=resposta.data["id"]).exists())
        self.assertEqual(mail.outbox, [])

    def test_mensagem_e_criada_sem_enviar_email_se_email_do_tutor_for_invalido(self):
        self.tutor_a.email = "endereco-invalido"
        self.tutor_a.save(update_fields=["email"])

        with self.captureOnCommitCallbacks(execute=True):
            resposta = self.client.post(
                reverse("criar-mensagem-contato", args=[self.animal_a.id]),
                {"mensagem": "Mensagem para endereço inválido."},
            )

        self.assertEqual(resposta.status_code, 201)
        self.assertTrue(MensagemContato.objects.filter(pk=resposta.data["id"]).exists())
        self.assertEqual(mail.outbox, [])

    def test_falha_smtp_nao_reverte_mensagem_nem_altera_resposta(self):
        with patch(
            "apps.comunicacoes.notificacoes.send_mail",
            side_effect=OSError("SMTP offline"),
        ), self.assertLogs("apps.comunicacoes.notificacoes", level="ERROR"):
            with self.captureOnCommitCallbacks(execute=True):
                resposta = self.client.post(
                    reverse("criar-mensagem-contato", args=[self.animal_a.id]),
                    {"mensagem": "Mensagem persistida apesar da falha SMTP."},
                )

        self.assertEqual(resposta.status_code, 201)
        self.assertTrue(MensagemContato.objects.filter(pk=resposta.data["id"]).exists())

    def test_listagem_e_marcacao_como_lida_nao_enviam_email(self):
        mensagem = MensagemContato.objects.create(
            animal=self.animal_a,
            mensagem="Mensagem já existente.",
        )
        self.client.force_authenticate(self.tutor_a)

        self.assertEqual(self.client.get(reverse("listar-mensagens-contato")).status_code, 200)
        self.assertEqual(
            self.client.patch(
                reverse("marcar-mensagem-como-lida", args=[mensagem.id])
            ).status_code,
            200,
        )
        self.assertEqual(mail.outbox, [])

    def test_mensagem_revertida_na_transacao_nao_envia_email(self):
        url = reverse("criar-mensagem-contato", args=[self.animal_a.id])
        id_mensagem = None

        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            try:
                with transaction.atomic():
                    resposta = self.client.post(url, {"mensagem": "Será revertida."})
                    id_mensagem = resposta.data["id"]
                    raise RuntimeError("reverter transação de teste")
            except RuntimeError:
                pass

        self.assertEqual(callbacks, [])
        self.assertFalse(MensagemContato.objects.filter(pk=id_mensagem).exists())
        self.assertEqual(mail.outbox, [])

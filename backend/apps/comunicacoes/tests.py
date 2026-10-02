from django.urls import reverse

from apps.test_helpers import TemporaryMediaTestCase, criar_animal, criar_tutor
from .models import MensagemContato


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

from unittest.mock import patch
from urllib.parse import urlsplit

from django.urls import reverse
from PIL import Image

from apps.test_helpers import TemporaryMediaTestCase, criar_animal, criar_ocorrencia, criar_tutor, imagem_png


class AnimalApiTests(TemporaryMediaTestCase):
    def setUp(self):
        self.tutor_a = criar_tutor("tutor-a")
        self.tutor_b = criar_tutor("tutor-b")
        self.animal_a = criar_animal(self.tutor_a)
        self.animal_b = criar_animal(self.tutor_b, nome="Bidu")

    def test_recursos_privados_exigem_autenticacao_e_listam_apenas_proprios(self):
        endpoint = reverse("animal-list")
        self.assertEqual(self.client.get(endpoint).status_code, 401)
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.get(endpoint)
        self.assertEqual([item["id"] for item in resposta.data], [self.animal_a.id])

    def test_tutor_nao_consulta_edita_ou_exclui_animal_de_outro(self):
        self.client.force_authenticate(self.tutor_a)
        url = reverse("animal-detail", args=[self.animal_b.id])
        self.assertEqual(self.client.get(url).status_code, 404)
        self.assertEqual(self.client.patch(url, {"nome": "Alterado"}).status_code, 404)
        self.assertEqual(self.client.delete(url).status_code, 404)

    def test_payload_nao_pode_trocar_tutor(self):
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.post(reverse("animal-list"), {
            "nome": "Novo", "especie": "GATO", "porte": "PEQUENO",
            "cor": "Preto", "tutor": self.tutor_b.id,
        })
        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(self.animal_a.__class__.objects.get(id=resposta.data["id"]).tutor, self.tutor_a)

    def test_upload_consulta_publica_e_edicao_preservam_ou_trocam_foto(self):
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.patch(
            reverse("animal-detail", args=[self.animal_a.id]),
            {"foto": imagem_png()},
            format="multipart",
        )
        self.assertEqual(resposta.status_code, 200, resposta.data)
        self.assertIn("/media/animais/", resposta.data["foto"])
        self.animal_a.refresh_from_db()
        arquivo_antigo = self.animal_a.foto.name
        self.assertTrue(self.animal_a.foto.storage.exists(arquivo_antigo))

        self.client.patch(reverse("animal-detail", args=[self.animal_a.id]), {"nome": "Luna 2"})
        self.animal_a.refresh_from_db()
        self.assertEqual(self.animal_a.foto.name, arquivo_antigo)

        criar_ocorrencia(self.animal_a)
        publica = self.client.get(reverse("animal-perdido-publico-detalhe", args=[self.animal_a.id]))
        self.assertEqual(publica.status_code, 200)
        self.assertIn("/media/animais/", publica.data["foto"])

        atualizada = self.client.patch(
            reverse("animal-detail", args=[self.animal_a.id]),
            {"foto": imagem_png("substituta.png")}, format="multipart",
        )
        self.assertEqual(atualizada.status_code, 200)
        self.assertNotEqual(atualizada.data["foto"], publica.data["foto"])
        self.animal_a.refresh_from_db()
        self.assertTrue(self.animal_a.foto.storage.exists(self.animal_a.foto.name))

    def test_cadastro_com_imagem_persiste_foto_e_retorna_url(self):
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.post(reverse("animal-list"), {
            "nome": "Com foto", "especie": "GATO", "porte": "PEQUENO",
            "cor": "Branco", "foto": imagem_png(),
        }, format="multipart")
        self.assertEqual(resposta.status_code, 201, resposta.data)
        self.assertIn("/media/animais/", resposta.data["foto"])
        self.assertTrue(resposta.data["foto"].startswith("http"))

    def test_foto_invalida_e_rejeitada_e_sem_foto_serializa_nulo(self):
        self.client.force_authenticate(self.tutor_a)
        url = reverse("animal-detail", args=[self.animal_a.id])
        self.assertIsNone(self.client.get(url).data["foto"])
        resposta = self.client.patch(url, {"foto": "nao-e-imagem"}, format="multipart")
        self.assertEqual(resposta.status_code, 400)

    def test_historico_e_qr_sao_privados_e_historico_filtra_eventos_por_animal(self):
        ocorrencia = criar_ocorrencia(self.animal_a)
        self.client.force_authenticate(self.tutor_a)
        historico = self.client.get(reverse("animal-historico", args=[self.animal_a.id]))
        self.assertEqual(historico.status_code, 200)
        self.assertEqual({e["ocorrencia"]["id"] for e in historico.data["eventos"] if e["ocorrencia"]}, {ocorrencia.id})
        self.assertEqual(self.client.get(reverse("animal-historico", args=[self.animal_b.id])).status_code, 404)
        self.assertEqual(self.client.get(reverse("animal-qrcode", args=[self.animal_b.id])).status_code, 404)

    def test_qr_proprietario_gera_imagem_com_url_publica_e_identificacao_segura(self):
        self.client.force_authenticate(self.tutor_a)
        urls = []
        with patch("apps.animais.views.qrcode.make", side_effect=lambda url: (urls.append(url), Image.new("RGB", (2, 2)))[1]):
            resposta_qr = self.client.get(reverse("animal-qrcode", args=[self.animal_a.id]))
        self.assertEqual(resposta_qr.status_code, 200)
        self.assertEqual(resposta_qr["Content-Type"], "image/png")
        self.assertIn("/identificacao/", urls[0])
        codigo = urlsplit(urls[0]).path.rstrip("/").split("/")[-1]

        publica = self.client.get(reverse("animal-identificacao-publica", args=[codigo]))
        self.assertEqual(publica.status_code, 200)
        self.assertEqual(publica.data["id"], self.animal_a.id)
        self.assertNotIn("tutor", publica.data)
        self.assertNotIn("email", publica.data)
        self.assertNotIn("telefone", publica.data)
        codigo_alterado = ("A" if codigo[0] != "A" else "B") + codigo[1:]
        self.assertEqual(self.client.get(reverse("animal-identificacao-publica", args=[codigo_alterado])).status_code, 404)

    def test_codigo_qr_invalido_e_animal_inexistente_tem_resposta_controlada(self):
        self.assertEqual(self.client.get(reverse("animal-identificacao-publica", args=["codigo-invalido"])).status_code, 404)
        from django.core import signing
        codigo = signing.dumps(999999, salt="identificacao-animal-v1")
        self.assertEqual(self.client.get(reverse("animal-identificacao-publica", args=[codigo])).status_code, 404)

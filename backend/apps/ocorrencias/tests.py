from django.urls import reverse
from django.utils import timezone

from apps.test_helpers import TemporaryMediaTestCase, criar_animal, criar_ocorrencia, criar_tutor
from .models import Ocorrencia


class OcorrenciaApiTests(TemporaryMediaTestCase):
    def setUp(self):
        self.tutor_a = criar_tutor("ocorrencia-a")
        self.tutor_b = criar_tutor("ocorrencia-b")
        self.animal_a = criar_animal(self.tutor_a)
        self.animal_b = criar_animal(self.tutor_b, nome="Bidu")

    def payload(self, animal):
        return {"animal": animal.id, "tipo": "DESAPARECIMENTO", "data_hora": timezone.now().isoformat(), "localidade": "Centro"}

    def test_desaparecimento_valido_associa_animal_atualiza_estado_e_bloqueia_duplicata(self):
        self.client.force_authenticate(self.tutor_a)
        url = reverse("ocorrencia-list")
        primeira = self.client.post(url, self.payload(self.animal_a))
        self.assertEqual(primeira.status_code, 201, primeira.data)
        self.assertEqual(primeira.data["animal"], self.animal_a.id)
        self.animal_a.refresh_from_db()
        self.assertEqual(self.animal_a.status, "PERDIDO")
        duplicada = self.client.post(url, self.payload(self.animal_a))
        self.assertEqual(duplicada.status_code, 400)

    def test_tutor_nao_registra_ou_encerra_ocorrencia_de_outro(self):
        ocorrencia = criar_ocorrencia(self.animal_b)
        self.client.force_authenticate(self.tutor_a)
        self.assertEqual(self.client.post(reverse("ocorrencia-list"), self.payload(self.animal_b)).status_code, 400)
        self.assertEqual(self.client.post(reverse("ocorrencia-marcar-reencontrado", args=[ocorrencia.id])).status_code, 404)
        ocorrencia.refresh_from_db()
        self.assertEqual(ocorrencia.status, Ocorrencia.Status.ATIVA)

    def test_encerrar_atualiza_animal_e_historico_preserva_episodios(self):
        anterior = criar_ocorrencia(self.animal_a)
        outra = criar_ocorrencia(self.animal_b)
        self.client.force_authenticate(self.tutor_a)
        encerramento = self.client.post(reverse("ocorrencia-marcar-reencontrado", args=[anterior.id]))
        self.assertEqual(encerramento.status_code, 200)
        self.animal_a.refresh_from_db()
        self.assertEqual(self.animal_a.status, "REENCONTRADO")
        novo = self.client.post(reverse("ocorrencia-list"), self.payload(self.animal_a))
        self.assertEqual(novo.status_code, 201)
        filtradas = self.client.get(reverse("ocorrencia-list"), {"animal": self.animal_a.id})
        self.assertEqual({item["id"] for item in filtradas.data}, {anterior.id, novo.data["id"]})
        self.assertNotIn(outra.id, {item["id"] for item in filtradas.data})

    def test_endpoint_privado_exige_login(self):
        self.assertEqual(self.client.get(reverse("ocorrencia-list")).status_code, 401)

    def test_marcar_reencontrado_com_local_e_descricao_persiste_dados(self):
        ocorrencia = criar_ocorrencia(self.animal_a)
        self.client.force_authenticate(self.tutor_a)
        url = reverse("ocorrencia-marcar-reencontrado", args=[ocorrencia.id])
        payload = {
            "localidade_reencontro": "Bairro Ceraíma, Guanambi-BA",
            "descricao_reencontro": "Encontrado por vizinho na rua de trás.",
            "data_hora_reencontro": "2026-10-10T15:30:00Z",
        }
        resposta = self.client.post(url, payload)
        self.assertEqual(resposta.status_code, 200, resposta.data)
        ocorrencia.refresh_from_db()
        self.assertEqual(ocorrencia.localidade_reencontro, "Bairro Ceraíma, Guanambi-BA")
        self.assertEqual(ocorrencia.descricao_reencontro, "Encontrado por vizinho na rua de trás.")
        self.assertIsNotNone(ocorrencia.data_hora_reencontro)

    def test_marcar_reencontrado_sem_dados_opcionais_usa_valores_padrao(self):
        ocorrencia = criar_ocorrencia(self.animal_a)
        self.client.force_authenticate(self.tutor_a)
        url = reverse("ocorrencia-marcar-reencontrado", args=[ocorrencia.id])
        resposta = self.client.post(url, {})
        self.assertEqual(resposta.status_code, 200, resposta.data)
        ocorrencia.refresh_from_db()
        self.assertEqual(ocorrencia.localidade_reencontro, "")
        self.assertEqual(ocorrencia.descricao_reencontro, "")
        self.assertIsNotNone(ocorrencia.data_hora_reencontro)

    def test_historico_inclui_evento_reencontro_com_dados_informados(self):
        from apps.animais.views import AnimalViewSet
        ocorrencia = criar_ocorrencia(self.animal_a, localidade="Centro")
        self.client.force_authenticate(self.tutor_a)
        # Marca como reencontrado com dados
        url = reverse("ocorrencia-marcar-reencontrado", args=[ocorrencia.id])
        payload = {
            "localidade_reencontro": "Bairro Ceraíma",
            "descricao_reencontro": "Encontrado por vizinho.",
            "data_hora_reencontro": "2026-10-10T15:30:00Z",
        }
        self.client.post(url, payload)
        # Consulta histórico
        historico = self.client.get(reverse("animal-historico", args=[self.animal_a.id]))
        self.assertEqual(historico.status_code, 200)
        eventos = historico.data["eventos"]
        reencontros = [e for e in eventos if e["tipo"] == "REENCONTRO"]
        self.assertEqual(len(reencontros), 1)
        reencontro = reencontros[0]
        self.assertEqual(reencontro["localidade"], "Bairro Ceraíma")
        self.assertEqual(reencontro["descricao"], "Encontrado por vizinho.")
        # data_hora vem como datetime no DRF, verifica o valor
        self.assertEqual(reencontro["data_hora"].year, 2026)
        self.assertEqual(reencontro["data_hora"].month, 10)
        self.assertEqual(reencontro["data_hora"].day, 10)
        self.assertEqual(reencontro["data_hora"].hour, 15)
        self.assertEqual(reencontro["data_hora"].minute, 30)

    def test_historico_inclui_evento_reencontro_sem_dados_mostra_local_nao_informado(self):
        ocorrencia = criar_ocorrencia(self.animal_a)
        self.client.force_authenticate(self.tutor_a)
        url = reverse("ocorrencia-marcar-reencontrado", args=[ocorrencia.id])
        self.client.post(url, {})  # Sem dados opcionais
        historico = self.client.get(reverse("animal-historico", args=[self.animal_a.id]))
        self.assertEqual(historico.status_code, 200)
        eventos = historico.data["eventos"]
        reencontros = [e for e in eventos if e["tipo"] == "REENCONTRO"]
        self.assertEqual(len(reencontros), 1)
        reencontro = reencontros[0]
        self.assertEqual(reencontro["localidade"], "Local não informado")
        self.assertEqual(reencontro["descricao"], "Reencontrado pelo tutor.")

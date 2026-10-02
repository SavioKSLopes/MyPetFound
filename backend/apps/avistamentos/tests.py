from django.urls import reverse
from django.utils import timezone

from apps.test_helpers import TemporaryMediaTestCase, criar_animal, criar_ocorrencia, criar_tutor
from .models import Avistamento


class AvistamentoApiTests(TemporaryMediaTestCase):
    def setUp(self):
        self.tutor_a = criar_tutor("avistamento-a")
        self.tutor_b = criar_tutor("avistamento-b")
        self.animal_a = criar_animal(self.tutor_a)
        self.animal_b = criar_animal(self.tutor_b, nome="Bidu")
        self.ocorrencia_a = criar_ocorrencia(self.animal_a)
        self.ocorrencia_b = criar_ocorrencia(self.animal_b)

    def test_registro_publico_associa_avistamento_a_ocorrencia_ativa_correta(self):
        resposta = self.client.post(reverse("registrar-avistamento-publico"), {
            "animal": self.animal_a.id,
            "data_hora": timezone.now().isoformat(),
            "localidade": "Praça",
            "descricao": "Perto da praça",
        })
        self.assertEqual(resposta.status_code, 201, resposta.data)
        self.assertEqual(Avistamento.objects.get(id=resposta.data["id"]).ocorrencia_id, self.ocorrencia_a.id)

    def test_consulta_privada_filtra_por_tutor_e_animal(self):
        Avistamento.objects.create(ocorrencia=self.ocorrencia_a, data_hora=timezone.now(), localidade="A")
        Avistamento.objects.create(ocorrencia=self.ocorrencia_b, data_hora=timezone.now(), localidade="B")
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.get(reverse("avistamento-list"), {"animal": self.animal_a.id})
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(len(resposta.data), 1)
        self.assertEqual(resposta.data[0]["ocorrencia"], self.ocorrencia_a.id)

    def test_historico_mantem_avistamentos_vinculados_a_episodios(self):
        segunda = criar_ocorrencia(self.animal_a, localidade="Outro bairro")
        # A primeira ocorrência fica encerrada para permitir registrar o segundo episódio.
        self.ocorrencia_a.status = "ENCERRADA"
        self.ocorrencia_a.save(update_fields=["status"])
        Avistamento.objects.create(ocorrencia=self.ocorrencia_a, data_hora=timezone.now(), localidade="Antigo")
        Avistamento.objects.create(ocorrencia=segunda, data_hora=timezone.now(), localidade="Novo")
        self.client.force_authenticate(self.tutor_a)
        resposta = self.client.get(reverse("animal-historico", args=[self.animal_a.id]))
        associacoes = {evento["localidade"]: evento["ocorrencia"]["id"] for evento in resposta.data["eventos"] if evento["tipo"] == "AVISTAMENTO"}
        self.assertEqual(associacoes, {"Antigo": self.ocorrencia_a.id, "Novo": segunda.id})

    def test_avistamento_publico_exige_desaparecimento_ativo(self):
        self.ocorrencia_a.status = "ENCERRADA"
        self.ocorrencia_a.save(update_fields=["status"])
        resposta = self.client.post(reverse("registrar-avistamento-publico"), {
            "animal": self.animal_a.id,
            "data_hora": timezone.now().isoformat(),
            "localidade": "Praça",
        })
        self.assertEqual(resposta.status_code, 400)

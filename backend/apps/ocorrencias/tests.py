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

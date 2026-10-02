from datetime import timedelta
from io import BytesIO
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from PIL import Image
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.animais.models import Animal
from apps.ocorrencias.models import Ocorrencia


class TemporaryMediaTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        cls._media_dir = tempfile.mkdtemp(prefix="mypetfound-test-media-")
        cls._media_settings = override_settings(MEDIA_ROOT=cls._media_dir)
        cls._media_settings.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._media_settings.disable()
        shutil.rmtree(cls._media_dir, ignore_errors=True)


def criar_tutor(username):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@example.test",
        password="senha-segura-123!",
    )


def criar_animal(tutor, nome="Luna", **campos):
    return Animal.objects.create(
        tutor=tutor,
        nome=nome,
        especie=Animal.Especie.CACHORRO,
        raca="Vira-lata",
        porte=Animal.Porte.MEDIO,
        cor="Caramelo",
        **campos,
    )


def criar_ocorrencia(animal, *, data_hora=None, localidade="Centro"):
    return Ocorrencia.objects.create(
        animal=animal,
        tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
        data_hora=data_hora or timezone.now() - timedelta(hours=2),
        localidade=localidade,
    )


def imagem_png(nome="animal.png"):
    imagem = Image.new("RGB", (3, 3), color="orange")
    buffer = BytesIO()
    imagem.save(buffer, format="PNG")
    return SimpleUploadedFile(nome, buffer.getvalue(), content_type="image/png")

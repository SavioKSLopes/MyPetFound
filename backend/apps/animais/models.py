from django.db import models
from django.conf import settings

class Animal(models.Model):
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="animais",
        verbose_name="Tutor",
    )
    class Especie(models.TextChoices):
        CACHORRO = "CACHORRO", "Cachorro"
        GATO = "GATO", "Gato"
        OUTRO = "OUTRO", "Outro"

    class Porte(models.TextChoices):
        PEQUENO = "PEQUENO", "Pequeno"
        MEDIO = "MEDIO", "Médio"
        GRANDE = "GRANDE", "Grande"

    class Status(models.TextChoices):
        CADASTRADO = "CADASTRADO", "Cadastrado"
        PERDIDO = "PERDIDO", "Perdido"
        REENCONTRADO = "REENCONTRADO", "Reencontrado"

    nome = models.CharField(
        max_length=100,
        verbose_name="Nome",
    )

    especie = models.CharField(
        max_length=10,
        choices=Especie.choices,
        verbose_name="Espécie",
    )

    raca = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Raça",
    )

    porte = models.CharField(
        max_length=10,
        choices=Porte.choices,
        verbose_name="Porte",
    )

    cor = models.CharField(
        max_length=100,
        verbose_name="Cor predominante",
    )

    descricao = models.TextField(
        blank=True,
        verbose_name="Características e observações",
        help_text="Ex.: mancha branca no peito, usa coleira azul, manca da pata traseira.",
    )

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.CADASTRADO,
        verbose_name="Status",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
    )

    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em",
    )

    class Meta:
        verbose_name = "Animal"
        verbose_name_plural = "Animais"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"{self.nome} — {self.get_especie_display()}"
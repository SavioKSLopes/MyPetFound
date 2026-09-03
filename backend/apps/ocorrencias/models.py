from django.db import models

from apps.animais.models import Animal


class Ocorrencia(models.Model):
    class Tipo(models.TextChoices):
        DESAPARECIMENTO = "DESAPARECIMENTO", "Desaparecimento"
        REENCONTRO = "REENCONTRO", "Reencontro"

    class Status(models.TextChoices):
        ATIVA = "ATIVA", "Ativa"
        ENCERRADA = "ENCERRADA", "Encerrada"

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="ocorrencias",
        verbose_name="Animal",
    )

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        default=Tipo.DESAPARECIMENTO,
        verbose_name="Tipo de ocorrência",
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ATIVA,
        verbose_name="Status da ocorrência",
    )

    data_hora = models.DateTimeField(
        verbose_name="Data e hora da ocorrência",
    )

    localidade = models.CharField(
        max_length=255,
        verbose_name="Último local visto",
        help_text="Ex.: Bairro Ceraíma, Guanambi-BA",
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Latitude",
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Longitude",
    )

    descricao = models.TextField(
        blank=True,
        verbose_name="Descrição",
        help_text="Ex.: Fugiu quando o portão ficou aberto.",
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
        verbose_name = "Ocorrência"
        verbose_name_plural = "Ocorrências"
        ordering = ["-data_hora"]

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.animal.nome}"
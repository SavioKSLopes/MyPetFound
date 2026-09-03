from django.db import models

from apps.ocorrencias.models import Ocorrencia


class Avistamento(models.Model):
    ocorrencia = models.ForeignKey(
        Ocorrencia,
        on_delete=models.CASCADE,
        related_name="avistamentos",
        verbose_name="Ocorrência",
        limit_choices_to={
            "tipo": Ocorrencia.Tipo.DESAPARECIMENTO,
            "status": Ocorrencia.Status.ATIVA,
        },
    )

    foto = models.ImageField(
        upload_to="avistamentos/%Y/%m/",
        null=True,
        blank=True,
        verbose_name="Foto do avistamento",
    )

    data_hora = models.DateTimeField(
        verbose_name="Data e hora do avistamento",
    )

    localidade = models.CharField(
        max_length=255,
        verbose_name="Local do avistamento",
        help_text="Ex.: Bairro Beija-Flor, Guanambi-BA",
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
        help_text="Ex.: Estava perto da praça, parecia assustado e estava sem coleira.",
    )

    nome_contato = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Nome de quem avistou",
    )

    telefone_contato = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Telefone de contato",
    )

    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em",
    )

    class Meta:
        verbose_name = "Avistamento"
        verbose_name_plural = "Avistamentos"
        ordering = ["-data_hora"]

    def __str__(self):
        return f"Avistamento de {self.ocorrencia.animal.nome} em {self.localidade}"
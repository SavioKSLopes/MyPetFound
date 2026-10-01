from django.db import models


class MensagemContato(models.Model):
    animal = models.ForeignKey(
        "animais.Animal",
        on_delete=models.CASCADE,
        related_name="mensagens_contato",
        verbose_name="Animal",
    )

    mensagem = models.TextField(
        max_length=1000,
        verbose_name="Mensagem",
    )

    localizacao_texto = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Local informado",
    )

    lida = models.BooleanField(
        default=False,
        verbose_name="Lida",
    )

    criada_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Enviada em",
    )

    class Meta:
        verbose_name = "Mensagem de contato"
        verbose_name_plural = "Mensagens de contato"
        ordering = ["-criada_em"]

    def __str__(self):
        return f"Mensagem sobre {self.animal.nome} — {self.criada_em:%d/%m/%Y %H:%M}"
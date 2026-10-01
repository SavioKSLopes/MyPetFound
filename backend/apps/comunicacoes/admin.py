from django.contrib import admin

from .models import MensagemContato


@admin.register(MensagemContato)
class MensagemContatoAdmin(admin.ModelAdmin):
    list_display = (
        "animal",
        "localizacao_texto",
        "lida",
        "criada_em",
    )

    list_filter = (
        "lida",
        "criada_em",
    )

    search_fields = (
        "animal__nome",
        "mensagem",
        "localizacao_texto",
    )

    readonly_fields = (
        "criada_em",
    )

    ordering = (
        "-criada_em",
    )
from django.contrib import admin

from .models import Avistamento


@admin.register(Avistamento)
class AvistamentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ocorrencia",
        "localidade",
        "data_hora",
        "nome_contato",
    )

    list_filter = (
        "data_hora",
    )

    search_fields = (
        "ocorrencia__animal__nome",
        "localidade",
        "descricao",
        "nome_contato",
    )

    readonly_fields = (
        "criado_em",
    )

    ordering = ("-data_hora",)
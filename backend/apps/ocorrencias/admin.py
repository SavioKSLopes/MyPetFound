from django.contrib import admin

from .models import Ocorrencia


@admin.register(Ocorrencia)
class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "animal",
        "tipo",
        "status",
        "localidade",
        "data_hora",
    )

    list_filter = (
        "tipo",
        "status",
        "data_hora",
    )

    search_fields = (
        "animal__nome",
        "localidade",
        "descricao",
    )

    readonly_fields = (
        "criado_em",
        "atualizado_em",
    )

    ordering = ("-data_hora",)
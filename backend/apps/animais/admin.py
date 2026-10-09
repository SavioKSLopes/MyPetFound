from django.contrib import admin

from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "especie",
        "porte",
        "sexo",
        "cor",
        "status",
        "criado_em",
    )

    list_filter = (
        "especie",
        "porte",
        "sexo",
        "status",
    )

    search_fields = (
        "nome",
        "raca",
        "cor",
        "descricao",
    )

    readonly_fields = (
        "criado_em",
        "atualizado_em",
    )

    ordering = ("-criado_em",)

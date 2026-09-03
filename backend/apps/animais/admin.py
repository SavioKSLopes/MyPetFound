from django.contrib import admin

from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "especie",
        "porte",
        "cor",
        "status",
        "criado_em",
    )

    list_filter = (
        "especie",
        "porte",
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

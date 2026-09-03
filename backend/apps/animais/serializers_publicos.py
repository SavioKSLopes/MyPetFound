from rest_framework import serializers

from .models import Animal


class AnimalPublicoSerializer(serializers.ModelSerializer):
    especie_nome = serializers.CharField(
        source="get_especie_display",
        read_only=True,
    )

    porte_nome = serializers.CharField(
        source="get_porte_display",
        read_only=True,
    )

    status_nome = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = Animal
        fields = (
            "id",
            "nome",
            "especie",
            "especie_nome",
            "raca",
            "porte",
            "porte_nome",
            "cor",
            "descricao",
            "status",
            "status_nome",
        )
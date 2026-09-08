from rest_framework import serializers

from .models import Animal

from apps.ocorrencias.models import Ocorrencia


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

    ocorrencia_id = serializers.SerializerMethodField()

    def get_ocorrencia_id(self, animal):
        ocorrencia = (
            animal.ocorrencias.filter(
                tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
                status=Ocorrencia.Status.ATIVA,
            )
            .order_by("-criado_em")
            .first()
        )

        return ocorrencia.id if ocorrencia else None

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
            "ocorrencia_id",
        )
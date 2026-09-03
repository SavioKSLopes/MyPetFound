from rest_framework import serializers

from .models import Ocorrencia


class OcorrenciaSerializer(serializers.ModelSerializer):
    animal_nome = serializers.CharField(
        source="animal.nome",
        read_only=True,
    )

    tipo_nome = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    status_nome = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = Ocorrencia
        fields = (
            "id",
            "animal",
            "animal_nome",
            "tipo",
            "tipo_nome",
            "status",
            "status_nome",
            "data_hora",
            "localidade",
            "latitude",
            "longitude",
            "descricao",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = (
            "id",
            "criado_em",
            "atualizado_em",
        )
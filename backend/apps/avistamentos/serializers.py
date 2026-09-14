from rest_framework import serializers

from .models import Avistamento


class AvistamentoSerializer(serializers.ModelSerializer):
    animal_nome = serializers.CharField(
        source="ocorrencia.animal.nome",
        read_only=True,
    )

    class Meta:
        model = Avistamento
        fields = (
            "id",
            "ocorrencia",
            "animal_nome",
            "foto",
            "data_hora",
            "localidade",
            "latitude",
            "longitude",
            "descricao",
            "nome_contato",
            "telefone_contato",
            "criado_em",
        )
        read_only_fields = (
            "id",
            "criado_em",
            "ocorrencia",
        )
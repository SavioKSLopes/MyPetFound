from rest_framework import serializers

from .models import MensagemContato


class MensagemContatoPublicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensagemContato
        fields = (
            "mensagem",
            "localizacao_texto",
        )

    def validate_mensagem(self, value):
        mensagem = value.strip()

        if not mensagem:
            raise serializers.ValidationError(
                "Informe uma mensagem para o tutor."
            )

        return mensagem

class MensagemContatoSerializer(serializers.ModelSerializer):
    animal_id = serializers.IntegerField(
        source="animal.id",
        read_only=True,
    )

    animal_nome = serializers.CharField(
        source="animal.nome",
        read_only=True,
    )

    class Meta:
        model = MensagemContato
        fields = (
            "id",
            "animal_id",
            "animal_nome",
            "mensagem",
            "localizacao_texto",
            "lida",
            "criada_em",
        )
        read_only_fields = (
            "id",
            "animal_id",
            "animal_nome",
            "mensagem",
            "localizacao_texto",
            "criada_em",
        )
from rest_framework import serializers

from apps.ocorrencias.models import Ocorrencia

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

    ocorrencia_id = serializers.SerializerMethodField()
    localidade = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    data_desaparecimento = serializers.SerializerMethodField()

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
            "localidade",
            "latitude",
            "longitude",
            "data_desaparecimento",
        )

    def get_ocorrencia_ativa(self, animal):
        return (
            animal.ocorrencias.filter(
                tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
                status=Ocorrencia.Status.ATIVA,
            )
            .order_by("-data_hora")
            .first()
        )

    def get_ocorrencia_id(self, animal):
        ocorrencia = self.get_ocorrencia_ativa(animal)

        return ocorrencia.id if ocorrencia else None

    def get_localidade(self, animal):
        ocorrencia = self.get_ocorrencia_ativa(animal)

        return ocorrencia.localidade if ocorrencia else None

    def get_latitude(self, animal):
        ocorrencia = self.get_ocorrencia_ativa(animal)

        return ocorrencia.latitude if ocorrencia else None

    def get_longitude(self, animal):
        ocorrencia = self.get_ocorrencia_ativa(animal)

        return ocorrencia.longitude if ocorrencia else None

    def get_data_desaparecimento(self, animal):
        ocorrencia = self.get_ocorrencia_ativa(animal)

        return ocorrencia.data_hora if ocorrencia else None
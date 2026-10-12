from django.db import transaction

from rest_framework import decorators, permissions, response, status, viewsets
from rest_framework.exceptions import ValidationError

from apps.animais.models import Animal

from .models import Ocorrencia
from .serializers import OcorrenciaSerializer


class OcorrenciaViewSet(viewsets.ModelViewSet):
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Ocorrencia.objects.filter(
            animal__tutor=self.request.user,
        ).order_by("-data_hora")

        animal_id = self.request.query_params.get("animal")

        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)

        return queryset

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)
        serializer_fields = serializer.child.fields if hasattr(serializer, "child") else serializer.fields
        if "animal" in serializer_fields:
            serializer_fields["animal"].queryset = Animal.objects.filter(
                tutor=self.request.user,
            )
        return serializer

    def perform_create(self, serializer):
        animal = serializer.validated_data["animal"]

        tipo = serializer.validated_data.get(
            "tipo",
            Ocorrencia.Tipo.DESAPARECIMENTO,
        )

        if tipo == Ocorrencia.Tipo.DESAPARECIMENTO:
            ja_existe_ocorrencia_ativa = Ocorrencia.objects.filter(
                animal=animal,
                tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
                status=Ocorrencia.Status.ATIVA,
            ).exists()

            if ja_existe_ocorrencia_ativa:
                raise ValidationError(
                    {
                        "animal": (
                            "Este animal já possui uma ocorrência de "
                            "desaparecimento ativa."
                        ),
                    },
                )

        with transaction.atomic():
            ocorrencia = serializer.save()

            if ocorrencia.tipo == Ocorrencia.Tipo.DESAPARECIMENTO:
                Animal.objects.filter(pk=ocorrencia.animal_id).update(
                    status=Animal.Status.PERDIDO,
                )

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="marcar-reencontrado",
    )
    def marcar_reencontrado(self, request, pk=None):
        ocorrencia = self.get_object()

        if ocorrencia.tipo != Ocorrencia.Tipo.DESAPARECIMENTO:
            return response.Response(
                {
                    "detail": (
                        "Apenas ocorrências de desaparecimento "
                        "podem ser marcadas como reencontradas."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ocorrencia.status == Ocorrencia.Status.ENCERRADA:
            return response.Response(
                {
                    "detail": "Esta ocorrência já está encerrada."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        localidade_reencontro = request.data.get("localidade_reencontro", "").strip()
        descricao_reencontro = request.data.get("descricao_reencontro", "").strip()
        data_hora_reencontro = request.data.get("data_hora_reencontro")

        with transaction.atomic():
            ocorrencia.status = Ocorrencia.Status.ENCERRADA
            ocorrencia.localidade_reencontro = localidade_reencontro
            ocorrencia.descricao_reencontro = descricao_reencontro
            if data_hora_reencontro:
                ocorrencia.data_hora_reencontro = data_hora_reencontro
            else:
                ocorrencia.data_hora_reencontro = ocorrencia.data_hora
            ocorrencia.save(
                update_fields=[
                    "status",
                    "localidade_reencontro",
                    "descricao_reencontro",
                    "data_hora_reencontro",
                    "atualizado_em",
                ]
            )

            Animal.objects.filter(pk=ocorrencia.animal_id).update(
                status=Animal.Status.REENCONTRADO,
            )

        ocorrencia.refresh_from_db()

        return response.Response(
            {
                "mensagem": (
                    f"{ocorrencia.animal.nome} foi marcado como reencontrado."
                ),
                "ocorrencia": OcorrenciaSerializer(ocorrencia).data,
            },
            status=status.HTTP_200_OK,
        )

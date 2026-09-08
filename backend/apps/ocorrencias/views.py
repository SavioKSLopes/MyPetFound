from django.db import transaction
from rest_framework import decorators, permissions, response, status, viewsets

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


    def perform_create(self, serializer):
        ocorrencia = serializer.save()

        if ocorrencia.tipo == Ocorrencia.Tipo.DESAPARECIMENTO:
            Animal.objects.filter(pk=ocorrencia.animal_id).update(
                status=Animal.Status.PERDIDO,
            )

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
                from rest_framework.exceptions import ValidationError

                raise ValidationError(
                    {
                        "animal": (
                            "Este animal já possui uma ocorrência de "
                            "desaparecimento ativa."
                        ),
                    },
                )

        serializer.save()

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

        with transaction.atomic():
            ocorrencia.status = Ocorrencia.Status.ENCERRADA
            ocorrencia.save(update_fields=["status", "atualizado_em"])

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
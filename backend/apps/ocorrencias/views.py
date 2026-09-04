from django.db import transaction
from rest_framework import decorators, permissions, response, status, viewsets

from apps.animais.models import Animal

from .models import Ocorrencia
from .serializers import OcorrenciaSerializer


class OcorrenciaViewSet(viewsets.ModelViewSet):
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Ocorrencia.objects
            .select_related("animal")
            .filter(
                animal__tutor=self.request.user,
            )
            .all()
        )

    def perform_create(self, serializer):
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
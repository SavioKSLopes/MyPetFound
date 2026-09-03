from rest_framework import generics, permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from apps.ocorrencias.models import Ocorrencia

from .models import Avistamento
from .serializers import AvistamentoSerializer


class AvistamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AvistamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Avistamento.objects
            .select_related("ocorrencia", "ocorrencia__animal")
            .filter(
                ocorrencia__animal__tutor=self.request.user,
            )
            .all()
        )


class RegistrarAvistamentoPublicoView(generics.CreateAPIView):
    serializer_class = AvistamentoSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        ocorrencia = serializer.validated_data["ocorrencia"]

        if (
            ocorrencia.tipo != Ocorrencia.Tipo.DESAPARECIMENTO
            or ocorrencia.status != Ocorrencia.Status.ATIVA
        ):
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {
                    "ocorrencia": (
                        "Você só pode registrar um avistamento "
                        "para uma ocorrência de desaparecimento ativa."
                    )
                }
            )

        serializer.save()
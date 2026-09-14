from rest_framework import generics, permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from apps.ocorrencias.models import Ocorrencia

from .models import Avistamento
from .serializers import AvistamentoSerializer

from rest_framework import serializers

class AvistamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AvistamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Avistamento.objects
            .select_related("ocorrencia", "ocorrencia__animal")
            .filter(ocorrencia__animal__tutor=self.request.user)
            .order_by("-data_hora")
        )

        animal_id = self.request.query_params.get("animal")

        if animal_id:
            queryset = queryset.filter(ocorrencia__animal_id=animal_id)

        return queryset

class RegistrarAvistamentoPublicoView(generics.CreateAPIView):
    serializer_class = AvistamentoSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        animal_id = self.request.data.get("animal")

        if not animal_id:
            raise serializers.ValidationError(
                {
                    "animal": (
                        "Informe o animal relacionado ao avistamento."
                    )
                }
            )

        ocorrencia = (
            Ocorrencia.objects
            .filter(
                animal_id=animal_id,
                tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
                status=Ocorrencia.Status.ATIVA,
            )
            .order_by("-data_hora")
            .first()
        )

        if not ocorrencia:
            raise serializers.ValidationError(
                {
                    "animal": (
                        "Este animal não possui uma ocorrência de "
                        "desaparecimento ativa."
                    )
                }
            )

        serializer.save(ocorrencia=ocorrencia)
        serializer.save()
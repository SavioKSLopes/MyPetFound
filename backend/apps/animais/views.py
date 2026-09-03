from rest_framework import generics, permissions, viewsets

from apps.ocorrencias.models import Ocorrencia

from .models import Animal
from .serializers import AnimalSerializer
from .serializers_publicos import AnimalPublicoSerializer

class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Animal.objects.filter(
            tutor=self.request.user,
        ).order_by("-criado_em")

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user)


class AnimaisPerdidosPublicosView(generics.ListAPIView):
    serializer_class = AnimalPublicoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Animal.objects.filter(
                ocorrencias__tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
                ocorrencias__status=Ocorrencia.Status.ATIVA,
            )
            .distinct()
            .order_by("-ocorrencias__data_hora")
        )
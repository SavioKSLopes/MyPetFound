from django.db.models import Exists, OuterRef
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
        ocorrencia_ativa = Ocorrencia.objects.filter(
            animal=OuterRef("pk"),
            tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
            status=Ocorrencia.Status.ATIVA,
        )

        return (
            Animal.objects.annotate(
                possui_desaparecimento_ativo=Exists(ocorrencia_ativa),
            )
            .filter(
                possui_desaparecimento_ativo=True,
            )
            .order_by("-id")
        )

class AnimalPerdidoPublicoDetalheView(generics.RetrieveAPIView):
    serializer_class = AnimalPublicoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        ocorrencia_ativa = Ocorrencia.objects.filter(
            animal=OuterRef("pk"),
            tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
            status=Ocorrencia.Status.ATIVA,
        )

        return (
            Animal.objects.annotate(
                possui_desaparecimento_ativo=Exists(ocorrencia_ativa),
            )
            .filter(
                possui_desaparecimento_ativo=True,
            )
        )
from rest_framework import permissions, viewsets

from .models import Animal
from .serializers import AnimalSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Animal.objects.filter(
            tutor=self.request.user,
        ).order_by("-criado_em")

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user)
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MensagemContato
from apps.animais.models import Animal


from .serializers import (
    MensagemContatoPublicaSerializer,
    MensagemContatoSerializer,
)

class CriarMensagemContatoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, animal_id):
        animal = Animal.objects.filter(
            id=animal_id,
        ).exclude(
            status=Animal.Status.REENCONTRADO,
        ).first()

        if animal is None:
            return Response(
                {
                    "detalhe": "Animal não encontrado ou não está disponível."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MensagemContatoPublicaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mensagem = serializer.save(animal=animal)

        return Response(
            {
                "detalhe": "Mensagem enviada ao tutor com sucesso.",
                "id": mensagem.id,
            },
            status=status.HTTP_201_CREATED,
        )

class ListarMensagensContatoView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MensagemContatoSerializer

    def get_queryset(self):
        return (
            MensagemContato.objects
            .filter(animal__tutor=self.request.user)
            .select_related("animal")
            .order_by("-criada_em")
        )

class MarcarMensagemComoLidaView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, mensagem_id):
        mensagem = get_object_or_404(
            MensagemContato.objects.select_related("animal"),
            id=mensagem_id,
            animal__tutor=request.user,
        )

        mensagem.lida = True
        mensagem.save(update_fields=["lida"])

        return Response(
            {
                "detalhe": "Mensagem marcada como lida.",
                "id": mensagem.id,
                "lida": mensagem.lida,
            },
            status=status.HTTP_200_OK,
        )
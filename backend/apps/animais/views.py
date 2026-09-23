from io import BytesIO

import qrcode
from django.conf import settings
from django.db.models import Exists, OuterRef, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, viewsets, views

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
        busca = self.request.query_params.get("busca", "").strip()
        especie = self.request.query_params.get("especie", "").strip()
        porte = self.request.query_params.get("porte", "").strip()
        cor = self.request.query_params.get("cor", "").strip()
        localidade = self.request.query_params.get(
            "localidade",
            "",
        ).strip()

        ocorrencia_ativa = Ocorrencia.objects.filter(
            animal=OuterRef("pk"),
            tipo=Ocorrencia.Tipo.DESAPARECIMENTO,
            status=Ocorrencia.Status.ATIVA,
        )

        if localidade:
            ocorrencia_ativa = ocorrencia_ativa.filter(
                localidade__icontains=localidade,
            )

        animais = (
            Animal.objects.annotate(
                possui_desaparecimento_ativo=Exists(ocorrencia_ativa),
            )
            .filter(
                possui_desaparecimento_ativo=True,
            )
        )

        if busca:
            animais = animais.filter(
                Q(nome__icontains=busca)
                | Q(raca__icontains=busca)
                | Q(cor__icontains=busca)
                | Q(descricao__icontains=busca),
            )

        if especie:
            animais = animais.filter(
                especie=especie,
            )

        if porte:
            animais = animais.filter(
                porte=porte,
            )

        if cor:
            animais = animais.filter(
                cor__icontains=cor,
            )

        return animais.order_by("-id")


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


class AnimalQRCodeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        animal = get_object_or_404(
            Animal,
            pk=pk,
            tutor=request.user,
        )

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        url_publica = f"{frontend_url}/animais/{animal.id}"

        imagem = qrcode.make(url_publica)

        buffer = BytesIO()
        imagem.save(buffer, format="PNG")
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type="image/png",
        )

        response["Content-Disposition"] = (
            f'inline; filename="qrcode-{animal.id}.png"'
        )

        return response
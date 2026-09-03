from rest_framework import viewsets

from .models import Ocorrencia
from .serializers import OcorrenciaSerializer


class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.select_related("animal").all()
    serializer_class = OcorrenciaSerializer
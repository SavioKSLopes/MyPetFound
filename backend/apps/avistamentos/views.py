from rest_framework import viewsets

from .models import Avistamento
from .serializers import AvistamentoSerializer


class AvistamentoViewSet(viewsets.ModelViewSet):
    queryset = (
        Avistamento.objects
        .select_related("ocorrencia", "ocorrencia__animal")
        .all()
    )
    serializer_class = AvistamentoSerializer
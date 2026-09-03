from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AnimalViewSet, AnimaisPerdidosPublicosView


router = DefaultRouter()

router.register(
    "animais",
    AnimalViewSet,
    basename="animal",
)


urlpatterns = [
    path(
        "publico/animais-perdidos/",
        AnimaisPerdidosPublicosView.as_view(),
        name="animais-perdidos-publicos",
    ),
]

urlpatterns += router.urls
import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email

from .models import MensagemContato


logger = logging.getLogger(__name__)


def enviar_notificacao_nova_mensagem(mensagem):
    """Notifica o tutor sem incluir o conteúdo privado recebido."""
    registro = (
        MensagemContato.objects
        .select_related("animal", "animal__tutor")
        .filter(pk=getattr(mensagem, "pk", None))
        .first()
    )
    if registro is None:
        return

    animal = registro.animal
    tutor = animal.tutor
    email = (getattr(tutor, "email", "") or "").strip()
    try:
        validate_email(email)
    except ValidationError:
        logger.warning(
            "Notificação de nova mensagem ignorada: e-mail do tutor ausente ou inválido."
        )
        return

    nome_tutor = (getattr(tutor, "first_name", "") or "").strip()
    nome_tutor = nome_tutor or getattr(tutor, "username", "tutor")
    nome_animal = (getattr(animal, "nome", "") or "").strip() or "seu animal"
    url_mensagens = f"{settings.FRONTEND_URL.rstrip('/')}/mensagens"

    assunto = f"Nova mensagem sobre {nome_animal} — MyPetFound"
    corpo = (
        f"Olá, {nome_tutor}.\n\n"
        f"Você recebeu uma nova mensagem sobre {nome_animal} no MyPetFound.\n\n"
        "Acesse sua caixa de entrada para consultar o aviso:\n\n"
        f"{url_mensagens}\n\n"
        "Por segurança, o conteúdo da mensagem não é exibido neste e-mail.\n\n"
        "Se você não reconhece essa atividade, acesse sua conta para verificar os detalhes."
    )

    try:
        send_mail(
            assunto,
            corpo,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception:
        # A mensagem já foi confirmada no banco; falha de e-mail não deve
        # converter a criação bem-sucedida em erro nem registrar dados privados.
        logger.exception("Falha ao enviar notificação de nova mensagem privada.")

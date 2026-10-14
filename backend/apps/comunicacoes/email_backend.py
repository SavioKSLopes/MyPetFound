"""Envio transacional via HTTPS, sem dependência de SMTP."""

import json
from email.utils import parseaddr
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class BrevoEmailError(Exception):
    """Falha de envio com descrição segura para os logs dos chamadores."""


def endereco(valor):
    nome, email = parseaddr(valor)
    return {"email": email, **({"name": nome} if nome else {})}


class BrevoEmailBackend(BaseEmailBackend):
    endpoint = "https://api.brevo.com/v3/smtp/email"

    def __init__(self, fail_silently=False, timeout=None, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.timeout = timeout if timeout is not None else settings.EMAIL_TIMEOUT

    def send_messages(self, email_messages):
        enviados = 0
        for mensagem in email_messages or []:
            if not mensagem.recipients():
                continue
            # Raise outside the exception handler so caller tracebacks never
            # include provider responses, request headers or network errors.
            erro = None
            try:
                if not settings.BREVO_API_KEY:
                    raise BrevoEmailError("BREVO_API_KEY não configurada.")
                if mensagem.attachments:
                    raise BrevoEmailError("Anexos não suportados pelo backend Brevo.")
                payload = {
                    "sender": endereco(mensagem.from_email or settings.DEFAULT_FROM_EMAIL),
                    "subject": mensagem.subject,
                }
                for campo in ("to", "cc", "bcc"):
                    valores = getattr(mensagem, campo)
                    if valores:
                        payload[campo] = [endereco(valor) for valor in valores]
                if mensagem.reply_to:
                    if len(mensagem.reply_to) != 1:
                        raise BrevoEmailError("Brevo aceita apenas um endereço reply-to.")
                    payload["replyTo"] = endereco(mensagem.reply_to[0])
                payload["htmlContent" if mensagem.content_subtype == "html" else "textContent"] = mensagem.body
                for conteudo, tipo in getattr(mensagem, "alternatives", []):
                    if tipo == "text/html":
                        payload["htmlContent"] = conteudo
                    elif tipo == "text/plain":
                        payload["textContent"] = conteudo
                    else:
                        raise BrevoEmailError("Alternativa de conteúdo não suportada pelo Brevo.")
                if mensagem.extra_headers:
                    payload["headers"] = mensagem.extra_headers
                request = Request(
                    self.endpoint,
                    data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                    headers={
                        "api-key": settings.BREVO_API_KEY,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    method="POST",
                )
                with urlopen(request, timeout=self.timeout) as response:
                    if response.status != 201:
                        erro = "Brevo rejeitou o envio (HTTP %s)." % response.status
            except HTTPError as exc:
                erro = "Brevo rejeitou o envio (HTTP %s)." % exc.code
                exc.close()
            except (URLError, OSError):
                erro = "Falha de conexão HTTPS com Brevo."
            except BrevoEmailError as exc:
                erro = str(exc)
            except Exception:
                erro = "Falha ao preparar ou enviar e-mail pelo Brevo."
            if erro:
                if not self.fail_silently:
                    raise BrevoEmailError(erro)
            else:
                enviados += 1
        return enviados

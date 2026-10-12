"""
Configurações de teste para usar SQLite em memória.
"""
from .settings import *  # noqa: F403,F401

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Desabilita migrações para testes mais rápidos
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Configurações de email para testes
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Configurações de CORS para testes
CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Configuração de mídia para testes
MEDIA_ROOT = "/tmp/test_media"
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Configuração do Cloudinary para testes (desabilitado)
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": "test",
    "API_KEY": "test",
    "API_SECRET": "test",
}

# Configuração de frontend URL para testes
FRONTEND_URL = "http://frontend-teste.local/"

# Desabilita throttle para testes
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "password_reset_request": "1000/hour",
        "password_reset_confirm": "1000/hour",
    },
}
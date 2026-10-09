from collections.abc import Mapping

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


User = get_user_model()


class CadastroUsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        max_length=150,
        trim_whitespace=True,
        validators=User._meta.get_field("username").validators,
        error_messages={
            "required": "Informe um nome de usuário.",
            "blank": "Informe um nome de usuário.",
        },
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
        style={"input_type": "password"},
        error_messages={
            "required": "Informe uma senha.",
            "blank": "Informe uma senha.",
            "min_length": "A senha deve ter pelo menos 8 caracteres.",
        },
    )
    password_confirmation = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
        error_messages={
            "required": "Confirme sua senha.",
            "blank": "Confirme sua senha.",
        },
    )
    first_name = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        max_length=150,
        error_messages={
            "required": "Informe seu nome completo.",
            "blank": "Informe seu nome completo.",
        },
    )
    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=True,
        max_length=150,
    )
    email = serializers.EmailField(
        required=True,
        max_length=254,
        error_messages={
            "required": "Informe seu e-mail.",
            "blank": "Informe seu e-mail.",
            "invalid": "Informe um endereço de e-mail válido.",
        },
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "password_confirmation",
            "first_name",
            "last_name",
        )
        read_only_fields = (
            "id",
        )

    def to_internal_value(self, data):
        if isinstance(data, Mapping):
            campos_inesperados = set(data.keys()).difference(self.fields)
            if campos_inesperados:
                raise serializers.ValidationError({
                    campo: "Este campo não é permitido."
                    for campo in sorted(campos_inesperados)
                })

        return super().to_internal_value(data)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Este e-mail já está cadastrado."
            )
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Este nome de usuário já está em uso."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError({
                "password_confirmation": "As senhas informadas não conferem."
            })

        usuario = User(
            username=attrs["username"],
            email=attrs["email"],
            first_name=attrs["first_name"],
            last_name=attrs.get("last_name", ""),
        )

        try:
            validate_password(attrs["password"], user=usuario)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirmation")
        return User.objects.create_user(
            **validated_data,
            is_staff=False,
            is_superuser=False,
        )


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
        )
        read_only_fields = fields


class SolicitarRedefinicaoSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)


class RedefinirSenhaSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=128)
    token = serializers.CharField(max_length=256)
    nova_senha = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
    )
    confirmacao_senha = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

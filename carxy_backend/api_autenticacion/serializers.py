from rest_framework import serializers
from .models import Usuarios


class UsuariosSerializers(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "is_staff",
        )
        extra_kwargs = {
            "is_staff": {"read_only": False},
        }

        def create(self, validated_data):
            user = Usuarios.objects.create_user(
                username=validated_data["username"], password=validated_data["password"]
            )
            if "is_staff" in validated_data:
                user.is_staff = validated_data["is_staff"]
                user.save()
            return user

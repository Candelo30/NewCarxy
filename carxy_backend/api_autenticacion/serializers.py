from rest_framework import serializers
from .models import *


class UsuariosSerializers(serializers.ModelSerializer):
    foto_perfil = (
        serializers.SerializerMethodField()
    )  # Usamos SerializerMethodField para la URL completa

    class Meta:
        model = Usuarios
        fields = "__all__"
        extra_kwargs = {
            "is_staff": {"read_only": False},
        }

    def get_foto_perfil(self, obj):
        request = self.context.get(
            "request", None
        )  # Evitar el AttributeError si request es None
        foto_perfil = (
            obj.foto_perfil
        )  # Asumiendo que tienes un campo 'foto_perfil' en el modelo Usuarios
        if foto_perfil:
            if request:
                return request.build_absolute_uri(
                    foto_perfil.url
                )  # Retorna la URL completa si request existe
            return foto_perfil.url  # Retorna la URL relativa si no hay request
        return None

    def create(self, validated_data):
        user = Usuarios.objects.create_user(
            username=validated_data["username"], password=validated_data["password"]
        )
        if "is_staff" in validated_data:
            user.is_staff = validated_data["is_staff"]
            user.save()
        return user


class PublicacionSerializer(serializers.ModelSerializer):
    # Traemos solo el 'username' y la 'foto_perfil' del usuario, usando 'source'
    usuario_username = serializers.CharField(source="usuario.username", read_only=True)
    usuario_foto = serializers.SerializerMethodField()

    # Traemos solo los comentarios y mostramos el nombre del usuario y el comentario
    comentarios = serializers.SerializerMethodField()

    class Meta:
        model = Publicacion
        fields = "__all__"

    def get_usuario_foto(self, obj):
        request = self.context.get("request")
        foto_perfil = obj.usuario.foto_perfil
        if foto_perfil:
            return request.build_absolute_uri(foto_perfil.url)
        return None

    def get_comentarios(self, obj):
        # Solo traemos el 'username' y el texto del comentario
        comentarios = obj.comentarios.all()
        return [
            {
                "usuario_username": comentario.usuario.username,
                "comentario": comentario.comentario,
                "fecha_comentario": comentario.fecha_comentario,
                "usuario_foto": self.get_comentario_foto(comentario),
            }
            for comentario in comentarios
        ]

    def get_comentario_foto(self, comentario):
        request = self.context.get("request")
        foto_perfil = comentario.usuario.foto_perfil
        if foto_perfil:
            return request.build_absolute_uri(foto_perfil.url)
        return None


# Serializador para Comentarios
class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializers(
        read_only=True
    )  # Incluye la info del usuario que hizo el comentario
    publicacion = serializers.PrimaryKeyRelatedField(
        queryset=Publicacion.objects.all()
    )  # Publicación a la que pertenece el comentario

    class Meta:
        model = Comentario
        fields = "__all__"


# Serializador para el modelo 3D (Auto)
class Modelo3DSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializers(
        read_only=True
    )  # Incluye la info del usuario pero no permite edición

    class Meta:
        model = Modelo3D
        fields = "__all__"


# Serializador para Personalización
class PersonalizacionSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializers(
        read_only=True
    )  # Muestra info del usuario sin permitir edición
    modelo = Modelo3DSerializer(
        read_only=True
    )  # Muestra info del modelo sin permitir edición

    class Meta:
        model = Personalizacion
        fields = ["id", "nombre_personalizacion", "fecha_creacion", "usuario", "modelo"]


# Serializador para Partes de Auto
class ParteSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializers(
        read_only=True
    )  # Muestra info del usuario sin permitir edición
    modelo = Modelo3DSerializer(
        read_only=True
    )  # Muestra info del modelo sin permitir edición
    personalizacion = PersonalizacionSerializer(
        read_only=True
    )  # Muestra la personalización sin permitir edición

    class Meta:
        model = Parte
        fields = "__all__"

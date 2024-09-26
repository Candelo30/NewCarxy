from rest_framework import serializers
from .models import *


class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = (
            "id",
            "foto_perfil",
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "is_staff",
        )
        extra_kwargs = {
            "password": {
                "write_only": True
            },  # Asegura que la contraseña no se muestre en la respuesta
            "is_staff": {"read_only": False},
        }

    def create(self, validated_data):
        # Crear el usuario de manera segura usando el método create_user
        user = Usuarios.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],  # El create_user cifrará la contraseña
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        # Si se incluye el campo is_staff, se asigna
        if "is_staff" in validated_data:
            user.is_staff = validated_data["is_staff"]
            user.save()

        return user


class PublicacionSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source="usuario.username", read_only=True)
    usuario_foto = serializers.SerializerMethodField()
    comentarios = serializers.SerializerMethodField()

    class Meta:
        model = Publicacion
        fields = "__all__"

    def get_usuario_foto(self, obj):
        request = self.context.get("request")
        if obj.usuario.foto_perfil:
            return request.build_absolute_uri(obj.usuario.foto_perfil.url)
        return None

    def get_comentarios(self, obj):
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
        if comentario.usuario.foto_perfil:
            return request.build_absolute_uri(comentario.usuario.foto_perfil.url)
        return None


class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializer(read_only=True)
    publicacion = serializers.PrimaryKeyRelatedField(queryset=Publicacion.objects.all())

    class Meta:
        model = Comentario
        fields = "__all__"


class Modelo3DSerializer(serializers.ModelSerializer):
    usuario = UsuariosSerializer(
        read_only=True
    )  # Añadir usuario como serializador anidado

    class Meta:
        model = Modelo3D
        fields = ["id", "nombre_modelo", "fecha_creacion", "usuario", "archivo_modelo"]

    def validate_archivo_modelo(self, value):
        if not value.name.endswith(".glb"):
            raise serializers.ValidationError(
                "El archivo debe ser un modelo en formato .glb"
            )
        return value


class PersonalizacionSerializer(serializers.ModelSerializer):
    modelo = Modelo3DSerializer(read_only=True)
    modelo_id = serializers.PrimaryKeyRelatedField(
        queryset=Modelo3D.objects.all(),  # Asegúrate de importar el modelo correcto
        source="modelo",  # Esto permite que 'modelo_id' mapee a 'modelo'
        write_only=True,  # Solo se puede escribir, no se puede leer
    )
    usuario = UsuariosSerializer(read_only=True)

    class Meta:
        model = Personalizacion
        fields = [
            "id",
            "nombre_personalizacion",
            "fecha_creacion",
            "usuario",
            "modelo",
            "modelo_id",
        ]


class ParteSerializer(serializers.ModelSerializer):
    modelo = Modelo3DSerializer(
        read_only=True
    )  # Añadir modelo como serializador anidado
    personalizacion = PersonalizacionSerializer(
        read_only=True
    )  # Añadir personalizacion como serializador anidado
    usuario = UsuariosSerializer(read_only=True)

    class Meta:
        model = Parte
        fields = ["id", "nombre_parte", "color", "modelo", "personalizacion", "usuario"]

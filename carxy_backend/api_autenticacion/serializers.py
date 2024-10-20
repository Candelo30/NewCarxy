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
            "last_login",
            "date_joined",
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


# ···············································


class PublicacionSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source="usuario.username")
    usuario_id = serializers.ReadOnlyField(source="usuario.id")
    usuario_foto = serializers.SerializerMethodField()
    comentarios = serializers.SerializerMethodField()
    liked_by_user = (
        serializers.SerializerMethodField()
    )  # Campo para verificar si el usuario ha dado like

    class Meta:
        model = Publicacion
        fields = [
            "id",
            "usuario_id",
            "usuario_username",
            "usuario_foto",
            "fecha_creacion",
            "imagen",
            "descripcion",
            "megusta",
            "comentarios",
            "liked_by_user",  # Agregar el nuevo campo aquí
        ]

    def get_usuario_foto(self, obj):
        request = self.context.get("request")
        if obj.usuario.foto_perfil:
            return request.build_absolute_uri(obj.usuario.foto_perfil.url)
        return None

    def get_comentarios(self, obj):
        comentarios = obj.comentarios.all()
        return ComentarioSerializer(comentarios, many=True, context=self.context).data

    def get_liked_by_user(self, obj):
        user = self.context["request"].user
        if user.is_authenticated:
            return Like.objects.filter(usuario=user, publicacion=obj).exists()
        return False  # Devuelve False si el usuario no está autenticado


class ComentarioSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source="usuario.username")
    usuario_foto = serializers.SerializerMethodField()
    usuario_id = serializers.ReadOnlyField(source="usuario.id")

    class Meta:
        model = Comentario
        fields = [
            "id",
            "usuario_id",
            "usuario_username",
            "usuario_foto",
            "publicacion",
            "comentario",
            "fecha_comentario",
        ]

    def get_usuario_foto(self, comentario):
        request = self.context.get(
            "request", None
        )  # Asegura que el request esté en el contexto
        if request and comentario.usuario and comentario.usuario.foto_perfil:
            # Construye la URL solo si todos los elementos existen
            return request.build_absolute_uri(comentario.usuario.foto_perfil.url)
        return None  # Devuelve None si no hay foto o no se cumple alguna condición


# ____________________________________________________________________________
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
    modelo_id = serializers.PrimaryKeyRelatedField(
        queryset=Modelo3D.objects.all(), source="modelo", write_only=True
    )
    personalizacion_id = serializers.PrimaryKeyRelatedField(
        queryset=Personalizacion.objects.all(),
        source="personalizacion",
        write_only=True,
    )
    usuario = serializers.HiddenField(default=serializers.CurrentUserDefault())

    modelo = Modelo3DSerializer(read_only=True)
    personalizacion = PersonalizacionSerializer(read_only=True)

    class Meta:
        model = Parte
        fields = [
            "id",
            "nombre_parte",
            "color",
            "modelo",
            "modelo_id",
            "personalizacion",
            "personalizacion_id",
            "usuario",
        ]

    def validate(self, data):
        modelo = data.get("modelo")
        personalizacion = data.get("personalizacion")
        nombre_parte = data.get("nombre_parte")
        usuario = self.context["request"].user

        if personalizacion and personalizacion.modelo != modelo:
            raise serializers.ValidationError(
                "La personalización seleccionada no corresponde al modelo proporcionado."
            )

        if Parte.objects.filter(
            nombre_parte=nombre_parte,
            modelo=modelo,
            personalizacion=personalizacion,
            usuario=usuario,
        ).exists():
            raise serializers.ValidationError(
                "Ya existe una parte con este nombre, modelo, personalización y usuario."
            )

        return data

    def create(self, validated_data):
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if instance.usuario != self.context["request"].user:
            raise serializers.ValidationError(
                "No tienes permiso para modificar esta parte."
            )

        validated_data["usuario"] = self.context["request"].user
        return super().update(instance, validated_data)


# _______________________________________________________
class HelpArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpArticle
        fields = "__all__"


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"

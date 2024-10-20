from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError


class Usuarios(AbstractUser):
    foto_perfil = models.ImageField(upload_to="img/", null=True, blank=True)
    email = models.EmailField(unique=True)  # Email único y obligatorio


# _______________________________


class Publicacion(models.Model):
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="publicaciones"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    imagen = models.ImageField(upload_to="img/", null=True, blank=True)
    descripcion = models.TextField()
    megusta = models.IntegerField(default=0)  # Contador de "Me gusta"

    def __str__(self):
        return f"Publicación: {self.descripcion} por {self.usuario.username}"


class Like(models.Model):
    usuario = models.ForeignKey(Usuarios, on_delete=models.CASCADE)
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE)

    class Meta:
        unique_together = (
            "usuario",
            "publicacion",
        )  # Asegura que un usuario solo pueda dar like una vez por publicación

    def __str__(self):
        return f"{self.usuario.username} likes {self.publicacion.descripcion}"


class Comentario(models.Model):
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="comentarios"
    )
    publicacion = models.ForeignKey(
        Publicacion, on_delete=models.CASCADE, related_name="comentarios"
    )
    comentario = models.TextField()
    fecha_comentario = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.usuario.username} en {self.publicacion}"


# __________________________________


class Modelo3D(models.Model):
    nombre_modelo = models.CharField(max_length=100)
    fecha_creacion = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="modelos_3d"
    )
    archivo_modelo = models.FileField(upload_to="modelos_3d/")

    def __str__(self):
        return self.nombre_modelo


class Personalizacion(models.Model):
    nombre_personalizacion = models.CharField(max_length=100)
    fecha_creacion = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="personalizaciones"
    )
    modelo = models.ForeignKey(
        Modelo3D, on_delete=models.CASCADE, related_name="personalizaciones"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "modelo", "nombre_personalizacion"],
                name="unique_personalizacion_usuario_modelo",
            )
        ]

    def __str__(self):
        return f"{self.nombre_personalizacion} - {self.modelo.nombre_modelo}"


# Modelos
class Parte(models.Model):
    nombre_parte = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    modelo = models.ForeignKey(
        Modelo3D, on_delete=models.CASCADE, related_name="partes"
    )
    personalizacion = models.ForeignKey(
        Personalizacion, on_delete=models.CASCADE, related_name="partes"
    )
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="partes"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["nombre_parte", "modelo", "personalizacion", "usuario"],
                name="unique_parte_per_usuario",
            )
        ]

    def clean(self):
        # Verificar que el modelo de la parte coincide con el de la personalización
        if self.modelo != self.personalizacion.modelo:
            raise ValidationError(
                "El modelo de la parte debe coincidir con el modelo de la personalización."
            )

    def __str__(self):
        return (
            f"{self.nombre_parte} ({self.color}) del modelo {self.modelo.nombre_modelo}"
        )


# ________________________________________________


class HelpArticle(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    content = models.TextField()
    image = models.ImageField(
        upload_to="help_articles/", blank=True, null=True
    )  # Para almacenar imágenes

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question

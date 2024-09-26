from django.db import models
from django.contrib.auth.models import AbstractUser


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
    megusta = models.IntegerField(default=0)

    def __str__(self):
        return f"Publicación: {self.descripcion} por {self.usuario.username}"


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
    fecha_creacion = models.DateField(
        auto_now_add=True
    )  # Consistente con otros modelos
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="personalizaciones"
    )
    modelo = models.ForeignKey(
        Modelo3D, on_delete=models.CASCADE, related_name="personalizaciones"
    )

    def __str__(self):
        return f"{self.nombre_personalizacion} - {self.modelo.nombre_modelo}"


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

    def __str__(self):
        return (
            f"{self.nombre_parte} ({self.color}) del modelo {self.modelo.nombre_modelo}"
        )

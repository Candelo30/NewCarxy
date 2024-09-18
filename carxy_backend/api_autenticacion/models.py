from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class Usuarios(AbstractUser):
    foto_perfil = models.ImageField(upload_to="img/", null=True, blank=True)


# _______________________________


class Modelo3D(models.Model):
    nombre_modelo = models.CharField(max_length=100)
    fecha_creacion = models.DateField()
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="modelos_3d"
    )

    def _str_(self):
        return self.nombre_modelo


class Personalizacion(models.Model):
    nombre_personalizacion = models.CharField(max_length=100)
    fecha_creacion = models.DateField()
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="personalizaciones"
    )
    modelo = models.ForeignKey(
        Modelo3D, on_delete=models.CASCADE, related_name="personalizaciones"
    )

    def _str_(self):
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

    def _str_(self):
        return (
            f"{self.nombre_parte} ({self.color}) del modelo {self.modelo.nombre_modelo}"
        )


class Publicacion(models.Model):
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, related_name="publicaciones"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    imagen = models.ImageField(upload_to="img/", null=True, blank=True)
    descripcion = models.TextField()
    megusta = models.IntegerField(default=0)

    def _str_(self):
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

    def _str_(self):
        return f"Comentario de {self.usuario.username} en {self.publicacion.titulo}"

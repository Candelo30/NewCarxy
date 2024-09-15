from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class Usuarios(AbstractUser):
    foto_perfil = models.ImageField(upload_to='img/', null=True, blank=True)
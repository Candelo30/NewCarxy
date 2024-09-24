from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r"usuarios", UsuarioViewSet, basename="usuario")
router.register(r"publicaciones", PublicacionUsuarioViewSet, basename="publicaciones")
router.register(
    r"allPublication", PublicacionPublicaViewSet, basename="Allpublications"
)

router.register(r"modelos3d", Modelo3DViewSet)
router.register(r"personalizaciones", PersonalizacionViewSet)
router.register(r"partes", ParteViewSet)


urlpatterns = router.urls

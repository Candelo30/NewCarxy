from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from carxy import settings
from api_autenticacion import views

urlpatterns = [
    path("admin/", admin.site.urls),
    # Autenticación y Perfil
    path("api/", include("api_autenticacion.urls")),
    path("iniciar-sesion/", views.iniciarSesion, name="iniciar_sesion"),
    path("registro/", views.registro, name="registro"),
    path("perfil/", views.PerfilView.as_view(), name="perfil"),
    path("admin/", admin.site.urls),
    # Incluir las rutas del router
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

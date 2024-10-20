from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from carxy import settings
from api_autenticacion import views

urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    # Autenticación y Perfil
    path("api/", include("api_autenticacion.urls")),
    path("iniciar-sesion/", views.iniciarSesion, name="iniciar_sesion"),
    path(
        "comentarios/",
        views.ComentarioListCreateView.as_view(),
        name="comentarios-list-create",
    ),
    path(
        "comentarios/<int:pk>/",
        views.ComentarioDeleteView.as_view(),
        name="comentarios-delete",
    ),
    path("registro/", views.registro, name="registro"),
    path("perfil/", views.PerfilView.as_view(), name="perfil"),
    path("change-password/", views.ChangePasswordView.as_view(), name="password"),
    # Incluir las rutas del router
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

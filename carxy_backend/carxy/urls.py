from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from carxy import settings
from api_autenticacion import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api_autenticacion.urls")),
    path("iniciar-sesion/", views.iniciarSesion),
    path("registro/", views.registro),
    path("perfil/", views.PerfilView.as_view(), name="perfil"),
    # Rutas para Modelos3D
    path(
        "modelos/", views.ListaModelos3D.as_view(), name="lista_modelos"
    ),  # GET y POST
    path(
        "modelos/<int:pk>/",
        views.ModificarEliminarModelo.as_view(),
        name="modificar_eliminar_modelo",
    ),  # PUT y DELETE
    # Ruta para personalizar partes
    path(
        "personalizar-parte/<int:pk>/",
        views.PersonalizarParte.as_view(),
        name="personalizar_parte",
    ),  # POST
    # Rutas para partes
    path("partes/", views.ListaCrearParte.as_view(), name="lista_crear_parte"),
    path(
        "partes/<int:pk>/",
        views.ModificarEliminarParte.as_view(),
        name="modificar_eliminar_parte",
    ),
    # Rutas para gestionar Personalizaciones
    path(
        "personalizaciones/",
        views.ListaCrearPersonalizacion.as_view(),
        name="lista_crear_personalizacion",
    ),  # GET y POST
    path(
        "personalizaciones/<int:pk>/",
        views.ModificarEliminarPersonalizacion.as_view(),
        name="modificar_eliminar_personalizacion",
    ),  # PUT y DELETE
    path(
        "personalizaciones/<int:pk>/",
        views.RetrievePersonalizacion.as_view(),
        name="personalizacion-detalle",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

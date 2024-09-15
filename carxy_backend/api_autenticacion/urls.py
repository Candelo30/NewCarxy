from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('iniciar-sesion/', views.iniciarSesion),
    path('registro/', views.perfil),
    path('perfil/', views.perfil),
]
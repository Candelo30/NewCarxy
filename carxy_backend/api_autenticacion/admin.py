from django.contrib import admin
from .models import (
    Usuarios,
    Publicacion,
    Comentario,
    Modelo3D,
    Personalizacion,
    Parte,
    Like,
    HelpArticle,  # Nuevo modelo
    FAQ,  # Nuevo modelo
)


# Usuarios Admin
@admin.register(Usuarios)
class UsuariosAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "is_active", "is_staff"]
    search_fields = ["username", "email"]
    list_filter = ["is_active", "is_staff"]
    ordering = ["username"]


# Comentarios Inline para ser mostrados en las publicaciones
class ComentarioInline(admin.TabularInline):
    model = Comentario
    extra = 1
    fields = ["usuario", "comentario", "fecha_comentario"]
    readonly_fields = ["fecha_comentario"]
    autocomplete_fields = ["usuario"]


# Publicaciones Admin
@admin.register(Publicacion)
class PublicacionAdmin(admin.ModelAdmin):
    list_display = ["usuario", "fecha_creacion", "megusta"]
    search_fields = ["usuario__username", "descripcion"]
    list_filter = ["usuario", "fecha_creacion"]
    inlines = [
        ComentarioInline
    ]  # Mostrar comentarios directamente en las publicaciones
    autocomplete_fields = ["usuario"]


# Partes Inline para ser mostradas en Modelo3D
class ParteInline(admin.TabularInline):
    model = Parte
    extra = 1
    fields = ["nombre_parte", "color", "personalizacion", "usuario"]
    autocomplete_fields = ["personalizacion", "usuario"]
    show_change_link = True


# Personalizacion Inline para ser mostradas en Modelo3D
class PersonalizacionInline(admin.TabularInline):
    model = Personalizacion
    extra = 1
    fields = ["nombre_personalizacion", "usuario"]
    show_change_link = True
    autocomplete_fields = ["usuario"]


# Modelo3D Admin
@admin.register(Modelo3D)
class Modelo3DAdmin(admin.ModelAdmin):
    list_display = ["nombre_modelo", "usuario", "fecha_creacion"]
    search_fields = ["nombre_modelo", "usuario__username"]
    list_filter = ["usuario", "fecha_creacion"]
    inlines = [
        PersonalizacionInline,
        ParteInline,
    ]  # Mostrar personalizaciones y partes en el Modelo3D
    autocomplete_fields = ["usuario"]


# Personalizacion Admin
@admin.register(Personalizacion)
class PersonalizacionAdmin(admin.ModelAdmin):
    list_display = ["nombre_personalizacion", "modelo", "usuario"]
    search_fields = [
        "nombre_personalizacion",
        "modelo__nombre_modelo",
        "usuario__username",
    ]
    list_filter = ["modelo", "usuario"]
    inlines = [ParteInline]  # Mostrar partes dentro de las personalizaciones
    autocomplete_fields = ["modelo", "usuario"]


# Parte Admin
@admin.register(Parte)
class ParteAdmin(admin.ModelAdmin):
    list_display = ["nombre_parte", "color", "modelo", "personalizacion", "usuario"]
    search_fields = [
        "nombre_parte",
        "modelo__nombre_modelo",
        "personalizacion__nombre_personalizacion",
        "usuario__username",
    ]
    list_filter = ["modelo", "personalizacion", "usuario"]
    autocomplete_fields = ["modelo", "personalizacion", "usuario"]


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["usuario", "publicacion"]
    search_fields = ["usuario__username", "publicacion__descripcion"]
    list_filter = ["publicacion", "usuario"]


# HelpArticle Admin
@admin.register(HelpArticle)
class HelpArticleAdmin(admin.ModelAdmin):
    list_display = ["title", "summary", "created_at", "updated_at"]
    search_fields = ["title", "summary"]
    list_filter = ["created_at", "updated_at"]


# FAQ Admin
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ["question", "created_at", "updated_at"]
    search_fields = ["question"]
    list_filter = ["created_at", "updated_at"]

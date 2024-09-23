from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import viewsets
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveAPIView,
)

from .serializers import *
from .models import *

from django.shortcuts import render
from warnings import filters

from django.shortcuts import get_object_or_404
from .models import Usuarios


# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    pass


class MyTokenRefreshView(TokenRefreshView):
    pass


@api_view(["POST"])
@permission_classes([AllowAny])
def iniciarSesion(request):
    user = get_object_or_404(Usuarios, username=request.data["username"])
    if not user.check_password(request.data["password"]):
        return Response(
            {"error": "Invalid password"}, status=status.HTTP_400_BAD_REQUEST
        )
    token, created = Token.objects.get_or_create(user=user)
    serializer = UsuariosSerializers(instance=user)
    return Response(
        {"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def registro(request):
    serializer = UsuariosSerializers(data=request.data)
    if serializer.is_valid():
        # Guardar el usuario con la contraseña encriptada
        user = serializer.save()
        user.set_password(request.data["password"])  # Encripta la contraseña
        user.save()

        # Crear el token para el usuario
        token = Token.objects.create(user=user)

        return Response(
            {"token": token.key, "user": serializer.data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Vistas
#  _________________________________________________
# Vista para obtener, actualizar y eliminar un usuario
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializers
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]


class PerfilView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtenemos los datos del usuario autenticado
        serializer = UsuariosSerializers(instance=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ______________________________


# Publicaciones


class PublicacionPublicaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]


# ViewSet para que los usuarios manejen solo sus publicaciones
class PublicacionUsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = PublicacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Los usuarios normales solo ven sus propias publicaciones
        return Publicacion.objects.filter(usuario=self.request.user)


# Comentarios
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lista_comentarios(request):
    if request.method == "GET":
        comentarios = Comentario.objects.all()
        serializer = ComentarioSerializer(comentarios, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = ComentarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def eliminar_comentario(request, pk):
    comentario = get_object_or_404(Comentario, pk=pk)

    # Permitir que solo el usuario propietario o un administrador elimine el comentario
    if request.user == comentario.usuario or request.user.is_staff:
        comentario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(
        {"error": "No tienes permiso para eliminar este comentario"},
        status=status.HTTP_403_FORBIDDEN,
    )


# Modelos
class ListaModelos3D(ListCreateAPIView):
    queryset = Modelo3D.objects.all()
    serializer_class = Modelo3DSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Solo los administradores pueden agregar modelos"},
                status=status.HTTP_403_FORBIDDEN,
            )

        request.data["usuario"] = request.user.id  # Asignar el usuario autenticado
        return super().post(request, *args, **kwargs)


class ModificarEliminarModelo(RetrieveUpdateDestroyAPIView):
    queryset = Modelo3D.objects.all()
    serializer_class = Modelo3DSerializer
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        # Verificar si el usuario es administrador
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para editar este modelo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        # Verificar si el usuario es administrador
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para eliminar este modelo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().delete(request, *args, **kwargs)


# ____________________________________________________________________
# Lista y creación de personalizaciones
class ListaCrearPersonalizacion(ListCreateAPIView):
    serializer_class = PersonalizacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Devuelve solo las personalizaciones del usuario autenticado
        return Personalizacion.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # Asigna el usuario autenticado a la personalización
        serializer.save(usuario=self.request.user)


class RetrievePersonalizacion(RetrieveAPIView):
    serializer_class = PersonalizacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Asegurarse de que solo devuelve personalizaciones del usuario autenticado
        return Personalizacion.objects.filter(usuario=self.request.user)


class ModificarEliminarPersonalizacion(RetrieveUpdateDestroyAPIView):
    serializer_class = PersonalizacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Devuelve solo las personalizaciones del usuario autenticado
        return Personalizacion.objects.filter(usuario=self.request.user)

    def put(self, request, *args, **kwargs):
        # Verificar si el usuario es el propietario de la personalización
        personalizacion = self.get_object()
        if personalizacion.usuario != request.user:
            return Response(
                {"error": "No tienes permiso para modificar esta personalización"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        # Verificar si el usuario es el propietario de la personalización
        personalizacion = self.get_object()
        if personalizacion.usuario != request.user:
            return Response(
                {"error": "No tienes permiso para eliminar esta personalización"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().delete(request, *args, **kwargs)


class PersonalizarParte(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        parte = get_object_or_404(Parte, pk=pk)

        # Verificar que la parte pertenezca al usuario
        if parte.usuario != request.user:
            return Response(
                {"error": "No tienes permiso para personalizar esta parte."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Cambiar el color de la parte
        color = request.data.get("color")
        if color:
            parte.color = color
        else:
            return Response(
                {"error": "El color es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar si ya existe una personalización
        if parte.personalizacion is None:
            personalizacion = Personalizacion.objects.create(
                nombre_personalizacion=f"Personalización de {parte.nombre_parte}",
                fecha_creacion=request.data.get("fecha_creacion"),
                usuario=request.user,
                modelo=parte.modelo,
            )
            parte.personalizacion = personalizacion

        parte.save()

        return Response(
            {
                "message": "Parte personalizada con éxito",
                "personalizacion": parte.personalizacion.id,
            },
            status=status.HTTP_200_OK,
        )


# Lista y creación de partes
class ListaCrearParte(ListCreateAPIView):
    serializer_class = ParteSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Devuelve solo las partes del usuario autenticado
        return Parte.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # Asigna el usuario autenticado a la parte
        serializer.save(usuario=self.request.user)


class ModificarEliminarParte(RetrieveUpdateDestroyAPIView):
    serializer_class = ParteSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Devuelve solo las partes del usuario autenticado
        return Parte.objects.filter(usuario=self.request.user)

    def put(self, request, *args, **kwargs):
        parte = self.get_object()
        if parte.usuario != request.user:
            return Response(
                {"error": "No tienes permiso para modificar esta parte"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        parte = self.get_object()
        if parte.usuario != request.user:
            return Response(
                {"error": "No tienes permiso para eliminar esta parte"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().delete(request, *args, **kwargs)

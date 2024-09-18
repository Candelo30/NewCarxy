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
        serializer.save()
        user = Usuarios.objects.get(username=serializer.data["username"])
        user.set_password(serializer.data["password"])
        user.save()
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
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lista_modelos(request):
    if request.method == "GET":
        modelos = Modelo3D.objects.all()
        serializer = Modelo3DSerializer(modelos, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        if not request.user.is_staff:
            return Response(
                {"error": "Solo los administradores pueden agregar modelos"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = Modelo3DSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def modificar_eliminar_modelo(request, pk):
    modelo = get_object_or_404(Modelo3D, pk=pk)

    if request.method == "PUT":
        # Solo los administradores pueden modificar el modelo completo
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para editar este modelo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = Modelo3DSerializer(modelo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para eliminar este modelo"},
                status=status.HTTP_403_FORBIDDEN,
            )
        modelo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Personalización de partes
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def personalizar_parte(request, pk):
    parte = get_object_or_404(Parte, pk=pk)

    # Verificar que la parte pertenezca al usuario
    if parte.usuario != request.user:
        return Response(
            {"error": "No tienes permiso para personalizar esta parte."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Cambiar el color de la parte
    color = request.data.get("color")
    parte.color = color
    parte.save()

    # Guardar la personalización
    personalizacion = Personalizacion.objects.create(
        nombre_personalizacion=f"Personalización de {parte.nombre_parte}",
        fecha_creacion=request.data.get("fecha_creacion"),
        usuario=request.user,
        modelo=parte.modelo,
    )

    return Response(
        {
            "message": "Parte personalizada con éxito",
            "personalizacion": personalizacion.id,
        },
        status=status.HTTP_200_OK,
    )

# Django and Python imports
from django.shortcuts import render, get_object_or_404
from warnings import filters

# Rest Framework imports
from rest_framework import viewsets, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
    authentication_classes,
)
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveAPIView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.parsers import MultiPartParser, FormParser


# Local imports (models and serializers)
from .models import *
from .serializers import *


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
    serializer = UsuariosSerializer(instance=user)
    return Response(
        {"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def registro(request):
    serializer = UsuariosSerializer(data=request.data)
    if serializer.is_valid():
        # Utilizar el método save del serializador para crear el usuario de forma segura
        user = serializer.save()

        # Crear el token para el usuario registrado
        token = Token.objects.create(user=user)

        return Response(
            {"token": token.key, "user": serializer.data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerfilView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Obtenemos los datos del usuario autenticado
            serializer = UsuariosSerializer(instance=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ______________________________


# Publicaciones


class PublicacionPublicaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error al obtener las publicaciones: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PublicacionUsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = PublicacionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            # Los usuarios normales solo ven sus propias publicaciones
            return Publicacion.objects.filter(usuario=self.request.user)
        except Exception as e:
            return Response(
                {
                    "error": f"Ocurrió un error al obtener las publicaciones del usuario: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_create(self, serializer):
        try:
            # Asigna el usuario autenticado a la publicación
            serializer.save(usuario=self.request.user)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error al crear la publicación: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lista_comentarios(request):
    try:
        if request.method == "GET":
            # Listar todos los comentarios
            comentarios = Comentario.objects.all()
            serializer = ComentarioSerializer(comentarios, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method == "POST":
            # Crear un nuevo comentario
            serializer = ComentarioSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(usuario=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": f"Ocurrió un error al procesar los comentarios: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def eliminar_comentario(request, pk):
    try:
        comentario = get_object_or_404(Comentario, pk=pk)

        # Permitir que solo el usuario propietario o un administrador elimine el comentario
        if request.user == comentario.usuario or request.user.is_staff:
            comentario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"error": "No tienes permiso para eliminar este comentario"},
                status=status.HTTP_403_FORBIDDEN,
            )
    except Comentario.DoesNotExist:
        return Response(
            {"error": "Comentario no encontrado"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Ocurrió un error al eliminar el comentario: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class Modelo3DViewSet(viewsets.ModelViewSet):
    queryset = Modelo3D.objects.all()
    serializer_class = Modelo3DSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class PersonalizacionViewSet(viewsets.ModelViewSet):
    serializer_class = PersonalizacionSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    # Este método filtra las personalizaciones para que solo el usuario autenticado pueda ver las suyas.
    def get_queryset(self):
        return Personalizacion.objects.filter(usuario=self.request.user)

    # Método para crear una personalización asociada al usuario autenticado
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ParteViewSet(viewsets.ModelViewSet):
    queryset = Parte.objects.all()
    serializer_class = ParteSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

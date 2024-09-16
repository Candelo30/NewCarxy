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

from .serializers import UsuariosSerializers
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
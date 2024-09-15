from django.shortcuts import render
from warnings import filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .serializers import UsuariosSerializer

from django.shortcuts import get_object_or_404
from .models import Usuarios
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated, IsAdminUser


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
    serializer = UsuariosSerializer(instance=user)
    return Response(
        {"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def registro(request):
    serializer = UsuariosSerializer(data=request.data)
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

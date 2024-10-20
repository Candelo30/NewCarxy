# Django and Python imports
from django.shortcuts import render, get_object_or_404
from warnings import filters
import logging

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
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction, IntegrityError
from django.db.models import Q
from rest_framework import generics

# Configuración del logger
logger = logging.getLogger(__name__)


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
            serializer = UsuariosSerializer(instance=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request):
        try:
            serializer = UsuariosSerializer(
                instance=request.user, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error al actualizar el perfil: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request):
        try:
            request.user.delete()  # Elimina la cuenta del usuario autenticado
            return Response(
                {"message": "Cuenta eliminada con éxito."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error al eliminar la cuenta: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChangePasswordView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        # Validar la contraseña antigua
        if not request.user.check_password(old_password):
            return Response(
                {"error": "La contraseña actual es incorrecta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Establecer la nueva contraseña
        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {"message": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK
        )


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Ocurrió un error al listar: {str(e)}")
            return Response(
                {"error": f"Ocurrió un error al listar: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Usuarios.DoesNotExist:
            logger.error(f"Usuario con ID {kwargs['pk']} no encontrado.")
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Ocurrió un error al obtener el usuario: {str(e)}")
            return Response(
                {"error": f"Ocurrió un error al obtener el usuario: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Ocurrió un error al crear el usuario: {str(e)}")
            return Response(
                {"error": f"Ocurrió un error al crear el usuario: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Usuarios.DoesNotExist:
            logger.error(f"Usuario con ID {kwargs['pk']} no encontrado.")
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Ocurrió un error al actualizar el usuario: {str(e)}")
            return Response(
                {"error": f"Ocurrió un error al actualizar el usuario: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()  # Esto obtendrá el objeto por su PK
            instance.delete()  # Elimina el objeto
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error al eliminar el usuario: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ______________________________


class ExceptionHandlerMixin:
    def handle_exception(self, exc):
        return Response(
            {"error": f"Ocurrió un error: {str(exc)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class BasePublicacionViewSet(viewsets.ModelViewSet, ExceptionHandlerMixin):
    serializer_class = PublicacionSerializer
    authentication_classes = [TokenAuthentication]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})  # Asegúrate de incluir el request
        return context

    def perform_create(self, serializer):
        try:
            serializer.save(usuario=self.request.user)
        except Exception as e:
            return self.handle_exception(e)


class PublicacionPublicaViewSet(BasePublicacionViewSet):
    queryset = Publicacion.objects.all()
    permission_classes = [AllowAny]  # Permitir que todos vean las publicaciones

    def list(self, request, *args, **kwargs):
        try:
            user_id = request.query_params.get("user_id", None)

            # Si se proporciona user_id, verificar que sea un número válido
            if user_id is not None:
                try:
                    user_id = int(
                        user_id.strip("/")
                    )  # Convertir a entero y eliminar barras
                    # Filtrar publicaciones por el user_id, si se desea
                    self.queryset = self.queryset.filter(usuario_id=user_id)
                except ValueError:
                    return Response(
                        {"error": "Invalid user_id"}, status=status.HTTP_400_BAD_REQUEST
                    )

            return super().list(request, *args, **kwargs)

        except Exception as e:
            return self.handle_exception(e)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        try:
            publicacion = self.get_object()
            user = request.user

            # Intentar obtener el "like" existente
            like, created = Like.objects.get_or_create(
                usuario=user, publicacion=publicacion
            )

            if created:
                # Se ha creado un nuevo "like"
                publicacion.megusta += 1
                publicacion.save()
                return Response({"status": "liked"}, status=status.HTTP_200_OK)
            else:
                # El "like" ya existía, así que lo eliminamos
                like.delete()
                publicacion.megusta -= 1
                publicacion.save()
                return Response({"status": "unliked"}, status=status.HTTP_200_OK)

        except Exception as e:
            return self.handle_exception(e)


class PublicacionUsuarioViewSet(BasePublicacionViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            # Los usuarios solo pueden ver sus propias publicaciones
            return Publicacion.objects.filter(usuario=self.request.user)
        except Exception as e:
            return self.handle_exception(e)


class ComentarioListCreateView(APIView, ExceptionHandlerMixin):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            comentarios = Comentario.objects.all()
            serializer = ComentarioSerializer(comentarios, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return self.handle_exception(e)

    def post(self, request):
        try:
            serializer = ComentarioSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(usuario=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return self.handle_exception(e)


class ComentarioDeleteView(APIView, ExceptionHandlerMixin):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            comentario = get_object_or_404(Comentario, pk=pk)

            # Solo el propietario o un administrador pueden eliminar el comentario
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
            return self.handle_exception(e)


# ! Modelos, partes y personalizaciones


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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        partes_data = request.data if isinstance(request.data, list) else [request.data]
        new_parts, updated_parts = [], []

        # Validación de campos obligatorios
        required_fields = ["nombre_parte", "color", "modelo_id", "personalizacion_id"]
        for parte_data in partes_data:
            for field in required_fields:
                if field not in parte_data:
                    return Response(
                        {"detail": f"El campo {field} es obligatorio."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Mapa de partes existentes por clave (nombre, modelo_id, personalizacion_id)
        partes_existentes_map = {
            (nombre, modelo_id, personalizacion_id): parte
            for nombre, modelo_id, personalizacion_id, parte in Parte.objects.filter(
                usuario=request.user
            ).values_list("nombre_parte", "modelo_id", "personalizacion_id", "id")
        }

        try:
            for parte_data in partes_data:
                modelo = get_object_or_404(Modelo3D, id=parte_data["modelo_id"])
                personalizacion = get_object_or_404(
                    Personalizacion, id=parte_data["personalizacion_id"]
                )

                # Validación: La personalización debe pertenecer al modelo indicado
                if personalizacion.modelo != modelo:
                    return Response(
                        {
                            "detail": "La personalización no corresponde al modelo indicado."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Verificar si la parte ya existe
                parte_clave = (
                    parte_data["nombre_parte"],
                    parte_data["modelo_id"],
                    parte_data["personalizacion_id"],
                )
                if parte_clave in partes_existentes_map:
                    # Actualizar la parte existente
                    parte_existente = Parte.objects.get(
                        id=partes_existentes_map[parte_clave]
                    )
                    parte_existente.color = parte_data["color"]
                    updated_parts.append(parte_existente)
                else:
                    # Crear una nueva parte
                    new_parts.append(
                        Parte(
                            nombre_parte=parte_data["nombre_parte"],
                            color=parte_data["color"],
                            modelo=modelo,
                            personalizacion=personalizacion,
                            usuario=request.user,
                        )
                    )

            # Guardar todas las nuevas partes de una vez
            if new_parts:
                Parte.objects.bulk_create(new_parts)

            # Guardar todas las partes actualizadas de una vez
            if updated_parts:
                Parte.objects.bulk_update(updated_parts, ["color"])

            # Serializar la respuesta con las partes nuevas y actualizadas
            response_data = [ParteSerializer(p).data for p in new_parts + updated_parts]
            return Response(response_data, status=status.HTTP_201_CREATED)

        except KeyError as e:
            return Response(
                {"detail": f"El campo {str(e)} es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except IntegrityError:
            return Response(
                {
                    "detail": "Parte duplicada. Verifica los datos y vuelve a intentarlo."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Error inesperado al crear partes: {str(e)}")
            return Response(
                {"detail": "Ocurrió un error inesperado. Contacte al administrador."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"], url_path="por-modelo/(?P<modelo_id>[^/.]+)")
    def listar_por_modelo(self, request, modelo_id=None):
        """Listar las partes de un modelo específico filtradas por usuario."""
        partes = Parte.objects.filter(modelo_id=modelo_id, usuario=request.user)
        serializer = self.get_serializer(partes, many=True)
        return Response(serializer.data)


# ____________________________________________________


class HelpArticleViewSet(viewsets.ModelViewSet):
    queryset = HelpArticle.objects.all()
    serializer_class = HelpArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication]


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication]

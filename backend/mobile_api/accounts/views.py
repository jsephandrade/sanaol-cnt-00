from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api import views_auth, views_face
from api.models import AppUser

from .serializers import AppUserSerializer, AppUserUpdateSerializer
from ..utils import normalize_json_response, prepare_legacy_request


class SessionView(APIView):
    """Create or destroy JWT-based sessions."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        """Authenticate user credentials and issue tokens."""
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_auth.auth_login(legacy_request)
        return normalize_json_response(django_response)


class RegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_auth.auth_register(legacy_request)
        return normalize_json_response(django_response)


class RefreshTokenView(APIView):
    """Rotate refresh tokens and obtain a new access token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        if "refresh_token" in payload and "refreshToken" not in payload:
            payload["refreshToken"] = payload["refresh_token"]
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_auth.refresh_token(legacy_request)
        return normalize_json_response(django_response)


class LogoutView(APIView):
    """Revoke refresh token and terminate session."""

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        if "refresh_token" in payload and "refreshToken" not in payload:
            payload["refreshToken"] = payload["refresh_token"]
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_auth.auth_logout(legacy_request)
        return normalize_json_response(django_response)


class PasswordResetRequestView(APIView):
    """Initiate password reset flow via email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_auth.forgot_password(legacy_request)
        return normalize_json_response(django_response)


class BiometricSessionView(APIView):
    """Authenticate a biometric face scan."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_face.face_login(legacy_request)
        return normalize_json_response(django_response)


class BiometricEnrollmentView(APIView):
    """Manage biometric enrollment for the current user."""

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_face.face_register(legacy_request)
        return normalize_json_response(django_response)

    def delete(self, request, *args, **kwargs):
        payload = dict(request.data)
        legacy_request = prepare_legacy_request(request, payload)
        django_response = views_face.face_unregister(legacy_request)
        return normalize_json_response(django_response)


class MeView(APIView):
    """Retrieve or update the authenticated user's profile."""

    def get(self, request, *args, **kwargs):
        user = self._get_user(request)
        serializer = AppUserSerializer(user)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        user = self._get_user(request)
        serializer = AppUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        dirty_fields = []
        for field, value in serializer.validated_data.items():
            setattr(user, field, value)
            dirty_fields.append(field)
        if dirty_fields:
            user.save(update_fields=[*dirty_fields, "updated_at"])
        read_serializer = AppUserSerializer(user)
        return Response({"data": read_serializer.data}, status=status.HTTP_200_OK)

    def _get_user(self, request) -> AppUser:
        user = request.user
        if isinstance(user, AppUser):
            return user
        if hasattr(request, "user") and getattr(request.user, "id", None):
            try:
                return AppUser.objects.get(id=request.user.id)
            except AppUser.DoesNotExist as exc:
                raise permissions.PermissionDenied("User not found.") from exc
        raise permissions.PermissionDenied("User not authenticated.")

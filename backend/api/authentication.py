import jwt
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header

from .models import AppUser


class JWTAuthentication(BaseAuthentication):
    """
    Minimal JWT auth backend for DRF built on the same signing settings used by the auth views.

    It expects `Authorization: Bearer <token>` headers, decodes the payload with the configured
    `JWT_SECRET`/`JWT_ALGORITHM`, and loads the matching `AppUser`. Any failure results in
    `AuthenticationFailed`, giving DRF enough context to return a 401.
    """

    keyword = b"bearer"

    def authenticate(self, request):
        auth = get_authorization_header(request)
        if not auth:
            return None

        if isinstance(auth, str):
            auth = auth.encode("utf-8")

        parts = auth.split()

        if parts[0].lower() != self.keyword:
            return None

        if len(parts) == 1:
            raise exceptions.AuthenticationFailed(_("Invalid Authorization header. No credentials provided."))
        if len(parts) > 2:
            raise exceptions.AuthenticationFailed(_("Invalid Authorization header. Token string should not contain spaces."))

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed(_("Token has expired.")) from exc
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed(_("Invalid token.")) from exc

        user_id = payload.get("sub")
        if not user_id:
            raise exceptions.AuthenticationFailed(_("Token payload missing subject."))

        try:
            user = AppUser.objects.get(id=user_id)
        except AppUser.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed(_("User not found.")) from exc

        if getattr(user, "status", "").lower() == "deactivated":
            raise exceptions.AuthenticationFailed(_("User account is deactivated."))

        return (user, payload)

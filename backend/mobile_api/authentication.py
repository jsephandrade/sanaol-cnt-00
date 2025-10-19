from __future__ import annotations

from typing import Optional, Tuple

import jwt
from django.conf import settings
from rest_framework import authentication, exceptions

from api.models import AppUser


class JWTAuthentication(authentication.BaseAuthentication):
    """DRF authentication backend that reuses the API's existing JWT tokens."""

    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[AppUser, str]]:
        header = self._get_authorization_header(request)
        if not header:
            return None

        scheme, token = header
        if scheme.lower() != self.keyword.lower():
            return None
        if not token:
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        payload = self._decode(token)
        user = self._resolve_user(payload)

        if not user:
            raise exceptions.AuthenticationFailed("User not found.")

        status = (user.status or "").lower()
        if status != "active":
            raise exceptions.AuthenticationFailed("Account inactive or pending approval.")

        request.jwt_payload = payload  # type: ignore[attr-defined]
        return user, token

    def authenticate_header(self, request) -> str:
        return f'{self.keyword} realm="api"'

    def _get_authorization_header(self, request) -> Optional[Tuple[str, str]]:
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth:
            return None
        parts = auth.split(" ", 1)
        if len(parts) != 2:
            return None
        return parts[0], parts[1].strip()

    def _decode(self, token: str) -> dict:
        try:
            return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Token expired.") from exc
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed("Invalid token.") from exc

    def _resolve_user(self, payload: dict) -> Optional[AppUser]:
        user_id = payload.get("sub")
        email = (payload.get("email") or "").lower().strip()
        user: Optional[AppUser] = None

        if user_id:
            user = AppUser.objects.filter(id=user_id).first()
        if not user and email:
            user = AppUser.objects.filter(email=email).first()
        return user

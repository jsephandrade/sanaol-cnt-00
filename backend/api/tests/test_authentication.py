import time

import jwt
from django.conf import settings
from django.test import TestCase
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.test import APIRequestFactory

from api.authentication import JWTAuthentication
from api.models import AppUser


def build_token(user, exp_offset=3600):
    now = int(time.time())
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "iat": now,
        "exp": now + exp_offset,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


class JWTAuthenticationTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.auth = JWTAuthentication()

    def test_authenticates_valid_bearer_token(self):
        user = AppUser.objects.create(email="api@example.com", name="API User", role="staff", status="active")
        token = build_token(user)
        request = self.factory.get("/api/orders", HTTP_AUTHORIZATION=f"Bearer {token}")

        authenticated = self.auth.authenticate(request)

        self.assertIsNotNone(authenticated)
        actor, payload = authenticated
        self.assertEqual(actor.id, user.id)
        self.assertEqual(payload["email"], user.email)

    def test_missing_authorization_header_returns_none(self):
        request = self.factory.get("/api/orders")
        self.assertIsNone(self.auth.authenticate(request))

    def test_invalid_token_raises(self):
        request = self.factory.get("/api/orders", HTTP_AUTHORIZATION="Bearer not-a-token")
        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_deactivated_user_blocked(self):
        user = AppUser.objects.create(email="inactive@example.com", name="Inactive", role="manager", status="deactivated")
        token = build_token(user)
        request = self.factory.get("/api/orders", HTTP_AUTHORIZATION=f"Bearer {token}")

        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_missing_user_raises(self):
        ghost = AppUser.objects.create(email="ghost@example.com", name="Ghost", role="staff", status="active")
        token = build_token(ghost)
        ghost.delete()
        request = self.factory.get("/api/orders", HTTP_AUTHORIZATION=f"Bearer {token}")

        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

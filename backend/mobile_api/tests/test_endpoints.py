
import jwt
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.test import TestCase

from api.models import AppUser, InventoryItem


class MobileApiEndpointsTests(TestCase):
    def setUp(self):
        self.password = "P@ssw0rd!"
        self.user = AppUser.objects.create(
            email="staff@example.com",
            name="Staff Member",
            role="staff",
            status="active",
            password_hash=make_password(self.password),
        )

    def _auth_headers(self):
        token = jwt.encode(
            {"sub": str(self.user.id), "email": self.user.email},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_login_success_returns_tokens(self):
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.user.email, "password": self.password},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("data", payload)
        tokens = payload["data"]
        self.assertIn("token", tokens)
        self.assertIn("refreshToken", tokens)
        self.assertIn("user", tokens)
        self.assertEqual(tokens["user"]["email"], self.user.email)

    def test_inventory_requires_auth_and_returns_list(self):
        InventoryItem.objects.create(name="Burger", quantity=10, unit="pcs")

        unauthenticated = self.client.get("/api/v1/inventory/items")
        self.assertEqual(unauthenticated.status_code, 401)

        response = self.client.get("/api/v1/inventory/items", **self._auth_headers())
        self.assertEqual(response.status_code, 200)
        data = response.json().get("data")
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

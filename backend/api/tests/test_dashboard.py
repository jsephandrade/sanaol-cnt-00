from decimal import Decimal
from datetime import timedelta

from django.conf import settings
from django.test import Client, TestCase
from django.utils import timezone as dj_tz
import jwt

from api.models import (
    AppUser,
    CashEntry,
    CashSession,
    MenuItem,
    Order,
    OrderItem,
    PaymentTransaction,
)


def auth_headers(user):
    now = dj_tz.now()
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + 3600,
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


class DashboardOverviewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = AppUser.objects.create(
            email="dash@example.com", name="Dash User", role="staff", status="active"
        )
        self.menu = MenuItem.objects.create(
            name="Bam-i", price=Decimal("50.00"), category="Noodles", available=True
        )
        self.session = CashSession.objects.create(opened_by=self.user, status=CashSession.STATUS_OPEN)

        self._seed_data()

    def _seed_data(self):
        now = dj_tz.now()
        order = Order.objects.create(
            order_number="W-001",
            status=Order.STATUS_COMPLETED,
            total_amount=Decimal("100.00"),
            customer_name="Walk-in",
        )
        OrderItem.objects.create(
            order=order,
            menu_item=self.menu,
            item_name=self.menu.name,
            price=self.menu.price,
            quantity=2,
        )

        txn = PaymentTransaction.objects.create(
            order_id=str(order.id),
            amount=Decimal("100.00"),
            method=PaymentTransaction.METHOD_CASH,
            status=PaymentTransaction.STATUS_COMPLETED,
            customer="Walk-in",
            meta={"orderNumber": order.order_number},
        )
        PaymentTransaction.objects.filter(id=txn.id).update(created_at=now - timedelta(hours=1))

        CashEntry.objects.create(
            session=self.session,
            type=CashEntry.TYPE_OUT,
            amount=Decimal("25.00"),
        )

    def test_overview_returns_expected_metrics(self):
        resp = self.client.get("/api/dashboard/overview", **auth_headers(self.user))
        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        self.assertTrue(payload.get("success"))
        data = payload.get("data", {})

        self.assertGreater(data.get("dailySales", 0), 0)
        self.assertGreaterEqual(data.get("monthlySales", 0), data.get("dailySales", 0))
        self.assertEqual(data.get("orderCount"), 1)
        self.assertEqual(data.get("customerCount"), 1)

        sales_by_time = data.get("salesByTime", [])
        self.assertTrue(any(row.get("amount", 0) > 0 for row in sales_by_time))

        categories = data.get("salesByCategory", [])
        self.assertTrue(any(row.get("category") == "Noodles" for row in categories))

        popular = data.get("popularItems", [])
        self.assertTrue(any(item.get("name") == "Bam-i" for item in popular))

        recent = data.get("recentSales", [])
        self.assertTrue(recent)
        self.assertEqual(recent[0].get("orderNumber"), "W-001")
        self.assertEqual(recent[0].get("paymentMethod"), PaymentTransaction.METHOD_CASH)

    def test_overview_requires_authentication(self):
        resp = self.client.get("/api/dashboard/overview")
        self.assertEqual(resp.status_code, 401)

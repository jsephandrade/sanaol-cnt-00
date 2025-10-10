"""Reports endpoints: sales, inventory, orders/transactions, staff attendance, customer purchase history.

Focuses on read-only aggregation using existing models. Keep responses simple and fast.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone as dj_tz

from .views_common import _actor_from_request, _has_permission


logger = logging.getLogger(__name__)


def _parse_range(val: str | None):
    now = dj_tz.now()
    if not val:
        return now - timedelta(days=1), now
    s = str(val).lower().strip()
    if s == "24h":
        return now - timedelta(hours=24), now
    if s == "7d":
        return now - timedelta(days=7), now
    if s == "30d":
        return now - timedelta(days=30), now
    try:
        # support ISO start..end
        start_s, end_s = s.split("..", 1)
        return datetime.fromisoformat(start_s), datetime.fromisoformat(end_s)
    except Exception:
        return now - timedelta(days=1), now


@require_http_methods(["GET"])  # /reports/sales
def reports_sales(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "reports.sales.view"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate, TruncMonth
        from .models import PaymentTransaction
        r = request.GET.get("range")
        start, end = _parse_range(r)
        qs = PaymentTransaction.objects.filter(created_at__gte=start, created_at__lte=end)
        total = qs.aggregate(total=Sum("amount")).get("total") or 0
        txn_count = qs.count()
        order_count = (
            qs.exclude(order_id__isnull=True)
            .exclude(order_id="")
            .values("order_id")
            .distinct()
            .count()
        )
        if order_count == 0:
            order_count = txn_count
        average = float(total) / order_count if order_count else 0.0

        by_method = list(
            qs.values("method")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by()
        )
        daily_rows = (
            qs.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("day")
        )
        monthly_rows = (
            qs.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )

        return JsonResponse({
            "success": True,
            "data": {
                "totalRevenue": float(total or 0),
                "totalTransactions": int(txn_count),
                "totalOrders": int(order_count),
                "averageOrderValue": float(average),
                "range": {"from": start.isoformat(), "to": end.isoformat()},
                "byMethod": [
                    {
                        "method": row["method"],
                        "total": float(row["total"] or 0),
                        "count": row["count"],
                    }
                    for row in by_method
                ],
                "dailyTotals": [
                    {
                        "date": row["day"].isoformat(),
                        "total": float(row["total"] or 0),
                        "count": row["count"],
                    }
                    for row in daily_rows
                    if row.get("day")
                ],
                "monthlyTotals": [
                    {
                        "month": row["month"].strftime("%Y-%m") if row.get("month") else None,
                        "total": float(row["total"] or 0),
                        "count": row["count"],
                    }
                    for row in monthly_rows
                    if row.get("month")
                ],
            },
        })
    except Exception:
        logger.exception("Failed to generate sales report")
        return JsonResponse({"success": False, "message": "Unable to generate sales report"}, status=500)


@require_http_methods(["GET"])  # /reports/inventory
def reports_inventory(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "reports.inventory.view"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from .models import InventoryItem
        items = InventoryItem.objects.all().order_by("name")
        data = [
            {
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "quantity": float(i.quantity or 0),
                "unit": i.unit,
                "minStock": float(i.min_stock or 0),
            }
            for i in items
        ]
        return JsonResponse({"success": True, "data": data})
    except Exception:
        logger.exception("Failed to generate inventory report")
        return JsonResponse({"success": False, "message": "Unable to generate inventory report"}, status=500)


@require_http_methods(["GET"])  # /reports/orders
def reports_orders(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "reports.orders.view"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from django.db.models import Count
        from .models import Order
        rows = Order.objects.values("status").annotate(count=Count("id"))
        return JsonResponse({"success": True, "data": {r["status"]: r["count"] for r in rows}})
    except Exception:
        logger.exception("Failed to generate orders report")
        return JsonResponse({"success": False, "message": "Unable to generate orders report"}, status=500)


@require_http_methods(["GET"])  # /reports/staff-attendance
def reports_staff_attendance(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "reports.staff.view"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from django.db.models import Count
        from .models import AttendanceRecord
        rows = AttendanceRecord.objects.values("status").annotate(count=Count("id"))
        return JsonResponse({"success": True, "data": {r["status"]: r["count"] for r in rows}})
    except Exception:
        logger.exception("Failed to generate staff attendance report")
        return JsonResponse({"success": False, "message": "Unable to generate staff attendance report"}, status=500)


@require_http_methods(["GET"])  # /reports/customer-history?customer=
def reports_customer_history(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "reports.customer.view"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    customer = (request.GET.get("customer") or "").strip()
    try:
        from .models import PaymentTransaction
        qs = PaymentTransaction.objects.all()
        if customer:
            qs = qs.filter(customer__icontains=customer)
        qs = qs.order_by("-created_at")[:500]
        data = [
            {
                "id": str(p.id),
                "orderId": p.order_id,
                "amount": float(p.amount or 0),
                "method": p.method,
                "status": p.status,
                "date": p.created_at.isoformat() if p.created_at else None,
                "reference": p.reference or "",
                "customer": p.customer or "",
            }
            for p in qs
        ]
        return JsonResponse({"success": True, "data": data})
    except Exception:
        logger.exception("Failed to generate customer history report")
        return JsonResponse({"success": False, "message": "Unable to generate customer history report"}, status=500)


__all__ = [
    "reports_sales",
    "reports_inventory",
    "reports_orders",
    "reports_staff_attendance",
    "reports_customer_history",
]


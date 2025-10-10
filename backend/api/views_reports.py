"""Reports endpoints: sales, inventory, orders/transactions, staff attendance, customer purchase history.

Focuses on read-only aggregation using existing models. Keep responses simple and fast.
"""

from __future__ import annotations

from datetime import datetime, timedelta, time
import logging

from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone as dj_tz
from django.views.decorators.http import require_http_methods

from .views_common import _actor_from_request, _has_permission


logger = logging.getLogger(__name__)


def _parse_int(value, default):
  try:
    parsed = int(value)
    return parsed if parsed > 0 else default
  except Exception:
    return default


def _downsample(points, max_points):
  if max_points <= 0 or len(points) <= max_points:
    return points
  step = len(points) / float(max_points)
  sampled = []
  index = 0.0
  taken = set()
  for _ in range(max_points - 1):
    idx = int(round(index))
    if idx >= len(points):
      idx = len(points) - 1
    if idx not in taken:
      sampled.append(points[idx])
      taken.add(idx)
    index += step
  last = points[-1]
  if points and sampled and sampled[-1] is not last:
    sampled.append(last)
  elif not sampled and points:
    sampled.append(last)
  return sampled


def _bucket_to_iso(bucket, tz):
    if bucket is None:
        return ""
    try:
        if isinstance(bucket, datetime):
            return dj_tz.localtime(bucket).isoformat()
        base = datetime.combine(bucket, time.min)
        if dj_tz.is_naive(base):
            if hasattr(tz, "localize"):
                base = tz.localize(base)
            else:
                base = base.replace(tzinfo=tz)
        return dj_tz.localtime(base).isoformat()
    except Exception:
        try:
            return str(bucket)
        except Exception:
            return ""


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
        from django.db.models.functions import TruncDate, TruncHour, TruncMonth
        from .models import PaymentTransaction
        raw_range = request.GET.get("range")
        start, end = _parse_range(raw_range)
        if start > end:
            start, end = end, start
        tz = dj_tz.get_current_timezone()

        granularity = (request.GET.get("granularity") or "").lower()
        max_points = _parse_int(request.GET.get("maxPoints"), 240)
        span_days = max(1.0, (end - start).total_seconds() / 86400.0)
        if granularity not in {"hour", "day", "month"}:
            if span_days <= 2:
                granularity = "hour"
            elif span_days <= 120:
                granularity = "day"
            else:
                granularity = "month"

        cache_key = (
            f"reports:sales:{actor.id}:"
            f"{start.isoformat()}:{end.isoformat()}:{granularity}:{max_points}"
        )
        cached = cache.get(cache_key)
        if cached:
            return JsonResponse({"success": True, "data": cached})

        qs = PaymentTransaction.objects.filter(created_at__gte=start, created_at__lte=end)
        totals = qs.aggregate(total=Sum("amount"), count=Count("id"))
        total_revenue = float(totals.get("total") or 0)
        txn_count = int(totals.get("count") or 0)

        order_count = (
            qs.exclude(order_id__isnull=True)
            .exclude(order_id="")
            .values("order_id")
            .distinct()
            .count()
        ) or txn_count

        average = total_revenue / order_count if order_count else 0.0

        by_method_rows = (
            qs.values("method")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by()
        )
        by_method = [
            {
                "method": row["method"],
                "label": row["method"],
                "total": float(row["total"] or 0),
                "count": int(row["count"] or 0),
            }
            for row in by_method_rows
        ]

        if granularity == "hour":
            bucket_expr = TruncHour("created_at", tzinfo=tz)
        elif granularity == "month":
            bucket_expr = TruncMonth("created_at")
        else:
            bucket_expr = TruncDate("created_at")

        bucket_rows = (
            qs.annotate(bucket=bucket_expr)
            .values("bucket")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("bucket")
        )
        series = [
            {
                "t": _bucket_to_iso(row["bucket"], tz),
                "y": float(row["total"] or 0),
                "count": int(row["count"] or 0),
            }
            for row in bucket_rows
            if row.get("bucket")
        ]
        series = _downsample(series, max_points)

        monthly_rows = (
            qs.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )
        monthly_totals = [
            {
                "t": _bucket_to_iso(row["month"], tz),
                "y": float(row["total"] or 0),
                "count": int(row["count"] or 0),
            }
            for row in monthly_rows
            if row.get("month")
        ]

        payload = {
            "totalRevenue": total_revenue,
            "totalTransactions": txn_count,
            "totalOrders": int(order_count),
            "averageOrderValue": average,
            "range": {"from": start.isoformat(), "to": end.isoformat()},
            "granularity": granularity,
            "series": series,
            "byMethod": by_method,
            "monthlyTotals": monthly_totals,
        }
        cache.set(cache_key, payload, 60)

        return JsonResponse({"success": True, "data": payload})
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
        from .models import PaymentTransaction, Order
        qs = PaymentTransaction.objects.all()
        if customer:
            qs = qs.filter(customer__icontains=customer)
        qs = qs.order_by("-created_at")[:500]
        entries = list(qs)
        order_numbers = {}
        try:
            order_ids = {str(p.order_id) for p in entries if p.order_id}
            if order_ids:
                order_numbers = {
                    str(row["id"]): row["order_number"] or ""
                    for row in Order.objects.filter(id__in=order_ids).values(
                        "id", "order_number"
                    )
                }
        except Exception:
            order_numbers = {}
        data = [
            {
                "id": str(p.id),
                "orderId": p.order_id,
                "orderNumber": order_numbers.get(str(p.order_id))
                or (
                    p.meta.get("orderNumber")
                    if isinstance(getattr(p, "meta", None), dict)
                    else ""
                ),
                "amount": float(p.amount or 0),
                "method": p.method,
                "status": p.status,
                "date": p.created_at.isoformat() if p.created_at else None,
                "reference": p.reference or "",
                "customer": p.customer or "",
            }
            for p in entries
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


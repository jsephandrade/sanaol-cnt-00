from __future__ import annotations

import logging
from datetime import datetime, timedelta, time
from decimal import Decimal
from typing import Tuple
from uuid import UUID

from django.core.cache import cache
from django.db.models import Sum, F, Value, DecimalField, Count
from django.db.models.functions import TruncDate, TruncHour, TruncMonth, Coalesce
from django.http import JsonResponse
from django.utils import timezone as dj_tz
from django.views.decorators.http import require_http_methods

from .views_common import _actor_from_request, _has_permission

logger = logging.getLogger(__name__)


def _resolve_range(raw: str | None) -> Tuple[datetime, datetime, str]:
    """Parse range query string into timezone-aware datetimes."""
    now_local = dj_tz.localtime(dj_tz.now())
    default_start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    label = "Today"
    if not raw:
        return default_start, now_local, label

    value = raw.strip().lower()
    if ".." in value:
        try:
            start_s, end_s = value.split("..", 1)
            start_dt = datetime.fromisoformat(start_s)
            end_dt = datetime.fromisoformat(end_s)
            tz = dj_tz.get_current_timezone()
            if dj_tz.is_naive(start_dt):
            start_dt = dj_tz.make_aware(start_dt, tz)
        else:
            start_dt = dj_tz.localtime(start_dt, tz)
        if dj_tz.is_naive(end_dt):
            end_dt = dj_tz.make_aware(end_dt, tz)
        else:
            end_dt = dj_tz.localtime(end_dt, tz)
            if start_dt > end_dt:
                start_dt, end_dt = end_dt, start_dt
            label = f"{start_dt.date().isoformat()} .. {end_dt.date().isoformat()}"
            return start_dt, end_dt, label
        except Exception:
            logger.warning("Invalid dashboard range '%s', falling back to today", raw)
    elif value in {"7d", "week", "last7"}:
        label = "Last 7 days"
        return now_local - timedelta(days=7), now_local, label
    elif value in {"30d", "month", "last30"}:
        label = "Last 30 days"
        return now_local - timedelta(days=30), now_local, label
    return default_start, now_local, label


def _decimal_to_float(value: Decimal | None) -> float:
    try:
        return float(value or 0)
    except Exception:
        return 0.0


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


def _format_bucket(bucket, span_days: float) -> str:
    if bucket is None:
        return ""
    if isinstance(bucket, datetime):
        bucket_local = dj_tz.localtime(bucket)
        if span_days <= 2.0:
            return bucket_local.strftime("%I %p").lstrip("0") or bucket_local.strftime("%H:%M")
        return bucket_local.strftime("%Y-%m-%d")
    # date object
    try:
        return bucket.strftime("%Y-%m-%d")
    except Exception:
        return str(bucket)


@require_http_methods(["GET"])  # /dashboard/overview
def dashboard_overview(request):
    actor, err = _actor_from_request(request)
    if not actor:
        return err

    if not (
        _has_permission(actor, "dashboard.view")
        or _has_permission(actor, "reports.sales.view")
    ):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)

    raw_range = request.GET.get("range") or request.GET.get("timeRange")
    start, end, label = _resolve_range(raw_range)
    tz = dj_tz.get_current_timezone()
    now_local = dj_tz.localtime(dj_tz.now())
    if end > now_local:
        end = now_local

    day_start = end.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    span_days = max(1.0, (end - start).total_seconds() / 86400.0)

    granularity_param = (request.GET.get("granularity") or "").lower()
    max_points = _parse_int(request.GET.get("maxPoints"), 240)
    if granularity_param in {"hour", "day", "month"}:
        granularity = granularity_param
    else:
        if span_days <= 2:
            granularity = "hour"
        elif span_days <= 120:
            granularity = "day"
        else:
            granularity = "month"

    cache_key = (
        f"dashboard:overview:{actor.id}:"
        f"{start.isoformat()}:{end.isoformat()}:{granularity}:{max_points}"
    )
    cached = cache.get(cache_key)
    if cached:
        return JsonResponse({"success": True, "data": cached})

    try:
        from .models import CashEntry, Order, OrderItem, PaymentTransaction

        completed_payments = PaymentTransaction.objects.filter(
            status=PaymentTransaction.STATUS_COMPLETED,
            created_at__gte=start,
            created_at__lte=end,
        )

        payments_today = completed_payments.filter(created_at__gte=day_start)
        payments_month = PaymentTransaction.objects.filter(
            status=PaymentTransaction.STATUS_COMPLETED,
            created_at__gte=month_start,
            created_at__lte=end,
        )

        daily_sales = payments_today.aggregate(total=Sum("amount")).get("total") or Decimal("0")
        monthly_sales = payments_month.aggregate(total=Sum("amount")).get("total") or Decimal("0")

        monthly_expenses = (
            CashEntry.objects.filter(
                type=CashEntry.TYPE_OUT,
                created_at__gte=month_start,
                created_at__lte=end,
            ).aggregate(total=Sum("amount")).get("total")
            or Decimal("0")
        )

        orders_in_range = (
            Order.objects.filter(created_at__gte=day_start, created_at__lte=end)
            .exclude(status__in=[Order.STATUS_CANCELLED, Order.STATUS_VOIDED, Order.STATUS_REFUNDED])
        )
        order_count = orders_in_range.count()

        if granularity == "hour":
            bucket_expr = TruncHour("created_at", tzinfo=tz)
        elif granularity == "month":
            bucket_expr = TruncMonth("created_at")
        else:
            bucket_expr = TruncDate("created_at", tzinfo=tz)

        sales_by_time_rows = (
            completed_payments.annotate(bucket=bucket_expr)
            .values("bucket")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("bucket")
        )
        sales_by_time = [
            {
                "t": _bucket_to_iso(row["bucket"], tz),
                "y": _decimal_to_float(row["total"]),
                "count": int(row["count"] or 0),
                "label": _format_bucket(row["bucket"], span_days),
            }
            for row in sales_by_time_rows
            if row.get("bucket") is not None
        ]
        sales_by_time = _downsample(sales_by_time, max_points)

        category_rows = (
            OrderItem.objects.filter(
                order__created_at__gte=start,
                order__created_at__lte=end,
                order__status=Order.STATUS_COMPLETED,
            )
            .annotate(category_name=Coalesce("menu_item__category", Value("Uncategorized")))
            .values("category_name")
            .annotate(
                amount=Sum(
                    F("price") * F("quantity"),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                )
            )
            .order_by("-amount")
        )
        sales_by_category = [
            {
                "label": row["category_name"] or "Uncategorized",
                "category": row["category_name"] or "Uncategorized",
                "value": _decimal_to_float(row["amount"]),
            }
            for row in category_rows
        ]

        popular_start = max(start, end - timedelta(days=7))
        popular_rows = (
            OrderItem.objects.filter(
                order__created_at__gte=popular_start,
                order__created_at__lte=end,
                order__status=Order.STATUS_COMPLETED,
            )
            .values("item_name")
            .annotate(
                total_quantity=Sum("quantity"),
                revenue=Sum(
                    F("price") * F("quantity"),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                ),
            )
            .order_by("-total_quantity", "-revenue")[:10]
        )
        popular_items = [
            {
                "name": row["item_name"] or "Menu Item",
                "count": int(row.get("total_quantity") or 0),
                "value": int(row.get("total_quantity") or 0),
            }
            for row in popular_rows
            if (row.get("total_quantity") or 0) > 0
        ]

        recent_payments = list(
            PaymentTransaction.objects.filter(
                status=PaymentTransaction.STATUS_COMPLETED,
                created_at__lte=end,
            )
            .order_by("-created_at")[:10]
        )
        order_ids = {str(p.order_id) for p in recent_payments if getattr(p, "order_id", None)}
        order_map = {}
        if order_ids:
            order_uuid_list = []
            for raw_id in order_ids:
                try:
                    order_uuid_list.append(UUID(str(raw_id)))
                except Exception:
                    continue
            if order_uuid_list:
                for o in Order.objects.filter(id__in=order_uuid_list):
                    order_map[str(o.id)] = {
                        "order_number": o.order_number or "",
                        "customer_name": o.customer_name or "",
                    }

        recent_sales = []
        for p in recent_payments:
            order_info = order_map.get(str(p.order_id), {})
            order_number = order_info.get("order_number") or (
                p.meta.get("orderNumber") if isinstance(getattr(p, "meta", None), dict) else ""
            )
            customer_raw = p.customer or order_info.get("customer_name") or ""
            customer_label = (
                "Walk-in" if not customer_raw or customer_raw.strip().lower() in {"", "n/a"} else customer_raw
            )
            recent_sales.append(
                {
                    "id": order_number or str(p.order_id or p.id),
                    "orderNumber": order_number or str(p.order_id or ""),
                    "total": _decimal_to_float(p.amount),
                    "date": (p.created_at or dj_tz.now()).isoformat(),
                    "paymentMethod": p.method,
                    "customer": customer_label,
                }
            )

        customer_count = (
            completed_payments.exclude(customer__isnull=True)
            .exclude(customer__exact="")
            .values("customer")
            .distinct()
            .count()
        )

        payload = {
            "timeRange": {
                "from": start.isoformat(),
                "to": end.isoformat(),
                "label": label,
                "granularity": granularity,
            },
            "granularity": granularity,
            "maxPoints": max_points,
            "dailySales": _decimal_to_float(daily_sales),
            "monthlySales": _decimal_to_float(monthly_sales),
            "monthlyExpenses": _decimal_to_float(monthly_expenses),
            "orderCount": int(order_count),
            "customerCount": int(customer_count),
            "salesByTime": sales_by_time,
            "salesByCategory": sales_by_category,
            "popularItems": popular_items,
            "recentSales": recent_sales,
        }

        cache.set(cache_key, payload, 60)
        return JsonResponse({"success": True, "data": payload})
    except Exception:
        logger.exception("Failed to build dashboard overview")
        return JsonResponse({"success": False, "message": "Unable to load dashboard data"}, status=500)

from __future__ import annotations

from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from api.models import AppUser, Order, OrderEvent, OrderItem

from ..permissions import IsManagerOrAdmin
from .serializers import OrderSerializer, OrderStatusUpdateSerializer


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose order queue operations for the mobile client."""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        qs = Order.objects.all().order_by("-created_at")
        qs = qs.prefetch_related(Prefetch("items", queryset=OrderItem.objects.order_by("sequence")))
        params = self.request.query_params

        status_filter = params.get("status")
        priority = params.get("priority")
        bulk_reference = params.get("bulk_id") or params.get("bulk_reference")

        if status_filter:
            statuses = [s.strip() for s in status_filter.split(",") if s.strip()]
            qs = qs.filter(status__in=statuses)
        if priority:
            qs = qs.filter(priority__iexact=priority)
        if bulk_reference:
            qs = qs.filter(bulk_reference__iexact=bulk_reference)

        assigned_to = params.get("assigned_to")
        if assigned_to:
            qs = qs.filter(placed_by_id=assigned_to)

        search = params.get("search")
        if search:
            qs = qs.filter(order_number__icontains=search)

        return qs

    def get_permissions(self):
        if self.action in {"partial_update"}:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return super().get_permissions()

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get("status")
        if new_status and new_status != order.status:
            previous_status = order.status
            update_fields = ["status", "updated_at"]
            order.status = new_status
            if new_status == Order.STATUS_COMPLETED and not order.completed_at:
                order.completed_at = timezone.now()
                update_fields.append("completed_at")
            order.save(update_fields=update_fields)

            OrderEvent.objects.create(
                order=order,
                actor=self._actor(request),
                event_type="status_change",
                from_state=previous_status,
                to_state=new_status,
                payload={"source": "mobile_api"},
            )

        read_serializer = OrderSerializer(order)
        return Response({"data": read_serializer.data}, status=status.HTTP_200_OK)

    def _actor(self, request) -> AppUser | None:
        user = getattr(request, "user", None)
        return user if isinstance(user, AppUser) else None

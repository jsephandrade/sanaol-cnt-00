from __future__ import annotations

from decimal import Decimal
from typing import Dict

from django.db import models
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from api.models import AppUser, InventoryActivity, InventoryItem

from ..permissions import IsManagerOrAdmin
from .serializers import InventoryItemSerializer, InventoryItemUpdateSerializer


class InventoryItemViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose inventory data to the mobile frontend."""

    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        qs = InventoryItem.objects.all().order_by("name")
        params = self.request.query_params
        category = (params.get("category") or "").strip()
        search = (params.get("search") or "").strip()
        low_stock = (params.get("low_stock") or "").lower()
        expiring_within = params.get("expiring_within")

        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(name__icontains=search)
        if low_stock in {"1", "true", "yes", "on"}:
            qs = qs.filter(quantity__lte=models.F("min_stock"))
        if expiring_within:
            try:
                days = int(expiring_within)
                from django.utils import timezone
                target = timezone.now().date() + timezone.timedelta(days=days)
                qs = qs.filter(expiry_date__isnull=False, expiry_date__lte=target)
            except (TypeError, ValueError):
                pass
        return qs

    def get_permissions(self):
        if self.action in {"partial_update"}:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return super().get_permissions()

    def partial_update(self, request, *args, **kwargs):
        item = self.get_object()
        serializer = InventoryItemUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        previous_quantity = Decimal(item.quantity)
        updates: Dict[str, Decimal] = {}
        for field, value in serializer.validated_data.items():
            setattr(item, field, value)
            updates[field] = value

        if updates:
            update_fields = list(updates.keys()) + ["updated_at"]
            item.save(update_fields=update_fields)
            if "quantity" in updates:
                new_quantity = Decimal(updates["quantity"])
                InventoryActivity.objects.create(
                    item=item,
                    action=InventoryActivity.ACTION_UPDATE,
                    quantity_change=new_quantity - previous_quantity,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    reason="mobile_update",
                    actor=self._actor(request),
                    meta={"source": "mobile_api"},
                )

        read_serializer = InventoryItemSerializer(item, context={"expiry_horizon_days": 14})
        return Response({"data": read_serializer.data}, status=status.HTTP_200_OK)

    def _actor(self, request) -> AppUser | None:
        user = getattr(request, "user", None)
        return user if isinstance(user, AppUser) else None

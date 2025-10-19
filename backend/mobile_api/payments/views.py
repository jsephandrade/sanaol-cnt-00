
from __future__ import annotations

from decimal import Decimal
from typing import Dict, Iterable

from django.utils.dateparse import parse_datetime
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action

from api import views_payments
from api.models import PaymentTransaction

from ..permissions import IsManagerOrAdmin
from ..utils import normalize_json_response, prepare_legacy_request
from .serializers import PaymentCreateSerializer, PaymentTransactionSerializer


class PaymentTransactionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Expose payment history and capture endpoints for the mobile client."""

    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post"]

    def get_queryset(self):
        qs = (
            PaymentTransaction.objects.select_related("processed_by")
            .order_by("-created_at")
        )
        params = self.request.query_params

        order_id = params.get("order_id")
        status_filter = params.get("status")
        method = params.get("method")
        since = params.get("since")
        until = params.get("until")

        if order_id:
            qs = qs.filter(order_id=str(order_id))
        if status_filter:
            statuses = self._split_param(status_filter)
            qs = qs.filter(status__in=statuses)
        if method:
            methods = self._split_param(method)
            qs = qs.filter(method__in=methods)
        if since:
            dt = parse_datetime(since)
            if dt:
                qs = qs.filter(created_at__gte=dt)
        if until:
            dt = parse_datetime(until)
            if dt:
                qs = qs.filter(created_at__lte=dt)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = self._build_payload(serializer.validated_data)
        headers = {}
        if serializer.validated_data.get("idempotency_key"):
            headers["HTTP_IDEMPOTENCY_KEY"] = serializer.validated_data["idempotency_key"]
        legacy_request = prepare_legacy_request(request, payload, headers=headers)
        django_response = views_payments.order_payment(legacy_request, serializer.validated_data["order_id"])
        return normalize_json_response(django_response)

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def refund(self, request, pk=None):
        """Process a refund for the specified transaction."""
        legacy_request = prepare_legacy_request(request, {})
        django_response = views_payments.payment_refund(legacy_request, str(pk))
        return normalize_json_response(django_response)

    def _split_param(self, value: str) -> Iterable[str]:
        return [part.strip() for part in value.split(",") if part.strip()]

    def _build_payload(self, validated: Dict[str, object]) -> Dict[str, object]:
        amount = validated["amount"]
        payload: Dict[str, object] = {
            "amount": float(amount) if isinstance(amount, Decimal) else amount,
            "method": str(validated["method"]).lower(),
        }
        if validated.get("customer"):
            payload["customer"] = validated["customer"]
        if validated.get("reference"):
            payload["reference"] = validated["reference"]
        if validated.get("token"):
            payload["token"] = validated["token"]
        return payload

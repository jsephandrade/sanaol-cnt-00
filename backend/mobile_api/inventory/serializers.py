from decimal import Decimal

from rest_framework import serializers

from api.models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    is_expiring = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "category",
            "quantity",
            "unit",
            "min_stock",
            "supplier",
            "last_restocked",
            "expiry_date",
            "updated_at",
            "is_low_stock",
            "is_expiring",
        ]
        read_only_fields = fields

    def get_is_low_stock(self, obj: InventoryItem) -> bool:
        try:
            return Decimal(obj.quantity) <= Decimal(obj.min_stock or 0)
        except Exception:
            return False

    def get_is_expiring(self, obj: InventoryItem) -> bool:
        expiry = getattr(obj, "expiry_date", None)
        if not expiry:
            return False
        from datetime import date, timedelta

        horizon = self.context.get("expiry_horizon_days", 14)
        return expiry <= date.today() + timedelta(days=horizon)


class InventoryItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.DecimalField(required=False, max_digits=12, decimal_places=2, min_value=0)
    min_stock = serializers.DecimalField(required=False, max_digits=12, decimal_places=2, min_value=0)
    supplier = serializers.CharField(required=False, allow_blank=True, max_length=255)
    expiry_date = serializers.DateField(required=False, allow_null=True)

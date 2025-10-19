from rest_framework import serializers

from api.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "category",
            "price",
            "quantity",
            "state",
            "station_code",
            "station_name",
            "priority",
            "modifiers",
            "notes",
        ]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    placed_by = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "order_type",
            "customer_name",
            "subtotal",
            "discount",
            "total_amount",
            "payment_method",
            "priority",
            "channel",
            "eta_seconds",
            "is_throttled",
            "throttle_reason",
            "bulk_reference",
            "promised_time",
            "completed_at",
            "created_at",
            "updated_at",
            "items",
            "placed_by",
        ]
        read_only_fields = fields

    def get_placed_by(self, obj: Order):
        if obj.placed_by_id and obj.placed_by:
            return {
                "id": str(obj.placed_by_id),
                "name": obj.placed_by.name,
                "email": obj.placed_by.email,
            }
        return None


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[choice[0] for choice in Order.STATUS_CHOICES])

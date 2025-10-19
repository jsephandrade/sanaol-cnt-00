
from rest_framework import serializers

from api.models import PaymentTransaction


class PaymentTransactionSerializer(serializers.ModelSerializer):
    processed_by = serializers.SerializerMethodField()

    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "order_id",
            "amount",
            "method",
            "status",
            "reference",
            "customer",
            "processed_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_processed_by(self, obj: PaymentTransaction):
        if obj.processed_by_id and obj.processed_by:
            return {
                "id": str(obj.processed_by_id),
                "email": obj.processed_by.email,
                "name": getattr(obj.processed_by, "name", ""),
            }
        return None


class PaymentCreateSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=64)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    method = serializers.ChoiceField(choices=[choice[0] for choice in PaymentTransaction.METHOD_CHOICES])
    customer = serializers.CharField(required=False, allow_blank=True, max_length=255)
    reference = serializers.CharField(required=False, allow_blank=True, max_length=128)
    token = serializers.CharField(required=False, allow_blank=True, max_length=512)
    idempotency_key = serializers.CharField(required=False, allow_blank=True, max_length=128)

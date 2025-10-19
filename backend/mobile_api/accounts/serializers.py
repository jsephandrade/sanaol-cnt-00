from rest_framework import serializers

from api.models import AppUser


class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = [
            "id",
            "email",
            "name",
            "role",
            "status",
            "permissions",
            "phone",
            "avatar",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AppUserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=False, max_length=255)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    avatar = serializers.URLField(required=False, allow_null=True, allow_blank=True, max_length=500)

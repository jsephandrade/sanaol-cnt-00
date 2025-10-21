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
            "credit_points",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AppUserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=False, max_length=255)
    first_name = serializers.CharField(required=False, allow_blank=False, max_length=120)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=32)
    avatar = serializers.URLField(required=False, allow_null=True, allow_blank=True, max_length=500)

    def _split_existing_name(self):
        user = self.context.get("user")
        if not user or not getattr(user, "name", ""):
            return "", ""
        parts = user.name.strip().split()
        if not parts:
            return "", ""
        first = parts[0]
        last = " ".join(parts[1:]) if len(parts) > 1 else ""
        return first, last

    def validate(self, attrs):
        first = attrs.pop("first_name", serializers.empty)
        last = attrs.pop("last_name", serializers.empty)

        if first is not serializers.empty or last is not serializers.empty:
            current_first, current_last = self._split_existing_name()
            first_val = (
                current_first if first is serializers.empty else first.strip()
            )
            last_val = current_last if last is serializers.empty else last.strip()
            combined = " ".join(filter(None, [first_val, last_val])).strip()
            if not combined:
                raise serializers.ValidationError(
                    {"name": "Name cannot be blank."}
                )
            attrs["name"] = combined

        if "name" in attrs:
            trimmed = attrs["name"].strip()
            if not trimmed:
                raise serializers.ValidationError({"name": "Name cannot be blank."})
            attrs["name"] = trimmed

        return super().validate(attrs)

    def validate_email(self, value):
        normalized = value.strip().lower()
        user = self.context.get("user")
        qs = AppUser.objects.filter(email__iexact=normalized)
        if user is not None:
            qs = qs.exclude(id=getattr(user, "id", None))
        if qs.exists():
            raise serializers.ValidationError("Email address is already in use.")
        return normalized

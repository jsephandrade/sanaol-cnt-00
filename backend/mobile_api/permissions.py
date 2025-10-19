from rest_framework.permissions import BasePermission


class IsManagerOrAdmin(BasePermission):
    """Allow access only to users with manager or admin roles."""

    allowed_roles = {"manager", "admin"}

    def has_permission(self, request, view) -> bool:
        role = getattr(request.user, "role", "") or ""
        return role.lower() in self.allowed_roles

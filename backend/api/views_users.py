"""User management endpoints and role configs."""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.utils import OperationalError, ProgrammingError
from django.db import transaction

from .views_common import USERS, _paginate, _maybe_seed_from_memory, _safe_user_from_db, _now_iso


ROLES = {
    "admin": {
        "label": "Admin",
        "value": "admin",
        "description": "Full access to all settings and functions",
        "permissions": ["all"],
    },
    "manager": {
        "label": "Manager",
        "value": "manager",
        "description": "Can manage most settings and view reports",
        "permissions": ["menu", "inventory", "reports", "users:read"],
    },
    "staff": {
        "label": "Staff",
        "value": "staff",
        "description": "Kitchen and service staff access",
        "permissions": ["orders", "inventory:read"],
    },
    "cashier": {
        "label": "Cashier",
        "value": "cashier",
        "description": "POS and payment access only",
        "permissions": ["pos", "payments"],
    },
}


@require_http_methods(["GET", "POST"]) 
def users(request):
    if request.method == "GET":
        search = (request.GET.get("search") or "").lower()
        role = (request.GET.get("role") or "").lower()
        status = (request.GET.get("status") or "").lower()
        sort_by = request.GET.get("sortBy") or "name"
        sort_dir = (request.GET.get("sortDir") or "asc").lower()
        page = request.GET.get("page", 1)
        limit = request.GET.get("limit", 20)

        try:
            from .models import AppUser
            _maybe_seed_from_memory()
            qs = AppUser.objects.all()
            if search:
                from django.db.models import Q
                qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
            if role:
                qs = qs.filter(role=role)
            if status:
                qs = qs.filter(status=status)

            field_map = {
                "name": "name",
                "email": "email",
                "role": "role",
                "status": "status",
                "createdAt": "created_at",
                "lastLogin": "last_login",
            }
            sort_field = field_map.get(sort_by, "name")
            if sort_dir == "desc":
                sort_field = f"-{sort_field}"
            qs = qs.order_by(sort_field)

            page = max(1, int(page or 1))
            limit = max(1, int(limit or 20))
            total = qs.count()
            start = (page - 1) * limit
            end = start + limit
            items = [_safe_user_from_db(u) for u in qs[start:end]]
            pagination = {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": max(1, (total + limit - 1) // limit),
                "sortBy": sort_by,
                "sortDir": sort_dir,
            }
            return JsonResponse({"success": True, "data": items, "pagination": pagination})
        except (OperationalError, ProgrammingError):
            pass

        data = USERS
        if search:
            data = [u for u in data if search in u.get("name", "").lower() or search in u.get("email", "").lower()]
        if role:
            data = [u for u in data if (u.get("role", "").lower() == role)]
        if status:
            data = [u for u in data if (u.get("status", "").lower() == status)]
        reverse = sort_dir == "desc"
        try:
            data = sorted(data, key=lambda x: str(x.get(sort_by, "")).lower(), reverse=reverse)
        except Exception:
            pass
        page_data, pagination = _paginate(data, page, limit)
        return JsonResponse({"success": True, "data": page_data, "pagination": pagination})

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        with transaction.atomic():
            db_user = AppUser.objects.create(
                email=(payload.get("email") or "user@example.com").lower().strip(),
                name=payload.get("name") or "New User",
                role=(payload.get("role") or "staff").lower(),
                status="active",
                permissions=payload.get("permissions") or [],
            )
        return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
    except (OperationalError, ProgrammingError):
        pass

    user = {
        "id": str(uuid.uuid4()),
        "name": payload.get("name") or "New User",
        "email": payload.get("email") or "user@example.com",
        "role": (payload.get("role") or "staff").lower(),
        "status": "active",
        "createdAt": _now_iso(),
        "lastLogin": None,
        "permissions": [],
    }
    USERS.append(user)
    return JsonResponse({"success": True, "data": user})


@require_http_methods(["GET", "PUT", "DELETE"]) 
def user_detail(request, user_id):
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(id=user_id).first()
        if not db_user:
            raise OperationalError("not found")
        if request.method == "GET":
            return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
        if request.method == "DELETE":
            db_user.delete()
            return JsonResponse({"success": True, "message": "Deleted"})
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        changed = False
        for k in ["name", "email", "role", "status", "permissions", "phone"]:
            if k in payload and payload[k] is not None:
                setattr(db_user, "email" if k == "email" else k, payload[k] if k != "role" else str(payload[k]).lower())
                changed = True
        if changed:
            db_user.save()
        return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
    except (OperationalError, ProgrammingError):
        pass

    idx = next((i for i, u in enumerate(USERS) if u.get("id") == user_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    if request.method == "GET":
        return JsonResponse({"success": True, "data": USERS[idx]})
    if request.method == "DELETE":
        USERS.pop(idx)
        return JsonResponse({"success": True, "message": "Deleted"})
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    user = {**USERS[idx]}
    for k in ["name", "email", "role", "status", "permissions"]:
        if k in payload and payload[k] is not None:
            user[k] = payload[k] if k != "role" else str(payload[k]).lower()
    USERS[idx] = user
    return JsonResponse({"success": True, "data": user})


@require_http_methods(["PATCH"]) 
def user_status(request, user_id):
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(id=user_id).first()
        if not db_user:
            raise OperationalError("not found")
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        status = (payload.get("status") or "").lower()
        if status not in {"active", "deactivated"}:
            return JsonResponse({"success": False, "message": "Invalid status"}, status=400)
        db_user.status = status
        db_user.save(update_fields=["status"])
        return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
    except (OperationalError, ProgrammingError):
        pass

    idx = next((i for i, u in enumerate(USERS) if u.get("id") == user_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    status = (payload.get("status") or "").lower()
    if status not in {"active", "deactivated"}:
        return JsonResponse({"success": False, "message": "Invalid status"}, status=400)
    USERS[idx]["status"] = status
    return JsonResponse({"success": True, "data": USERS[idx]})


@require_http_methods(["PATCH"]) 
def user_role(request, user_id):
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(id=user_id).first()
        if not db_user:
            raise OperationalError("not found")
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        role = (payload.get("role") or "").lower()
        if role not in ROLES:
            return JsonResponse({"success": False, "message": "Invalid role"}, status=400)
        db_user.role = role
        db_user.save(update_fields=["role"])
        return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
    except (OperationalError, ProgrammingError):
        pass

    idx = next((i for i, u in enumerate(USERS) if u.get("id") == user_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    role = (payload.get("role") or "").lower()
    if role not in ROLES:
        return JsonResponse({"success": False, "message": "Invalid role"}, status=400)
    USERS[idx]["role"] = role
    return JsonResponse({"success": True, "data": USERS[idx]})


@require_http_methods(["GET"]) 
def user_roles(request):
    return JsonResponse({"success": True, "data": list(ROLES.values())})


@require_http_methods(["PUT"]) 
def user_role_config(request, value):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    role_value = (value or payload.get("value") or "").lower()
    if not role_value:
        return JsonResponse({"success": False, "message": "Missing role value"}, status=400)
    cfg = {
        "label": payload.get("label") or role_value.capitalize(),
        "value": role_value,
        "description": payload.get("description") or "",
        "permissions": payload.get("permissions") or [],
    }
    ROLES[role_value] = cfg
    return JsonResponse({"success": True, "data": cfg})


__all__ = [
    "users",
    "user_detail",
    "user_status",
    "user_role",
    "user_roles",
    "user_role_config",
]

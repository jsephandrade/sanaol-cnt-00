import json
import os
import uuid
import time
import functools
from datetime import datetime, timezone
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.db import transaction
from django.db.utils import OperationalError, ProgrammingError
from django.utils import timezone as dj_timezone
from django.contrib.auth.hashers import make_password, check_password
import jwt
import base64
import re
from django.core.files.base import ContentFile

# -----------------------------
# Rate limit helpers (must be defined before decorator usage)
# -----------------------------

_RATE_BUCKETS = {}


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        # take first IP in chain
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def rate_limit(limit=10, window_seconds=60, key_fn=None):
    """Basic sliding window rate limit by IP and path.

    - limit: max requests within window_seconds
    - window_seconds: sliding window size
    - key_fn: optional function (request) -> str for bucketing
    """

    def decorator(view_func):
        @functools.wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            now = time.time()
            key_base = key_fn(request) if key_fn else _client_ip(request)
            bucket_key = f"{key_base}:{request.path}:{request.method}:{window_seconds}:{limit}"
            bucket = _RATE_BUCKETS.get(bucket_key, [])
            # drop old timestamps
            threshold = now - window_seconds
            bucket = [t for t in bucket if t > threshold]
            if len(bucket) >= limit:
                # compute retry-after as time until oldest entry falls out
                oldest = min(bucket)
                retry_after = max(1, int(window_seconds - (now - oldest)))
                resp = JsonResponse(
                    {
                        "success": False,
                        "message": "Too many requests, slow down.",
                    }
                )
                resp.status_code = 429
                resp["Retry-After"] = str(retry_after)
                return resp
            # record this hit
            bucket.append(now)
            _RATE_BUCKETS[bucket_key] = bucket
            return view_func(request, *args, **kwargs)

        return _wrapped

    return decorator


@require_http_methods(["GET"]) 
def health(request):
    return JsonResponse({"status": "ok", "service": "backend", "version": "0.1"})


@rate_limit(limit=5, window_seconds=60)
@require_http_methods(["POST"]) 
def auth_login(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    # Try DB first
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(email=email).first()
        if db_user and db_user.password_hash and password and check_password(password, db_user.password_hash):
            db_user.last_login = dj_timezone.now()
            db_user.save(update_fields=["last_login"])
            safe_user = _safe_user_from_db(db_user)
            token = _issue_jwt(db_user)
            return JsonResponse({"success": True, "user": safe_user, "token": token})
    except (OperationalError, ProgrammingError):
        # DB not ready; fall back to in-memory
        pass

    # Fallback to in-memory USERS
    user = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
    if user and password and password == user.get("password"):
        safe_user = {k: v for k, v in user.items() if k != "password"}
        return JsonResponse({"success": True, "user": safe_user, "token": _issue_jwt_from_dict(safe_user)})

    return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)


@require_http_methods(["POST"]) 
def auth_logout(request):
    return JsonResponse({"success": True})


@rate_limit(limit=3, window_seconds=60)
@require_http_methods(["POST"]) 
def auth_register(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}

    name = (data.get("name") or "").strip() or (data.get("firstName", "").strip() + " " + data.get("lastName", "").strip()).strip() or "New User"
    email = (data.get("email") or "user@example.com").lower().strip()
    password = data.get("password") or ""
    role = (data.get("role") or "staff").lower()

    if len(password) < 8:
        return JsonResponse({"success": False, "message": "Password must be at least 8 characters"}, status=400)

    # Uniqueness by email
    existing = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
    if existing:
        return JsonResponse({"success": False, "message": "Email already registered"}, status=409)

    # Try DB create
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        with transaction.atomic():
            db_user = AppUser.objects.create(
                email=email,
                name=name,
                role=role,
                status="pending",
                permissions=[],
                password_hash=make_password(password) if password else "",
            )
        # Ensure AccessRequest exists for manual approval
        try:
            from .models import AccessRequest
            AccessRequest.objects.get_or_create(user=db_user)
        except Exception:
            pass
        safe_user = _safe_user_from_db(db_user)
        return JsonResponse({
            "success": True,
            "pending": True,
            "user": safe_user,
            "verifyToken": _issue_verify_token_from_db(db_user),
        })
    except (OperationalError, ProgrammingError):
        pass

    # Fallback in-memory
    new_user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "role": role,
        "status": "pending",
        "createdAt": _now_iso(),
        "lastLogin": None,
        "permissions": [],
        "password": password,
    }
    USERS.append(new_user)
    safe_user = {k: v for k, v in new_user.items() if k != "password"}
    return JsonResponse({"success": True, "pending": True, "user": safe_user, "verifyToken": _issue_verify_token_from_dict(safe_user)})


@rate_limit(limit=5, window_seconds=60)
@require_http_methods(["POST"]) 
def forgot_password(request):
    return JsonResponse({"success": True, "message": "Password reset email sent"})


@rate_limit(limit=5, window_seconds=60)
@require_http_methods(["POST"]) 
def reset_password(request):
    return JsonResponse({"success": True, "message": "Password reset successful"})


@require_http_methods(["POST"]) 
def refresh_token(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    token = data.get("token") or ""
    if not token:
        # Allow Authorization: Bearer token
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        return JsonResponse({"success": False, "message": "Missing token"}, status=400)
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        # Issue a new token with a fresh expiry
        new_token = _issue_jwt_from_payload(payload)
        return JsonResponse({"success": True, "token": new_token})
    except jwt.ExpiredSignatureError:
        return JsonResponse({"success": False, "message": "Token expired"}, status=401)
    except Exception:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=401)


@require_http_methods(["GET"]) 
def auth_me(request):
    """Return current user from Bearer JWT."""
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    token = ""
    if auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        return JsonResponse({"success": False, "message": "Missing token"}, status=401)
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return JsonResponse({"success": False, "message": "Token expired"}, status=401)
    except Exception:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=401)

    user_id = str(payload.get("sub") or "")
    email = (payload.get("email") or "").lower().strip()
    # Try DB first
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        u = None
        if user_id:
            u = AppUser.objects.filter(id=user_id).first()
        if not u and email:
            u = AppUser.objects.filter(email=email).first()
        if not u:
            raise OperationalError("not found")
        return JsonResponse({"success": True, "user": _safe_user_from_db(u)})
    except (OperationalError, ProgrammingError):
        pass

    # Fallback to in-memory store
    user = None
    if email:
        user = next((x for x in USERS if (x.get("email") or "").lower() == email), None)
    if not user and user_id:
        user = next((x for x in USERS if str(x.get("id")) == user_id), None)
    if not user:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    safe_user = {k: v for k, v in user.items() if k != "password"}
    return JsonResponse({"success": True, "user": safe_user})


@rate_limit(limit=10, window_seconds=60)
@require_http_methods(["POST"]) 
def auth_google(request):
    """Authenticate via Google.

    Supports two request shapes (JSON body):
    - { "credential": "<ID_TOKEN>" }  # Google One Tap / GIS ID token
    - { "code": "<AUTH_CODE>", "redirectUri": "<REDIRECT_URI>", "codeVerifier": "<optional PKCE>" }
    """
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}

    client_id = settings.GOOGLE_CLIENT_ID or os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = settings.GOOGLE_CLIENT_SECRET or os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    if not client_id:
        return JsonResponse({"success": False, "message": "Server missing GOOGLE_CLIENT_ID"}, status=500)

    idinfo = None
    # Path A: ID token directly from frontend
    credential = (data.get("credential") or "").strip()
    if credential:
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests

            req = google_requests.Request()
            idinfo = google_id_token.verify_oauth2_token(credential, req, client_id)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Invalid Google ID token: {e}"}, status=401)

    # Path B: Authorization code exchange
    elif (data.get("code") or "").strip():
        auth_code = data.get("code").strip()
        redirect_uri = (data.get("redirectUri") or data.get("redirect_uri") or "").strip()
        code_verifier = (data.get("codeVerifier") or data.get("code_verifier") or "").strip()
        if not client_secret:
            return JsonResponse({"success": False, "message": "Server missing GOOGLE_CLIENT_SECRET for code flow"}, status=500)
        if not redirect_uri:
            return JsonResponse({"success": False, "message": "Missing redirectUri"}, status=400)
        try:
            import requests as _requests
            token_url = "https://oauth2.googleapis.com/token"
            payload = {
                "code": auth_code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            }
            if code_verifier:
                payload["code_verifier"] = code_verifier
            resp = _requests.post(token_url, data=payload, timeout=10)
            if resp.status_code != 200:
                try:
                    err_payload = resp.json()
                except Exception:
                    err_payload = {"error": resp.text}
                return JsonResponse({"success": False, "message": "Token exchange failed", "details": err_payload}, status=401)
            token_data = resp.json()
            id_token_value = token_data.get("id_token")
            if not id_token_value:
                return JsonResponse({"success": False, "message": "No id_token in token response"}, status=401)
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests

            req = google_requests.Request()
            idinfo = google_id_token.verify_oauth2_token(id_token_value, req, client_id)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Authorization code verification failed: {e}"}, status=401)
    else:
        return JsonResponse({"success": False, "message": "Missing credential or code"}, status=400)

    # Extract profile from verified idinfo
    sub = str(idinfo.get("sub") or "")
    email = (idinfo.get("email") or "").lower().strip()
    email_verified = bool(idinfo.get("email_verified", True))
    name = (idinfo.get("name") or "").strip() or (f"{idinfo.get('given_name','')} {idinfo.get('family_name','')}").strip() or "Google User"
    picture = idinfo.get("picture")
    if not email or not email_verified:
        return JsonResponse({"success": False, "message": "Google account email is not available/verified"}, status=400)

    # Find or create user by email
    # Try DB first
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(email=email).first()
        if db_user:
            db_user.name = name or db_user.name
            db_user.avatar = picture or db_user.avatar
            db_user.last_login = dj_timezone.now()
            db_user.save(update_fields=["name", "avatar", "last_login"])
        else:
            with transaction.atomic():
                db_user = AppUser.objects.create(
                    email=email,
                    name=name,
                    role="staff",
                    status="pending",  # gate access until approved
                    permissions=[],
                    avatar=picture or "",
                )
        # Ensure an AccessRequest exists for pending users
        try:
            from .models import AccessRequest
            ar, _ = AccessRequest.objects.get_or_create(user=db_user)
            if ar.status == "rejected":
                ar.status = "pending"
                ar.save(update_fields=["status"]) 
        except Exception:
            pass

        safe_user = _safe_user_from_db(db_user)
        if (db_user.status or "").lower() != "active":
            return JsonResponse({
                "success": True,
                "pending": True,
                "user": safe_user,
                "verifyToken": _issue_verify_token_from_db(db_user),
            })
        token = _issue_jwt(db_user)
        return JsonResponse({"success": True, "user": safe_user, "token": token})
    except (OperationalError, ProgrammingError):
        pass

    # Fallback to in-memory
    user = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
    if user:
        user["lastLogin"] = _now_iso()
        if name:
            user["name"] = name
        if picture:
            user["avatar"] = picture
    else:
        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "role": "staff",
            "status": "pending",
            "createdAt": _now_iso(),
            "lastLogin": _now_iso(),
            "permissions": [],
            "provider": "google",
            "googleSub": sub,
            "avatar": picture,
        }
        USERS.append(user)

    safe_user = {k: v for k, v in user.items() if k != "password"}
    # For in-memory path, also gate issuance if pending
    if (user.get("status") or "").lower() != "active":
        return JsonResponse({"success": True, "pending": True, "user": safe_user, "verifyToken": _issue_verify_token_from_dict(safe_user)})
    return JsonResponse({"success": True, "user": safe_user, "token": _issue_jwt_from_dict(safe_user)})

# -----------------------------
# In-memory data stores
# -----------------------------

def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# Menu store (simple list)
MENU_ITEMS = []


def _paginate(list_data, page, limit):
    page = max(1, int(page or 1))
    limit = max(1, int(limit or 20))
    total = len(list_data)
    start = (page - 1) * limit
    end = start + limit
    return list_data[start:end], {
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": max(1, (total + limit - 1) // limit),
    }


@require_http_methods(["GET", "POST"])
def menu_items(request):
    if request.method == "GET":
        search = (request.GET.get("search") or request.GET.get("q") or "").lower()
        category = (request.GET.get("category") or "").lower()
        available = request.GET.get("available")
        page = request.GET.get("page", 1)
        limit = request.GET.get("limit", 50)

        data = MENU_ITEMS
        if search:
            data = [
                i
                for i in data
                if search in i.get("name", "").lower()
                or search in i.get("description", "").lower()
            ]
        if category:
            data = [i for i in data if i.get("category", "").lower() == category]
        if available is not None and available != "":
            val = str(available).lower() in {"1", "true", "yes"}
            data = [i for i in data if bool(i.get("available", False)) == val]

        # Sort (optional)
        sort_by = request.GET.get("sortBy") or "name"
        sort_dir = (request.GET.get("sortDir") or "asc").lower()
        reverse = sort_dir == "desc"
        try:
            data = sorted(
                data,
                key=lambda x: str(x.get(sort_by, "")).lower(),
                reverse=reverse,
            )
        except Exception:
            pass

        page_data, pagination = _paginate(data, page, limit)
        return JsonResponse({"success": True, "data": page_data, "pagination": pagination})

    # POST create
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    item = {
        "id": payload.get("id") or str(uuid.uuid4()),
        "name": payload.get("name", "Unnamed Item"),
        "description": payload.get("description", ""),
        "price": float(payload.get("price", 0)),
        "category": payload.get("category", "General"),
        "available": bool(payload.get("available", True)),
        "image": payload.get("image"),
        "ingredients": payload.get("ingredients") or [],
        "preparationTime": payload.get("preparationTime"),
    }
    MENU_ITEMS.append(item)
    return JsonResponse({"success": True, "data": item})


@require_http_methods(["GET", "PUT", "DELETE"])
def menu_item_detail(request, item_id):
    idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)

    if request.method == "GET":
        return JsonResponse({"success": True, "data": MENU_ITEMS[idx]})
    if request.method == "DELETE":
        MENU_ITEMS.pop(idx)
        return JsonResponse({"success": True, "message": "Deleted"})

    # PUT update
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}

    item = {**MENU_ITEMS[idx]}
    for k in [
        "name",
        "description",
        "category",
        "image",
        "ingredients",
        "preparationTime",
        "available",
    ]:
        if k in payload:
            item[k] = payload[k]
    if "price" in payload:
        try:
            item["price"] = float(payload["price"])
        except Exception:
            pass
    MENU_ITEMS[idx] = item
    return JsonResponse({"success": True, "data": item})


@require_http_methods(["PATCH"])
def menu_item_availability(request, item_id):
    idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    MENU_ITEMS[idx]["available"] = bool(payload.get("available", True))
    return JsonResponse({"success": True, "data": MENU_ITEMS[idx]})


@require_http_methods(["POST"])
def menu_item_image(request, item_id):
    # Pretend to handle upload; just return a fake URL
    fake_url = f"/images/menu/{item_id}-{int(datetime.now().timestamp())}.jpg"
    return JsonResponse({"success": True, "data": {"imageUrl": fake_url}})


# Users store (simple list)
USERS = [
    {
        "id": "1",
        "name": "Admin User",
        "email": "admin@canteen.com",
        "role": "admin",
        "status": "active",
        "createdAt": _now_iso(),
        "lastLogin": _now_iso(),
        "permissions": ["all"],
        "password": "1234",
    },
    {
        "id": "2",
        "name": "Manager One",
        "email": "manager@canteen.com",
        "role": "manager",
        "status": "active",
        "createdAt": _now_iso(),
        "lastLogin": _now_iso(),
        "permissions": ["menu", "inventory", "reports", "users:read"],
        "password": "manager1234",
    },
]

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

        # Try DB first
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

            # Pagination
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

        # Fallback to in-memory
        data = USERS
        if search:
            data = [
                u
                for u in data
                if search in u.get("name", "").lower()
                or search in u.get("email", "").lower()
            ]
        if role:
            data = [u for u in data if (u.get("role", "").lower() == role)]
        if status:
            data = [u for u in data if (u.get("status", "").lower() == status)]

        reverse = sort_dir == "desc"
        try:
            data = sorted(
                data,
                key=lambda x: str(x.get(sort_by, "")).lower(),
                reverse=reverse,
            )
        except Exception:
            pass

        page_data, pagination = _paginate(data, page, limit)
        return JsonResponse({"success": True, "data": page_data, "pagination": pagination})

    # POST create user
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    # Try DB first
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

    # Fallback in-memory
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
        # PUT update
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        changed = False
        for k in ["name", "email", "role", "status", "permissions", "avatar"]:
            if k in payload and payload[k] is not None:
                setattr(db_user, "email" if k == "email" else k, payload[k] if k != "role" else str(payload[k]).lower())
                changed = True
        if changed:
            db_user.save()
        return JsonResponse({"success": True, "data": _safe_user_from_db(db_user)})
    except (OperationalError, ProgrammingError):
        pass

    # Fallback to in-memory
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
    # Update a role config in-memory
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


# -----------------------------
# Helpers: JWT + DB seeding
# -----------------------------

def _issue_jwt(db_user):
    now = int(time.time())
    exp = now + getattr(settings, "JWT_EXP_SECONDS", 3600)
    payload = {
        "sub": str(db_user.id),
        "email": db_user.email,
        "role": db_user.role,
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _issue_jwt_from_dict(user_dict):
    now = int(time.time())
    exp = now + getattr(settings, "JWT_EXP_SECONDS", 3600)
    payload = {
        "sub": str(user_dict.get("id")),
        "email": user_dict.get("email"),
        "role": user_dict.get("role", "staff"),
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _issue_jwt_from_payload(payload):
    now = int(time.time())
    exp = now + getattr(settings, "JWT_EXP_SECONDS", 3600)
    new_payload = {
        "sub": str(payload.get("sub")),
        "email": payload.get("email"),
        "role": payload.get("role", "staff"),
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(new_payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _issue_verify_token_from_db(db_user):
    now = int(time.time())
    exp = now + 15 * 60  # 15 minutes
    payload = {
        "typ": "verify",
        "sub": str(db_user.id),
        "email": db_user.email,
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _issue_verify_token_from_dict(user_dict):
    now = int(time.time())
    exp = now + 15 * 60
    payload = {
        "typ": "verify",
        "sub": str(user_dict.get("id")),
        "email": user_dict.get("email"),
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _decode_verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("typ") != "verify":
            return None
        return payload
    except Exception:
        return None


def _extract_dataurl_image(data_url: str):
    if not data_url or not isinstance(data_url, str):
        return None, None
    m = re.match(r"^data:([\w/+\-\.]+);base64,(.*)$", data_url)
    if not m:
        return None, None
    mime = m.group(1)
    b64 = m.group(2)
    try:
        binary = base64.b64decode(b64)
        return mime, binary
    except Exception:
        return None, None


@require_http_methods(["GET"]) 
def verify_status(request):
    """Return verification status for the pending user using a verify token or email.

    Accepts:
    - Authorization: Bearer <verifyToken>
    - or query param `token`, or body { verifyToken }
    """
    token = None
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        token = request.GET.get("token") or ""
    if not token:
        try:
            data = json.loads(request.body.decode("utf-8") or "{}")
            token = data.get("verifyToken") or ""
        except Exception:
            token = ""
    payload = _decode_verify_token(token)
    if not payload:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=401)
    email = (payload.get("email") or "").lower().strip()
    try:
        from .models import AppUser, AccessRequest
        u = AppUser.objects.filter(email=email).first()
        if not u:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)
        ar = getattr(u, "access_request", None)
        if not ar:
            return JsonResponse({"success": True, "status": "pending", "hasHeadshot": False})
        return JsonResponse({
            "success": True,
            "status": ar.status,
            "hasHeadshot": bool(ar.headshot),
            "consented": bool(ar.consent_at),
        })
    except Exception:
        return JsonResponse({"success": True, "status": "pending"})


@require_http_methods(["POST"]) 
def verify_upload(request):
    """Accept a data URL headshot and consent flag using a short-lived verify token."""
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    verify_token = data.get("verifyToken") or ""
    consent = bool(data.get("consent", False))
    image_data = data.get("imageData") or data.get("headshot") or ""

    payload = _decode_verify_token(verify_token)
    if not payload:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=401)

    mime, raw = _extract_dataurl_image(image_data)
    if not raw:
        return JsonResponse({"success": False, "message": "Invalid image data"}, status=400)

    # Determine file extension
    ext = ".jpg"
    if mime == "image/png":
        ext = ".png"
    elif mime == "image/jpeg" or mime == "image/jpg":
        ext = ".jpg"
    elif mime == "image/webp":
        ext = ".webp"

    try:
        from .models import AppUser, AccessRequest
        email = (payload.get("email") or "").lower().strip()
        u = AppUser.objects.filter(email=email).first()
        if not u:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)
        ar, _ = AccessRequest.objects.get_or_create(user=u)
        # Save file to private storage
        filename = f"headshot{ext}"
        ar.headshot.save(filename, ContentFile(raw), save=False)
        if consent:
            ar.consent_at = dj_timezone.now()
        if (u.status or "").lower() != "active":
            u.status = "pending"
            u.save(update_fields=["status"]) 
        ar.save()
        return JsonResponse({"success": True, "status": ar.status})
    except Exception as e:
        return JsonResponse({"success": False, "message": "Upload failed"}, status=500)


def _require_admin_or_manager(db_user):
    try:
        role = (getattr(db_user, "role", "") or "").lower()
        return role in {"admin", "manager"}
    except Exception:
        return False


@require_http_methods(["GET"]) 
def verify_requests(request):
    """List access requests for admin/staff review. Requires admin/manager role.

    Query params: status (default: pending), page, limit, search
    """
    # Authenticate via Bearer JWT and fetch AppUser
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    try:
        from .models import AppUser, AccessRequest
        reviewer = AppUser.objects.filter(email=(payload.get("email") or "").lower()).first()
        if not reviewer or not _require_admin_or_manager(reviewer):
            return JsonResponse({"success": False, "message": "Forbidden"}, status=403)

        status_q = (request.GET.get("status") or "pending").lower()
        page = max(1, int(request.GET.get("page") or 1))
        limit = max(1, min(100, int(request.GET.get("limit") or 20)))
        search = (request.GET.get("search") or "").strip().lower()

        qs = AccessRequest.objects.select_related("user").all()
        if status_q:
            qs = qs.filter(status=status_q)
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(user__email__icontains=search) | Q(user__name__icontains=search))
        total = qs.count()
        start = (page - 1) * limit
        end = start + limit
        items = []
        for ar in qs.order_by("-created_at")[start:end]:
            items.append({
                "id": str(ar.id),
                "status": ar.status,
                "createdAt": (ar.created_at).isoformat() if ar.created_at else None,
                "verifiedAt": ar.verified_at.isoformat() if ar.verified_at else None,
                "verifiedBy": ar.verified_by,
                "notes": ar.notes or "",
                "hasHeadshot": bool(ar.headshot),
                "user": {
                    "id": str(ar.user.id),
                    "email": ar.user.email,
                    "name": ar.user.name,
                    "role": ar.user.role,
                    "status": ar.user.status,
                    "avatar": ar.user.avatar or None,
                },
                "headshotUrl": f"/api/verify/headshot/{ar.id}",
            })
        return JsonResponse({
            "success": True,
            "data": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": max(1, (total + limit - 1) // limit),
            },
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": "Failed to load requests"}, status=500)


@require_http_methods(["GET"]) 
def verify_headshot(request, request_id):
    """Stream headshot for the given AccessRequest. Requires admin/manager."""
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    try:
        from .models import AppUser, AccessRequest
        reviewer = AppUser.objects.filter(email=(payload.get("email") or "").lower()).first()
        if not reviewer or not _require_admin_or_manager(reviewer):
            return JsonResponse({"success": False, "message": "Forbidden"}, status=403)

        ar = AccessRequest.objects.filter(id=request_id).first()
        if not ar or not ar.headshot:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        f = ar.headshot.open("rb")
        name = getattr(ar.headshot, "name", "headshot.jpg")
        if name.endswith(".png"):
            ctype = "image/png"
        elif name.endswith(".webp"):
            ctype = "image/webp"
        else:
            ctype = "image/jpeg"
        from django.http import FileResponse
        return FileResponse(f, content_type=ctype)
    except Exception:
        return JsonResponse({"success": False, "message": "Error"}, status=500)


@require_http_methods(["POST"]) 
def verify_approve(request):
    """Approve a request and assign a role. Requires admin/manager."""
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}

    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    request_id = (data.get("requestId") or "").strip()
    role = (data.get("role") or "staff").lower()
    note = (data.get("note") or "").strip()
    if role not in {"admin", "manager", "staff", "cashier"}:
        return JsonResponse({"success": False, "message": "Invalid role"}, status=400)
    if not request_id:
        return JsonResponse({"success": False, "message": "Missing requestId"}, status=400)

    try:
        from .models import AppUser, AccessRequest
        reviewer = AppUser.objects.filter(email=(payload.get("email") or "").lower()).first()
        if not reviewer or not _require_admin_or_manager(reviewer):
            return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
        ar = AccessRequest.objects.filter(id=request_id).select_related("user").first()
        if not ar:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        ar.status = AccessRequest.STATUS_APPROVED
        ar.verified_at = dj_timezone.now()
        ar.verified_by = reviewer.email
        if note:
            ar.notes = (ar.notes or "") + ("\n" if ar.notes else "") + note
        ar.save()
        u = ar.user
        u.role = role
        u.status = "active"
        u.save(update_fields=["role", "status"])
        return JsonResponse({"success": True, "data": {"id": str(ar.id), "status": ar.status, "user": {"id": str(u.id), "role": u.role, "status": u.status}}})
    except Exception:
        return JsonResponse({"success": False, "message": "Failed to approve"}, status=500)


@require_http_methods(["POST"]) 
def verify_reject(request):
    """Reject a request. Requires admin/manager."""
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    request_id = (data.get("requestId") or "").strip()
    note = (data.get("note") or "").strip()

    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    try:
        from .models import AppUser, AccessRequest
        reviewer = AppUser.objects.filter(email=(payload.get("email") or "").lower()).first()
        if not reviewer or not _require_admin_or_manager(reviewer):
            return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
        ar = AccessRequest.objects.filter(id=request_id).select_related("user").first()
        if not ar:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        ar.status = AccessRequest.STATUS_REJECTED
        ar.verified_at = dj_timezone.now()
        ar.verified_by = reviewer.email
        if note:
            ar.notes = (ar.notes or "") + ("\n" if ar.notes else "") + note
        ar.save()
        u = ar.user
        if (u.status or "").lower() != "active":
            u.status = "pending"
            u.save(update_fields=["status"])
        return JsonResponse({"success": True, "data": {"id": str(ar.id), "status": ar.status}})
    except Exception:
        return JsonResponse({"success": False, "message": "Failed to reject"}, status=500)


def _safe_user_from_db(db_user):
    return {
        "id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "status": db_user.status,
        "createdAt": (db_user.created_at or dj_timezone.now()).isoformat(),
        "lastLogin": db_user.last_login.isoformat() if db_user.last_login else None,
        "permissions": db_user.permissions or [],
        "avatar": db_user.avatar or None,
    }


def _maybe_seed_from_memory():
    """If DB has no users yet, seed from in-memory USERS list."""
    try:
        from .models import AppUser
        if AppUser.objects.count() == 0 and USERS:
            for u in USERS:
                try:
                    AppUser.objects.create(
                        id=u.get("id") or uuid.uuid4(),
                        email=u.get("email"),
                        name=u.get("name") or (u.get("firstName", "") + " " + u.get("lastName", "")).strip() or "User",
                        role=u.get("role", "staff"),
                        status=u.get("status", "active"),
                        permissions=u.get("permissions") or [],
                        password_hash=make_password(u.get("password") or "") if u.get("password") else "",
                        avatar=u.get("avatar") or None,
                    )
                except Exception:
                    continue
    except Exception:
        # if models or table not ready, ignore
        pass

"""Auth-related views: login, signup, password, tokens, Google, email verify."""

import json
import uuid
import os
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.db.utils import OperationalError, ProgrammingError
from django.utils import timezone as dj_timezone
from django.contrib.auth.hashers import check_password
import jwt
import requests as _requests

from .views_common import (
    rate_limit,
    _login_rate_key,
    _is_locked,
    _lockout_check_and_touch,
    _safe_user_from_db,
    _maybe_seed_from_memory,
    _issue_jwt,
    _issue_jwt_from_dict,
    _issue_refresh_token_db,
    _issue_refresh_token_mem,
    _revoke_refresh_token,
    USERS,
    _issue_verify_token_from_db,
    _issue_verify_token_from_dict,
    _email_rate_key,
    _rotate_refresh_token_mem,
    _revoke_all_refresh_tokens,
    _revoke_all_refresh_tokens_mem,
    _issue_verify_token_from_db,
    _issue_verify_token_from_dict,
)


@require_http_methods(["GET"]) 
def health(request):
    return JsonResponse({"status": "ok", "service": "backend", "version": "0.1"})


@rate_limit(limit=7, window_seconds=60, key_fn=_login_rate_key)
@require_http_methods(["POST"]) 
def auth_login(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""
    remember_raw = data.get("remember")
    remember = False
    if isinstance(remember_raw, bool):
        remember = remember_raw
    elif isinstance(remember_raw, (int, str)):
        remember = str(remember_raw).lower() in {"1", "true", "yes", "on"}
    exp_seconds = getattr(settings, "JWT_REMEMBER_EXP_SECONDS", 30 * 24 * 60 * 60) if remember else getattr(settings, "JWT_EXP_SECONDS", 3600)

    # Lockout pre-check
    from .views_common import _client_ip
    ip = _client_ip(request)
    locked, retry_after = _is_locked(email, ip)
    if locked:
        resp = JsonResponse({"success": False, "message": "Too many attempts. Try again later."})
        resp.status_code = 423
        resp["Retry-After"] = str(max(1, int(retry_after)))
        return resp

    # Try DB first
    try:
        from .models import AppUser
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(email=email).first()
        if db_user and db_user.password_hash and password and check_password(password, db_user.password_hash):
            status_l = (db_user.status or "").lower()
            safe_user = _safe_user_from_db(db_user)
            # Block deactivated accounts
            if status_l == "deactivated":
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Your account is currently deactivated, to activate please contact the admin.",
                    },
                    status=403,
                )
            # Pending or other non-active states: return pending without issuing tokens
            if status_l != "active":
                try:
                    vtok = _issue_verify_token_from_db(db_user)
                except Exception:
                    vtok = None
                _lockout_check_and_touch(email, ip, success=True)
                return JsonResponse({
                    "success": True,
                    "pending": True,
                    "user": safe_user,
                    **({"verifyToken": vtok} if vtok else {}),
                })

            # Active: issue tokens
            db_user.last_login = dj_timezone.now()
            db_user.save(update_fields=["last_login"])
            token = _issue_jwt(db_user, exp_seconds=exp_seconds)
            refresh_token = _issue_refresh_token_db(db_user, remember=remember, request=request)
            _lockout_check_and_touch(email, ip, success=True)
            payload = {"success": True, "user": safe_user, "token": token, "refreshToken": refresh_token}
            return JsonResponse(payload)
    except (OperationalError, ProgrammingError):
        pass

    # Fallback to in-memory
    user = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
    if user and password and password == user.get("password"):
        status_l = (user.get("status") or "").lower()
        safe_user = {k: v for k, v in user.items() if k != "password"}
        # Block deactivated accounts
        if status_l == "deactivated":
            return JsonResponse(
                {
                    "success": False,
                    "message": "Your account is currently deactivated, to activate please contact the admin.",
                },
                status=403,
            )
        # Pending or other non-active states: return pending without tokens
        if status_l != "active":
            _lockout_check_and_touch(email, ip, success=True)
            try:
                vtok = _issue_verify_token_from_dict(safe_user)
            except Exception:
                vtok = None
            return JsonResponse({
                "success": True,
                "pending": True,
                "user": safe_user,
                **({"verifyToken": vtok} if vtok else {}),
            })

        rtoken = _issue_refresh_token_mem(safe_user, remember=remember, request=request)
        _lockout_check_and_touch(email, ip, success=True)
        payload = {"success": True, "user": safe_user, "token": _issue_jwt_from_dict(safe_user, exp_seconds=exp_seconds), "refreshToken": rtoken}
        return JsonResponse(payload)

    # Record failed attempt and maybe lock
    locked, retry_after = _lockout_check_and_touch(email, ip, success=False)
    if locked:
        resp = JsonResponse({"success": False, "message": "Too many attempts. Try again later."})
        resp.status_code = 423
        resp["Retry-After"] = str(max(1, int(retry_after)))
        return resp
    return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)


@require_http_methods(["POST"]) 
def auth_logout(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    rtoken = (data.get("refreshToken") or "").strip()
    if rtoken:
        _revoke_refresh_token(request, rtoken)
    return JsonResponse({"success": True})


@require_http_methods(["GET"]) 
def auth_me(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Missing token"}, status=401)
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return JsonResponse({"success": False, "message": "Token expired"}, status=401)
    except Exception:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=401)

    user_id = str(payload.get("sub") or "")
    email = (payload.get("email") or "").lower().strip()
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
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}

    client_id = settings.GOOGLE_CLIENT_ID or os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = settings.GOOGLE_CLIENT_SECRET or os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    if not client_id:
        return JsonResponse({"success": False, "message": "Server missing GOOGLE_CLIENT_ID"}, status=500)

    idinfo = None
    credential = (data.get("credential") or "").strip()
    if credential:
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            req = google_requests.Request()
            idinfo = google_id_token.verify_oauth2_token(credential, req, client_id)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Invalid Google ID token: {e}"}, status=401)
    elif (data.get("code") or "").strip():
        auth_code = data.get("code").strip()
        redirect_uri = (data.get("redirectUri") or data.get("redirect_uri") or "").strip()
        code_verifier = (data.get("codeVerifier") or data.get("code_verifier") or "").strip()
        if not client_secret:
            return JsonResponse({"success": False, "message": "Server missing GOOGLE_CLIENT_SECRET for code flow"}, status=500)
        if not redirect_uri:
            return JsonResponse({"success": False, "message": "Missing redirectUri"}, status=400)
        try:
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

    sub = str(idinfo.get("sub") or "")
    email = (idinfo.get("email") or "").lower().strip()
    name = (idinfo.get("name") or "").strip() or email
    picture = idinfo.get("picture") or ""
    if not email:
        return JsonResponse({"success": False, "message": "Google account missing email"}, status=401)

    try:
        from .models import AppUser, AccessRequest
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(email=email).first()
        if db_user:
            db_user.name = name or db_user.name
            db_user.avatar = picture or db_user.avatar
            db_user.last_login = dj_timezone.now()
            db_user.save(update_fields=["name", "avatar", "last_login"])
        else:
            from django.db import transaction
            with transaction.atomic():
                db_user = AppUser.objects.create(
                    email=email,
                    name=name,
                    role="staff",
                    status="pending",
                    permissions=[],
                    avatar=picture or "",
                )
        try:
            ar, _ = AccessRequest.objects.get_or_create(user=db_user)
            if ar.status == "rejected":
                ar.status = "pending"
                ar.save(update_fields=["status"]) 
        except Exception:
            pass

        safe_user = _safe_user_from_db(db_user)
        status_l = (db_user.status or "").lower()
        if status_l == "deactivated":
            return JsonResponse({
                "success": False,
                "message": "Your account is currently deactivated, to activate please contact the admin.",
            }, status=403)
        if status_l != "active":
            return JsonResponse({
                "success": True,
                "pending": True,
                "user": safe_user,
                "verifyToken": _issue_verify_token_from_db(db_user),
            })
        token = _issue_jwt(db_user)
        rtok = _issue_refresh_token_db(db_user, remember=False, request=request)
        return JsonResponse({"success": True, "user": safe_user, "token": token, "refreshToken": rtok})
    except (OperationalError, ProgrammingError):
        pass

    from .views_common import _now_iso
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
    status_l = (user.get("status") or "").lower()
    if status_l == "deactivated":
        return JsonResponse({
            "success": False,
            "message": "Your account is currently deactivated, to activate please contact the admin.",
        }, status=403)
    if status_l != "active":
        return JsonResponse({"success": True, "pending": True, "user": safe_user, "verifyToken": _issue_verify_token_from_dict(safe_user)})
    rtok = _issue_refresh_token_mem(user, remember=False, request=request)
    return JsonResponse({"success": True, "user": safe_user, "token": _issue_jwt_from_dict(safe_user), "refreshToken": rtok})


from .views_common import _decode_emailverify_token
from .emails import email_user_email_verification

@require_http_methods(["POST", "GET"]) 
def verify_email(request):
    token = ""
    if request.method == "GET":
        token = request.GET.get("token") or ""
    else:
        try:
            data = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            data = {}
        token = (data.get("token") or "").strip()
    if not token:
        return JsonResponse({"success": False, "message": "Missing token"}, status=400)
    payload = _decode_emailverify_token(token)
    if not payload:
        return JsonResponse({"success": False, "message": "Invalid or expired token"}, status=400)
    email = (payload.get("email") or "").lower().strip()
    try:
        from .models import AppUser
        u = AppUser.objects.filter(email=email).first()
        if not u:
            return JsonResponse({"success": True, "status": "pending", "hasHeadshot": False})
        if not u.email_verified:
            u.email_verified = True
            u.save(update_fields=["email_verified"])
        return JsonResponse({"success": True})
    except Exception:
        pass
    u = next((x for x in USERS if (x.get("email") or "").lower() == email), None)
    if u:
        u["emailVerified"] = True
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "message": "User not found"}, status=404)


from .views_common import _email_rate_key
from .views_common import rate_limit

@rate_limit(limit=5, window_seconds=60, key_fn=_email_rate_key)
@require_http_methods(["POST"]) 
def resend_verification(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()
    if email:
        try:
            from .models import AppUser
            u = AppUser.objects.filter(email=email).first()
            if u and not u.email_verified:
                from .views_common import _issue_emailverify_token_from_db
                tok = _issue_emailverify_token_from_db(u)
                base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:8080").rstrip("/")
                link = f"{base}/verify-email?token={tok}"
                email_user_email_verification(email, link)
        except Exception:
            pass
        user = next((x for x in USERS if (x.get("email") or "").lower() == email), None)
        if user and not user.get("emailVerified"):
            try:
                from .views_common import _issue_emailverify_token_from_dict
                tok = _issue_emailverify_token_from_dict(user)
                print("[dev] Email verification link:", f"/verify-email?token={tok}")
            except Exception:
                pass
    resp = JsonResponse({"success": True, "message": "If an account exists and is unverified, a link has been sent."})
    resp.status_code = 202
    return resp

from django.db import transaction
from django.contrib.auth.hashers import make_password
from .views_common import _issue_emailverify_token_from_db, _issue_emailverify_token_from_dict, _now_iso
from .emails import email_user_email_verification

@rate_limit(limit=3, window_seconds=60)
@require_http_methods(["POST"]) 
def auth_register(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}

    name = (data.get("name") or "").strip() or (data.get("firstName", "").strip() + " " + data.get("lastName", "").strip()).strip() or "New User"
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""
    role = "staff"
    phone = (data.get("contactNumber") or data.get("phone") or "").strip()

    if not email:
        return JsonResponse({"success": False, "message": "Email is required"}, status=400)
    try:
        from django.core.validators import validate_email
        validate_email(email)
    except Exception:
        return JsonResponse({"success": False, "message": "Enter a valid email address"}, status=400)

    if len(password) < 8:
        return JsonResponse({"success": False, "message": "Password must be at least 8 characters"}, status=400)

    try:
        from .models import AppUser, AccessRequest
        _maybe_seed_from_memory()
        db_user = AppUser.objects.filter(email=email).first()
        if not db_user:
            with transaction.atomic():
                db_user = AppUser.objects.create(
                    email=email,
                    name=name,
                    role=role,
                    status="pending",
                    permissions=[],
                    password_hash=make_password(password) if password else "",
                    email_verified=False,
                    phone=phone,
                )
        try:
            AccessRequest.objects.get_or_create(user=db_user)
        except Exception:
            pass
        safe_user = _safe_user_from_db(db_user)
        try:
            token = _issue_emailverify_token_from_db(db_user)
            base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:8080").rstrip("/")
            link = f"{base}/verify-email?token={token}"
            email_user_email_verification(db_user.email, link)
        except Exception:
            pass
        return JsonResponse({
            "success": True,
            "pending": True,
            "user": safe_user,
            "verifyToken": _issue_verify_token_from_db(db_user),
            "emailVerificationSent": True,
        })
    except (OperationalError, ProgrammingError):
        pass

    existing = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
    if existing:
        base_user = existing
    else:
        base_user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "role": "staff",
            "status": "pending",
            "createdAt": _now_iso(),
            "lastLogin": None,
            "permissions": [],
            "password": password,
            "emailVerified": False,
            "phone": phone,
        }
        USERS.append(base_user)
    safe_user = {k: v for k, v in base_user.items() if k != "password"}
    try:
        token = _issue_emailverify_token_from_dict(safe_user)
        print("[dev] Email verification link:", f"/verify-email?token={token}")
    except Exception:
        pass
    return JsonResponse({"success": True, "pending": True, "user": safe_user, "verifyToken": _issue_verify_token_from_dict(safe_user), "emailVerificationSent": True})


from datetime import timedelta
import hashlib
import secrets
from .views_common import _email_rate_key, _issue_pwdreset_token_from_dict, _decode_pwdcommit_token, _issue_pwdcommit_token_from_db, _decode_pwdreset_token, _revoke_all_refresh_tokens, _revoke_all_refresh_tokens_mem
from .emails import email_user_password_reset

@rate_limit(limit=5, window_seconds=60, key_fn=_email_rate_key)
@require_http_methods(["POST"]) 
def forgot_password(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()

    debug_link = None
    if email:
        try:
            from .models import AppUser, ResetToken
            _maybe_seed_from_memory()
            db_user = AppUser.objects.filter(email=email).first()
            if db_user:
                raw = secrets.token_urlsafe(32)
                code = f"{secrets.randbelow(1000000):06d}"
                rhash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
                chash = hashlib.sha256(code.encode("utf-8")).hexdigest()
                ttl_seconds = 15 * 60
                ua = request.META.get("HTTP_USER_AGENT", "")[:255]
                ip = request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR") or ""
                ip = (ip.split(",")[0].strip() if "," in ip else ip)[:64]
                ResetToken.objects.create(
                    user=db_user,
                    token_hash=rhash,
                    code_hash=chash,
                    expires_at=dj_timezone.now() + timedelta(seconds=ttl_seconds),
                    user_agent=ua,
                    ip_address=ip,
                )
                try:
                    base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:8080").rstrip("/")
                    link = f"{base}/reset-password?token={raw}"
                    if getattr(settings, "DEBUG", False):
                        debug_link = link
                    email_user_password_reset(email, link, code=code, expires_minutes=15)
                except Exception:
                    pass
            else:
                user = next((u for u in USERS if (u.get("email") or "").lower() == email), None)
                if user:
                    token = _issue_pwdreset_token_from_dict(user)
                    try:
                        base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:8080").rstrip("/")
                        link = f"{base}/reset-password?token={token}"
                        if getattr(settings, "DEBUG", False):
                            debug_link = link
                        email_user_password_reset(email, link)
                    except Exception:
                        pass
        except Exception:
            pass

    payload = {"success": True, "message": "If an account exists for this email, a reset link has been sent."}
    if debug_link:
        payload["debugResetLink"] = debug_link
    resp = JsonResponse(payload)
    resp.status_code = 202
    return resp


@rate_limit(limit=5, window_seconds=60)
@require_http_methods(["POST"]) 
def reset_password(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    token = (data.get("token") or "").strip()
    new_password = data.get("newPassword") or data.get("password") or ""
    if not token:
        return JsonResponse({"success": False, "message": "Missing token"}, status=400)
    if not new_password or len(new_password) < 8:
        return JsonResponse({"success": False, "message": "Password must be at least 8 characters"}, status=400)

    from .views_common import _decode_pwdcommit_token, _decode_pwdreset_token, _revoke_all_refresh_tokens, _revoke_all_refresh_tokens_mem
    payload_commit = _decode_pwdcommit_token(token)
    if payload_commit:
        email = (payload_commit.get("email") or "").lower().strip()
        rid = (payload_commit.get("rid") or "").strip()
        try:
            from .models import AppUser, ResetToken
            u = AppUser.objects.filter(email=email).first()
            if not u:
                return JsonResponse({"success": False, "message": "Invalid token"}, status=400)
            if rid:
                rt = ResetToken.objects.filter(id=rid).first()
                if rt and rt.is_active:
                    rt.used_at = dj_timezone.now()
                    rt.save(update_fields=["used_at"])
            from django.contrib.auth.hashers import make_password
            u.password_hash = make_password(new_password)
            u.save(update_fields=["password_hash"])
            _revoke_all_refresh_tokens(u)
            return JsonResponse({"success": True, "message": "Password reset successful"})
        except (OperationalError, ProgrammingError):
            pass

    try:
        from .models import AppUser, ResetToken
        raw = token
        rhash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        rt = ResetToken.objects.select_related("user").filter(token_hash=rhash).first()
        if not rt or not rt.is_active:
            raise OperationalError("not found")
        u = rt.user
        from django.contrib.auth.hashers import make_password
        u.password_hash = make_password(new_password)
        u.save(update_fields=["password_hash"])
        rt.used_at = dj_timezone.now()
        rt.save(update_fields=["used_at"])
        _revoke_all_refresh_tokens(u)
        return JsonResponse({"success": True, "message": "Password reset successful"})
    except (OperationalError, ProgrammingError):
        pass

    payload = _decode_pwdreset_token(token)
    if not payload:
        return JsonResponse({"success": False, "message": "Invalid or expired token"}, status=400)
    user_id = str(payload.get("sub") or "")
    email = (payload.get("email") or "").lower().strip()
    user = None
    if email:
        user = next((x for x in USERS if (x.get("email") or "").lower() == email), None)
    if not user and user_id:
        user = next((x for x in USERS if str(x.get("id")) == user_id), None)
    if not user:
        return JsonResponse({"success": False, "message": "Invalid token"}, status=400)
    user["password"] = new_password
    _revoke_all_refresh_tokens_mem(user)
    return JsonResponse({"success": True, "message": "Password reset successful"})


@rate_limit(limit=5, window_seconds=60, key_fn=_email_rate_key)
@require_http_methods(["POST"]) 
def reset_password_code(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()
    code = (data.get("code") or "").strip()
    new_password = data.get("newPassword") or data.get("password") or ""
    if not email or not code or not new_password or len(new_password) < 8:
        return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
    try:
        from .models import AppUser, ResetToken
        u = AppUser.objects.filter(email=email).first()
        if not u:
            return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
        tokens = ResetToken.objects.filter(user=u, used_at__isnull=True, revoked_at__isnull=True).order_by("-created_at")
        chash = hashlib.sha256(code.encode("utf-8")).hexdigest()
        ok = None
        for rt in tokens:
            if not rt.is_active:
                continue
            if rt.code_hash and rt.code_hash == chash:
                ok = rt
                break
        if not ok:
            return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
        from django.contrib.auth.hashers import make_password
        u.password_hash = make_password(new_password)
        u.save(update_fields=["password_hash"])
        ok.used_at = dj_timezone.now()
        ok.save(update_fields=["used_at"])
        from .views_common import _revoke_all_refresh_tokens
        _revoke_all_refresh_tokens(u)
        return JsonResponse({"success": True, "message": "Password reset successful"})
    except (OperationalError, ProgrammingError):
        return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)


@rate_limit(limit=5, window_seconds=60, key_fn=_email_rate_key)
@require_http_methods(["POST"]) 
def verify_reset_code(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    email = (data.get("email") or "").lower().strip()
    code = (data.get("code") or "").strip()
    if not email or not code:
        return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
    try:
        from .models import AppUser, ResetToken
        u = AppUser.objects.filter(email=email).first()
        if not u:
            return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
        tokens = ResetToken.objects.filter(user=u, used_at__isnull=True, revoked_at__isnull=True).order_by("-created_at")
        chash = hashlib.sha256(code.encode("utf-8")).hexdigest()
        ok = None
        for rt in tokens:
            if not rt.is_active:
                continue
            if rt.code_hash and rt.code_hash == chash:
                ok = rt
                break
        if not ok:
            return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)
        from .views_common import _issue_pwdcommit_token_from_db
        commit = _issue_pwdcommit_token_from_db(u, ok.id)
        return JsonResponse({"success": True, "commitToken": commit})
    except (OperationalError, ProgrammingError):
        return JsonResponse({"success": False, "message": "Invalid or expired code"}, status=400)


@require_http_methods(["POST"]) 
def refresh_token(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    rtoken = (data.get("refreshToken") or "").strip()
    if not rtoken:
        return JsonResponse({"success": False, "message": "Missing refresh token"}, status=400)

    try:
        from .models import RefreshToken
        import hashlib
        rhash = hashlib.sha256(rtoken.encode("utf-8")).hexdigest()
        rt = RefreshToken.objects.select_related("user").filter(token_hash=rhash).first()
        if not rt or not rt.is_active:
            return JsonResponse({"success": False, "message": "Invalid or expired refresh token"}, status=401)
        user = rt.user
        status_l = (user.status or "").lower()
        if status_l == "deactivated":
            return JsonResponse({
                "success": False,
                "message": "Your account is currently deactivated, to activate please contact the admin.",
            }, status=403)
        if status_l != "active":
            return JsonResponse({
                "success": False,
                "message": "Account pending approval",
            }, status=403)
        rt.revoked_at = dj_timezone.now()
        rt.save(update_fields=["revoked_at"])
        new_refresh = _issue_refresh_token_db(user, remember=rt.remember, request=request, rotated_from=rt)
        access_ttl = settings.JWT_REMEMBER_EXP_SECONDS if rt.remember else settings.JWT_EXP_SECONDS
        new_access = _issue_jwt(user, exp_seconds=access_ttl)
        return JsonResponse({"success": True, "token": new_access, "refreshToken": new_refresh})
    except (OperationalError, ProgrammingError):
        pass
    except Exception:
        pass

    out = _rotate_refresh_token_mem(rtoken, request=request)
    if not out:
        return JsonResponse({"success": False, "message": "Invalid or expired refresh token"}, status=401)
    return JsonResponse({"success": True, "token": out["token"], "refreshToken": out["refreshToken"]})


@require_http_methods(["POST"]) 
def change_password(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        data = {}
    current = data.get("currentPassword") or data.get("current") or ""
    new = data.get("newPassword") or data.get("password") or ""
    if not new or len(new) < 8:
        return JsonResponse({"success": False, "message": "Password must be at least 8 characters"}, status=400)

    email = (payload.get("email") or "").lower().strip()
    user_id = str(payload.get("sub") or "")
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
        if not u.password_hash or not current or not check_password(current, u.password_hash):
            return JsonResponse({"success": False, "message": "Invalid current password"}, status=400)
        from django.contrib.auth.hashers import make_password
        u.password_hash = make_password(new)
        u.save(update_fields=["password_hash"])
        return JsonResponse({"success": True})
    except (OperationalError, ProgrammingError):
        pass

    user = None
    if email:
        user = next((x for x in USERS if (x.get("email") or "").lower() == email), None)
    if not user and user_id:
        user = next((x for x in USERS if str(x.get("id")) == user_id), None)
    if not user:
        return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
    if not current or user.get("password") != current:
        return JsonResponse({"success": False, "message": "Invalid current password"}, status=400)
    user["password"] = new
    return JsonResponse({"success": True})

__all__ = [
    "health",
    "auth_login",
    "auth_logout",
    "auth_register",
    "forgot_password",
    "reset_password",
    "reset_password_code",
    "verify_reset_code",
    "refresh_token",
    "change_password",
    "auth_me",
    "auth_google",
    "verify_email",
    "resend_verification",
]

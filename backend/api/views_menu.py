"""Menu item endpoints (list, detail, availability, image) backed by DB.

Production readiness goals:
- No in-memory fallbacks when DISABLE_INMEM_FALLBACK is enabled (default in non-DEBUG).
- Strong input validation and clear 4xx errors.
- Bounded pagination and safe sorting fields.
- Validated image uploads (type/size) using Pillow.
"""

import json
import uuid
from datetime import datetime
import os
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from django.db import transaction
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.paginator import Paginator
from django.utils import timezone as dj_tz
from django.conf import settings
from .views_common import MENU_ITEMS, _paginate, _actor_from_request, _has_permission
from .utils_audit import record_audit


def _safe_menu_item(mi):
    try:
        return {
            "id": str(mi.id),
            "name": mi.name,
            "description": mi.description or "",
            "category": mi.category or "",
            "price": float(mi.price or 0),
            "available": bool(mi.available),
            "archived": bool(getattr(mi, "archived", False)),
            "archivedAt": mi.archived_at.isoformat() if getattr(mi, "archived_at", None) else None,
            "image": (mi.image.url if getattr(mi, "image", None) else None),
            "ingredients": getattr(mi, "ingredients", []) or [],
            "preparationTime": getattr(mi, "preparation_time", 0) or 0,
            "createdAt": mi.created_at.isoformat() if getattr(mi, "created_at", None) else None,
            "updatedAt": mi.updated_at.isoformat() if getattr(mi, "updated_at", None) else None,
        }
    except Exception:
        # Fallback for in-memory dicts to keep compatibility if ever used
        return {
            "id": str(getattr(mi, "id", "")),
            "name": getattr(mi, "name", "Unnamed"),
            "description": getattr(mi, "description", ""),
            "category": getattr(mi, "category", ""),
            "price": float(getattr(mi, "price", 0) or 0),
            "available": bool(getattr(mi, "available", True)),
            "archived": bool(getattr(mi, "archived", False)),
            "archivedAt": getattr(mi, "archivedAt", None),
            "image": getattr(mi, "image", None),
            "ingredients": getattr(mi, "ingredients", []) or [],
            "preparationTime": getattr(mi, "preparationTime", 0) or 0,
        }


def _record_menu_audit(request, actor, action, details, severity="info", meta=None):
    try:
        record_audit(
            request,
            user=actor if hasattr(actor, "id") else None,
            type="action",
            action=action,
            details=details,
            severity=severity,
            meta=meta or {},
        )
    except Exception:
        pass


def _archive_menu_item_instance(request, actor, menu_item):
    changed = False
    if menu_item and not bool(getattr(menu_item, "archived", False)):
        menu_item.archived = True
        menu_item.archived_at = dj_tz.now()
        menu_item.available = False
        menu_item.save(update_fields=["archived", "archived_at", "available", "updated_at"])
        changed = True
        _record_menu_audit(
            request,
            actor,
            action="Menu item archived",
            details=f"Archived '{menu_item.name}'",
            severity="warning",
            meta={"id": str(menu_item.id), "name": menu_item.name},
        )
    return changed, _safe_menu_item(menu_item)


def _restore_menu_item_instance(request, actor, menu_item):
    changed = False
    if menu_item and bool(getattr(menu_item, "archived", False)):
        menu_item.archived = False
        menu_item.archived_at = None
        menu_item.available = False  # restored items remain unavailable until explicitly enabled
        menu_item.save(update_fields=["archived", "archived_at", "available", "updated_at"])
        changed = True
        _record_menu_audit(
            request,
            actor,
            action="Menu item restored",
            details=f"Restored '{menu_item.name}' from archive",
            severity="info",
            meta={"id": str(menu_item.id), "name": menu_item.name},
        )
    return changed, _safe_menu_item(menu_item)


def _archive_menu_item_fallback(request, actor, item_dict):
    changed = not bool(item_dict.get("archived"))
    item_dict["archived"] = True
    item_dict["available"] = False
    item_dict["archivedAt"] = dj_tz.now().isoformat()
    if changed:
        _record_menu_audit(
            request,
            actor,
            action="Menu item archived",
            details=f"Archived '{item_dict.get('name','Unnamed')}'",
            severity="warning",
            meta={"id": item_dict.get("id"), "name": item_dict.get("name")},
        )
    return changed, item_dict


def _restore_menu_item_fallback(request, actor, item_dict):
    changed = bool(item_dict.get("archived"))
    item_dict["archived"] = False
    item_dict["archivedAt"] = None
    item_dict["available"] = False
    if changed:
        _record_menu_audit(
            request,
            actor,
            action="Menu item restored",
            details=f"Restored '{item_dict.get('name','Unnamed')}' from archive",
            severity="info",
            meta={"id": item_dict.get("id"), "name": item_dict.get("name")},
        )
    return changed, item_dict

@require_http_methods(["GET", "POST"]) 
def menu_items(request):
    if request.method == "GET":
        try:
            from .models import MenuItem
            search = (request.GET.get("search") or request.GET.get("q") or "").strip()
            category = (request.GET.get("category") or "").strip()
            available = request.GET.get("available")
            try:
                page = int(request.GET.get("page", 1) or 1)
            except Exception:
                page = 1
            try:
                limit = int(request.GET.get("limit", 50) or 50)
            except Exception:
                limit = 50
            page = max(1, page)
            limit = max(1, min(200, limit))

            qs = MenuItem.objects.all()
            archived_param = request.GET.get("archived")
            if archived_param is None or archived_param == "":
                qs = qs.filter(archived=False)
            else:
                val = str(archived_param).lower() in {"1", "true", "yes"}
                qs = qs.filter(archived=val)
            if search:
                qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(category__icontains=search))
            if category:
                qs = qs.filter(category__iexact=category)
            if available is not None and available != "":
                val = str(available).lower() in {"1", "true", "yes"}
                qs = qs.filter(available=val)
            sort_by = request.GET.get("sortBy") or "name"
            sort_dir = (request.GET.get("sortDir") or "asc").lower()
            order = ("-" if sort_dir == "desc" else "") + (sort_by if sort_by in {"name", "category", "price", "created_at", "updated_at"} else "name")
            qs = qs.order_by(order)
            paginator = Paginator(qs, limit)
            page_obj = paginator.get_page(page)
            items = [_safe_menu_item(it) for it in page_obj.object_list]
            pagination = {
                "page": page_obj.number,
                "limit": limit,
                "total": paginator.count,
                "totalPages": paginator.num_pages,
            }
            return JsonResponse({"success": True, "data": items, "pagination": pagination})
        except Exception:
            # Fallback to in-memory only allowed in development when explicitly enabled
            if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
                return JsonResponse({"success": False, "message": "Failed to load menu items"}, status=500)
            search = (request.GET.get("search") or request.GET.get("q") or "").lower()
            category = (request.GET.get("category") or "").lower()
            available = request.GET.get("available")
            archived_param = request.GET.get("archived")
            page = request.GET.get("page", 1)
            limit = request.GET.get("limit", 50)
            data = MENU_ITEMS
            if archived_param is None or archived_param == "":
                data = [i for i in data if not i.get("archived")]
            else:
                val = str(archived_param).lower() in {"1", "true", "yes"}
                data = [i for i in data if bool(i.get("archived")) == val]
            if search:
                data = [i for i in data if search in i.get("name", "").lower() or search in i.get("description", "").lower()]
            if category:
                data = [i for i in data if i.get("category", "").lower() == category]
            if available is not None and available != "":
                val = str(available).lower() in {"1", "true", "yes"}
                data = [i for i in data if bool(i.get("available", False)) == val]
            sort_by = request.GET.get("sortBy") or "name"
            sort_dir = (request.GET.get("sortDir") or "asc").lower()
            reverse = sort_dir == "desc"
            try:
                data = sorted(data, key=lambda x: str(x.get(sort_by, "")).lower(), reverse=reverse)
            except Exception:
                pass
            page_data, pagination = _paginate(data, page, limit)
            return JsonResponse({"success": True, "data": page_data, "pagination": pagination})

    # Create item -> require menu.manage permission
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from decimal import Decimal, ROUND_HALF_UP
        from .models import MenuItem
        payload = json.loads(request.body.decode("utf-8") or "{}")
        name = (payload.get("name") or "").strip()
        if not name:
            return JsonResponse({"success": False, "message": "name is required"}, status=400)
        category = (payload.get("category") or "General").strip()
        description = (payload.get("description") or "").strip() or None
        # price validation
        try:
            price = Decimal(str(payload.get("price") or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        except Exception:
            return JsonResponse({"success": False, "message": "price must be a number"}, status=400)
        if price < 0:
            return JsonResponse({"success": False, "message": "price cannot be negative"}, status=400)
        # ingredients must be a list
        ingredients = payload.get("ingredients") or []
        if not isinstance(ingredients, list):
            return JsonResponse({"success": False, "message": "ingredients must be a list"}, status=400)
        # preparation time
        try:
            prep = int(payload.get("preparationTime") or 0)
        except Exception:
            return JsonResponse({"success": False, "message": "preparationTime must be an integer"}, status=400)
        if prep < 0:
            return JsonResponse({"success": False, "message": "preparationTime cannot be negative"}, status=400)
        available = bool(payload.get("available", True))
        with transaction.atomic():
            mi = MenuItem.objects.create(
                name=name,
                description=description,
                price=price,
                category=category,
                available=available,
                ingredients=ingredients,
                preparation_time=prep,
            )
        item = _safe_menu_item(mi)
    except Exception:
        if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
            return JsonResponse({"success": False, "message": "Failed to create menu item"}, status=500)
        # Fallback to in-memory add (dev only)
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
            "archived": False,
            "archivedAt": None,
            "image": payload.get("image"),
            "ingredients": payload.get("ingredients") or [],
            "preparationTime": payload.get("preparationTime"),
        }
        MENU_ITEMS.append(item)
    try:
        record_audit(
            request,
            user=actor,
            type="action",
            action="Menu item created",
            details=f"Created '{item.get('name','Unnamed')}'",
            severity="info",
            meta={"id": item.get("id"), "name": item.get("name"), "price": item.get("price")},
        )
    except Exception:
        pass
    return JsonResponse({"success": True, "data": item})


@require_http_methods(["GET", "PUT", "DELETE"]) 
def menu_item_detail(request, item_id):
    try:
        from .models import MenuItem
        mi = MenuItem.objects.filter(id=item_id).first()
        if not mi:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        if request.method == "GET":
            return JsonResponse({"success": True, "data": _safe_menu_item(mi)})
    except Exception:
        if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
            return JsonResponse({"success": False, "message": "Failed to load menu item"}, status=500)
        mi = None
        idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
        if idx == -1:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        if request.method == "GET":
            return JsonResponse({"success": True, "data": MENU_ITEMS[idx]})
    # For updates/deletes, require menu.manage (manager/admin)
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        if request.method == "DELETE":
            if mi:
                _, payload = _archive_menu_item_instance(request, actor, mi)
                return JsonResponse({"success": True, "data": payload})
            if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
                return JsonResponse({"success": False, "message": "Not found"}, status=404)
            idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
            if idx == -1:
                return JsonResponse({"success": False, "message": "Not found"}, status=404)
            _, payload = _archive_menu_item_fallback(request, actor, MENU_ITEMS[idx])
            return JsonResponse({"success": True, "data": payload})
        # Update
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}
        if mi:
            from decimal import Decimal, ROUND_HALF_UP
            fields = {}
            for k in ["name", "description", "category"]:
                if k in payload and payload[k] is not None:
                    val = str(payload[k]).strip()
                    if k == "name" and not val:
                        return JsonResponse({"success": False, "message": "name cannot be empty"}, status=400)
                    if k == "description" and val == "":
                        fields[k] = None
                    else:
                        fields[k] = val
            if "price" in payload:
                try:
                    price = Decimal(str(payload.get("price") or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                except Exception:
                    return JsonResponse({"success": False, "message": "price must be a number"}, status=400)
                if price < 0:
                    return JsonResponse({"success": False, "message": "price cannot be negative"}, status=400)
                fields["price"] = price
            if "available" in payload:
                desired_available = bool(payload["available"])
                if getattr(mi, "archived", False) and desired_available:
                    return JsonResponse({"success": False, "message": "Archived items cannot be made available"}, status=400)
                fields["available"] = desired_available
            if "ingredients" in payload:
                ingredients = payload.get("ingredients")
                if ingredients is not None and not isinstance(ingredients, list):
                    return JsonResponse({"success": False, "message": "ingredients must be a list"}, status=400)
                if ingredients is not None:
                    fields["ingredients"] = ingredients
            if "preparationTime" in payload:
                try:
                    prep = int(payload.get("preparationTime") or 0)
                except Exception:
                    return JsonResponse({"success": False, "message": "preparationTime must be an integer"}, status=400)
                if prep < 0:
                    return JsonResponse({"success": False, "message": "preparationTime cannot be negative"}, status=400)
                fields["preparation_time"] = prep
            for k, v in fields.items():
                setattr(mi, k, v)
            mi.save()
            item = _safe_menu_item(mi)
        else:
            if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
                return JsonResponse({"success": False, "message": "Not found"}, status=404)
            idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
            item = MENU_ITEMS[idx]
            for k in ["name", "description", "category", "image", "ingredients", "preparationTime"]:
                if k in payload:
                    item[k] = payload[k]
            if "available" in payload:
                if item.get("archived") and payload.get("available"):
                    return JsonResponse({"success": False, "message": "Archived items cannot be made available"}, status=400)
                item["available"] = bool(payload.get("available"))
            if "price" in payload:
                try:
                    item["price"] = float(payload["price"])
                except Exception:
                    pass
            MENU_ITEMS[idx] = item
    except Exception:
        return JsonResponse({"success": False, "message": "Failed to update"}, status=500)
    try:
        record_audit(
            request,
            user=actor,
            type="action",
            action="Menu item updated",
            details=f"Updated '{item.get('name','Unnamed')}'",
            severity="info",
            meta={"id": item.get("id"), "name": item.get("name")},
        )
    except Exception:
        pass
    return JsonResponse({"success": True, "data": item})


@require_http_methods(["POST"])
def menu_item_archive(request, item_id):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    db_error = False
    mi = None
    try:
        from .models import MenuItem
        mi = MenuItem.objects.filter(id=item_id).first()
    except Exception:
        db_error = True
    if mi:
        _, payload = _archive_menu_item_instance(request, actor, mi)
        return JsonResponse({"success": True, "data": payload})
    if not db_error:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
        return JsonResponse({"success": False, "message": "Failed to archive menu item"}, status=500)
    idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    _, payload = _archive_menu_item_fallback(request, actor, MENU_ITEMS[idx])
    return JsonResponse({"success": True, "data": payload})


@require_http_methods(["POST"])
def menu_item_restore(request, item_id):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    db_error = False
    mi = None
    try:
        from .models import MenuItem
        mi = MenuItem.objects.filter(id=item_id).first()
    except Exception:
        db_error = True
    if mi:
        _, payload = _restore_menu_item_instance(request, actor, mi)
        return JsonResponse({"success": True, "data": payload})
    if not db_error:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
        return JsonResponse({"success": False, "message": "Failed to restore menu item"}, status=500)
    idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    _, payload = _restore_menu_item_fallback(request, actor, MENU_ITEMS[idx])
    return JsonResponse({"success": True, "data": payload})


@require_http_methods(["PATCH"]) 
def menu_item_availability(request, item_id):
    # Try DB first
    try:
        from .models import MenuItem
        mi = MenuItem.objects.filter(id=item_id).first()
        if not mi:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
    except Exception:
        if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
            return JsonResponse({"success": False, "message": "Failed to load menu item"}, status=500)
        mi = None
        idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
        if idx == -1:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    if mi and getattr(mi, "archived", False):
        return JsonResponse({"success": False, "message": "Archived items cannot be made available"}, status=400)
    if mi is None and MENU_ITEMS[idx].get("archived"):
        return JsonResponse({"success": False, "message": "Archived items cannot be made available"}, status=400)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    available = bool(payload.get("available", True))
    try:
        if mi:
            mi.available = available
            mi.save(update_fields=["available", "updated_at"])
            updated = _safe_menu_item(mi)
        else:
            if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
                return JsonResponse({"success": False, "message": "Not found"}, status=404)
            MENU_ITEMS[idx]["available"] = available
            updated = MENU_ITEMS[idx]
    except Exception:
        return JsonResponse({"success": False, "message": "Failed to update"}, status=500)
    try:
        record_audit(
            request,
            user=actor,
            type="action",
            action="Menu availability updated",
            details=f"Set availability for '{MENU_ITEMS[idx].get('name','Unnamed')}'",
            severity="info",
            meta={"id": MENU_ITEMS[idx].get("id"), "available": MENU_ITEMS[idx].get("available")},
        )
    except Exception:
        pass
    return JsonResponse({"success": True, "data": updated})


@require_http_methods(["POST"]) 
def menu_item_image(request, item_id):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        from .models import MenuItem
        mi = MenuItem.objects.filter(id=item_id).first()
        if not mi:
            return JsonResponse({"success": False, "message": "Not found"}, status=404)
        # Expect multipart form data with field 'image'
        img = request.FILES.get("image")
        if not img:
            return JsonResponse({"success": False, "message": "No image uploaded"}, status=400)
        # Basic validation: type and size
        allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
        if getattr(img, "content_type", "") not in allowed_types:
            return JsonResponse({"success": False, "message": "Unsupported image type"}, status=400)
        # Configurable size limit (default 25 MB); set DJANGO_MENU_IMAGE_MAX_MB env to override
        try:
            max_mb = int(os.getenv("DJANGO_MENU_IMAGE_MAX_MB", "25"))
        except Exception:
            max_mb = 25
        max_size = max_mb * 1024 * 1024
        if getattr(img, "size", 0) > max_size:
            return JsonResponse({"success": False, "message": f"Image too large (max {max_mb}MB)"}, status=400)
        # Try to verify via Pillow
        try:
            from PIL import Image
            img.file.seek(0)
            with Image.open(img.file) as im:
                im.verify()
            img.file.seek(0)
        except Exception:
            return JsonResponse({"success": False, "message": "Invalid image"}, status=400)
        storage_name = mi.image.field.generate_filename(mi, img.name)
        if default_storage.exists(storage_name):
            mi.image.name = storage_name
            mi.save(update_fields=["image", "updated_at"])
        else:
            mi.image.save(img.name, img, save=True)
        image_url = mi.image.url if getattr(mi, "image", None) else None
    except Exception:
        if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
            return JsonResponse({"success": False, "message": "Failed to upload image"}, status=500)
        # Fallback: simulate URL when storage unavailable (dev only)
        image_url = f"/images/menu/{item_id}-{int(datetime.now().timestamp())}.jpg"
    try:
        record_audit(
            request,
            user=actor,
            type="action",
            action="Menu image updated",
            details=f"Uploaded image for item {item_id}",
            severity="info",
            meta={"id": item_id, "imageUrl": image_url},
        )
    except Exception:
        pass
    return JsonResponse({"success": True, "data": {"imageUrl": image_url}})


@require_http_methods(["GET"]) 
def menu_categories(request):
    try:
        from .models import MenuItem
        rows = (
            MenuItem.objects.filter(archived=False)
            .values_list("category")
            .order_by("category")
            .distinct()
        )
        cats = [c[0] or "" for c in rows]
        # Optional counts
        out = []
        for name in cats:
            count = MenuItem.objects.filter(category=name, archived=False).count()
            out.append({
                "id": (name or "").lower().replace(" ", "_") or "uncategorized",
                "name": name or "Uncategorized",
                "itemCount": count,
            })
        return JsonResponse({"success": True, "data": out})
    except Exception:
        if getattr(settings, "DISABLE_INMEM_FALLBACK", False):
            return JsonResponse({"success": False, "data": [], "message": "Failed to load categories"}, status=500)
        # Fallback based on in-memory items (dev only)
        try:
            names = sorted({(i.get("category") or "") for i in MENU_ITEMS if not i.get("archived")})
            out = []
            for name in names:
                out.append({
                    "id": (name or "").lower().replace(" ", "_") or "uncategorized",
                    "name": name or "Uncategorized",
                    "itemCount": len([1 for i in MENU_ITEMS if (i.get("category") or "") == name and not i.get("archived")]),
                })
            return JsonResponse({"success": True, "data": out})
        except Exception:
            return JsonResponse({"success": True, "data": []})


__all__ = [
    "menu_items",
    "menu_item_detail",
    "menu_item_archive",
    "menu_item_restore",
    "menu_item_availability",
    "menu_item_image",
    "menu_categories",
]

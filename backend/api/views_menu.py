"""Menu item endpoints (list, detail, availability, image)."""

import json
import uuid
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .views_common import MENU_ITEMS, _paginate, _actor_from_request, _has_permission
from .utils_audit import record_audit


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
    if request.method == "DELETE":
        deleted = MENU_ITEMS.pop(idx)
        try:
            record_audit(
                request,
                user=actor,
                type="action",
                action="Menu item deleted",
                details=f"Deleted '{deleted.get('name','Unnamed')}'",
                severity="warning",
                meta={"id": deleted.get("id"), "name": deleted.get("name")},
            )
        except Exception:
            pass
        return JsonResponse({"success": True})
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    item = MENU_ITEMS[idx]
    for k in ["name", "description", "category", "available", "image", "ingredients", "preparationTime"]:
        if k in payload:
            item[k] = payload[k]
    if "price" in payload:
        try:
            item["price"] = float(payload["price"])
        except Exception:
            pass
    MENU_ITEMS[idx] = item
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


@require_http_methods(["PATCH"]) 
def menu_item_availability(request, item_id):
    idx = next((i for i, it in enumerate(MENU_ITEMS) if it.get("id") == item_id), -1)
    if idx == -1:
        return JsonResponse({"success": False, "message": "Not found"}, status=404)
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    MENU_ITEMS[idx]["available"] = bool(payload.get("available", True))
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
    return JsonResponse({"success": True, "data": MENU_ITEMS[idx]})


@require_http_methods(["POST"]) 
def menu_item_image(request, item_id):
    actor, err = _actor_from_request(request)
    if not actor:
        return err
    if not _has_permission(actor, "menu.manage") and not _has_permission(actor, "inventory.menu.manage"):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    fake_url = f"/images/menu/{item_id}-{int(datetime.now().timestamp())}.jpg"
    try:
        record_audit(
            request,
            user=actor,
            type="action",
            action="Menu image updated",
            details=f"Uploaded image for item {item_id}",
            severity="info",
            meta={"id": item_id, "imageUrl": fake_url},
        )
    except Exception:
        pass
    return JsonResponse({"success": True, "data": {"imageUrl": fake_url}})


__all__ = [
    "menu_items",
    "menu_item_detail",
    "menu_item_availability",
    "menu_item_image",
]

"""Menu item endpoints (list, detail, availability, image)."""

import json
import uuid
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .views_common import MENU_ITEMS, _paginate


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
    fake_url = f"/images/menu/{item_id}-{int(datetime.now().timestamp())}.jpg"
    return JsonResponse({"success": True, "data": {"imageUrl": fake_url}})


__all__ = [
    "menu_items",
    "menu_item_detail",
    "menu_item_availability",
    "menu_item_image",
]

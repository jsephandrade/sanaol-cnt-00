from __future__ import annotations

import json
from typing import Any, Dict, Optional

from rest_framework.response import Response


def normalize_json_response(django_response) -> Response:
    """Convert an existing JsonResponse into a DRF Response with `data` / `meta` structure."""
    try:
        raw = django_response.content.decode("utf-8")
        payload = json.loads(raw) if raw else {}
    except Exception:
        payload = {}

    status_code = django_response.status_code

    if status_code < 400 and isinstance(payload, dict):
        meta = payload.get("meta") or {}
        data_section = payload.get("data")
        if data_section is None:
            reserved = {"meta", "success", "message"}
            data_section = {k: v for k, v in payload.items() if k not in reserved}
        else:
            reserved = {"success", "message"}
        for key in ("success", "message"):
            if key in payload and key not in meta:
                meta[key] = payload[key]

        body: Dict[str, Any] = {"data": data_section}
        if meta:
            body["meta"] = meta
    else:
        body = payload if isinstance(payload, dict) else {"detail": payload}

    response = Response(body, status=status_code)
    for header, value in django_response.items():
        response[header] = value
    return response


def prepare_legacy_request(request, payload: Dict[str, Any], *, headers: Optional[Dict[str, str]] = None):
    """Mutate the underlying Django request so legacy JSON views can consume it."""
    raw = json.dumps(payload or {}).encode("utf-8")
    legacy_request = request._request
    legacy_request._body = raw  # type: ignore[attr-defined]
    legacy_request.META["CONTENT_LENGTH"] = str(len(raw))
    legacy_request.META["CONTENT_TYPE"] = "application/json"
    if headers:
        for key, value in headers.items():
            legacy_request.META[key] = value
    return legacy_request

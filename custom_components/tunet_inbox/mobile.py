"""Mobile delivery helpers for Tunet Inbox."""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, HomeAssistant

from .const import (
    FAILURE_INVALID_MOBILE_MAPPING,
    FAILURE_MOBILE_CLEAR_FAILED,
    FAILURE_MOBILE_SEND_FAILED,
    INBOX_TAP_URL,
)
from .models import InboxItem, parse_raw_mobile_action


def _resolve_notify_service(
    hass: HomeAssistant,
    item: InboxItem,
    default_notify_target: str | None,
) -> str | None:
    candidate = (item.mobile.notify_service or default_notify_target or "").strip()
    if not candidate:
        return None
    if candidate.startswith("notify."):
        return candidate

    helper_state = hass.states.get(candidate)
    if helper_state is not None:
        device_id = helper_state.state.strip()
        if not device_id or device_id.lower() in {"unknown", "unavailable"}:
            return None
        return f"notify.mobile_app_{device_id}"

    return f"notify.mobile_app_{candidate}"


def _split_service_name(service_name: str) -> tuple[str, str]:
    if "." not in service_name:
        raise ValueError(f"invalid notify service: {service_name}")
    domain, service = service_name.split(".", 1)
    return domain, service


def build_raw_action(item_id: str, action_id: str) -> str:
    """Build the raw mobile action string."""
    return f"TINBOX|{item_id}|{action_id}"


def _resolve_tap_url(item: InboxItem, default_tap_url: str) -> str:
    """Return the governed inbox route for mobile notification body taps."""
    return item.mobile.url or default_tap_url or INBOX_TAP_URL


async def async_send_item_notification(
    hass: HomeAssistant,
    *,
    item: InboxItem,
    default_notify_target: str | None,
    default_tap_url: str = INBOX_TAP_URL,
) -> dict[str, Any]:
    """Send the mobile push that mirrors a queue item."""
    service_name = _resolve_notify_service(hass, item, default_notify_target)
    if not service_name:
        return {"ok": False, "reason": FAILURE_MOBILE_SEND_FAILED, "detail": "notify_service_missing"}

    try:
        domain, service = _split_service_name(service_name)
        notification_data = {
            "tag": item.mobile.tag,
            "actions": [
                {
                    "action": build_raw_action(item.item_id, action.id),
                    "title": action.title,
                }
                for action in item.actions
            ],
            "action_data": {
                "item_id": item.item_id,
                "key": item.key,
                "schema_version": item.schema_version,
                "family": item.family,
                "tag": item.mobile.tag,
            },
        }
        notification_data["url"] = _resolve_tap_url(item, default_tap_url)
        await hass.services.async_call(
            domain,
            service,
            {
                "title": item.title,
                "message": item.message,
                "data": notification_data,
            },
            blocking=True,
        )
    except Exception as err:  # pragma: no cover - runtime HA integration path
        return {"ok": False, "reason": FAILURE_MOBILE_SEND_FAILED, "detail": str(err)}

    return {"ok": True, "service": service_name}


async def async_clear_item_notification(
    hass: HomeAssistant,
    *,
    item: InboxItem,
    default_notify_target: str | None,
) -> dict[str, Any]:
    """Clear the matching mobile notification by tag."""
    service_name = _resolve_notify_service(hass, item, default_notify_target)
    if not service_name:
        return {"ok": False, "reason": FAILURE_MOBILE_CLEAR_FAILED, "detail": "notify_service_missing"}

    try:
        domain, service = _split_service_name(service_name)
        await hass.services.async_call(
            domain,
            service,
            {
                "message": "clear_notification",
                "data": {"tag": item.mobile.tag},
            },
            blocking=True,
        )
    except Exception as err:  # pragma: no cover - runtime HA integration path
        return {"ok": False, "reason": FAILURE_MOBILE_CLEAR_FAILED, "detail": str(err)}

    return {"ok": True, "service": service_name}


def extract_mobile_response(event: Event) -> dict[str, Any] | None:
    """Extract a governed response from a raw mobile action event."""
    raw_action = event.data.get("action")
    parsed = parse_raw_mobile_action(raw_action)
    if not parsed:
        return None

    item_id, action_id = parsed
    action_data = event.data.get("action_data") or {}
    if action_data:
        if action_data.get("item_id") and action_data.get("item_id") != item_id:
            return {"ok": False, "reason": FAILURE_INVALID_MOBILE_MAPPING}

    return {
        "ok": True,
        "item_id": item_id,
        "action_id": action_id,
        "actor": {
            "user_id": getattr(event.context, "user_id", None),
            "device_id": event.data.get("device_id"),
        },
    }

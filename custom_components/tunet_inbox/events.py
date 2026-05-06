"""Event emission helpers for Tunet Inbox."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .const import EVENT_ACTION, EVENT_UPDATED
from .models import InboxItem, utcnow_iso


async def async_emit_action(
    hass: HomeAssistant,
    *,
    item: InboxItem,
    action_id: str,
    source: str,
    surface: str,
    actor: dict[str, Any] | None,
) -> None:
    """Fire the canonical accepted action event."""
    hass.bus.async_fire(
        EVENT_ACTION,
        {
            "item_id": item.item_id,
            "key": item.key,
            "action_id": action_id,
            "family": item.family,
            "source": source,
            "surface": surface,
            "actor": actor,
            "context": item.context,
            "mobile": item.mobile.as_dict(),
            "timestamps": {"received_at": utcnow_iso()},
        },
    )


async def async_emit_updated(
    hass: HomeAssistant,
    *,
    reason: str,
    item: InboxItem,
) -> None:
    """Fire the queue refresh event."""
    hass.bus.async_fire(
        EVENT_UPDATED,
        {
            "reason": reason,
            "item_id": item.item_id,
            "key": item.key,
            "status": item.status,
        },
    )


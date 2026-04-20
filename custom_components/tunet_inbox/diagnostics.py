"""Diagnostics support for Tunet Inbox."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import REDACTED, async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DATA_MANAGER, DOMAIN

_REDACT_KEYS = {
    "message",
    "subtitle",
    "context",
    "notify_service",
    "payload",
    "tag",
    "last_actor",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Return redacted diagnostics for the active Tunet Inbox config entry."""
    runtime = hass.data.get(DOMAIN, {})
    manager = runtime.get(DATA_MANAGER)
    snapshot = manager.diagnostics_snapshot() if manager is not None else {}

    return {
        "entry": {
            "entry_id": entry.entry_id,
            "title": entry.title,
            "source": entry.source,
            "data": entry.data,
            "options": entry.options,
        },
        "runtime": async_redact_data(snapshot, _REDACT_KEYS),
        "redaction_marker": REDACTED,
    }

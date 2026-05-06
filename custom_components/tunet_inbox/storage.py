"""Persistence helpers for Tunet Inbox."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_QUARANTINED_ITEMS, STORAGE_VERSION


class TunetInboxStorage:
    """Wrap Home Assistant storage for the integration."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)

    async def async_load(self) -> dict[str, Any]:
        """Load persisted state."""
        data = await self._store.async_load()
        if not data:
            return {
                "version": STORAGE_VERSION,
                "active_items": [],
                "archive_items": [],
                STORAGE_QUARANTINED_ITEMS: [],
                "last_reconcile_at": None,
                "last_prune_at": None,
            }
        return data

    async def async_save(
        self,
        *,
        active_items: list[dict[str, Any]],
        archive_items: list[dict[str, Any]],
        quarantined_items: list[dict[str, Any]],
        last_reconcile_at: str | None,
        last_prune_at: str | None,
    ) -> None:
        """Persist the queue and metadata."""
        await self._store.async_save(
            {
                "version": STORAGE_VERSION,
                "active_items": active_items,
                "archive_items": archive_items,
                STORAGE_QUARANTINED_ITEMS: quarantined_items,
                "last_reconcile_at": last_reconcile_at,
                "last_prune_at": last_prune_at,
            }
        )

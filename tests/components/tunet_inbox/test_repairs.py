"""Repairs tests for tunet_inbox."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.tunet_inbox.const import (
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DATA_MANAGER,
    DOMAIN,
    INTEGRATION_TITLE,
    ISSUE_ID_RESTORE_QUARANTINE,
    STORAGE_QUARANTINED_ITEMS,
)
from custom_components.tunet_inbox.storage import TunetInboxStorage


async def test_restore_quarantine_creates_repair_issue(hass, monkeypatch) -> None:
    """Malformed restored payloads should create a persistent repair issue."""
    monkeypatch.setattr(
        TunetInboxStorage,
        "async_load",
        AsyncMock(
            return_value={
                "active_items": [{"key": "broken"}],
                "archive_items": [],
                STORAGE_QUARANTINED_ITEMS: [],
                "last_reconcile_at": None,
                "last_prune_at": None,
            }
        ),
    )
    monkeypatch.setattr(TunetInboxStorage, "async_save", AsyncMock())

    entry = MockConfigEntry(
        domain=DOMAIN,
        title=INTEGRATION_TITLE,
        data={
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
        unique_id=DOMAIN,
    )
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = ir.async_get(hass)
    issue = registry.async_get_issue(DOMAIN, ISSUE_ID_RESTORE_QUARANTINE)

    assert issue is not None
    assert issue.translation_key == ISSUE_ID_RESTORE_QUARANTINE
    assert issue.translation_placeholders == {"count": "1"}
    assert hass.data[DOMAIN][DATA_MANAGER].quarantine_count == 1


async def test_restore_quarantine_issue_clears_when_state_is_clean_on_reload(
    hass,
    monkeypatch,
) -> None:
    """The repair issue should clear once the restored quarantine is gone."""
    monkeypatch.setattr(
        TunetInboxStorage,
        "async_load",
        AsyncMock(
            side_effect=[
                {
                    "active_items": [{"key": "broken"}],
                    "archive_items": [],
                    STORAGE_QUARANTINED_ITEMS: [],
                    "last_reconcile_at": None,
                    "last_prune_at": None,
                },
                {
                    "active_items": [],
                    "archive_items": [],
                    STORAGE_QUARANTINED_ITEMS: [],
                    "last_reconcile_at": None,
                    "last_prune_at": None,
                },
            ]
        ),
    )
    monkeypatch.setattr(TunetInboxStorage, "async_save", AsyncMock())

    entry = MockConfigEntry(
        domain=DOMAIN,
        title=INTEGRATION_TITLE,
        data={
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
        unique_id=DOMAIN,
    )
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    registry = ir.async_get(hass)
    assert registry.async_get_issue(DOMAIN, ISSUE_ID_RESTORE_QUARANTINE) is not None

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert registry.async_get_issue(DOMAIN, ISSUE_ID_RESTORE_QUARANTINE) is None

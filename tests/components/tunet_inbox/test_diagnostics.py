"""Diagnostics tests for tunet_inbox."""

from __future__ import annotations

from homeassistant.components.diagnostics import REDACTED
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
)
from custom_components.tunet_inbox.diagnostics import async_get_config_entry_diagnostics


async def test_diagnostics_redacts_sensitive_queue_fields(
    hass,
    base_post_payload,
) -> None:
    """Diagnostics should expose queue structure but redact sensitive payload content."""
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

    manager = hass.data[DOMAIN][DATA_MANAGER]
    await manager.async_post(
        {
            **base_post_payload,
            "privacy": "sensitive",
            "message": "Top secret payload",
            "subtitle": "Sensitive subtitle",
            "context": {"entity_id": "light.secret"},
            "mobile": {
                "tag": "secret_tag",
                "notify_service": "notify.mobile_app_secret_phone",
            },
        }
    )
    manager._quarantined_items.append(
        {
            "collection": "active_items",
            "error": "Malformed payload",
            "quarantined_at": "2026-04-06T00:00:00Z",
            "payload": {
                "message": "Quarantined secret",
                "context": {"entity_id": "light.secret"},
            },
        }
    )

    diagnostics = await async_get_config_entry_diagnostics(hass, entry)
    runtime = diagnostics["runtime"]
    first_item = runtime["active_items"][0]
    quarantine_item = runtime["quarantine_tail"][0]

    assert runtime["counts"]["active_items"] == 1
    assert runtime["counts"]["quarantined_items"] == 1
    assert first_item["message"] == REDACTED
    assert first_item["subtitle"] == REDACTED
    assert first_item["context"] == REDACTED
    assert first_item["mobile"]["tag"] == REDACTED
    assert first_item["mobile"]["notify_service"] == REDACTED
    assert quarantine_item["payload"] == REDACTED
    assert diagnostics["entry"]["entry_id"] == entry.entry_id

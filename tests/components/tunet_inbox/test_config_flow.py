"""Config-entry tests for tunet_inbox."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.tunet_inbox.const import (
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_MOBILE_TAP_URL,
    CONF_NOTIFY_DEVICE_HELPER,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DATA_ENTRY_ID,
    DATA_MANAGER,
    DOMAIN,
    INTEGRATION_TITLE,
)


async def test_user_flow_creates_single_entry(hass) -> None:
    """The user flow should create the single Tunet Inbox config entry."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_USER},
    )

    assert result["type"] == FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_NOTIFY_DEVICE_HELPER: "input_text.notify_target_device_id",
            CONF_MOBILE_TAP_URL: "/mobile/custom-inbox",
            CONF_MAX_PENDING_ITEMS: 42,
            CONF_RESPONSE_TIMEOUT_SECONDS: 45,
            CONF_ARCHIVE_RETENTION_DAYS: 4,
            CONF_PRIVACY_MODE_DEFAULT: True,
            CONF_DEBUG_EVENTS: False,
        },
    )

    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == INTEGRATION_TITLE
    assert result["data"] == {
        CONF_NOTIFY_DEVICE_HELPER: "input_text.notify_target_device_id",
        CONF_MOBILE_TAP_URL: "/mobile/custom-inbox",
        CONF_MAX_PENDING_ITEMS: 42,
        CONF_RESPONSE_TIMEOUT_SECONDS: 45,
        CONF_ARCHIVE_RETENTION_DAYS: 4,
        CONF_PRIVACY_MODE_DEFAULT: True,
        CONF_DEBUG_EVENTS: False,
    }


async def test_yaml_setup_imports_config_entry_and_initializes_manager(
    hass,
    inbox_setup_config,
) -> None:
    """YAML bootstrap should import into a config entry and still initialize the runtime."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    entries = hass.config_entries.async_entries(DOMAIN)
    assert len(entries) == 1
    assert entries[0].source == config_entries.SOURCE_IMPORT
    assert hass.data[DOMAIN][DATA_ENTRY_ID] == entries[0].entry_id
    assert hass.data[DOMAIN][DATA_MANAGER] is not None


async def test_options_flow_updates_entry_options_and_reloads_runtime(hass) -> None:
    """Options flow should update the entry options for the live runtime."""
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

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] == FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_NOTIFY_DEVICE_HELPER: "input_text.alt_notify_device",
            CONF_MOBILE_TAP_URL: "/mobile/options-inbox",
            CONF_MAX_PENDING_ITEMS: 80,
            CONF_RESPONSE_TIMEOUT_SECONDS: 55,
            CONF_ARCHIVE_RETENTION_DAYS: 5,
            CONF_PRIVACY_MODE_DEFAULT: True,
            CONF_DEBUG_EVENTS: True,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert entry.options == {
        CONF_NOTIFY_DEVICE_HELPER: "input_text.alt_notify_device",
        CONF_MOBILE_TAP_URL: "/mobile/options-inbox",
        CONF_MAX_PENDING_ITEMS: 80,
        CONF_RESPONSE_TIMEOUT_SECONDS: 55,
        CONF_ARCHIVE_RETENTION_DAYS: 5,
        CONF_PRIVACY_MODE_DEFAULT: True,
        CONF_DEBUG_EVENTS: True,
    }


async def test_user_flow_accepts_direct_notify_service_target(hass) -> None:
    """The config flow should accept an explicit notify.* service as the default target."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_USER},
    )

    assert result["type"] == FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
            CONF_MOBILE_TAP_URL: "/mobile/direct-notify",
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
    )

    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_NOTIFY_DEVICE_HELPER] == "notify.tunet_inbox_all_devices"
    assert result["data"][CONF_MOBILE_TAP_URL] == "/mobile/direct-notify"


async def test_import_flow_clears_stale_options_and_updates_entry_data(hass) -> None:
    """YAML import should replace overlapping stale options on an import-sourced entry."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title=INTEGRATION_TITLE,
        data={
            CONF_NOTIFY_DEVICE_HELPER: "input_text.notify_target_device_id",
            CONF_MOBILE_TAP_URL: "/mobile/original-inbox",
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
        options={
            CONF_NOTIFY_DEVICE_HELPER: "input_text.old_stale_target",
            CONF_RESPONSE_TIMEOUT_SECONDS: 120,
            CONF_DEBUG_EVENTS: True,
        },
        unique_id=DOMAIN,
        source=config_entries.SOURCE_IMPORT,
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_IMPORT},
        data={
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
            CONF_MOBILE_TAP_URL: "/mobile/import-inbox",
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "already_configured"
    assert entry.data[CONF_NOTIFY_DEVICE_HELPER] == "notify.tunet_inbox_all_devices"
    assert entry.data[CONF_MOBILE_TAP_URL] == "/mobile/import-inbox"
    assert entry.options == {}


async def test_import_flow_preserves_non_overlapping_mobile_tap_url_option(hass) -> None:
    """YAML import should keep options-only tap URLs when import data omits that key."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title=INTEGRATION_TITLE,
        data={
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
        options={
            CONF_MOBILE_TAP_URL: "http://10.0.0.21:8123/tunet-inbox-yaml/inbox",
            CONF_DEBUG_EVENTS: True,
        },
        unique_id=DOMAIN,
        source=config_entries.SOURCE_IMPORT,
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_IMPORT},
        data={
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        },
    )
    await hass.async_block_till_done()

    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "already_configured"
    assert entry.data[CONF_NOTIFY_DEVICE_HELPER] == "notify.tunet_inbox_all_devices"
    assert CONF_MOBILE_TAP_URL not in entry.data
    assert entry.options == {
        CONF_MOBILE_TAP_URL: "http://10.0.0.21:8123/tunet-inbox-yaml/inbox",
    }

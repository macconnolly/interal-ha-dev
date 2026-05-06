"""Tunet Inbox custom integration."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event, HomeAssistant
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers import issue_registry as ir

from .const import (
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_MOBILE_TAP_URL,
    CONF_NOTIFY_DEVICE_HELPER,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DATA_ENTRY_ID,
    DATA_MANAGER,
    DATA_SERVICES_REGISTERED,
    DATA_UNSUB_MOBILE,
    DATA_UNSUB_STARTED,
    DATA_UNSUB_SWEEP,
    DEFAULT_ARCHIVE_RETENTION_DAYS,
    DEFAULT_DEBUG_EVENTS,
    DEFAULT_MAX_PENDING_ITEMS,
    DEFAULT_PRIVACY_MODE_DEFAULT,
    DEFAULT_RESPONSE_TIMEOUT_SECONDS,
    DOMAIN,
    ISSUE_ID_RESTORE_QUARANTINE,
)
from .manager import TunetInboxManager
from .mobile import extract_mobile_response
from .services import async_register_services, async_remove_services

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Optional(CONF_NOTIFY_DEVICE_HELPER): cv.string,
                vol.Optional(CONF_MOBILE_TAP_URL): cv.string,
                vol.Optional(CONF_MAX_PENDING_ITEMS, default=DEFAULT_MAX_PENDING_ITEMS): vol.Coerce(int),
                vol.Optional(
                    CONF_RESPONSE_TIMEOUT_SECONDS,
                    default=DEFAULT_RESPONSE_TIMEOUT_SECONDS,
                ): vol.Coerce(int),
                vol.Optional(
                    CONF_ARCHIVE_RETENTION_DAYS,
                    default=DEFAULT_ARCHIVE_RETENTION_DAYS,
                ): vol.Coerce(int),
                vol.Optional(
                    CONF_PRIVACY_MODE_DEFAULT,
                    default=DEFAULT_PRIVACY_MODE_DEFAULT,
                ): cv.boolean,
                vol.Optional(CONF_DEBUG_EVENTS, default=DEFAULT_DEBUG_EVENTS): cv.boolean,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


def _runtime(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {})


def _manager_for_services(hass: HomeAssistant) -> TunetInboxManager | None:
    return _runtime(hass).get(DATA_MANAGER)


def _entry_config(entry: config_entries.ConfigEntry) -> dict[str, Any]:
    return {**entry.data, **entry.options}


def _sync_restore_quarantine_issue(
    hass: HomeAssistant,
    manager: TunetInboxManager | None,
) -> None:
    """Mirror restore quarantine state into Home Assistant Repairs."""
    if manager is not None and manager.quarantine_count > 0:
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_ID_RESTORE_QUARANTINE,
            is_fixable=False,
            is_persistent=True,
            severity=ir.IssueSeverity.WARNING,
            translation_key=ISSUE_ID_RESTORE_QUARANTINE,
            translation_placeholders={"count": str(manager.quarantine_count)},
        )
        return

    ir.async_delete_issue(hass, DOMAIN, ISSUE_ID_RESTORE_QUARANTINE)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up Tunet Inbox from YAML by importing it into a config entry."""
    runtime = _runtime(hass)
    yaml_cfg = config.get(DOMAIN)
    if yaml_cfg:
        runtime["yaml_config"] = yaml_cfg
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": config_entries.SOURCE_IMPORT},
                data=yaml_cfg,
            )
        )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: config_entries.ConfigEntry) -> bool:
    """Set up Tunet Inbox from a config entry."""
    runtime = _runtime(hass)

    existing_entry_id = runtime.get(DATA_ENTRY_ID)
    if existing_entry_id and existing_entry_id != entry.entry_id:
        _LOGGER.error("tunet_inbox only supports one active config entry")
        return False

    manager = TunetInboxManager(hass, _entry_config(entry))
    await manager.async_initialize()
    runtime[DATA_MANAGER] = manager
    runtime[DATA_ENTRY_ID] = entry.entry_id
    _sync_restore_quarantine_issue(hass, manager)

    if not runtime.get(DATA_SERVICES_REGISTERED):
        await async_register_services(hass, lambda: _manager_for_services(hass))
        runtime[DATA_SERVICES_REGISTERED] = True

    if runtime.get(DATA_UNSUB_MOBILE) is None:

        async def _on_mobile_action(event: Event) -> None:
            active_manager = _manager_for_services(hass)
            if active_manager is None:
                return
            response = extract_mobile_response(event)
            if not response:
                return
            if not response.get("ok"):
                _LOGGER.warning(
                    "tunet_inbox rejected mobile action mapping: %s",
                    response["reason"],
                )
                return
            result = await active_manager.async_accept_response(
                item_id=response["item_id"],
                action_id=response["action_id"],
                source="phone",
                surface="mobile_app",
                actor=response.get("actor"),
            )
            if not result.get("accepted"):
                _LOGGER.info(
                    "tunet_inbox ignored mobile response item_id=%s action_id=%s reason=%s",
                    response["item_id"],
                    response["action_id"],
                    result.get("reason"),
                )

        runtime[DATA_UNSUB_MOBILE] = hass.bus.async_listen(
            "mobile_app_notification_action",
            _on_mobile_action,
        )

    if runtime.get(DATA_UNSUB_STARTED) is None:

        async def _on_started(_event: Event) -> None:
            active_manager = _manager_for_services(hass)
            if active_manager is None:
                return
            await active_manager.async_reconcile_startup()
            _LOGGER.info("tunet_inbox startup reconcile completed")

        if hass.is_running:
            hass.async_create_task(manager.async_reconcile_startup())
        else:
            runtime[DATA_UNSUB_STARTED] = hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STARTED,
                _on_started,
            )

    if runtime.get(DATA_UNSUB_SWEEP) is None:

        async def _on_sweep(now) -> None:
            active_manager = _manager_for_services(hass)
            if active_manager is None:
                return
            await active_manager.async_sweep_expired_and_stuck(now)

        runtime[DATA_UNSUB_SWEEP] = async_track_time_interval(
            hass,
            _on_sweep,
            timedelta(seconds=max(15, manager.response_timeout_seconds)),
        )

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    _LOGGER.info("tunet_inbox initialized via config entry %s", entry.entry_id)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: config_entries.ConfigEntry) -> bool:
    """Unload the active Tunet Inbox config entry."""
    runtime = _runtime(hass)
    if runtime.get(DATA_ENTRY_ID) != entry.entry_id:
        return True

    for key in (DATA_UNSUB_STARTED, DATA_UNSUB_MOBILE, DATA_UNSUB_SWEEP):
        unsub = runtime.pop(key, None)
        if callable(unsub):
            unsub()

    _sync_restore_quarantine_issue(hass, None)
    async_remove_services(hass)
    runtime.pop(DATA_SERVICES_REGISTERED, None)
    runtime.pop(DATA_MANAGER, None)
    runtime.pop(DATA_ENTRY_ID, None)
    return True


async def async_reload_entry(hass: HomeAssistant, entry: config_entries.ConfigEntry) -> None:
    """Reload the config entry after options changes."""
    await hass.config_entries.async_reload(entry.entry_id)

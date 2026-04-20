"""Config flow for Tunet Inbox."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_MOBILE_TAP_URL,
    CONF_NOTIFY_DEVICE_HELPER,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DEFAULT_ARCHIVE_RETENTION_DAYS,
    DEFAULT_DEBUG_EVENTS,
    DEFAULT_MAX_PENDING_ITEMS,
    DEFAULT_PRIVACY_MODE_DEFAULT,
    DEFAULT_RESPONSE_TIMEOUT_SECONDS,
    DOMAIN,
    INTEGRATION_TITLE,
)


def _normalize_config(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize UI or YAML-import config payloads into entry data."""
    notify_helper = str(data.get(CONF_NOTIFY_DEVICE_HELPER, "") or "").strip()
    mobile_tap_url = str(data.get(CONF_MOBILE_TAP_URL, "") or "").strip()
    normalized: dict[str, Any] = {
        CONF_MAX_PENDING_ITEMS: int(data.get(CONF_MAX_PENDING_ITEMS, DEFAULT_MAX_PENDING_ITEMS)),
        CONF_RESPONSE_TIMEOUT_SECONDS: int(
            data.get(CONF_RESPONSE_TIMEOUT_SECONDS, DEFAULT_RESPONSE_TIMEOUT_SECONDS)
        ),
        CONF_ARCHIVE_RETENTION_DAYS: int(
            data.get(CONF_ARCHIVE_RETENTION_DAYS, DEFAULT_ARCHIVE_RETENTION_DAYS)
        ),
        CONF_PRIVACY_MODE_DEFAULT: bool(
            data.get(CONF_PRIVACY_MODE_DEFAULT, DEFAULT_PRIVACY_MODE_DEFAULT)
        ),
        CONF_DEBUG_EVENTS: bool(data.get(CONF_DEBUG_EVENTS, DEFAULT_DEBUG_EVENTS)),
    }
    if notify_helper:
        normalized[CONF_NOTIFY_DEVICE_HELPER] = notify_helper
    if mobile_tap_url:
        normalized[CONF_MOBILE_TAP_URL] = mobile_tap_url
    return normalized


def _merge_import_options(
    existing_options: dict[str, Any],
    imported_data: dict[str, Any],
) -> dict[str, Any]:
    """Preserve only non-overlapping options across YAML imports."""
    imported_keys = set(imported_data)
    return {
        key: value
        for key, value in existing_options.items()
        if key not in imported_keys
    }


def _build_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    """Build the config/options form schema."""
    defaults = defaults or {}
    return vol.Schema(
        {
            vol.Optional(
                CONF_NOTIFY_DEVICE_HELPER,
                default=defaults.get(CONF_NOTIFY_DEVICE_HELPER, ""),
            ): str,
            vol.Optional(
                CONF_MOBILE_TAP_URL,
                default=defaults.get(CONF_MOBILE_TAP_URL, ""),
            ): str,
            vol.Required(
                CONF_MAX_PENDING_ITEMS,
                default=defaults.get(CONF_MAX_PENDING_ITEMS, DEFAULT_MAX_PENDING_ITEMS),
            ): vol.All(vol.Coerce(int), vol.Range(min=1, max=512)),
            vol.Required(
                CONF_RESPONSE_TIMEOUT_SECONDS,
                default=defaults.get(
                    CONF_RESPONSE_TIMEOUT_SECONDS,
                    DEFAULT_RESPONSE_TIMEOUT_SECONDS,
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=5, max=3600)),
            vol.Required(
                CONF_ARCHIVE_RETENTION_DAYS,
                default=defaults.get(
                    CONF_ARCHIVE_RETENTION_DAYS,
                    DEFAULT_ARCHIVE_RETENTION_DAYS,
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=1, max=30)),
            vol.Required(
                CONF_PRIVACY_MODE_DEFAULT,
                default=defaults.get(
                    CONF_PRIVACY_MODE_DEFAULT,
                    DEFAULT_PRIVACY_MODE_DEFAULT,
                ),
            ): bool,
            vol.Required(
                CONF_DEBUG_EVENTS,
                default=defaults.get(CONF_DEBUG_EVENTS, DEFAULT_DEBUG_EVENTS),
            ): bool,
        }
    )


class TunetInboxConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Single-instance config flow for Tunet Inbox."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> "TunetInboxOptionsFlow":
        return TunetInboxOptionsFlow(config_entry)

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Handle manual UI setup."""
        if user_input is not None:
            normalized = _normalize_config(user_input)
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=INTEGRATION_TITLE, data=normalized)

        return self.async_show_form(
            step_id="user",
            data_schema=_build_schema(),
        )

    async def async_step_import(self, import_config: dict[str, Any]):
        """Handle YAML import into a config entry."""
        normalized = _normalize_config(import_config)
        await self.async_set_unique_id(DOMAIN)
        existing_entries = self._async_current_entries()
        if existing_entries:
            existing_entry = existing_entries[0]
            self.hass.config_entries.async_update_entry(
                existing_entry,
                data=normalized,
                options=_merge_import_options(existing_entry.options, normalized),
            )
            return self.async_abort(reason="already_configured")
        return self.async_create_entry(title=INTEGRATION_TITLE, data=normalized)


class TunetInboxOptionsFlow(config_entries.OptionsFlow):
    """Options flow for updating the active Tunet Inbox entry."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        """Handle the single options step."""
        if user_input is not None:
            return self.async_create_entry(title="", data=_normalize_config(user_input))

        defaults = {**self._config_entry.data, **self._config_entry.options}
        return self.async_show_form(
            step_id="init",
            data_schema=_build_schema(defaults),
        )

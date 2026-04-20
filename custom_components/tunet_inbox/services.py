"""Service registration for Tunet Inbox."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN,
    SERVICE_DISMISS,
    SERVICE_FAIL,
    SERVICE_LIST_ITEMS,
    SERVICE_POST,
    SERVICE_RESOLVE,
    SERVICE_RESPOND,
)
from .manager import TunetInboxManager
from .models import ContractError


def _service_error(err: ContractError | Exception) -> ServiceValidationError:
    return ServiceValidationError(str(err))


ACTION_SCHEMA = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Required("title"): cv.string,
        vol.Optional("icon"): cv.string,
        vol.Optional("destructive"): cv.boolean,
        vol.Optional("requires_confirm"): cv.boolean,
        vol.Optional("style"): cv.string,
        vol.Optional("disabled_reason"): vol.Any(None, cv.string),
    },
    extra=vol.PREVENT_EXTRA,
)


def _validate_item_reference(data: dict[str, Any]) -> dict[str, Any]:
    has_item_id = bool(str(data.get("item_id", "") or "").strip())
    has_key = bool(str(data.get("key", "") or "").strip())
    if has_item_id == has_key:
        raise vol.Invalid("exactly one of item_id or key is required")
    return data

MOBILE_SCHEMA = vol.Schema(
    {
        vol.Required("tag"): cv.string,
        vol.Optional("notify_service"): cv.string,
        vol.Optional("url"): cv.string,
        vol.Optional("clear_on_resolve"): cv.boolean,
    },
    extra=vol.PREVENT_EXTRA,
)

POST_SCHEMA = vol.Schema(
    {
        vol.Required("key"): cv.string,
        vol.Required("title"): cv.string,
        vol.Required("message"): cv.string,
        vol.Required("actions"): [ACTION_SCHEMA],
        vol.Optional("subtitle"): cv.string,
        vol.Optional("context"): dict,
        vol.Optional("family"): cv.string,
        vol.Optional("room"): cv.string,
        vol.Optional("icon"): cv.string,
        vol.Optional("badge"): cv.string,
        vol.Optional("priority"): vol.Coerce(int),
        vol.Optional("severity"): cv.string,
        vol.Optional("expires_at"): cv.string,
        vol.Optional("dedupe_policy"): cv.string,
        vol.Optional("privacy"): cv.string,
        vol.Optional("send_mobile"): cv.boolean,
        vol.Optional("mobile"): MOBILE_SCHEMA,
        vol.Optional("source"): dict,
    },
    extra=vol.PREVENT_EXTRA,
)

RESPOND_SCHEMA = vol.Schema(
    vol.All(
        {
            vol.Optional("item_id"): cv.string,
            vol.Optional("key"): cv.string,
            vol.Required("action_id"): cv.string,
            vol.Required("source"): cv.string,
            vol.Optional("client_id"): cv.string,
        },
        _validate_item_reference,
    ),
    extra=vol.PREVENT_EXTRA,
)

RESOLVE_SCHEMA = vol.Schema(
    vol.All(
        {
            vol.Optional("item_id"): cv.string,
            vol.Optional("key"): cv.string,
            vol.Required("reason"): cv.string,
            vol.Optional("result"): dict,
            vol.Optional("clear_mobile"): cv.boolean,
        },
        _validate_item_reference,
    ),
    extra=vol.PREVENT_EXTRA,
)

FAIL_SCHEMA = vol.Schema(
    vol.All(
        {
            vol.Optional("item_id"): cv.string,
            vol.Optional("key"): cv.string,
            vol.Required("reason"): cv.string,
            vol.Optional("details"): cv.string,
            vol.Optional("return_to_pending"): cv.boolean,
        },
        _validate_item_reference,
    ),
    extra=vol.PREVENT_EXTRA,
)

DISMISS_SCHEMA = vol.Schema(
    vol.All(
        {
            vol.Optional("item_id"): cv.string,
            vol.Optional("key"): cv.string,
            vol.Required("reason"): cv.string,
        },
        _validate_item_reference,
    ),
    extra=vol.PREVENT_EXTRA,
)

LIST_SCHEMA = vol.Schema(
    {
        vol.Optional("statuses"): [cv.string],
        vol.Optional("families"): [cv.string],
        vol.Optional("rooms"): [cv.string],
        vol.Optional("privacy_mode"): cv.boolean,
        vol.Optional("limit"): vol.Coerce(int),
    },
    extra=vol.PREVENT_EXTRA,
)


def _require_manager(get_manager: Callable[[], TunetInboxManager | None]) -> TunetInboxManager:
    manager = get_manager()
    if manager is None:
        raise HomeAssistantError("tunet_inbox manager is not initialized")
    return manager


async def async_register_services(
    hass: HomeAssistant,
    get_manager: Callable[[], TunetInboxManager | None],
) -> None:
    """Register all Tunet Inbox service handlers."""

    async def _post(call: ServiceCall) -> dict[str, Any]:
        try:
            return await _require_manager(get_manager).async_post(dict(call.data))
        except ContractError as err:
            raise _service_error(err) from err
        except HomeAssistantError:
            raise
        except Exception as err:  # pragma: no cover - HA runtime error path
            raise HomeAssistantError(str(err)) from err

    async def _respond(call: ServiceCall) -> dict[str, Any]:
        try:
            return await _require_manager(get_manager).async_accept_response(
                item_id=call.data.get("item_id"),
                key=call.data.get("key"),
                action_id=call.data["action_id"],
                source=call.data["source"],
                surface=call.data["source"],
                actor={"user_id": call.context.user_id, "client_id": call.data.get("client_id")},
            )
        except ContractError as err:
            raise _service_error(err) from err

    async def _resolve(call: ServiceCall) -> dict[str, Any]:
        try:
            return await _require_manager(get_manager).async_resolve(
                item_id=call.data.get("item_id"),
                key=call.data.get("key"),
                reason=call.data["reason"],
                result=call.data.get("result"),
                clear_mobile=call.data.get("clear_mobile", True),
            )
        except ContractError as err:
            raise _service_error(err) from err

    async def _fail(call: ServiceCall) -> dict[str, Any]:
        try:
            return await _require_manager(get_manager).async_fail(
                item_id=call.data.get("item_id"),
                key=call.data.get("key"),
                reason=call.data["reason"],
                details=call.data.get("details"),
                return_to_pending=call.data.get("return_to_pending", False),
            )
        except ContractError as err:
            raise _service_error(err) from err

    async def _dismiss(call: ServiceCall) -> dict[str, Any]:
        try:
            return await _require_manager(get_manager).async_dismiss(
                item_id=call.data.get("item_id"),
                key=call.data.get("key"),
                reason=call.data["reason"],
            )
        except ContractError as err:
            raise _service_error(err) from err

    async def _list_items(call: ServiceCall) -> dict[str, Any]:
        return await _require_manager(get_manager).async_list_items(
            statuses=call.data.get("statuses"),
            families=call.data.get("families"),
            rooms=call.data.get("rooms"),
            privacy_mode=call.data.get("privacy_mode"),
            limit=call.data.get("limit"),
        )

    registry = [
        (SERVICE_POST, POST_SCHEMA, _post),
        (SERVICE_RESPOND, RESPOND_SCHEMA, _respond),
        (SERVICE_RESOLVE, RESOLVE_SCHEMA, _resolve),
        (SERVICE_FAIL, FAIL_SCHEMA, _fail),
        (SERVICE_DISMISS, DISMISS_SCHEMA, _dismiss),
        (SERVICE_LIST_ITEMS, LIST_SCHEMA, _list_items),
    ]

    for service_name, schema, handler in registry:
        hass.services.async_register(
            DOMAIN,
            service_name,
            handler,
            schema=schema,
            supports_response=SupportsResponse.OPTIONAL,
        )


def async_remove_services(hass: HomeAssistant) -> None:
    """Remove all registered Tunet Inbox services."""
    for service_name in (
        SERVICE_POST,
        SERVICE_RESPOND,
        SERVICE_RESOLVE,
        SERVICE_FAIL,
        SERVICE_DISMISS,
        SERVICE_LIST_ITEMS,
    ):
        if hass.services.has_service(DOMAIN, service_name):
            hass.services.async_remove(DOMAIN, service_name)

"""Service-response tests for tunet_inbox."""

from __future__ import annotations

import pytest

from homeassistant.exceptions import ServiceValidationError
from homeassistant.setup import async_setup_component

from custom_components.tunet_inbox.const import (
    CONF_NOTIFY_DEVICE_HELPER,
    CONF_MOBILE_TAP_URL,
    DOMAIN,
    EVENT_ACTION,
    EVENT_UPDATED,
    FAILURE_INVALID_ACTION,
    SERVICE_DISMISS,
    SERVICE_FAIL,
    SERVICE_LIST_ITEMS,
    SERVICE_POST,
    SERVICE_RESOLVE,
    SERVICE_RESPOND,
)


async def test_yaml_setup_registers_services_and_returns_structured_responses(
    hass, inbox_setup_config, base_post_payload, capture_events
) -> None:
    """YAML bootstrap should import into the entry-backed runtime and still expose the service contract."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    assert len(hass.config_entries.async_entries(DOMAIN)) == 1

    for service_name in (
        SERVICE_POST,
        SERVICE_RESPOND,
        SERVICE_RESOLVE,
        SERVICE_FAIL,
        SERVICE_DISMISS,
        SERVICE_LIST_ITEMS,
    ):
        assert hass.services.has_service(DOMAIN, service_name)

    updated_events = capture_events(EVENT_UPDATED)
    action_events = capture_events(EVENT_ACTION)

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        base_post_payload,
        blocking=True,
        return_response=True,
    )
    item_id = post_result["item_id"]

    list_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_LIST_ITEMS,
        {},
        blocking=True,
        return_response=True,
    )
    respond_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_RESPOND,
        {"key": base_post_payload["key"], "action_id": "TEST_ACK", "source": "dashboard_card"},
        blocking=True,
        return_response=True,
    )
    await hass.async_block_till_done()

    assert post_result["accepted"] is True
    assert list_result["items"][0]["item_id"] == item_id
    assert respond_result == {
        "accepted": True,
        "item_id": item_id,
        "action_id": "TEST_ACK",
        "reason": None,
    }
    assert updated_events[0].data["reason"] == "post"
    assert updated_events[-1].data["reason"] == "respond"
    assert action_events[-1].data["item_id"] == item_id
    assert action_events[-1].data["action_id"] == "TEST_ACK"


async def test_respond_service_rejects_invalid_action_with_structured_payload(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """Invalid actions should return structured service responses instead of mutating state."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        base_post_payload,
        blocking=True,
        return_response=True,
    )

    respond_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_RESPOND,
        {"item_id": post_result["item_id"], "action_id": "WRONG_ACTION", "source": "dashboard_card"},
        blocking=True,
        return_response=True,
    )

    assert respond_result["accepted"] is False
    assert respond_result["reason"] == FAILURE_INVALID_ACTION


async def test_post_service_accepts_mobile_url_and_persists_it(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """The public post service should admit and persist mobile.url."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    payload = {
        **base_post_payload,
        "mobile": {
            **base_post_payload["mobile"],
            "url": "/tunet-inbox-yaml/inbox",
        },
    }

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        payload,
        blocking=True,
        return_response=True,
    )
    list_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_LIST_ITEMS,
        {},
        blocking=True,
        return_response=True,
    )

    assert post_result["accepted"] is True
    assert list_result["items"][0]["item_id"] == post_result["item_id"]
    assert list_result["items"][0]["mobile"]["tag"] == payload["mobile"]["tag"]
    assert list_result["items"][0]["mobile"]["url"] == "/tunet-inbox-yaml/inbox"


async def test_post_service_with_send_mobile_true_defaults_to_canonical_inbox_tap_url(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """The service boundary should normalize inbox tap-through without caller-supplied route strings."""
    config = {
        DOMAIN: {
            **inbox_setup_config[DOMAIN],
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
        }
    }
    notify_calls: list[dict] = []

    async def _capture_notify(call) -> None:
        notify_calls.append(call.data)

    hass.services.async_register("notify", "tunet_inbox_all_devices", _capture_notify)

    assert await async_setup_component(hass, DOMAIN, config)
    await hass.async_block_till_done()

    payload = {
        **base_post_payload,
        "send_mobile": True,
        "mobile": {"tag": base_post_payload["mobile"]["tag"]},
    }

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        payload,
        blocking=True,
        return_response=True,
    )
    list_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_LIST_ITEMS,
        {},
        blocking=True,
        return_response=True,
    )

    assert post_result["accepted"] is True
    assert post_result["mobile_send_status"]["ok"] is True
    assert list_result["items"][0]["mobile"]["url"] == "/tunet-inbox-yaml/inbox"
    assert notify_calls[0]["data"]["url"] == "/tunet-inbox-yaml/inbox"


async def test_post_service_with_send_mobile_true_uses_configured_tap_url(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """The service boundary should honor the configured default tap URL."""
    config = {
        DOMAIN: {
            **inbox_setup_config[DOMAIN],
            CONF_NOTIFY_DEVICE_HELPER: "notify.tunet_inbox_all_devices",
            CONF_MOBILE_TAP_URL: "/mobile/custom-inbox",
        }
    }
    notify_calls: list[dict] = []

    async def _capture_notify(call) -> None:
        notify_calls.append(call.data)

    hass.services.async_register("notify", "tunet_inbox_all_devices", _capture_notify)

    assert await async_setup_component(hass, DOMAIN, config)
    await hass.async_block_till_done()

    payload = {
        **base_post_payload,
        "send_mobile": True,
        "mobile": {"tag": base_post_payload["mobile"]["tag"]},
    }

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        payload,
        blocking=True,
        return_response=True,
    )
    list_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_LIST_ITEMS,
        {},
        blocking=True,
        return_response=True,
    )

    assert post_result["accepted"] is True
    assert post_result["mobile_send_status"]["ok"] is True
    assert list_result["items"][0]["mobile"]["url"] == "/mobile/custom-inbox"
    assert notify_calls[0]["data"]["url"] == "/mobile/custom-inbox"


async def test_post_service_rejects_non_canonical_mobile_url(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """Legacy mobile.url remains compatible only for the governed inbox route."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    payload = {
        **base_post_payload,
        "mobile": {
            **base_post_payload["mobile"],
            "url": "/lovelace/somewhere-else",
        },
    }

    with pytest.raises(ServiceValidationError, match="mobile.url"):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_POST,
            payload,
            blocking=True,
            return_response=True,
        )


async def test_post_service_rejects_mobile_url_that_does_not_match_configured_tap_url(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """Legacy mobile.url must match the currently configured governed route."""
    config = {
        DOMAIN: {
            **inbox_setup_config[DOMAIN],
            CONF_MOBILE_TAP_URL: "/mobile/configured-inbox",
        }
    }
    assert await async_setup_component(hass, DOMAIN, config)
    await hass.async_block_till_done()

    payload = {
        **base_post_payload,
        "mobile": {
            **base_post_payload["mobile"],
            "url": "/tunet-inbox-yaml/inbox",
        },
    }

    with pytest.raises(ServiceValidationError, match="mobile.url"):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_POST,
            payload,
            blocking=True,
            return_response=True,
        )


async def test_resolve_service_accepts_key_reference(
    hass, inbox_setup_config, base_post_payload
) -> None:
    """Resolve should accept a logical key reference instead of only item_id."""
    assert await async_setup_component(hass, DOMAIN, inbox_setup_config)
    await hass.async_block_till_done()

    post_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_POST,
        base_post_payload,
        blocking=True,
        return_response=True,
    )

    resolve_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_RESOLVE,
        {"key": base_post_payload["key"], "reason": "operator_cleanup"},
        blocking=True,
        return_response=True,
    )

    list_result = await hass.services.async_call(
        DOMAIN,
        SERVICE_LIST_ITEMS,
        {},
        blocking=True,
        return_response=True,
    )

    assert resolve_result["accepted"] is True
    assert resolve_result["item_id"] == post_result["item_id"]
    assert list_result["items"] == []

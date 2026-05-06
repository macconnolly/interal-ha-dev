"""Targeted mobile routing tests for tunet_inbox."""

from __future__ import annotations

from custom_components.tunet_inbox.const import INBOX_TAP_URL
from custom_components.tunet_inbox.mobile import _resolve_notify_service, async_send_item_notification
from custom_components.tunet_inbox.models import InboxItem


def _build_item(
    *,
    notify_service: str | None,
    url: str | None = None,
    default_tap_url: str = INBOX_TAP_URL,
) -> InboxItem:
    return InboxItem.from_post_payload(
        {
            "key": "mobile_route_probe",
            "title": "Mobile route probe",
            "message": "Verify notify target resolution",
            "actions": [{"id": "ACK", "title": "Acknowledge"}],
            "family": "ops",
            "context": {"probe": "mobile-routing"},
            "mobile": {
                "tag": "mobile_route_probe",
                "notify_service": notify_service,
                "url": url,
            },
            "send_mobile": True,
            "source": {
                "integration": "pytest",
                "automation_id": "mobile_routing",
                "reason": "targeted_test",
            },
        },
        default_mobile_tap_url=default_tap_url,
    )


def test_resolve_notify_service_passes_through_direct_notify_service(hass) -> None:
    """Direct notify.* services should be used unchanged."""
    item = _build_item(notify_service="notify.tunet_inbox_all_devices")

    assert _resolve_notify_service(hass, item, None) == "notify.tunet_inbox_all_devices"


def test_resolve_notify_service_maps_helper_state_to_mobile_app_service(hass) -> None:
    """Helper-backed targets should map to notify.mobile_app_<device_id>."""
    hass.states.async_set("input_text.notify_target_device_id", "macs_iphone_personal")
    item = _build_item(notify_service=None)

    assert (
        _resolve_notify_service(hass, item, "input_text.notify_target_device_id")
        == "notify.mobile_app_macs_iphone_personal"
    )


def test_resolve_notify_service_rejects_blank_target(hass) -> None:
    """Blank notify targets remain invalid and do not imply broadcast."""
    item = _build_item(notify_service=None)

    assert _resolve_notify_service(hass, item, None) is None


async def test_send_item_notification_includes_dashboard_tap_url(hass) -> None:
    """Optional mobile URLs should be passed through to the notify payload."""
    calls: list[dict] = []

    async def _capture(call):
        calls.append(call.data)

    hass.services.async_register("notify", "tunet_inbox_all_devices", _capture)
    item = _build_item(
        notify_service="notify.tunet_inbox_all_devices",
        url="/tunet-inbox-yaml/inbox",
    )

    result = await async_send_item_notification(
        hass,
        item=item,
        default_notify_target=None,
        default_tap_url=INBOX_TAP_URL,
    )

    assert result["ok"] is True
    assert calls[0]["data"]["url"] == "/tunet-inbox-yaml/inbox"
    assert calls[0]["data"]["tag"] == "mobile_route_probe"


async def test_send_item_notification_uses_configured_default_tap_url(hass) -> None:
    """Configured default tap URLs should override the fallback route."""
    calls: list[dict] = []

    async def _capture(call):
        calls.append(call.data)

    hass.services.async_register("notify", "tunet_inbox_all_devices", _capture)
    item = _build_item(
        notify_service="notify.tunet_inbox_all_devices",
        url=None,
        default_tap_url="/mobile/configured-inbox",
    )

    result = await async_send_item_notification(
        hass,
        item=item,
        default_notify_target=None,
        default_tap_url="/mobile/configured-inbox",
    )

    assert result["ok"] is True
    assert calls[0]["data"]["url"] == "/mobile/configured-inbox"
    assert calls[0]["data"]["tag"] == "mobile_route_probe"


async def test_send_item_notification_defaults_to_canonical_inbox_tap_url(hass) -> None:
    """Backend-owned mobile delivery should emit the governed inbox route by default."""
    calls: list[dict] = []

    async def _capture(call):
        calls.append(call.data)

    hass.services.async_register("notify", "tunet_inbox_all_devices", _capture)
    item = _build_item(
        notify_service="notify.tunet_inbox_all_devices",
        url=None,
    )

    result = await async_send_item_notification(
        hass,
        item=item,
        default_notify_target=None,
    )

    assert result["ok"] is True
    assert calls[0]["data"]["url"] == "/tunet-inbox-yaml/inbox"
    assert calls[0]["data"]["tag"] == "mobile_route_probe"

"""Event-emission tests for tunet_inbox."""

from __future__ import annotations

from custom_components.tunet_inbox.const import EVENT_ACTION, EVENT_UPDATED
from custom_components.tunet_inbox.events import async_emit_action, async_emit_updated
from custom_components.tunet_inbox.models import InboxItem


async def test_emit_helpers_fire_expected_payloads(hass, base_post_payload, capture_events) -> None:
    """Canonical event helpers should publish the render and action contract payloads."""
    item = InboxItem.from_post_payload(base_post_payload)
    updated_events = capture_events(EVENT_UPDATED)
    action_events = capture_events(EVENT_ACTION)

    await async_emit_updated(hass, reason="post", item=item)
    await async_emit_action(
        hass,
        item=item,
        action_id="TEST_ACK",
        source="dashboard_card",
        surface="dashboard_card",
        actor={"client_id": "pytest"},
    )
    await hass.async_block_till_done()

    assert len(updated_events) == 1
    assert updated_events[0].data == {
        "reason": "post",
        "item_id": item.item_id,
        "key": item.key,
        "status": item.status,
    }

    assert len(action_events) == 1
    action_data = action_events[0].data
    assert action_data["item_id"] == item.item_id
    assert action_data["key"] == item.key
    assert action_data["action_id"] == "TEST_ACK"
    assert action_data["family"] == item.family
    assert action_data["source"] == "dashboard_card"
    assert action_data["surface"] == "dashboard_card"
    assert action_data["actor"] == {"client_id": "pytest"}
    assert action_data["context"] == {"probe": "unit"}
    assert action_data["mobile"]["tag"] == "ti1a_probe_tag"
    assert "received_at" in action_data["timestamps"]

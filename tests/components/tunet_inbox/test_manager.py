"""Manager state-transition tests for tunet_inbox."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

from custom_components.tunet_inbox.const import (
    EVENT_ACTION,
    EVENT_UPDATED,
    FAILURE_HANDLER_TIMEOUT,
    FAILURE_NOT_PENDING,
    QUARANTINE_COLLECTION_ACTIVE,
    QUARANTINE_COLLECTION_ARCHIVE,
    STATUS_PENDING,
    STATUS_REPLACED,
    STATUS_RESPONDING,
    STORAGE_QUARANTINED_ITEMS,
)
from custom_components.tunet_inbox.manager import TunetInboxManager
from custom_components.tunet_inbox.models import InboxItem


async def test_post_replace_archives_prior_pending_item(
    hass, base_post_payload, capture_events, monkeypatch
) -> None:
    """Default replace dedupe should archive the old item and keep the new one active."""
    manager = TunetInboxManager(hass, {})
    monkeypatch.setattr(manager, "_save", AsyncMock())
    updated_events = capture_events(EVENT_UPDATED)

    first = await manager.async_post(base_post_payload)
    second = await manager.async_post({**base_post_payload, "message": "Updated payload"})
    await hass.async_block_till_done()

    assert first["accepted"] is True
    assert second["accepted"] is True
    assert first["item_id"] != second["item_id"]
    assert list(manager._active_items) == [second["item_id"]]
    assert manager._item_id_by_key[base_post_payload["key"]] == second["item_id"]
    assert manager._archive_items[-1]["item_id"] == first["item_id"]
    assert manager._archive_items[-1]["status"] == STATUS_REPLACED
    assert updated_events[-1].data["item_id"] == second["item_id"]
    assert updated_events[-1].data["reason"] == "post"


async def test_accept_response_emits_canonical_events_and_rejects_second_accept(
    hass, base_post_payload, capture_events, monkeypatch
) -> None:
    """One response should transition to responding and emit exactly one canonical action."""
    manager = TunetInboxManager(hass, {})
    monkeypatch.setattr(manager, "_save", AsyncMock())
    action_events = capture_events(EVENT_ACTION)
    updated_events = capture_events(EVENT_UPDATED)

    post_result = await manager.async_post(base_post_payload)
    item_id = post_result["item_id"]

    result = await manager.async_accept_response(
        item_id=item_id,
        action_id="TEST_ACK",
        source="dashboard_card",
        surface="dashboard_card",
        actor={"client_id": "pytest"},
    )
    second = await manager.async_accept_response(
        item_id=item_id,
        action_id="TEST_ACK",
        source="dashboard_card",
        surface="dashboard_card",
        actor={"client_id": "pytest-second"},
    )
    await hass.async_block_till_done()

    assert result == {
        "accepted": True,
        "item_id": item_id,
        "action_id": "TEST_ACK",
        "reason": None,
    }
    assert manager._active_items[item_id].status == STATUS_RESPONDING
    assert len(action_events) == 1
    assert action_events[0].data["item_id"] == item_id
    assert action_events[0].data["action_id"] == "TEST_ACK"
    assert updated_events[-1].data["reason"] == "respond"
    assert second["accepted"] is False
    assert second["reason"] == FAILURE_NOT_PENDING


async def test_sweep_returns_timed_out_item_to_pending(
    hass, base_post_payload, capture_events, monkeypatch
) -> None:
    """Periodic sweep should return a stuck responding item to pending with handler timeout."""
    manager = TunetInboxManager(hass, {})
    monkeypatch.setattr(manager, "_save", AsyncMock())
    updated_events = capture_events(EVENT_UPDATED)

    item = InboxItem.from_post_payload(base_post_payload)
    item.status = STATUS_RESPONDING
    item.response_started_at = (
        datetime.now(timezone.utc) - timedelta(seconds=90)
    ).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    manager._active_items[item.item_id] = item
    manager._item_id_by_key[item.key] = item.item_id

    await manager.async_sweep_expired_and_stuck(_now=datetime.now(timezone.utc))
    await hass.async_block_till_done()

    current = manager._active_items[item.item_id]
    assert current.status == STATUS_PENDING
    assert current.last_error == FAILURE_HANDLER_TIMEOUT
    assert current.response_started_at is None
    assert updated_events[-1].data["reason"] == "fail"


async def test_initialize_quarantines_malformed_active_and_archive_items(
    hass,
    base_post_payload,
    monkeypatch,
) -> None:
    """Malformed restored payloads should be moved into quarantine instead of disappearing."""
    manager = TunetInboxManager(hass, {})
    good_archive_item = InboxItem.from_post_payload({**base_post_payload, "key": "archived_good"}).as_dict()
    bad_active = {"key": "missing_required_fields"}
    bad_archive = {"status": "resolved"}
    monkeypatch.setattr(
        manager._storage,
        "async_load",
        AsyncMock(
            return_value={
                "active_items": [bad_active],
                "archive_items": [good_archive_item, bad_archive],
                STORAGE_QUARANTINED_ITEMS: [],
                "last_reconcile_at": None,
                "last_prune_at": None,
            }
        ),
    )
    monkeypatch.setattr(manager._storage, "async_save", AsyncMock())

    await manager.async_initialize()

    snapshot = manager.diagnostics_snapshot()

    assert snapshot["counts"]["active_items"] == 0
    assert snapshot["counts"]["archive_items"] == 1
    assert snapshot["counts"]["quarantined_items"] == 2
    assert manager.restore_stats["malformed_active_items"] == 1
    assert manager.restore_stats["malformed_archive_items"] == 1
    assert snapshot["quarantine_tail"][0]["collection"] == QUARANTINE_COLLECTION_ACTIVE
    assert snapshot["quarantine_tail"][1]["collection"] == QUARANTINE_COLLECTION_ARCHIVE
    assert snapshot["quarantine_tail"][0]["payload"] == bad_active
    assert snapshot["quarantine_tail"][1]["payload"] == bad_archive

"""Core state manager for Tunet Inbox."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    ACTIVE_STATUSES,
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_MOBILE_TAP_URL,
    CONF_NOTIFY_DEVICE_HELPER,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DEDUPE_APPEND,
    DEDUPE_IGNORE,
    DEDUPE_REFRESH,
    DEDUPE_REPLACE,
    DEFAULT_LIST_STATUSES,
    FAILURE_DUPLICATE_APPEND_KEY,
    FAILURE_EXPIRED,
    FAILURE_HANDLER_TIMEOUT,
    FAILURE_INVALID_ACTION,
    FAILURE_ITEM_NOT_FOUND,
    FAILURE_LOCK_CONFLICT,
    FAILURE_NOT_PENDING,
    FAILURE_QUEUE_FULL,
    FAILURE_STALE_ACTION,
    INBOX_TAP_URL,
    QUARANTINE_COLLECTION_ACTIVE,
    QUARANTINE_COLLECTION_ARCHIVE,
    STATUS_DISMISSED,
    STATUS_EXPIRED,
    STATUS_FAILED,
    STATUS_PENDING,
    STATUS_REPLACED,
    STATUS_RESOLVED,
    STATUS_RESPONDING,
    TERMINAL_STATUSES,
    STORAGE_QUARANTINED_ITEMS,
)
from .events import async_emit_action, async_emit_updated
from .mobile import async_clear_item_notification, async_send_item_notification
from .models import (
    ContractError,
    InboxItem,
    normalize_dedupe_policy,
    normalize_response_source,
    severity_sort_key,
    utcnow_iso,
)
from .storage import TunetInboxStorage

_LOGGER = logging.getLogger(__name__)


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    candidate = value.replace("Z", "+00:00")
    return datetime.fromisoformat(candidate)


class TunetInboxManager:
    """Governed queue manager."""

    def __init__(self, hass: HomeAssistant, config: dict[str, Any]) -> None:
        self.hass = hass
        self._config = config
        self._storage = TunetInboxStorage(hass)
        self._active_items: dict[str, InboxItem] = {}
        self._archive_items: list[dict[str, Any]] = []
        self._quarantined_items: list[dict[str, Any]] = []
        self._item_id_by_key: dict[str, str] = {}
        self._locks: dict[str, asyncio.Lock] = {}
        self._last_reconcile_at: str | None = None
        self._last_prune_at: str | None = None
        self._restore_stats: dict[str, int] = {
            "malformed_active_items": 0,
            "malformed_archive_items": 0,
        }

    async def async_initialize(self) -> None:
        """Load persisted state and reconcile it."""
        data = await self._storage.async_load()
        self._quarantined_items = list(data.get(STORAGE_QUARANTINED_ITEMS, []))
        for payload in data.get("active_items", []):
            try:
                item = InboxItem.from_dict(payload)
            except ContractError as err:
                self._restore_stats["malformed_active_items"] += 1
                self._quarantine_restore_payload(
                    collection=QUARANTINE_COLLECTION_ACTIVE,
                    payload=payload,
                    error=err,
                )
                _LOGGER.warning(
                    "tunet_inbox quarantined malformed active item during restore: %s",
                    err,
                )
                continue
            self._active_items[item.item_id] = item
            self._item_id_by_key[item.key] = item.item_id
        for payload in data.get("archive_items", []):
            try:
                item = InboxItem.from_dict(payload)
            except ContractError as err:
                self._restore_stats["malformed_archive_items"] += 1
                self._quarantine_restore_payload(
                    collection=QUARANTINE_COLLECTION_ARCHIVE,
                    payload=payload,
                    error=err,
                )
                _LOGGER.warning(
                    "tunet_inbox quarantined malformed archive item during restore: %s",
                    err,
                )
                continue
            self._archive_items.append(item.as_dict())
        self._last_reconcile_at = data.get("last_reconcile_at")
        self._last_prune_at = data.get("last_prune_at")
        await self.async_reconcile_startup()

    async def async_reconcile_startup(self) -> None:
        """Normalize stuck or expired active items after startup."""
        now = datetime.now(timezone.utc)
        for item in list(self._active_items.values()):
            expires_at = _parse_iso(item.expires_at)
            if item.status == STATUS_RESPONDING:
                started = _parse_iso(item.response_started_at) or now
                if (now - started).total_seconds() >= self.response_timeout_seconds:
                    item.status = STATUS_PENDING
                    item.last_error = FAILURE_HANDLER_TIMEOUT
                    item.response_started_at = None
                    item.touch()
            elif expires_at and expires_at <= now and item.status == STATUS_PENDING:
                await self._terminalize(item, STATUS_EXPIRED, resolution_reason="startup_expired")

        self._last_reconcile_at = utcnow_iso()
        await self._prune_archive(now)
        await self._save()

    async def async_sweep_expired_and_stuck(self, _now: datetime | None = None) -> None:
        """Periodic sweep for expired or stuck queue items."""
        now = _now or datetime.now(timezone.utc)
        changed = False
        for item in list(self._active_items.values()):
            expires_at = _parse_iso(item.expires_at)
            if item.status == STATUS_RESPONDING:
                started = _parse_iso(item.response_started_at) or now
                if (now - started).total_seconds() >= self.response_timeout_seconds:
                    item.status = STATUS_PENDING
                    item.last_error = FAILURE_HANDLER_TIMEOUT
                    item.response_started_at = None
                    item.touch()
                    await async_emit_updated(self.hass, reason="fail", item=item)
                    changed = True
            elif item.status == STATUS_PENDING and expires_at and expires_at <= now:
                await self._terminalize(item, STATUS_EXPIRED, resolution_reason="periodic_expired")
                await async_emit_updated(self.hass, reason="expire", item=item)
                changed = True

        pruned = await self._prune_archive(now)
        if changed or pruned:
            await self._save()

    @property
    def default_notify_target(self) -> str | None:
        return self._config.get(CONF_NOTIFY_DEVICE_HELPER)

    @property
    def default_mobile_tap_url(self) -> str:
        candidate = str(self._config.get(CONF_MOBILE_TAP_URL, "") or "").strip()
        return candidate or INBOX_TAP_URL

    @property
    def max_pending_items(self) -> int:
        return int(self._config.get(CONF_MAX_PENDING_ITEMS, 64))

    @property
    def response_timeout_seconds(self) -> int:
        return int(self._config.get(CONF_RESPONSE_TIMEOUT_SECONDS, 30))

    @property
    def archive_retention_days(self) -> int:
        return int(self._config.get(CONF_ARCHIVE_RETENTION_DAYS, 3))

    @property
    def privacy_mode_default(self) -> bool:
        return bool(self._config.get(CONF_PRIVACY_MODE_DEFAULT, False))

    @property
    def debug_events(self) -> bool:
        return bool(self._config.get(CONF_DEBUG_EVENTS, False))

    @property
    def restore_stats(self) -> dict[str, int]:
        return dict(self._restore_stats)

    @property
    def quarantine_count(self) -> int:
        return len(self._quarantined_items)

    def async_update_config(self, config: dict[str, Any]) -> None:
        """Update the live runtime configuration from a config entry reload."""
        self._config = config

    async def async_post(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create or upsert a queue item."""
        item = InboxItem.from_post_payload(
            payload,
            default_mobile_tap_url=self.default_mobile_tap_url,
        )
        dedupe_policy = normalize_dedupe_policy(payload.get("dedupe_policy"))
        existing_id = self._item_id_by_key.get(item.key)
        existing_item = self._active_items.get(existing_id) if existing_id else None

        if dedupe_policy == DEDUPE_APPEND and existing_item:
            return {
                "accepted": False,
                "reason": FAILURE_DUPLICATE_APPEND_KEY,
                "key": item.key,
                "item_id": None,
                "result": "rejected",
                "mobile_send_status": {"ok": False},
            }

        if dedupe_policy == DEDUPE_IGNORE and existing_item:
            return {
                "accepted": True,
                "reason": None,
                "key": existing_item.key,
                "item_id": existing_item.item_id,
                "result": "ignored",
                "mobile_send_status": {"ok": True, "skipped": True},
            }

        if dedupe_policy == DEDUPE_REFRESH and existing_item:
            existing_item.title = item.title
            existing_item.message = item.message
            existing_item.subtitle = item.subtitle
            existing_item.actions = item.actions
            existing_item.context = item.context
            existing_item.mobile = item.mobile
            existing_item.priority = item.priority
            existing_item.severity = item.severity
            existing_item.family = item.family
            existing_item.room = item.room
            existing_item.icon = item.icon
            existing_item.badge = item.badge
            existing_item.privacy = item.privacy
            existing_item.expires_at = item.expires_at
            existing_item.source = item.source
            existing_item.last_error = None
            existing_item.touch()
            send_status = {"ok": True, "skipped": True}
            if payload.get("send_mobile", True):
                send_status = await async_send_item_notification(
                    self.hass,
                    item=existing_item,
                    default_notify_target=self.default_notify_target,
                    default_tap_url=self.default_mobile_tap_url,
                )
                if not send_status.get("ok"):
                    existing_item.last_error = send_status.get("reason")
            await self._save()
            await async_emit_updated(self.hass, reason="post", item=existing_item)
            return {
                "accepted": True,
                "reason": existing_item.last_error,
                "key": existing_item.key,
                "item_id": existing_item.item_id,
                "result": "refreshed",
                "mobile_send_status": send_status,
            }

        if existing_item and dedupe_policy == DEDUPE_REPLACE:
            await self._terminalize(existing_item, STATUS_REPLACED, resolution_reason="dedupe_replace")

        if len(self._active_items) >= self.max_pending_items:
            return {
                "accepted": False,
                "reason": FAILURE_QUEUE_FULL,
                "key": item.key,
                "item_id": None,
                "result": "rejected",
                "mobile_send_status": {"ok": False},
            }

        self._active_items[item.item_id] = item
        self._item_id_by_key[item.key] = item.item_id
        send_status = {"ok": True, "skipped": True}
        if payload.get("send_mobile", True):
            send_status = await async_send_item_notification(
                self.hass,
                item=item,
                default_notify_target=self.default_notify_target,
                default_tap_url=self.default_mobile_tap_url,
            )
            if not send_status.get("ok"):
                item.last_error = send_status.get("reason")
                item.touch()

        await self._save()
        await async_emit_updated(self.hass, reason="post", item=item)
        return {
            "accepted": True,
            "reason": item.last_error,
            "key": item.key,
            "item_id": item.item_id,
            "result": "created",
            "mobile_send_status": send_status,
        }

    async def async_list_items(
        self,
        *,
        statuses: list[str] | None = None,
        families: list[str] | None = None,
        rooms: list[str] | None = None,
        privacy_mode: bool | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
        """Return render-normalized queue items."""
        allowed_statuses = set(statuses or DEFAULT_LIST_STATUSES)
        use_privacy_mode = self.privacy_mode_default if privacy_mode is None else privacy_mode

        items = [
            item
            for item in self._active_items.values()
            if item.status in allowed_statuses
            and (not families or item.family in families)
            and (not rooms or item.room in rooms)
        ]
        items.sort(
            key=lambda item: (
                -int(item.priority),
                -severity_sort_key(item.severity),
                item.created_at,
            )
        )
        if limit is not None:
            items = items[:limit]

        return {
            "items": [item.to_render_dict(privacy_mode=use_privacy_mode) for item in items],
            "meta": {
                "total": len(items),
                "highest_priority": max((item.priority for item in items), default=0),
                "generated_at": utcnow_iso(),
            },
        }

    def _resolve_active_reference(
        self,
        *,
        item_id: str | None = None,
        key: str | None = None,
    ) -> tuple[str | None, InboxItem | None]:
        if item_id:
            return item_id, self._active_items.get(item_id)
        if key:
            resolved_item_id = self._item_id_by_key.get(key)
            if not resolved_item_id:
                return None, None
            return resolved_item_id, self._active_items.get(resolved_item_id)
        return None, None

    async def async_accept_response(
        self,
        *,
        item_id: str | None = None,
        key: str | None = None,
        action_id: str,
        source: str,
        surface: str,
        actor: dict[str, Any] | None,
    ) -> dict[str, Any]:
        """Validate and accept a response from dashboard or mobile."""
        if source != "phone":
            source = normalize_response_source(source)
        resolved_item_id, item = self._resolve_active_reference(item_id=item_id, key=key)
        if not item:
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "action_id": action_id,
                "reason": FAILURE_ITEM_NOT_FOUND,
            }

        if item.status != STATUS_PENDING:
            reason = FAILURE_STALE_ACTION if item.status in TERMINAL_STATUSES else FAILURE_NOT_PENDING
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "action_id": action_id,
                "reason": reason,
            }

        expires_at = _parse_iso(item.expires_at)
        if expires_at and expires_at <= datetime.now(timezone.utc):
            await self._terminalize(item, STATUS_EXPIRED, resolution_reason="respond_after_expiry")
            await self._save()
            await async_emit_updated(self.hass, reason="expire", item=item)
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "action_id": action_id,
                "reason": FAILURE_EXPIRED,
            }

        if not item.has_action(action_id):
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "action_id": action_id,
                "reason": FAILURE_INVALID_ACTION,
            }

        lock = self._locks.setdefault(item.item_id, asyncio.Lock())
        if lock.locked():
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "action_id": action_id,
                "reason": FAILURE_LOCK_CONFLICT,
            }

        async with lock:
            current = self._active_items.get(item.item_id)
            if not current or current.status != STATUS_PENDING:
                return {
                    "accepted": False,
                    "item_id": resolved_item_id,
                    "action_id": action_id,
                    "reason": FAILURE_STALE_ACTION,
                }

            current.status = STATUS_RESPONDING
            current.last_actor = actor
            current.response_started_at = utcnow_iso()
            current.touch()
            await self._save()
            await async_emit_updated(self.hass, reason="respond", item=current)
            await async_emit_action(
                self.hass,
                item=current,
                action_id=action_id,
                source=source,
                surface=surface,
                actor=actor,
            )

        return {
            "accepted": True,
            "item_id": resolved_item_id,
            "action_id": action_id,
            "reason": None,
        }

    async def async_resolve(
        self,
        *,
        item_id: str | None = None,
        key: str | None = None,
        reason: str,
        result: dict[str, Any] | None = None,
        clear_mobile: bool = True,
    ) -> dict[str, Any]:
        """Resolve a queue item and clear the matching mobile prompt."""
        resolved_item_id, item = self._resolve_active_reference(item_id=item_id, key=key)
        if not item:
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "reason": FAILURE_ITEM_NOT_FOUND,
                "mobile_clear_status": None,
            }

        item.resolution_reason = reason
        mobile_status = {"ok": True, "skipped": True}
        if clear_mobile and item.mobile.clear_on_resolve:
            mobile_status = await async_clear_item_notification(
                self.hass,
                item=item,
                default_notify_target=self.default_notify_target,
            )
            if not mobile_status.get("ok"):
                item.last_error = mobile_status.get("reason")

        await self._terminalize(item, STATUS_RESOLVED, resolution_reason=reason)
        await self._save()
        await async_emit_updated(self.hass, reason="resolve", item=item)
        return {
            "accepted": True,
            "item_id": resolved_item_id,
            "reason": reason,
            "result": result,
            "mobile_clear_status": mobile_status,
        }

    async def async_fail(
        self,
        *,
        item_id: str | None = None,
        key: str | None = None,
        reason: str,
        details: str | None = None,
        return_to_pending: bool = False,
    ) -> dict[str, Any]:
        """Mark an in-flight item as failed or retryable."""
        resolved_item_id, item = self._resolve_active_reference(item_id=item_id, key=key)
        if not item:
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "status": None,
                "reason": FAILURE_ITEM_NOT_FOUND,
            }

        item.last_error = details or reason
        if return_to_pending:
            item.status = STATUS_PENDING
            item.response_started_at = None
            item.touch()
            await self._save()
            await async_emit_updated(self.hass, reason="fail", item=item)
            return {
                "accepted": True,
                "item_id": resolved_item_id,
                "status": item.status,
                "reason": reason,
            }

        await self._terminalize(item, STATUS_FAILED, resolution_reason=reason)
        await self._save()
        await async_emit_updated(self.hass, reason="fail", item=item)
        return {
            "accepted": True,
            "item_id": resolved_item_id,
            "status": STATUS_FAILED,
            "reason": reason,
        }

    async def async_dismiss(
        self,
        *,
        item_id: str | None = None,
        key: str | None = None,
        reason: str,
    ) -> dict[str, Any]:
        """Dismiss a queue item without executing a business action."""
        resolved_item_id, item = self._resolve_active_reference(item_id=item_id, key=key)
        if not item:
            return {
                "accepted": False,
                "item_id": resolved_item_id,
                "status": None,
                "reason": FAILURE_ITEM_NOT_FOUND,
            }

        if item.mobile.clear_on_resolve:
            mobile_status = await async_clear_item_notification(
                self.hass,
                item=item,
                default_notify_target=self.default_notify_target,
            )
            if not mobile_status.get("ok"):
                item.last_error = mobile_status.get("reason")

        await self._terminalize(item, STATUS_DISMISSED, resolution_reason=reason)
        await self._save()
        await async_emit_updated(self.hass, reason="dismiss", item=item)
        return {
            "accepted": True,
            "item_id": resolved_item_id,
            "status": STATUS_DISMISSED,
            "reason": reason,
        }

    async def _terminalize(
        self,
        item: InboxItem,
        terminal_status: str,
        *,
        resolution_reason: str,
    ) -> None:
        item.status = terminal_status
        item.resolution_reason = resolution_reason
        item.touch()
        self._archive_items.append(item.as_dict())
        self._active_items.pop(item.item_id, None)
        if self._item_id_by_key.get(item.key) == item.item_id:
            self._item_id_by_key.pop(item.key, None)

    async def _prune_archive(self, now: datetime) -> bool:
        cutoff = now - timedelta(days=self.archive_retention_days)
        original_len = len(self._archive_items)
        kept: list[dict[str, Any]] = []
        for payload in self._archive_items:
            updated_at = _parse_iso(payload.get("updated_at"))
            if updated_at and updated_at >= cutoff:
                kept.append(payload)
        self._archive_items = kept
        self._last_prune_at = utcnow_iso()
        return len(self._archive_items) != original_len

    async def _save(self) -> None:
        await self._storage.async_save(
            active_items=[item.as_dict() for item in self._active_items.values()],
            archive_items=self._archive_items,
            quarantined_items=self._quarantined_items,
            last_reconcile_at=self._last_reconcile_at,
            last_prune_at=self._last_prune_at,
        )

    def _quarantine_restore_payload(
        self,
        *,
        collection: str,
        payload: Any,
        error: ContractError,
    ) -> None:
        self._quarantined_items.append(
            {
                "collection": collection,
                "error": str(error),
                "quarantined_at": utcnow_iso(),
                "payload": payload,
            }
        )

    def diagnostics_snapshot(self) -> dict[str, Any]:
        """Return a support-oriented view of the current runtime state."""
        return {
            "config": {
                CONF_NOTIFY_DEVICE_HELPER: self.default_notify_target,
                CONF_MOBILE_TAP_URL: self.default_mobile_tap_url,
                CONF_MAX_PENDING_ITEMS: self.max_pending_items,
                CONF_RESPONSE_TIMEOUT_SECONDS: self.response_timeout_seconds,
                CONF_ARCHIVE_RETENTION_DAYS: self.archive_retention_days,
                CONF_PRIVACY_MODE_DEFAULT: self.privacy_mode_default,
                CONF_DEBUG_EVENTS: self.debug_events,
            },
            "counts": {
                "active_items": len(self._active_items),
                "archive_items": len(self._archive_items),
                "quarantined_items": len(self._quarantined_items),
                "locks": len(self._locks),
            },
            "restore_stats": self.restore_stats,
            "last_reconcile_at": self._last_reconcile_at,
            "last_prune_at": self._last_prune_at,
            "active_items": [item.as_dict() for item in self._active_items.values()],
            "archive_tail": self._archive_items[-10:],
            "quarantine_tail": self._quarantined_items[-10:],
        }

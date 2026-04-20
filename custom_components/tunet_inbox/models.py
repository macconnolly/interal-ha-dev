"""Typed models and validation helpers for Tunet Inbox."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import re
from typing import Any
from uuid import uuid4

from .const import (
    ALL_DEDUPE_POLICIES,
    ALL_PRIVACY_VALUES,
    ALL_RESPONSE_SOURCES,
    ALL_STATUSES,
    INBOX_TAP_URL,
    RAW_ACTION_PREFIX,
    SCHEMA_VERSION,
    SEVERITY_INFO,
    SEVERITY_NOTICE,
    SEVERITY_ORDER,
    STATUS_PENDING,
)

_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")


class ContractError(ValueError):
    """Raised when payload data violates the tunet_inbox contract."""


def utcnow_iso() -> str:
    """Return the current UTC timestamp as ISO-8601."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _require_safe_id(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value or not _SAFE_ID_RE.fullmatch(value):
        raise ContractError(f"{field_name} must match {_SAFE_ID_RE.pattern}")
    return value


def _require_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str):
        raise ContractError(f"{field_name} must be a string")
    normalized = value.strip()
    if not normalized:
        raise ContractError(f"{field_name} must be a non-empty string")
    return normalized


def _optional_string(value: Any, field_name: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ContractError(f"{field_name} must be a string or null")
    return value


def _normalize_mobile_url(
    value: Any,
    field_name: str,
    *,
    allowed_url: str | None = None,
    default_to_url: str | None = None,
) -> str | None:
    if value is None:
        return default_to_url
    if not isinstance(value, str):
        raise ContractError(f"{field_name} must be a string or null")

    normalized = value.strip()
    if not normalized:
        return default_to_url
    if allowed_url is not None and normalized != allowed_url:
        raise ContractError(f"{field_name} must equal {allowed_url}")
    return normalized


def _optional_bool(value: Any, field_name: str, default: bool = False) -> bool:
    if value is None:
        return default
    if not isinstance(value, bool):
        raise ContractError(f"{field_name} must be a boolean")
    return value


def _optional_object(value: Any, field_name: str) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ContractError(f"{field_name} must be an object")
    return value


@dataclass(slots=True)
class InboxAction:
    """Render-safe action metadata."""

    id: str
    title: str
    icon: str | None = None
    destructive: bool = False
    requires_confirm: bool = False
    style: str = "secondary"
    disabled_reason: str | None = None

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "InboxAction":
        if not isinstance(payload, dict):
            raise ContractError("action must be an object")
        return cls(
            id=_require_safe_id(payload.get("id"), "actions[].id"),
            title=_require_text(payload.get("title"), "actions[].title"),
            icon=_optional_string(payload.get("icon"), "actions[].icon"),
            destructive=_optional_bool(
                payload.get("destructive"), "actions[].destructive", default=False
            ),
            requires_confirm=_optional_bool(
                payload.get("requires_confirm"),
                "actions[].requires_confirm",
                default=False,
            ),
            style=_optional_string(payload.get("style"), "actions[].style") or "secondary",
            disabled_reason=_optional_string(
                payload.get("disabled_reason"), "actions[].disabled_reason"
            ),
        )

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class InboxMobileConfig:
    """Mobile delivery metadata."""

    tag: str
    notify_service: str | None = None
    url: str | None = None
    clear_on_resolve: bool = True

    @classmethod
    def from_dict(
        cls,
        payload: dict[str, Any],
        *,
        allowed_url: str | None = None,
        default_to_url: str | None = None,
    ) -> "InboxMobileConfig":
        if not isinstance(payload, dict):
            raise ContractError("mobile must be an object")
        return cls(
            tag=_require_safe_id(payload.get("tag"), "mobile.tag"),
            notify_service=_optional_string(payload.get("notify_service"), "mobile.notify_service"),
            url=_normalize_mobile_url(
                payload.get("url"),
                "mobile.url",
                allowed_url=allowed_url,
                default_to_url=default_to_url,
            ),
            clear_on_resolve=_optional_bool(
                payload.get("clear_on_resolve"), "mobile.clear_on_resolve", default=True
            ),
        )

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class InboxItem:
    """Persistent queue item."""

    schema_version: int
    item_id: str
    key: str
    status: str
    title: str
    message: str
    subtitle: str | None
    actions: list[InboxAction]
    context: dict[str, Any]
    mobile: InboxMobileConfig
    priority: int
    severity: str
    family: str
    room: str | None
    icon: str | None
    badge: str | None
    privacy: str
    created_at: str
    updated_at: str
    expires_at: str | None
    source: dict[str, Any]
    last_actor: dict[str, Any] | None = None
    last_error: str | None = None
    response_started_at: str | None = None
    resolution_reason: str | None = None

    @classmethod
    def from_post_payload(
        cls,
        payload: dict[str, Any],
        *,
        default_mobile_tap_url: str = INBOX_TAP_URL,
    ) -> "InboxItem":
        actions_payload = payload.get("actions")
        if not isinstance(actions_payload, list) or not actions_payload:
            raise ContractError("actions must be a non-empty list")
        actions = [InboxAction.from_dict(action) for action in actions_payload]

        mobile_payload = payload.get("mobile") or {}
        if payload.get("send_mobile", True) is not False:
            mobile = InboxMobileConfig.from_dict(
                mobile_payload,
                allowed_url=default_mobile_tap_url,
                default_to_url=default_mobile_tap_url,
            )
        else:
            mobile = InboxMobileConfig(
                tag=_require_safe_id(
                    (mobile_payload or {}).get("tag", f"local:{uuid4()}"), "mobile.tag"
                ),
                notify_service=_optional_string(
                    (mobile_payload or {}).get("notify_service"), "mobile.notify_service"
                ),
                url=_normalize_mobile_url(
                    (mobile_payload or {}).get("url"),
                    "mobile.url",
                    allowed_url=default_mobile_tap_url,
                ),
                clear_on_resolve=_optional_bool(
                    (mobile_payload or {}).get("clear_on_resolve"),
                    "mobile.clear_on_resolve",
                    default=True,
                ),
            )

        severity = payload.get("severity") or SEVERITY_NOTICE
        if severity not in SEVERITY_ORDER:
            raise ContractError("severity must be one of info|notice|warning|critical")

        privacy = payload.get("privacy") or "public"
        if privacy not in ALL_PRIVACY_VALUES:
            raise ContractError("privacy must be one of public|sensitive")

        now = utcnow_iso()
        return cls(
            schema_version=SCHEMA_VERSION,
            item_id=str(uuid4()),
            key=_require_safe_id(payload.get("key"), "key"),
            status=STATUS_PENDING,
            title=_require_text(payload.get("title"), "title"),
            message=_optional_string(payload.get("message"), "message") or "",
            subtitle=_optional_string(payload.get("subtitle"), "subtitle"),
            actions=actions,
            context=_optional_object(payload.get("context"), "context"),
            mobile=mobile,
            priority=int(payload.get("priority") or 0),
            severity=severity,
            family=_require_safe_id(payload.get("family") or "general", "family"),
            room=_optional_string(payload.get("room"), "room"),
            icon=_optional_string(payload.get("icon"), "icon"),
            badge=_optional_string(payload.get("badge"), "badge"),
            privacy=privacy,
            created_at=now,
            updated_at=now,
            expires_at=_optional_string(payload.get("expires_at"), "expires_at"),
            source=_optional_object(payload.get("source"), "source"),
        )

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "InboxItem":
        if not isinstance(payload, dict):
            raise ContractError("item payload must be an object")
        status = payload.get("status")
        if status not in ALL_STATUSES:
            raise ContractError(f"invalid status: {status}")
        severity = payload.get("severity")
        if severity not in SEVERITY_ORDER:
            raise ContractError(f"invalid severity: {severity}")
        privacy = payload.get("privacy") or "public"
        if privacy not in ALL_PRIVACY_VALUES:
            raise ContractError(f"invalid privacy: {privacy}")
        actions = [InboxAction.from_dict(action) for action in payload.get("actions", [])]
        if not actions:
            raise ContractError("actions must be a non-empty list")
        return cls(
            schema_version=int(payload.get("schema_version", SCHEMA_VERSION)),
            item_id=_require_safe_id(payload.get("item_id"), "item_id"),
            key=_require_safe_id(payload.get("key"), "key"),
            status=status,
            title=_require_text(payload.get("title"), "title"),
            message=_optional_string(payload.get("message"), "message") or "",
            subtitle=_optional_string(payload.get("subtitle"), "subtitle"),
            actions=actions,
            context=_optional_object(payload.get("context"), "context"),
            mobile=InboxMobileConfig.from_dict(payload.get("mobile") or {}),
            priority=int(payload.get("priority") or 0),
            severity=severity,
            family=_require_safe_id(payload.get("family"), "family"),
            room=_optional_string(payload.get("room"), "room"),
            icon=_optional_string(payload.get("icon"), "icon"),
            badge=_optional_string(payload.get("badge"), "badge"),
            privacy=privacy,
            created_at=_require_text(payload.get("created_at"), "created_at"),
            updated_at=_require_text(payload.get("updated_at"), "updated_at"),
            expires_at=_optional_string(payload.get("expires_at"), "expires_at"),
            source=_optional_object(payload.get("source"), "source"),
            last_actor=payload.get("last_actor"),
            last_error=_optional_string(payload.get("last_error"), "last_error"),
            response_started_at=_optional_string(
                payload.get("response_started_at"), "response_started_at"
            ),
            resolution_reason=_optional_string(
                payload.get("resolution_reason"), "resolution_reason"
            ),
        )

    def as_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["actions"] = [action.as_dict() for action in self.actions]
        data["mobile"] = self.mobile.as_dict()
        return data

    def has_action(self, action_id: str) -> bool:
        return any(action.id == action_id for action in self.actions)

    def touch(self) -> None:
        self.updated_at = utcnow_iso()

    def to_render_dict(self, privacy_mode: bool = False) -> dict[str, Any]:
        data = self.as_dict()
        if privacy_mode and self.privacy == "sensitive":
            data["message"] = "Hidden notification"
            data["subtitle"] = None
        return data


def parse_raw_mobile_action(value: Any) -> tuple[str, str] | None:
    """Parse `TINBOX|<item_id>|<action_id>` from a raw mobile action string."""
    if not isinstance(value, str):
        return None
    parts = value.split("|", 2)
    if len(parts) != 3 or parts[0] != RAW_ACTION_PREFIX:
        return None
    item_id = _require_safe_id(parts[1], "mobile action item_id")
    action_id = _require_safe_id(parts[2], "mobile action action_id")
    return item_id, action_id


def normalize_dedupe_policy(value: Any) -> str:
    """Validate dedupe policy and return the normalized string."""
    policy = value or "replace"
    if policy not in ALL_DEDUPE_POLICIES:
        raise ContractError("dedupe_policy must be one of replace|refresh|ignore|append")
    return policy


def normalize_response_source(value: Any) -> str:
    """Validate response source string."""
    source = value or ""
    if source not in ALL_RESPONSE_SOURCES:
        raise ContractError("source must be dashboard_card or dashboard_popup")
    return source


def severity_sort_key(value: str) -> int:
    """Return a descending-friendly numeric severity."""
    return SEVERITY_ORDER.get(value, SEVERITY_ORDER[SEVERITY_INFO])

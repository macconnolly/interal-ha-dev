"""Fixtures for tunet_inbox tests."""

from __future__ import annotations

from collections.abc import Callable

import pytest

from custom_components.tunet_inbox.const import (
    CONF_ARCHIVE_RETENTION_DAYS,
    CONF_DEBUG_EVENTS,
    CONF_MAX_PENDING_ITEMS,
    CONF_PRIVACY_MODE_DEFAULT,
    CONF_RESPONSE_TIMEOUT_SECONDS,
    DOMAIN,
)


@pytest.fixture
def inbox_setup_config() -> dict[str, dict[str, object]]:
    """Return a minimal but explicit YAML config for the integration."""
    return {
        DOMAIN: {
            CONF_MAX_PENDING_ITEMS: 64,
            CONF_RESPONSE_TIMEOUT_SECONDS: 30,
            CONF_ARCHIVE_RETENTION_DAYS: 3,
            CONF_PRIVACY_MODE_DEFAULT: False,
            CONF_DEBUG_EVENTS: False,
        }
    }


@pytest.fixture
def base_post_payload() -> dict[str, object]:
    """Return a stable queue payload used across the targeted tests."""
    return {
        "key": "ti1a_probe",
        "title": "TI1A Probe",
        "message": "Exercise the governed inbox path",
        "actions": [
            {"id": "TEST_ACK", "title": "Acknowledge"},
            {"id": "TEST_DISMISS", "title": "Dismiss"},
        ],
        "family": "ops",
        "context": {"probe": "unit"},
        "mobile": {"tag": "ti1a_probe_tag"},
        "send_mobile": False,
        "source": {
            "integration": "pytest",
            "automation_id": "ti1a_fixture",
            "reason": "targeted_test",
        },
    }


@pytest.fixture
def capture_events(hass) -> Callable[[str], list]:
    """Capture HA bus events of a given type and clean up listeners after the test."""
    removers = []

    def _capture(event_type: str) -> list:
        events: list = []
        removers.append(hass.bus.async_listen(event_type, lambda event: events.append(event)))
        return events

    yield _capture

    for remove in removers:
        remove()

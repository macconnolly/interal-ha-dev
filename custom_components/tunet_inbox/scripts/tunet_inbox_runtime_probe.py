#!/usr/bin/env python3
"""Deterministic local runtime probes for Tunet Inbox."""

from __future__ import annotations

import argparse
import asyncio
import importlib.util
import json
import types
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
PACKAGE_ROOT = REPO_ROOT / "custom_components" / "tunet_inbox"


def _install_homeassistant_stubs() -> None:
    if "homeassistant" in sys.modules:
        return

    homeassistant_pkg = types.ModuleType("homeassistant")
    core_mod = types.ModuleType("homeassistant.core")
    helpers_mod = types.ModuleType("homeassistant.helpers")
    helpers_storage_mod = types.ModuleType("homeassistant.helpers.storage")

    class HomeAssistant:  # noqa: D401 - stub for import compatibility
        """Stub HomeAssistant type."""

    class Event:  # noqa: D401 - stub for import compatibility
        """Stub Event type."""

    class Store:
        def __init__(self, *_args, **_kwargs) -> None:
            pass

        def __class_getitem__(cls, _item):
            return cls

        async def async_load(self):
            return None

        async def async_save(self, _value):
            return None

    core_mod.HomeAssistant = HomeAssistant
    core_mod.Event = Event
    helpers_storage_mod.Store = Store
    helpers_mod.storage = helpers_storage_mod
    homeassistant_pkg.core = core_mod
    homeassistant_pkg.helpers = helpers_mod

    sys.modules["homeassistant"] = homeassistant_pkg
    sys.modules["homeassistant.core"] = core_mod
    sys.modules["homeassistant.helpers"] = helpers_mod
    sys.modules["homeassistant.helpers.storage"] = helpers_storage_mod


def _install_custom_component_package_stubs() -> None:
    custom_components_pkg = sys.modules.get("custom_components")
    if custom_components_pkg is None:
        custom_components_pkg = types.ModuleType("custom_components")
        custom_components_pkg.__path__ = [str(REPO_ROOT / "custom_components")]
        sys.modules["custom_components"] = custom_components_pkg

    tunet_pkg = types.ModuleType("custom_components.tunet_inbox")
    tunet_pkg.__path__ = [str(PACKAGE_ROOT)]
    sys.modules["custom_components.tunet_inbox"] = tunet_pkg


def _load_module(module_name: str, file_name: str):
    spec = importlib.util.spec_from_file_location(module_name, PACKAGE_ROOT / file_name)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module {module_name} from {file_name}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


def _load_tunet_inbox_modules():
    _install_homeassistant_stubs()
    _install_custom_component_package_stubs()

    const_mod = _load_module("custom_components.tunet_inbox.const", "const.py")
    models_mod = _load_module("custom_components.tunet_inbox.models", "models.py")
    _load_module("custom_components.tunet_inbox.events", "events.py")
    _load_module("custom_components.tunet_inbox.mobile", "mobile.py")
    _load_module("custom_components.tunet_inbox.storage", "storage.py")
    manager_mod = _load_module("custom_components.tunet_inbox.manager", "manager.py")
    return const_mod, models_mod, manager_mod


CONST_MOD, MODELS_MOD, MANAGER_MOD = _load_tunet_inbox_modules()
TunetInboxManager = MANAGER_MOD.TunetInboxManager
InboxItem = MODELS_MOD.InboxItem


def _build_probe_manager(item: InboxItem) -> TunetInboxManager:
    """Create a narrow manager instance without HA storage bootstrap."""

    manager = object.__new__(TunetInboxManager)
    manager.hass = object()
    manager._config = {}
    manager._storage = None
    manager._active_items = {item.item_id: item}
    manager._archive_items = []
    manager._item_id_by_key = {item.key: item.item_id}
    manager._locks = {}
    manager._last_reconcile_at = None
    manager._last_prune_at = None
    return manager


async def _probe_lock_conflict() -> dict[str, object]:
    item = InboxItem.from_post_payload(
        {
            "key": "runtime_probe_lock_conflict",
            "title": "Runtime Probe Lock Conflict",
            "message": "Deterministic local proof item",
            "actions": [{"id": "TEST_LOCK", "title": "Test Lock"}],
            "family": "ops",
            "severity": "notice",
            "send_mobile": False,
            "source": {
                "integration": "tunet_inbox",
                "automation_id": "runtime_probe",
                "reason": "lock_conflict",
            },
        }
    )
    manager = _build_probe_manager(item)
    lock = asyncio.Lock()
    manager._locks[item.item_id] = lock

    await lock.acquire()
    try:
        result = await manager.async_accept_response(
            item_id=item.item_id,
            action_id="TEST_LOCK",
            source="dashboard_card",
            surface="dashboard_card",
            actor={"client_id": "runtime-probe"},
        )
    finally:
        lock.release()

    expected = {
        "accepted": False,
        "item_id": item.item_id,
        "action_id": "TEST_LOCK",
        "reason": "lock_conflict",
    }
    ok = result == expected
    return {
        "probe": "lock-conflict",
        "ok": ok,
        "expected": expected,
        "actual": result,
    }


async def _run_probe(name: str) -> dict[str, object]:
    if name == "lock-conflict":
        return await _probe_lock_conflict()
    raise ValueError(f"Unsupported probe: {name}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run deterministic Tunet Inbox runtime probes")
    parser.add_argument(
        "probe",
        choices=["lock-conflict"],
        help="Probe name to execute",
    )
    args = parser.parse_args()

    result = asyncio.run(_run_probe(args.probe))
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

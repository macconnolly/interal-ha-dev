# SA0 — Alarm Backend Hygiene + Governance Sync

Closed: 2026-04-23 (deployed live 2026-04-28)

> **Out-of-spec (2026-04-30):** Part of the SA-series isolated side task. Root Tunet authority remained CD9 throughout. No CD tranche advanced. See `FIX_LEDGER.md` 2026-04-30 Session Delta.

Governing plan: `~/.claude/plans/tunet-sonos-alarm-manage.md`

## Purpose

Clear alarm-backend technical debt and record the AGENTS.md §3 alarm-edit-popup exception before SA2/SA3/SA4 build the UI. SA0 is strictly backend + governance; no Tunet v3 card files touched.

## Pre-work live audit (2026-04-23 MCP)

Live state verified before making any edits:

- `switch.sonos_alarm_bedroom` — exists, state=on, alarm_id=42, 05:30 WEEKDAYS
- `switch.sonos_alarm_bath` — exists, state=off, alarm_id=37, 17:00 WEEKDAYS
- `switch.sonos_alarm_bedroom_weekend` — exists, state=off, alarm_id=155
- `switch.sonos_alarm_bath_weekend` — exists, state=off, alarm_id=823
- `switch.sonos_alarm_{kitchen,living_room,office,42}` — 404 (phantom)
- `switch.sonos_alarm_{10,182,1381}` — exist (numeric parallels), all disabled
- `script.sonos_adjust_edit_time` — live (mode=restart), regression-verified (+5 min: 05:30 → 05:35)
- `sensor.sonos_enabled_alarm_count` = 1; `sensor.sonos_next_alarm` = "05:30 · Bedroom"

## Changes applied

### `packages/sonos_package.yaml`

1. **D4 — dead display sensor deletion**
   - Removed template sensor definitions for `sonos_alarm_living_room_display` and `sonos_alarm_kitchen_display` (previous lines 746-762).
   - Kept `sonos_alarm_bedroom_display` and `sonos_alarm_bath_display` intact (live values).

2. **D3 — quick-action script rewrite (canonical entities)**
   - `sonos_enable_weekday_alarms` → `[switch.sonos_alarm_bedroom, switch.sonos_alarm_bath]`
   - `sonos_enable_weekend_alarms` → `[switch.sonos_alarm_bedroom_weekend, switch.sonos_alarm_bath_weekend]`
   - `sonos_disable_all_alarms` → all four canonical entities
   - Dropped dead `switch.sonos_alarm_42` literal (entity was renamed to `_bedroom`).

3. **D2 + D8 — automation trigger cleanup**
   - `sonos_alarm_trigger_update` trigger list trimmed:
     - Removed: `switch.sonos_alarm_{kitchen,living_room,office}` (phantoms).
     - Kept: `switch.sonos_alarm_{bedroom,bath}`.
     - Added: `switch.sonos_alarm_{bedroom_weekend,bath_weekend}`.

### `Dashboard/Tunet/AGENTS.md`

Added §3 alarm-edit-popup exception bullet. Scope: alarm-edit popup only (`popup_card_id: tunet-alarm-edit`). All other popup triggers remain `fire-dom-event`.

### `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`

Appended dated SA-series migration note documenting LD1–LD4 and the AGENTS.md §3 exception rationale.

### `Dashboard/Tunet/Docs/visual_defect_ledger.md`

CD12 alarm backlog entry updated: status moved from "backlog" to "SA-series active, SA0 closed."

### `Dashboard/Tunet/Docs/sonos_alarm_popup_reference.md`

Added target-architecture section documenting the SA-series contract (Tunet v3 card + stock `custom:popup-card` Browser Mod wrapper + canonical entities). Legacy Bubble Card content marked historical; retirement at SA4.

## Acceptance criteria — all met

- [x] D1: `script.sonos_adjust_edit_time(minutes=5)` advances `input_datetime.sonos_alarm_edit_time` by exactly 5 minutes (live MCP: 05:30 → 05:35).
- [x] D2/D8: `sonos_alarm_trigger_update` trigger list has only live canonical entities (4 entries, no phantoms). Verified via file inspection; requires HA package reload to take effect.
- [x] D3: three quick-action scripts target canonical entities only. No `switch.sonos_alarm_42` literal remains.
- [x] D4: `sensor.sonos_alarm_{kitchen,living_room}_display` definitions deleted; grep returns zero hits outside historical docs.
- [x] `grep -rn "switch.sonos_alarm_42\|switch.sonos_alarm_kitchen\|switch.sonos_alarm_living_room\|switch.sonos_alarm_office" packages/sonos_package.yaml` returns zero hits outside comments.
- [x] `AGENTS.md` §3 has the dated alarm-edit-popup exception bullet.
- [x] `nav_popup_ux_direction.md` has the dated SA-series migration entry.
- [x] `FIX_LEDGER.md` has the Session Delta for SA0 closure.
- [x] `visual_defect_ledger.md` CD12 alarm entry references SA0 closure.
- [x] `python3 -c "import yaml; yaml.safe_load(open('packages/sonos_package.yaml'))"` passes.

## Deploy impact

`HA PACKAGE RELOAD` required: `automation.reload` + `script.reload` + template reload on `packages/sonos_package.yaml`. Not performed in this session; deploy is a separate step via the runbook.

## Rollback

`git restore packages/sonos_package.yaml Dashboard/Tunet/AGENTS.md Dashboard/Tunet/Docs/nav_popup_ux_direction.md Dashboard/Tunet/Docs/visual_defect_ledger.md Dashboard/Tunet/Docs/sonos_alarm_popup_reference.md FIX_LEDGER.md plan.md handoff.md Dashboard/Tunet/Docs/tranches/SA0_alarm_backend_hygiene.md`

Then `automation.reload` + `script.reload` to undo runtime state.

## Next tranche: SA2

SA2 builds `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js`. See `~/.claude/plans/tunet-sonos-alarm-manage.md` §SA2 for exact changes. Blocker list is clear.

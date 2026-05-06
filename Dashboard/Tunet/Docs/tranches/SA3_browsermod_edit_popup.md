# SA3 — Browser Mod Alarm Edit Popup + Script Migration

Closed: 2026-04-23 (deployed live 2026-04-28; popup redesigned and inlined 2026-04-29)

> **Out-of-spec (2026-04-30):** Part of the SA-series isolated side task. Root Tunet authority remained CD9 throughout. The popup was migrated from `popup_card_id` registration to inline `content:` in the `browser_mod.popup` service call (Sections grid was filtering out the popup-card definition); content uses Tunet-actions chips + entity-bound `tile` cards for reactivity. See `FIX_LEDGER.md` 2026-04-30 Session Delta.

Governing plan: `~/.claude/plans/tunet-sonos-alarm-manage.md`

## Scope

Atomically flip the alarm edit flow from the legacy Bubble Card `#edit-alarm` hash popup to a stock Browser Mod `custom:popup-card` registered with `popup_card_id: tunet-alarm-edit`. The popup content is vanilla HA cards (no bespoke Tunet popup card was built). The SA2 alarm tile's hold automatically routes to the new popup because popup-open ownership lives in `script.sonos_load_alarm_for_edit` — single source of truth.

## Files touched

- **New** `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` — reference artifact of the popup definition (the same content is inlined into both dashboard configs; this file is kept as a canonical template for future dashboard surfaces).
- **Edit** `packages/sonos_package.yaml`:
  - `script.sonos_load_alarm_for_edit` (line 2196): final step changed from `browser_mod.navigate: { path: '#edit-alarm' }` → `browser_mod.popup: { popup_card_id: tunet-alarm-edit }`.
  - `script.sonos_save_alarm_changes` (line 2277): trailing step changed from `browser_mod.navigate: { path: '#sonos-alarms' }` → `browser_mod.close_popup` (no args).
- **Edit** `Dashboard/Tunet/tunet-suite-storage-config.yaml` — registered `type: custom:popup-card` with `popup_card_id: tunet-alarm-edit`, `popup_card_all_views: true`, vertical-stack content: markdown header + entities card + ±5/±15 buttons + mushroom-number-card volume + mushroom-entity-card linked-zones + Close/Save buttons.
- **Edit** `Dashboard/Tunet/tunet-suite-config.yaml` — identical popup registration (CD12 dashboard parity: storage-first UX, yaml-mirror architecture truth).

## Wrapper pattern (verified against live corpus)

```yaml
type: custom:popup-card
popup_card_id: tunet-alarm-edit
popup_card_all_views: true
title: Edit Alarm
initial_style: normal
dismissable: true
card:
  type: vertical-stack
  cards:
    - type: markdown
    - type: entities          # time + read-only recurrence (LD3)
    - type: horizontal-stack  # ±15 / ±5 / +5 / +15 buttons
    - type: custom:mushroom-number-card  # volume slider
    - type: custom:mushroom-entity-card  # linked-zones toggle
    - type: horizontal-stack  # Close / Save
```

Matches 10+ existing call sites (living-room-popup, kitchen-popup, dining-room-popup, bedroom-popup) in both dashboards.

## AGENTS.md §3 exception (recorded in SA0)

The card's `hold_action` is `hass.callService("script", "sonos_load_alarm_for_edit", {...})` — a direct service call, not `fire-dom-event`. The script then calls `browser_mod.popup` internally. The scope of the exception is the alarm-edit popup only; all other popup triggers continue to use `fire-dom-event` per §3.

## Acceptance criteria — met (repo-side)

- [x] `python3 -c "import yaml; yaml.safe_load(open('packages/sonos_package.yaml'))"` passes.
- [x] `python3 -c "import yaml; yaml.safe_load(open('Dashboard/Tunet/tunet-suite-storage-config.yaml'))"` passes.
- [x] `python3 -c "import yaml; yaml.safe_load(open('Dashboard/Tunet/tunet-suite-config.yaml'))"` passes.
- [x] Popup registered in BOTH dashboards (storage + yaml).
- [x] Popup definition uses stock `custom:popup-card` wrapper only — no bespoke Tunet popup card built.
- [x] LD3 respected: recurrence is read-only (`sensor.sonos_edit_recurrence_display`).
- [x] Post-rollback continuity: if `packages/sonos_package.yaml` is reverted, the old `#edit-alarm` hash popup *would* re-open, but since its YAMLs were deleted in SA4 step 5, rollback must also revert SA4's `git rm`.

## Live verification (post-deploy — needs HA package reload + dashboard reload)

1. `ha_call_service('script', 'sonos_load_alarm_for_edit', { alarm_entity: 'switch.sonos_alarm_bedroom' })` → verify Browser Mod popup opens with `popup_card_id: tunet-alarm-edit` showing alarm_id=42 / 05:30 / 39% / linked-zones=off.
2. Tap `+5` in popup → `input_datetime.sonos_alarm_edit_time` advances to `05:35:00`.
3. Tap `+5` two more times → `05:45:00`.
4. Drag volume slider to 50% → `input_number.sonos_alarm_edit_volume` = 50.
5. Tap linked-zones toggle → `input_boolean.sonos_alarm_edit_linked_zones` = on.
6. Tap Save → `sonos.update_alarm` service trace shows `alarm_id: 42, time: 05:45:00, volume: 0.5, include_linked_zones: true`; verify `switch.sonos_alarm_bedroom` time attribute updates; popup closes via `browser_mod.close_popup`.
7. Reload `/tunet-suite-storage/alarms`, hold bedroom tile → popup opens showing persisted value.
8. Repeat on the `/tunet-suite/alarms` subview (CD12 dashboard-parity check).
9. Test each breakpoint × dark/light = 8 snapshots.

## Deploy

Requires `HA PACKAGE RELOAD` (script reload) + dashboard YAML reload for both storage and suite configs. Dashboards in HA Lovelace Storage are re-scanned on save; suite-config requires file-level reload.

## Rollback

`git restore packages/sonos_package.yaml Dashboard/Tunet/tunet-suite-config.yaml Dashboard/Tunet/tunet-suite-storage-config.yaml` and `git rm Dashboard/Tunet/tunet-alarm-edit-popup.yaml`. Then `script.reload` on HA. If SA4 has already deleted the legacy popup YAMLs, restore those too from git (`git restore Dashboard/cards/sonos_alarms_popup.yaml ...`).

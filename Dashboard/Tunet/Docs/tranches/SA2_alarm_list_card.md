# SA2 — Tunet Alarm List Card

Closed: 2026-04-23 (deployed live 2026-04-28; iterative UX fixes through 2026-04-30)

> **Out-of-spec (2026-04-30):** Part of the SA-series isolated side task. Root Tunet authority remained CD9 throughout. No CD tranche advanced. The card includes context-aware All On/All Off with optimistic UI added during the 2026-04-28 → 2026-04-30 fix cycle. See `FIX_LEDGER.md` 2026-04-30 Session Delta.

Governing plan: `~/.claude/plans/tunet-sonos-alarm-manage.md`

## Scope

Build `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` as the Tunet Sonos alarm surface. Vanilla HTMLElement + shadow DOM, consumes `tunet_base.js` tokens, does NOT opt into the superseded profile resolver. Hold interaction routes through `script.sonos_load_alarm_for_edit` (SA0 regression-verified live; script-internal popup open comes in SA3).

## Files touched

- **New** `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` — the card (~580 lines).
- **New** `Dashboard/Tunet/Cards/v3/tests/alarm_bespoke.test.js` — 11 tests, all green.
- **Edit** `Dashboard/Tunet/tunet-card-rehab-lab.yaml` — section 14 rehab harness with 3 variants (default 2-tile, incl. weekend, no-quick-actions).
- **Edit** `build.mjs` — `ENTRY_POINTS` adds `tunet_alarm_card.js`.
- **Edit** `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs` — adds the same card so Lovelace resource sync registers it.
- **Edit** `Dashboard/Tunet/Docs/cards_reference.md` — new §14 entry + Whole-Home Usage Contract row.
- **Edit** `Dashboard/Tunet/Docs/sections_layout_matrix.md` — alarm row (`12 | 6 | auto | 2 | 12 | No`).

## Design summary

- **Tokens**: splices `TOKENS` CSS string into shadow DOM (exactly like `tunet_sensor_card.js:289`); consumes profile-injected `--_tunet-tile-*` vars with explicit fallbacks (e.g. `var(--_tunet-tile-min-h, 3.25em)`). Does NOT opt into `_setProfileVars` (profile resolver contract is superseded policy).
- **Interaction**: tap = `switch.toggle`; hold (400 ms, tracked via `pointerdown`/`pointerup` with `HOLD_MS = 400`) = `script.sonos_load_alarm_for_edit`. Keyboard: Enter/Space = toggle; E = open edit.
- **Config**: editor Level 2 (`object` + `fields` + `multiple: true`); per-alarm fields are `entity` (required switch-domain), `label`, `room` (enum for accent color).
- **Header**: displays `sensor.sonos_next_alarm` and `sensor.sonos_enabled_alarm_count` live.
- **Quick-action strip**: 4 buttons — Weekday / Weekend / All Off / Snooze — mapped to `sonos_enable_weekday_alarms`, `sonos_enable_weekend_alarms`, `sonos_disable_all_alarms`, `sonos_snooze_next_alarm` (all canonical post-SA0).
- **Grid options**: `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }` — sensor/speaker_grid/status parity.
- **Em anchor**: `:host { font-size: 16px }` (D21-RESOLVED).
- **Room accent map**: bedroom→amber, bath→blue, kitchen→purple, living_room/dining_room→green, office→muted.

## Tests (`alarm_bespoke.test.js`)

11 tests, all passing:

1. `registers with customElements`
2. `renders two alarm rows with canonical entities`
3. `shows HH:MM and recurrence text`
4. `header renders next-alarm + enabled count from sensors`
5. `quick-action strip renders 4 buttons when show_quick_actions=true`
6. `quick-action strip hidden when show_quick_actions=false`
7. `tap calls switch.toggle with the row entity`
8. `hold (400ms) calls script.sonos_load_alarm_for_edit with alarm_entity`
9. `quick-action buttons call the mapped scripts`
10. `getGridOptions returns list-like shape`
11. `setConfig with empty alarms renders placeholder without crashing`

Full suite: 16 files, **639 tests pass** (628 prior + 11 new).

## Build + deploy

- `npm run tunet:build` — ✓ 15 cards built, including `tunet_alarm_card.js` (48 KB).
- `node --check Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` — ✓ clean.
- **Deploy to live HA lab**: `npm run tunet:deploy:lab` (not yet run from this session; sandbox denied SSH — user must run this interactively via `!npm run tunet:deploy:lab`). This SCPs the built bundle to `/config/www/tunet/v3/` and syncs the Lovelace resource via `update_tunet_v3_resources.mjs` (bumps the `?v=` cache-bust).

## Live verification (post-deploy)

1. Navigate to `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab` — section 14 renders 3 card variants.
2. All 4 breakpoints × dark + light = 8 visual snapshots via `npm run tunet:lab:screenshot`.
3. Tap bedroom tile → `switch.sonos_alarm_bedroom` state flips within 1 s.
4. Hold bedroom tile → `script.sonos_load_alarm_for_edit` trace fires with `alarm_entity: switch.sonos_alarm_bedroom`; edit buffer populates to alarm_id=42, time=05:30:00; legacy `#edit-alarm` Bubble Card popup opens (pre-SA3 behavior).
5. Quick-action Weekday button → both `_bedroom` + `_bath` turn on.
6. Quick-action All Off → all four canonical alarms disabled.

## SA2 → SA3 handoff

SA2 ships with the script still calling `browser_mod.navigate('#edit-alarm')` (SA0 retained that for continuity). SA3 atomically replaces the navigate step with `browser_mod.popup(popup_card_id: tunet-alarm-edit)` — the SA2 card's hold then automatically routes to the new popup with zero card code change.

## Rollback

`git restore Dashboard/Tunet/Cards/v3/tunet_alarm_card.js build.mjs Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs Dashboard/Tunet/tunet-card-rehab-lab.yaml Dashboard/Tunet/Docs/cards_reference.md Dashboard/Tunet/Docs/sections_layout_matrix.md` and `git rm Dashboard/Tunet/Cards/v3/tests/alarm_bespoke.test.js`. Then `npm run tunet:build` to rebuild without the alarm card and redeploy.

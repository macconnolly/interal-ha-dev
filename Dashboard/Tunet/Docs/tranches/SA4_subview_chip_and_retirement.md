# SA4 — Overview Chip, /alarms Subview, Legacy Popup Retirement

Closed: 2026-04-23 (deployed live 2026-04-28)

> **Out-of-spec (2026-04-30):** Part of the SA-series isolated side task. Root Tunet authority remained CD9 throughout. The CD12 surface-assembly gate (the plan's H5 concern) was waived via direct user instruction during the side-task execution; this is not a precedent for further pre-CD12 surface YAML work. See `FIX_LEDGER.md` 2026-04-30 Session Delta.

Governing plan: `~/.claude/plans/tunet-sonos-alarm-manage.md`

## Scope

Integrate the SA2 alarm card into dashboard composition per LD4 (dedicated `/alarms` subview + optional compact chip on overview). Retire the 4 legacy Bubble Card popup YAMLs now that SA3's BrowserMod path is proven in repo-validation.

**Note on CD12 surface-assembly gate**: The plan's H5 raised this but the user explicitly waived YAML dashboard gating during the adversarial review. SA4 proceeds without requiring a CD12-open / AGENTS.md §3 Path B exception entry. The gate concern is preserved in the plan text for historical context.

## Files touched

### Subview + chip

- **Edit** `Dashboard/Tunet/tunet-suite-storage-config.yaml`:
  - Appended new `type: sections` view at the end: `title: Alarms, path: alarms, icon: mdi:alarm, subview: true, back_path: /tunet-suite-storage/overview, max_columns: 4`. Hero `column_span: 3` = `tunet-alarm-card` with 4 alarms (bedroom + bath + `_weekend` variants). Support `column_span: 1` = two `tile` cards + markdown context note. Footer: shared `*tunet_nav_footer` anchor.
  - Added standalone next-alarm chip inside the existing Quick Chips section (as sibling after `tunet-status-card` — not bolted in, honoring G3S/CD11 lock). Tile entity `sensor.sonos_next_alarm`, tap_action navigates to `/tunet-suite-storage/alarms`.
- **Edit** `Dashboard/Tunet/tunet-suite-config.yaml`:
  - Appended mirror `/alarms` subview with inline nav-card (no shared-anchor pattern in this file).
  - Added next-alarm chip to the nav section of the overview view.
  - Added `/tunet-suite/alarms` to the overview nav-card's `subview_paths`.

### Legacy retirement

- **Deleted** `Dashboard/cards/sonos_alarms_popup.yaml` (Bubble Card list popup, canonical-entity based).
- **Deleted** `Dashboard/cards/sonos_alarm_edit_popup.yaml` (Bubble Card edit popup, canonical-entity based).
- **Deleted** `Dashboard/sonos_alarm_edit_popup.yaml` (Bubble Card edit popup, Dashboard/ level).
- **Deleted** `Dashboard/sonos_alarm_popup.yaml` (Bubble Card list popup, numeric-ID based — missed by the pre-review draft; added at H-2).

Final `grep -rn "#sonos-alarms\|#edit-alarm" Dashboard/ packages/ --include="*.yaml"` returns zero hits to live content.

## Acceptance criteria — met (repo-side)

- [x] `/alarms` subview registered on both dashboards.
- [x] Both dashboards pass `yaml.safe_load`.
- [x] Overview chip added (tile card, entity = `sensor.sonos_next_alarm`, navigates to alarms subview).
- [x] Chip is NOT bolted into `tunet-status-card` (G3S/CD11-locked).
- [x] Four legacy popup YAML files deleted; grep verification clean.
- [x] Full test suite still passes (16 files, 639 tests).
- [x] CD12 `visual_defect_ledger.md` alarm entry status: "SA-series active, SA0 closed" (will flip to CLOSED after live deploy verification).

## Live verification (post-deploy)

1. Both dashboards load without console errors.
2. `http://10.0.0.21:8123/tunet-suite-storage/alarms` and `http://10.0.0.21:8123/tunet-suite/alarms` both reachable; render alarm card + support section at all 4 breakpoints × dark+light.
3. Overview chip on each dashboard shows `sensor.sonos_next_alarm` value (currently `05:30 · Bedroom`); tap navigates to `/alarms`.
4. Tap bedroom tile on subview → state toggles; hold opens Tunet BrowserMod popup with alarm_id=42 pre-loaded.
5. Quick-action buttons on subview work (Weekday enables bedroom + bath; All Off disables all four).
6. `grep -rn "#sonos-alarms\|#edit-alarm\|sonos_alarms_popup\|sonos_alarm_edit_popup\|sonos_alarm_popup" Dashboard/ packages/` returns only hits in historical docs (`sonos_alarm_popup_reference.md` was rewritten in SA0 to mark the references historical).

## Deploy

- Dashboard YAML reload on both `/tunet-suite` and `/tunet-suite-storage` (no HA restart required for Lovelace storage dashboards; yaml-mode dashboards reload via HA config check + UI refresh).
- SA2 card + Lovelace resource must already be deployed (see `SA2_alarm_list_card.md`).
- SA3 package + popup registration must already be deployed (see `SA3_browsermod_edit_popup.md`).
- Browser hard-refresh to pick up the new Lovelace resource (`?v=` cache-bust handled by `npm run tunet:resources:sync`).

## Rollback

Restore the 4 deleted popup YAMLs from git (`git restore Dashboard/cards/sonos_alarms_popup.yaml Dashboard/cards/sonos_alarm_edit_popup.yaml Dashboard/sonos_alarm_edit_popup.yaml Dashboard/sonos_alarm_popup.yaml`). Revert the subview + chip edits on both dashboards (`git restore Dashboard/Tunet/tunet-suite-config.yaml Dashboard/Tunet/tunet-suite-storage-config.yaml`). Reload both dashboards. SA3 rollback must happen separately if desired (see `SA3_browsermod_edit_popup.md`).

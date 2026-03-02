# T-001 Implementation Report

## TRANCHE_ID
- `T-001`

## BRANCH_AND_HEAD
- Branch: `claude/dashboard-nav-research-QnOBs`
- HEAD at start of implementation: `a249c8e`

## FILES_CHANGED
- [tunet-suite-storage-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml)

## FILES_NOT_CHANGED
- [tunet_status_card.js](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js)
- [tunet-suite-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-config.yaml)
- [tunet-overview-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-overview-config.yaml)
- [tunet-v2-test-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-v2-test-config.yaml)
- all nav-card files
- all popup/subview files outside the storage status-card block

## CHANGES_MADE
- Updated the storage dashboard source Manual tile `aux_show_when` block at [tunet-suite-storage-config.yaml:54](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml:54) so it now uses:
  - `entity: sensor.oal_global_brightness_offset`
  - `attribute: total_offset`
  instead of:
  - `entity: sensor.oal_system_status`
  - `attribute: active_zonal_overrides`
- This aligns the storage dashboard Manual tile with the intended suite behavior already present in [tunet-suite-config.yaml:57](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-config.yaml:57).
- I deliberately did not modify [tunet_status_card.js](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js) because the card already supports attribute-aware `aux_show_when` evaluation at:
  - [tunet_status_card.js:761](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:761)
  - [tunet_status_card.js:763](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:763)
  - [tunet_status_card.js:775](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:775)
- I also applied the same narrow change to the live storage dashboard in Home Assistant using a targeted dashboard transform, so repo state and live storage state now agree for this tranche.

## VALIDATION_RUN

### Static validation
- Inspected the changed storage dashboard source block and confirmed the Manual tile now references `sensor.oal_global_brightness_offset.total_offset`.
- Confirmed the diff is limited to the intended `aux_show_when` block in [tunet-suite-storage-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml).

### Runtime validation
- Confirmed the live storage dashboard existed before edit at `url_path: tunet-suite-storage`.
- Confirmed live HA exposes:
  - `sensor.oal_global_brightness_offset`
  - attribute `total_offset`
  - current state context:
    - `total_offset = 2`
    - `sensor.oal_system_status.active_zonal_overrides = 0`
- Confirmed the live storage dashboard config now contains:
  - `aux_show_when.entity = sensor.oal_global_brightness_offset`
  - `aux_show_when.attribute = total_offset`

### HA/live validation
- Updated the live storage dashboard via Home Assistant API transform only for the Manual tile `aux_show_when` block.
- Re-read the live storage dashboard and confirmed the new `aux_show_when` block is present.
- Because current live values are:
  - `total_offset = 2`
  - `active_zonal_overrides = 0`
  the previous storage behavior would have hidden the Reset pill while the intended behavior should show it.
- I did not perform direct browser-level visual verification in this run, so the non-zero visible case is logically and config-wise verified, but not yet click-verified in-browser.
- I also did not force a zero-offset state during this run, so the zero-case remains a live verification follow-up.

## BLOCKERS
- No implementation blocker.
- Remaining verification blocker: no direct browser-level visual confirmation performed in this run.
- Remaining environment blocker: zero-offset case was not forced during this run, so the hidden-state case is not yet directly observed post-change.

## KNOWN_RISKS
- If the live storage dashboard diverges again from the repo storage source, the storage path can regress independently of repo state.
- If `sensor.oal_global_brightness_offset.total_offset` changes shape in HA, this visibility contract would need revalidation.
- The Manual tile’s main `show_when` is still tied to `sensor.oal_system_status != Adaptive`; this tranche intentionally did not revisit that semantic.

## DEPLOY_STATUS
- Repo storage dashboard source updated.
- Live HA storage dashboard updated.
- No JS resource deployment required.
- No cache-bust required for this config-only change.

## REVIEW_HANDOFF
- Reviewer should check whether the tranche stayed within scope.
- Reviewer should verify that live storage config and repo storage config now agree.
- Reviewer should decide whether the tranche is:
  - `DONE` after a final manual UI check, or
  - `PARTIAL` pending direct visual verification of both zero and non-zero cases.

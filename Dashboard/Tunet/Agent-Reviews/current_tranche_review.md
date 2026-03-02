# T-001 Tranche Review

## TRANCHE_ID
- `T-001`

## BRANCH_AND_HEAD
- Branch: `claude/dashboard-nav-research-QnOBs`
- HEAD reviewed against: `a249c8e` plus uncommitted tranche changes in the working tree

## VERDICT
- `PARTIAL`

## FINDINGS

### F-001
- Severity: `MEDIUM`
- Files:
  - [current_tranche.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche.md)
  - [current_tranche_implementation.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche_implementation.md)
- Line Numbers:
  - [current_tranche.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche.md)
  - [current_tranche_implementation.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche_implementation.md)
- What Is Wrong:
  - The implementation completed the config alignment and live dashboard update, but it did not directly complete the full live acceptance loop for both `total_offset = 0` and `total_offset != 0`.
- Why It Matters:
  - This tranche was intentionally defined around user-visible behavior. Without the final direct UI check, the tranche is safer than before but not fully closed.
- Exact Fix In English:
  - Hard refresh the storage dashboard Overview and visually confirm:
    - when `total_offset != 0`, the Reset pill is visible
    - when `total_offset = 0`, the Reset pill is hidden
  - Then update tranche status to `DONE`.

## ACCEPTANCE_CRITERIA_CHECK
- Storage dashboard Manual tile no longer uses `sensor.oal_system_status.active_zonal_overrides` in `aux_show_when`: `PASS`
- Storage dashboard Manual tile now uses `sensor.oal_global_brightness_offset.total_offset` in `aux_show_when`: `PASS`
- No unrelated status tiles, popup blocks, room definitions, or nav settings changed: `PASS`
- After deployment, Reset pill hidden when `total_offset = 0`: `NOT YET VERIFIED LIVE`
- After deployment, Reset pill visible when `total_offset != 0`: `LIKELY PASS`, but still not directly browser-verified in this run

## VALIDATION_ASSESSMENT
- Static validation: `PASS`
- Live dashboard config validation: `PASS`
- Browser/UI validation: `PARTIAL`
- The implementation was disciplined and correctly narrow, but the tranche contract explicitly aimed at a user-visible behavior check, so it should remain open until observed.

## SCOPE_DISCIPLINE
- Scope discipline was good.
- The change stayed within the intended storage dashboard config surface.
- Status-card JS was correctly left untouched because the existing attribute-aware logic already supports this behavior.
- No unrelated files were changed for implementation.

## REGRESSION_RISKS
- Low regression risk for repo code because the change is confined to one storage-dashboard config block.
- Medium operational drift risk if the live storage dashboard is edited again in HA without syncing repo state.

## LEDGER_UPDATE_RECOMMENDATION
- Do not mark `T-001` fully `DONE` yet.
- Mark it as:
  - `CODE-DONE / HA-VERIFY`
  or
  - `PARTIAL`
- Once the final browser-level verification is complete, the corresponding storage parity issue can be treated as closed.

## NEXT_TRANCHE_RECOMMENDATION
- Proceed to `T-002` only after `T-001` receives the final live UI verification.
- If the user wants immediate visible UX progress after that, `T-003` is the next strongest candidate because the desktop/tablet long-scroll issue is now the dominant usability problem.

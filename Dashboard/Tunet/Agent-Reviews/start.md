# Tunet Profile Rollout Start Guide (V2)

Use this file to start any new implementation pass for profile unification.

## Source of Truth

1. `Dashboard/Tunet/Mockups/design_language.md` (`v9.0`)
2. `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
3. `plan.md`
4. `FIX_LEDGER.md`
5. `handoff.md`

Implementation authority is `Dashboard/Tunet/Cards/v2/`.
Legacy `Dashboard/Tunet/Cards/` is reference-only.

## Locked Architecture

- Option C (family profile consumption)
- Weighted score lock: `8.15/10` (see architecture doc §4)
- 5 family keys:
  - `tile-grid`
  - `speaker-tile`
  - `rooms-row`
  - `indicator-tile`
  - `indicator-row`
- API split:
  - `selectProfileSize({ preset, layout, widthHint, userSize? })`
  - `resolveSizeProfile({ family, size })`
- Container-first width source for profile-driven behavior
- Profiles are mode-agnostic (geometry/typography only)

## Interaction Contract Lock (Supersedes Legacy Tap-Toggle Language)

Room interaction semantics:
- card-body tap: primary route action (`navigate` preferred)
- explicit controls (orbs/buttons): toggle actions
- hold: optional secondary behavior only (e.g., popup), never the sole primary path

If older docs mention global `tap-toggle / hold-popup` as the room baseline, treat them as historical.

## Gate Sequence

1. `G0` prerequisites
- container-first width migration complete on target families
- nav global offset side effects neutralized for sections validation

2. `G1` base primitives
- registry + selector/resolver split + unit tests

3. `G2` pilot
- lighting + speaker-grid

4. `G3` family rollout
- status + rooms (+ environment path if in scope)

5. `G4` tile alignment
- light-tile consumption alignment

6. `G5` sections integration validation
- enforce sections-safe `getGridOptions()` strategy (`rows: auto`)
- validate profile transitions across breakpoints without clipping/overlap

7. `G6` cleanup (post-soak only)
- remove legacy scaling and `use_profiles` rollback flags after soak criteria pass

## Required Outputs Per Tranche

- explicit file list
- changed contract summary
- validation evidence (syntax/tests/live checks as applicable)
- docs sync in `plan.md`, `FIX_LEDGER.md`, `handoff.md`

## Do Not Do

- do not reopen locked family/API decisions without explicit approval
- do not reintroduce viewport-first sizing for profile-driven cards
- do not mix interaction routing logic into profile registries
- do not treat `tile_size` string parity as success if lane proportions differ

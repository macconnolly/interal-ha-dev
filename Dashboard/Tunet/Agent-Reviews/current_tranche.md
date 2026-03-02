# T-004 - Status Card Width Normalization And Config Parity

### TRANCHE_ID
- `T-004`

### TITLE
- `Status-card internal grid stops visually distorting columns and restores V1 config behaviors the storage overview already expects`

### STATUS
- `CODE-DONE / HA-VERIFY`

### SOURCE_ITEMS
- `tranche_queue.md: T-004`
- `FIX_LEDGER.md: status-card internal width imbalance / missing config parity`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml: status card uses tile_size compact and Boost secondary`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/Cards/tunet_status_card.js`

### GOAL
- Make the V2 status card use equal internal columns reliably and restore the small V1 behaviors the current storage overview config still assumes: `tile_size`, `secondary`, and top-level UI config for `tile_size`.

### WHY_NOW
- The overview composition pass is already done.
- The next visible failure is inside the Home Status card itself: tiles still read as uneven even when the overview structure is better.
- The current storage config already asks V2 for `tile_size: compact` and a Boost `secondary` line, but V2 was silently ignoring those fields.

### USER_VISIBLE_OUTCOME
- The Home Status tiles should stop reading as different-width columns when one tile contains longer content.
- The storage overview should honor the intended compact status-card density.
- The Boost tile should regain its secondary line.
- The visual editor should at least expose `tile_size` at the card top level again.

### FILES_ALLOWED
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/tunet-suite-config.yaml`
- all other V2 card JS files
- nav card files
- lighting card files
- popup / Browser Mod config

### CURRENT_STATE
- V2 status card already renders a 4-column grid, but it was using `repeat(..., 1fr)` without the stronger `minmax(0, 1fr)` constraint, which lets longer intrinsic content distort column widths.
- V2 status card was not restoring V1 `tile_size` behavior even though the storage overview uses `tile_size: compact`.
- V2 status card was also not restoring V1 `secondary` support even though the storage overview config sets `secondary` on the Boost tile.
- V2 `getConfigForm()` did not expose `tile_size`, so there was no top-level UI path for that behavior.

### INTENDED_STATE
- Internal status-card columns are explicitly equal-width and content-constrained.
- Compact/large tile sizing behaves again through the existing top-level config.
- Value tiles can render a secondary line again.
- The card editor exposes `tile_size` as a top-level form field.
- No overview YAML restructuring is part of this tranche.

### EXACT_CHANGE_IN_ENGLISH
- Change the internal status-card grid tracks from bare `1fr` to `minmax(0, 1fr)` so long content cannot widen one column relative to another.
- Add the missing `min-width: 0` and truncation rules needed for grid children to stay inside their tracks.
- Restore V1 `tile_size` handling in V2:
  - parse it in config
  - set the host attribute
  - apply compact/large CSS rules
  - expose it in `getConfigForm()`
- Restore V1 `secondary` support on value tiles so the Boost tile can render its config line again.
- Keep this strictly inside the status card.

### ACCEPTANCE_CRITERIA
- `tunet_status_card.js` parses successfully.
- The V2 status card uses `minmax(0, 1fr)` for its internal grid columns.
- V2 status-card tiles have `min-width: 0` and value/dropdown text is constrained inside the tile width.
- V2 status card accepts and applies `tile_size`.
- V2 status card renders `secondary` text for value tiles.
- `getConfigForm()` exposes `tile_size`.
- The updated status-card resource is deployed to live HA with a new cache-busted URL.
- No other card file is changed.

### VALIDATION

#### Static validation
- `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- diff confined to the one status-card file

#### Runtime validation
- confirm the live resource URL was updated in HA resource config
- confirm the card can still load without syntax/runtime registration failure

#### HA/live validation
- hard refresh the storage overview
- verify the Home Status card now reads as a more even 4x2 grid
- verify the Boost tile shows its secondary line again
- verify the compact density feels closer to the intended storage overview config

### DEPLOY_IMPACT
- `HA RESOURCE UPDATE`
- one JS file deployed
- one Lovelace resource cache-bust update required

### ROLLBACK
- restore `Dashboard/Tunet/Cards/v2/tunet_status_card.js` from git
- copy the prior file back to `/config/www/tunet/v2_next/`
- reset the live resource URL to the previous version token if needed

### DEPENDENCIES
- branch must be `claude/dashboard-nav-research-QnOBs`
- live HA must already load the status card from `/local/tunet/v2_next/tunet_status_card.js`
- storage overview must still use `custom:tunet-status-card`

### UNKNOWNS
- Whether all of the perceived unevenness was caused by intrinsic grid sizing, or whether some remaining imbalance is still visual/content-driven.
- Whether compact-mode density alone is enough, or whether font scale should still be revisited in a later tranche.
- Whether a later config-editor tranche should expose more than `tile_size` at the top level.

### STOP_CONDITIONS
- Stop if fixing the width imbalance requires editing overview YAML again.
- Stop if fixing `secondary` or `tile_size` forces broader status-card redesign beyond this narrow parity pass.
- Stop if the live HA resource path differs from `/local/tunet/v2_next/tunet_status_card.js`.

### OUT_OF_SCOPE
- Browser Mod popup work
- actions-strip redesign
- V1 page-shell polish recovery
- lighting-card internal density changes
- nav-card behavior changes
- full status-card visual-editor support for tiles arrays

### REVIEW_FOCUS
- Did the work stay inside the V2 status card only?
- Did it actually address internal width normalization instead of reopening overview layout?
- Did it restore the specific V1 config behaviors the current storage overview depends on?
- Was the live resource updated cleanly with a new cache-busted URL?

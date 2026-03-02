# T-003 - Storage Overview Composition Reset

### TRANCHE_ID
- `T-003`

### TITLE
- `Storage Overview composition becomes a real Sections overview instead of a full-row vertical stack`

### STATUS
- `CODE-DONE / HA-VERIFY`

### SOURCE_ITEMS
- `plan.md: storage-first / hybrid overview direction`
- `Dashboard/Tunet/Docs/overview_ia_locked.md`
- `FIX_LEDGER.md: overview composition / hero / popup strategy drift`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### GOAL
- Make the storage Overview use an intentional Sections layout:
  - full-width utility strip
  - `3:2` Home Status / Environment band
  - full-width Lighting hero
  - `3:2` Rooms / Media destination band
- Remove dependency on the broken Living Room hash popup from the Overview surface.

### WHY_NOW
- The current dashboard pain is structural, not just cosmetic.
- The page had no real hero and behaved like one full-row section per card.
- This tranche isolates page composition before reopening card-core work on status widths, lighting density, or actions-strip styling.

### USER_VISIBLE_OUTCOME
- Desktop/tablet Overview should stop reading like a long single-column scroll.
- Lighting becomes the actual hero row.
- Rooms and Media become a deliberate bottom band.
- The Living Room overview tile now goes straight to the room subview instead of depending on the broken hash popup.

### FILES_ALLOWED
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- all V2 card JS files
- `Dashboard/Tunet/tunet-suite-config.yaml`
- `Dashboard/Tunet/tunet-overview-config.yaml`
- `Dashboard/Tunet/tunet-v2-test-config.yaml`
- any Browser Mod automation/service config

### CURRENT_STATE
- The storage Overview was effectively authored as repeated full-row sections and had no dominant hero.
- The Living Room overview path depended on `#living-room`, but the Bubble hash popup path was not working reliably.
- The page hierarchy did not match the locked IA in `overview_ia_locked.md`.

### INTENDED_STATE
- `max_columns: 5`
- top utility band spans `5`
- Home Status spans `3`
- Environment companion spans `2`
- Lighting hero spans `5`
- Rooms spans `3`
- Media spans `2`
- nav remains a full-width chrome row
- broken Living Room overview hash popup is removed from the active storage Overview path

### EXACT_CHANGE_IN_ENGLISH
- Recompose the storage Overview to the locked `5-column` rhythm.
- Reduce the Environment companion stack to Climate + Weather only.
- Keep Lighting as a full-width hero row.
- Convert the bottom band to `Rooms + Media`.
- Replace the Living Room overview hash navigation with direct subview navigation.
- Remove the dead Bubble popup section from the storage Overview.

### ACCEPTANCE_CRITERIA
- Storage Overview uses `max_columns: 5`.
- Actions strip spans the full row.
- Status and Environment are authored as `3:2`.
- Lighting spans the full row.
- Rooms and Media are authored as `3:2`.
- The Overview no longer contains the Living Room Bubble popup block.
- The Living Room overview tile no longer points to `#living-room`.
- No card-core JS was changed in this tranche.

### VALIDATION

#### Static validation
- YAML parses successfully.
- Diff is confined to `tunet-suite-storage-config.yaml`.

#### HA/live validation
- Live dashboard `tunet-suite-storage` is updated.
- Re-read of the live dashboard confirms:
  - `max_columns: 5`
  - `3:2` status/environment
  - `5`-wide lighting hero
  - `3:2` rooms/media
  - Living Room navigate path is `/tunet-suite-storage/living-room`
  - no Living Room Bubble popup block remains in the Overview

#### Visual validation still needed
- Desktop should now show Lighting as the hero.
- Rooms and Media should now read as a deliberate bottom band.
- The Overview should no longer feel like one full-row card after another.

### DEPLOY_IMPACT
- `HA DASHBOARD UPDATE`
- no JS resource deployment
- no cache-bust required

### ROLLBACK
- Restore the previous storage Overview composition from git.
- Reapply the previous storage dashboard config in HA if the new composition is worse.

### DEPENDENCIES
- Branch must be `claude/dashboard-nav-research-QnOBs`.
- Live HA storage dashboard `tunet-suite-storage` must exist.
- `tunet-media-card` must already be loaded as a resource in HA.

### UNKNOWNS
- Whether the current media companion is visually balanced enough at `2/5` without card-core adjustments.
- Whether the status-card internal tile imbalance will still dominate after the page structure is fixed.
- Whether the actions strip still needs a separate card-style tranche even after composition is corrected.

### STOP_CONDITIONS
- Stop if implementing the page composition requires card-core changes.
- Stop if the storage dashboard cannot be updated cleanly in HA.
- Stop if the media companion introduces a runtime failure in the Overview.

### OUT_OF_SCOPE
- Browser Mod implementation
- status-card internal tile-width normalization
- lighting-card internal density changes
- actions-card visual restyling
- desktop typography scaling

### REVIEW_FOCUS
- Did the tranche stay composition-only?
- Is Lighting now structurally the hero?
- Was the dead popup dependency removed from the Overview?
- Does the live storage config now match the intended `5-column / 3:2 / 5 / 3:2` structure?

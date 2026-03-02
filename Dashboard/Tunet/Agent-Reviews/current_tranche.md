# T-001 - Storage Status Card Reset Visibility Parity

### TRANCHE_ID
- `T-001`

### TITLE
- `Storage dashboard Manual tile Reset pill only appears when total offset is non-zero`

### STATUS
- `CODE-DONE / HA-VERIFY`

### SOURCE_ITEMS
- `plan.md: P0.25-P0.26`
- `plan.md: current storage-first / hybrid preference`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml:43-65`
- `Dashboard/Tunet/tunet-suite-config.yaml:46-68`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js:752-765`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js:769-790`

### GOAL
- Make the storage POC status card’s Manual tile show the `Reset` aux pill only when the real global brightness offset `total_offset` is non-zero, matching the intended behavior already expressed in the YAML suite config.

### WHY_NOW
- This is a small, directly user-visible bug.
- It aligns the preferred storage dashboard path with the intended behavior already present in the YAML suite.
- It validates the `aux_show_when` mechanism with one concrete live behavior instead of reopening the whole dashboard architecture.
- It keeps the first execution slice to one config file unless a real blocker is discovered.

### USER_VISIBLE_OUTCOME
- On the storage dashboard Overview, the `Manual` tile no longer shows a misleading `Reset` pill when `sensor.oal_global_brightness_offset.total_offset` is `0`.
- When the total offset becomes non-zero, the `Reset` pill appears again without requiring a full config rewrite.

### FILES_ALLOWED
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/tunet-suite-config.yaml`
- `Dashboard/Tunet/tunet-overview-config.yaml`
- `Dashboard/Tunet/tunet-v2-test-config.yaml`
- any nav-card file
- any popup or subview config

### CURRENT_STATE
- The storage dashboard Overview Manual tile currently uses:
  - `entity: sensor.oal_system_status`
  - `attribute: active_zonal_overrides`
  - `aux_show_when` tied to `sensor.oal_system_status.active_zonal_overrides`
  at [tunet-suite-storage-config.yaml:43-65](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml:43).
- The YAML suite dashboard already uses:
  - `aux_show_when.entity: sensor.oal_global_brightness_offset`
  - `aux_show_when.attribute: total_offset`
  at [tunet-suite-config.yaml:46-68](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-config.yaml:46).
- The V2 status card already supports `aux_show_when` evaluation with attribute-aware comparison at [tunet_status_card.js:760-765](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:760) and [tunet_status_card.js:775-779](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:775).
- This means the likely drift is in storage dashboard config, not necessarily in card logic.

### INTENDED_STATE
- The storage dashboard Manual tile uses the same `aux_show_when` contract as the suite YAML:
  - `entity: sensor.oal_global_brightness_offset`
  - `attribute: total_offset`
  - `operator: not_equals`
  - `state: 0`
- The storage dashboard is the preferred editable surface, so it must not lag behind the intended status-card behavior.

### EXACT_CHANGE_IN_ENGLISH
- Change the storage dashboard Manual tile’s `aux_show_when` block so it uses `sensor.oal_global_brightness_offset.total_offset` rather than `sensor.oal_system_status.active_zonal_overrides`.
- Leave the rest of the Manual tile behavior unchanged:
  - keep `label: Manual`
  - keep the `Reset` aux action
  - keep the tile’s primary `show_when` behavior unless a blocker proves that it is also wrong
- Do not modify status-card JavaScript in this tranche unless the storage config change alone provably cannot satisfy the acceptance criteria.

### ARCHITECTURAL_INTENTION
- This tranche validates a key workflow principle:
  - the storage/hybrid dashboard path must remain behaviorally aligned with the intended suite behavior
- It also validates the discipline of fixing one real bug in one preferred dashboard surface before reopening larger responsive or navigation work.

### ACCEPTANCE_CRITERIA
- The storage dashboard Manual tile no longer uses `sensor.oal_system_status.active_zonal_overrides` in its `aux_show_when` block.
- The storage dashboard Manual tile does use `sensor.oal_global_brightness_offset.total_offset` in its `aux_show_when` block.
- No unrelated status tiles, popup blocks, room definitions, or nav settings are changed.
- After deployment to HA storage, the `Reset` pill is hidden when `total_offset = 0`.
- After deployment to HA storage, the `Reset` pill appears when `total_offset != 0`.

### VALIDATION

#### Static validation
- Inspect [tunet-suite-storage-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml) and confirm the Manual tile `aux_show_when` block matches the intended `total_offset` contract.
- Confirm only the intended storage status-card block changed.

#### Runtime validation
- Ensure the YAML/JSON structure for the storage dashboard source remains valid.
- Confirm there is no need to edit [tunet_status_card.js](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js) for this tranche if the config aligns cleanly.

#### HA/live validation
- Update the live storage dashboard using the Home Assistant UI or MCP so the storage dashboard matches the repo artifact.
- Open the storage dashboard Overview.
- With `sensor.oal_global_brightness_offset.total_offset = 0`, confirm the `Reset` pill is hidden.
- Force a non-zero total offset and confirm the `Reset` pill appears.
- Confirm no other Home Status tiles regress visually or behaviorally.

### DEPLOY_IMPACT
- `HA DASHBOARD UPDATE`
- This tranche does not require JS resource deployment if config-only alignment is sufficient.

### ROLLBACK
- Restore the previous Manual tile `aux_show_when` block in the storage dashboard source.
- Reapply the prior storage dashboard config in HA if the live behavior becomes worse or diverges from expected state.

### DEPENDENCIES
- The current branch must be `claude/dashboard-nav-research-QnOBs`.
- The storage dashboard source file must still represent the editable storage POC path.
- `sensor.oal_global_brightness_offset` must exist in HA and expose `total_offset`.
- The storage dashboard must be reachable in HA for live verification.

### UNKNOWNS
- Whether the live storage dashboard currently matches the repo storage source exactly.
- Whether `active_zonal_overrides` was intentionally chosen for the storage Manual tile for a reason no longer captured in the docs.
- Whether the user wants the Manual tile’s main `show_when` rule to remain tied to `sensor.oal_system_status != Adaptive`, even after the `Reset` pill itself is tied to `total_offset`.

### STOP_CONDITIONS
- Stop if the live storage dashboard is no longer structurally aligned with [tunet-suite-storage-config.yaml](/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-suite-storage-config.yaml).
- Stop if `sensor.oal_global_brightness_offset` or its `total_offset` attribute does not exist in live HA.
- Stop if fixing the storage config alone does not satisfy the acceptance criteria and would require status-card JavaScript changes; that becomes a separate tranche.
- Stop if updating the storage dashboard requires broader status-card semantic changes beyond the Reset-pill visibility path.

### OUT_OF_SCOPE
- Any nav-card changes
- Any popup composition changes
- Any room-subview changes
- Any broader status-card redesign
- Any climate/environment layout changes
- Any storage-vs-YAML architecture decision changes
- Any attempt to fix all status-card issues in one pass

### REVIEW_FOCUS
- Did the tranche stay constrained to the storage status-card config?
- Did it align the storage Manual tile with the intended `total_offset` behavior?
- Was the live behavior actually validated at zero and non-zero offset?
- Was status-card JavaScript avoided unless truly blocked?

# Tunet V1 -> V2 -> Stabilization: Full Forensic Handoff

Date: 2026-02-23  
Audience: next agent with zero prior context  
Priority order: `works perfectly` -> `looks like mockup` -> `architecture purity`

---

## 1) Why This Document Exists

This is not a generic summary. It is a full continuity file so the next agent can:

1. Understand the original goal and how it shifted.
2. Avoid repeating regressions introduced during abstraction.
3. Know exactly what is active in Home Assistant now.
4. Continue with the correct intent: **pass-1 reliability and visual parity over refactor elegance**.

---

## 2) The Real Objective (As Clarified by User)

Initial direction included:

- V1 vs V2 deep behavioral parity analysis.
- Unification into a central CSS/token system.
- Primitive/composer architecture (light tile, status tile, speaker tile, chips, thin card shells).

Final clarified direction:

- The architecture can be separated or duplicated; this is secondary.
- First pass must be plain, stable, and faithful to the mockup behavior.
- The system is judged by real HA behavior, not by code elegance.

Canonical phrase to follow:

- “Get one that works perfectly first, like the mockup.”

---

## 3) Repository and Environment Coordinates

Repository root:

- `/mnt/c/Users/Mac Connolly/OneDrive/Documents/Code/ha-live/interal-ha-dev`

Main code trees:

- V1/self-contained cards: `Dashboard/Tunet/Cards/`
- V2 source cards and primitives: `Dashboard/Tunet/Cards/v2/`
- Tracked HA mirror (current v2): `Configuration/www/tunet/v2/`
- Tracked HA fallback snapshot: `Configuration/www/tunet/v2_pre_reuse_5b9158/`

Mockup and design specs:

- `Dashboard/mockups/living_card_mockup.html`
- `Dashboard/Tunet/Mockups/design_language.md` (v8.x canonical language)
- `Dashboard/Tunet/Mockups/v2_design_lock_report.md`

Current git branch:

- `trial` (clean, pushed)

Related worktree branch:

- `trial-lighting-finalize`
- Worktree path: `/mnt/c/Users/Mac Connolly/OneDrive/Documents/Code/ha-live/worktrees/interal-ha-dev-trial-lighting`

MCP endpoint update (done):

- Claude Desktop MCP server host switched to `100.101.63.118`
- File updated:
  - `C:\Users\Mac Connolly\AppData\Roaming\Claude\claude_desktop_config.json`

---

## 4) Origin Story: What Triggered the Deep Work

### 4.1 Starting hypothesis

Initial forensic work claimed near-complete V1/V2 parity in status card behavior.

### 4.2 User challenge

User correctly pushed deeper:

- “What is actually missing, especially in lighting/actions/scenes/sensor?”
- “Design quality matters more than code parity claims.”
- “The mockup feel (shadows/lift/proportions/type) is central.”

### 4.3 Key strategic pivot

The project moved from “feature parity checklist” to:

1. Design-language lock
2. Shared base tokens
3. Reusable primitives
4. Composer shells

Then later pivoted again to stabilization because regressions appeared in live HA behavior.

---

## 5) Detailed Timeline (Commits + Intent + Outcome)

Below is the high-value sequence from V2 baseline through current stabilization.

### Phase A: Visual token lock and design baseline

1. `016957d` (2026-02-20 13:51 -0700)  
   `tune v2 base tokens to living mockup parity`
   - Intent: align base tokens to mockup values.
   - Files: `Dashboard/Tunet/Cards/v2/tunet_base.js`
   - Outcome: token foundation improved.

2. `5b9158a` (2026-02-20 13:59 -0700)  
   `harden v2 design system tokens and add lock report`
   - Intent: formal design lock and references.
   - Files: base + `Dashboard/Tunet/Mockups/v2_design_lock_report.md`
   - Outcome: explicit decision lock added.

### Phase B: Primitive/composer extraction wave

3. `ca3828d` (2026-02-20 17:14 -0700)  
   `Refactor lighting to event-only tile composition; start climate runtime actions`
   - Intent: move to event-only primitive approach.
   - Outcome: major structural shift began.

4. `f11d9eb` (2026-02-20 17:52 -0700)  
   `feat(v2): execute pass 1-11 primitive/composer extraction`
   - Intent: broad extraction pass (action/scene/status/light/info/control primitives).
   - Outcome: architecture advanced, complexity increased.

5. `5fda035` (2026-02-20 18:10 -0700)  
   `feat(v2): migrate status/media composers to tile primitives`
   - Intent: more cards onto primitive stack.
   - Outcome: more reuse, but larger regression surface.

6. `253800e` (2026-02-20 18:21 -0700)  
   `refactor(v2): centralize light and climate core css in tunet_base`
   - Intent: “single underlying CSS” direction.
   - Outcome: stronger centralization, but runtime parity risk remained.

### Phase C: Track deploy artifacts in git

7. `937c7eb` (2026-02-21 13:25 -0700)  
   `chore(v2): track mirrored HA www tunet resources`
   - Intent: keep deployed copies tracked (`Configuration/www/tunet/v2`).
   - Outcome: made runtime/source divergence auditable.

### Phase D: Speaker/Sonos reuse migration and regressions

8. `b20ecb4` (2026-02-21 13:30 -0700)  
   `refactor(v2): migrate speaker-grid to speaker-tile composer`
   - Intent: reuse speaker tile in speaker-grid.
   - Outcome: behavior drift started showing.

9. `5805b98` (2026-02-21 13:33 -0700)  
   `refactor(v2): compose sonos speaker strip with speaker-tile`
   - Intent: same reuse pattern for sonos.
   - Outcome: additional interaction regressions surfaced.

### Phase E: Recovery and rollback strategy

10. `2c18aff` (2026-02-21 13:47 -0700)  
    `fix(v2): restore sonos and speaker-grid to known-good parity`
    - Intent: undo breakage and recover expected behavior.
    - Outcome: partial stability restored.

11. `f3c5797` (2026-02-21 19:07 -0700)  
    `fix(v2): restore speaker volume dispatch and lighting manual-state parity`
    - Intent: fix critical interaction bugs.
    - Outcome: major behavioral issues reduced.

12. `d093e2a` (2026-02-21 19:14 -0700)  
    `chore(v2): archive pre-reuse working card snapshot from 5b9158a`
    - Intent: create explicit fallback runtime set.
    - Files added:
      - `Configuration/www/tunet/v2_pre_reuse_5b9158/*`
      - README warning about not dual-loading same tags.
    - Outcome: controlled rollback channel established.

### Phase F: Latest hotfixes

13. `d837fcd` (2026-02-22 03:33 -0700)  
    `fix(v2): preserve lighting drag pill headroom and harden volume drag dispatch`
    - Intent: address top-row pill clipping + drag dispatch race.
    - Outcome: clipping fixed in active lighting runtime; drag dispatch hardened.

---

## 6) Scale of Change (for risk awareness)

Large footprint commits:

- `0c26263`: +13616 / -261
- `937c7eb`: +13344 / -0 (tracking mirrored deploy files)
- `d093e2a`: +9354 / -0 (pre-reuse snapshot archive)
- `ca3828d`: +1487 / -490
- `f11d9eb`: +2286 / -463

Interpretation:

- This is not a small refactor. The project now has multiple runtime-capable codepaths and duplicated loading risk if resources are mixed.

---

## 7) What Is Live in HA Right Now (Critical)

This is the most important “don’t guess” section.

### 7.1 Loaded resource model is hybrid

Core cards are loaded from pre-reuse snapshot path:

- `/local/tunet/v2_pre_reuse_5b9158/tunet_base.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_actions_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_climate_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_lighting_card.js?v=5101`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_media_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_rooms_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_sensor_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_speaker_grid_card.js?v=5101`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_status_card.js?v=5100`
- `/local/tunet/v2_pre_reuse_5b9158/tunet_weather_card.js?v=5100`

Sonos is loaded from current v2 path:

- `/local/tunet/v2/tunet_sonos_card.js?v=2007`

Primitive files are still loaded under v2 path:

- runtime/control/info/light/action/scene/status/speaker primitives

### 7.2 Why this matters

- Editing `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` does **not** change current runtime if active resource points to `v2_pre_reuse_5b9158`.
- Any fix must target the active resource path for that card type.

### 7.3 Validation dashboard

- `tunet-overview-v2` exists and is being used as the test bench.
- It includes lighting/climate/status/media/speaker-grid/sonos cards.

---

## 8) Design-Led Decisions and Their Current State

User-driven decision set (1-12 style lock) and implementation reality:

1. Tile corner radius:
   - Global baseline in base tokens: 16px
   - Lighting hero exception: 22px
   - Current state: preserved conceptually, but active runtime uses pre-reuse core cards.

2. Rest/lift shadows:
   - Stronger dark mode separation was desired.
   - Current state: mixed by path; verify active cards (pre-reuse set).

3. Ghost border visibility:
   - Wanted visible dark ghost border where needed.
   - Current state: partially tokenized, card-specific behavior still mixed.

4. Off-state icon wrap ghost:
   - Strong preference for explicit off-state container in stateful tiles.
   - Current state: present in lighting and several cards; not universal by design.

5. Floating drag pill:
   - Must be tactile, readable, not clipped.
   - Current state: clipping fixed in active lighting file.

6. Progress geometry:
   - Hero lighting track values intentionally specific.
   - Current state: preserved in active pre-reuse lighting path.

7. Manual override dot/glow:
   - Semantic-only glow policy; manual dot required for lighting.
   - Current state: dot exists in pre-reuse; manual attribute parsing depth differs by path.

8. Proportion model:
   - Fixed row height model accepted for stability.
   - Current state: still implemented in lighting.

9. Drag physics:
   - Tuned touch/mouse thresholds and gains, not purely linear mockup.
   - Current state: implemented; must be validated by feel on target devices.

10. Typography:
   - Mockup-value discipline requested.
   - Current state: mostly preserved in active lighting runtime.

11. Section surface:
   - section/card variants allowed; not forced everywhere.
   - Current state: mixed strategy retained.

12. Icon container policy:
   - Stateful/tappable tiles should have container; micro chips may remain inline.
   - Current state: mixed but mostly aligned with this rule.

---

## 9) Regressions Encountered, with Root Cause and Status

### R1) “Configuration error” across cards

- Symptom: multiple cards failed in Lovelace.
- Root cause: resources not consistently uploaded/registered at matching paths/versions.
- Fix path: upload all required files, align resources, avoid duplicate conflicting tags.
- Status: resolved at time of this handoff.

### R2) Sonos dropdown/menu and UI parity drift

- Symptom: dropdown behavior regressed after composer/primitive migration.
- Root cause: migration introduced behavior changes not yet parity-tested.
- Mitigation: rollback/fix commits (`2c18aff`, `f3c5797`) and later targeted sonos hardening.
- Status: improved; continue validating source dropdown and active entity switching.

### R3) Speaker-grid volume drag visual update but no HA command

- Symptom: UI percent changed during drag; speaker volume not always changed.
- Root cause: debounce closure/drag entity timing and commit semantics.
- Fix:
  - explicit `_sendVolumeSet`
  - capture target entity+value per debounce
  - commit final value on pointer-up
  - pointer capture/release and preventDefault
- Active file: `Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_speaker_grid_card.js`
- Status: improved; still requires live multi-device validation.

### R4) Hold action scope should be icon-only

- Symptom: hold firing from whole tile where user wanted icon-only.
- Sonos current v2 includes icon-scoped hold gate.
- Speaker-grid active pre-reuse path still needs policy confirmation/implementation.
- Status: partial.

### R5) Lighting drag pill clipping at top row

- Symptom: floating pill clipped by card/grid container during drag.
- Root cause: max-row clamp + overflow hidden with no top reserve.
- Fix:
  - added `--pill-overflow-top` + `padding-top` + expanded `max-height`
- Active file:
  - `Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_lighting_card.js`
- Status: resolved, with 16px reserve (can tune if needed).

### R6) Manual dot and “Adaptive vs manual” subtitle confusion

- Symptom: manual-state communication mismatch.
- Root cause:
  - pre-reuse parser reads narrow adaptive attribute set (`manual_control` only).
  - policy ambiguity in subtitle wording when adaptive on + manual overrides exist.
- Status: partially addressed; final wording/parsing policy still open.

---

## 10) Architecture State: What Was Built vs What Is Running

### Built (in v2 source)

Primitives:

- `tunet_runtime.js`
- `tunet_control_button.js`
- `tunet_info_tile.js`
- `tunet_light_tile.js`
- `tunet_action_chip.js`
- `tunet_scene_chip.js`
- `tunet_scene_row.js`
- `tunet_status_tile.js`
- `tunet_speaker_tile.js`

Composer cards were partially migrated to use primitives.

### Running

- Mixed runtime:
  - pre-reuse monolithic cards for most core cards
  - v2 sonos + v2 primitives still loaded

### Practical implication

- There are two valid engineering tracks:
  - Stabilize pre-reuse runtime first and delay re-migration.
  - Re-migrate card-by-card with strict parity gates.

Either is acceptable as long as behavior is correct.

---

## 11) Mistakes, Wrong Assumptions, and Lessons

1. Assumption: parity can be inferred from static code shape.
   - Reality: parity must be validated in live HA interactions.

2. Assumption: one central CSS extraction automatically improves UX.
   - Reality: interaction semantics and runtime wiring can regress independently.

3. Assumption: source edit equals runtime edit.
   - Reality: active Lovelace resource path/version decides runtime.

4. Assumption: `getConfigForm` alone guarantees UI editor behavior.
   - Reality: full editor path (`getConfigElement` + editor class) is needed in problematic cases.

5. Mistake: mixing resource generations without explicit map caused confusion and false negatives.

---

## 12) Non-Negotiables for Next Agent

1. Never change inactive source files and assume runtime changed.
2. Always identify active resource URL for each card before editing.
3. Never load two implementations for the same custom element tag concurrently.
4. Always bump `?v=` after deploy.
5. Validate on actual dashboard interactions, not just syntax.
6. Keep behavior-first objective over abstraction.

---

## 13) Open Questions (Must Be Explicitly Resolved)

1. Speaker-grid hold scope:
   - Should it match sonos icon-only hold behavior?
2. Manual subtitle policy:
   - In manual override state, should subtitle ever display “Adaptive”?
3. Runtime strategy:
   - Continue hybrid, or converge to one path before new feature work?
4. Central CSS target:
   - Is pass-1 allowed to keep card-local duplication where needed for parity?

---

## 14) Immediate Next Work Plan (Stability-First)

Priority sequence:

1. Finish speaker-grid behavior parity on active pre-reuse runtime:
   - Confirm service dispatch
   - Confirm hold scope policy
   - Restore editor parity if missing

2. Finish lighting manual/adaptive communication parity:
   - Backport robust manual parser if needed
   - Lock subtitle policy
   - Re-check dark-mode drag pill appearance

3. Freeze behavior and visual parity in `tunet-overview-v2`.

4. Only after freeze, decide architecture path:
   - keep monolith runtime for production
   - or reintroduce primitives incrementally with test gates

---

## 15) Card-by-Card Test Protocol (Definition of Done)

For each card before calling it done:

1. No config error on load.
2. Core interactions send actual HA services.
3. Keyboard semantics still work where expected.
4. Touch and mouse behavior both stable.
5. Visual behavior matches mockup intent (not just approximate).

Specific checks:

- Lighting: drag, pill visibility, manual dot, subtitle semantics, adaptive toggle long-press.
- Sonos: source dropdown, volume drag commit, icon-only hold.
- Speaker-grid: volume drag commit, tap group behavior, editor UI controls.
- Status: dropdown/timer/conditional visibility and tap actions.
- Climate: slider/knob tactile behavior unchanged.

---

## 16) Files That Matter Most Right Now

Active runtime code to edit first:

- `Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_lighting_card.js`
- `Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_speaker_grid_card.js`
- `Configuration/www/tunet/v2/tunet_sonos_card.js`

Source counterparts to keep synchronized:

- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`

Design authority files:

- `Dashboard/Tunet/Mockups/design_language.md`
- `Dashboard/Tunet/Mockups/v2_design_lock_report.md`
- `Dashboard/mockups/living_card_mockup.html`

---

## 17) Infrastructure Notes for Continuity

MCP:

- Home Assistant MCP host updated to `100.101.63.118` and verified reachable.

Deploy scripts:

- Some helper scripts/docs still default to `10.0.0.21` for SSH (`HA_SSH_HOST` fallback).
- Set `HA_SSH_HOST=100.101.63.118` when deploying via ssh/scp-based tools unless defaults are updated.

---

## 18) Final Guiding Principle for Next Agent

The user has already approved that architecture can be messy for pass-1.

Your success criterion is:

- **No regressions**
- **Correct HA behavior**
- **Mockup-level visual interaction quality**

Only after that should abstraction/consolidation continue.


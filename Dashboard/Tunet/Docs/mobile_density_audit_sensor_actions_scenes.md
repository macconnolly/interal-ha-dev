# Mobile Density Audit: Sensor + Actions + Scenes

Date: 2026-03-06  
Scope: `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`, `tunet_actions_card.js`, `tunet_scenes_card.js`

This audit follows the required rubric and focuses on mobile compact readability, whitespace efficiency, and tapability.

## Card 1: `tunet_sensor_card.js`

### 1) Mobile Repro Context
- Typical surfaces: overview/support sections and room companion sections where sensor rows are stacked.
- Mobile behavior path: `@media (max-width: 440px)` rule in card CSS.

### 2) Current Compact/Mobile CSS Values
- Section container mobile padding: `16px` (`.section-container`, line 269).
- Row spacing: `.sensor-row { gap: 10px; padding: 10px 2px; }` (line 270).
- Typography:
  - Label: `13px` (`.sensor-label`, line 182)
  - Sub-label: `11px` (`.sensor-sub`, line 187)
  - Value: `20px` desktop, `18px` mobile (`.sensor-val`, lines 202, 271)
  - Unit: `11px` (`.sensor-unit`, line 209)
  - Header action chip: `12px` (`.section-action`, line 89)
- No explicit tile row-height grid; row height is content + padding-driven.

### 3) Issue Classification
- `whitespace`: **Medium**
  - Per-row vertical padding can feel loose when many rows are shown.
- `tiny text`: **Medium/High**
  - `11px` sub/units can feel too small on iOS handheld view.
- `hit-target`: **Low/Medium**
  - Row tap target is generally acceptable due full-row interaction.
- `clipping`: **Low**
  - No strong clipping pattern observed in CSS.

### 4) Root Cause Type
- **Mixed**
  - Base token contribution: section container still effectively roomy if card does not explicitly align with global density token intent.
  - Card-local: row paddings and 11px sub/unit typography are hard-coded locally.

### 5) Proposed Fix Plan
- **Central-token adoption opportunities (P2)**
  - Use base density tokenized padding for section shell (`--section-pad`) consistently in this card.
  - Introduce optional shared sensor text tokens in base (e.g., `--sensor-sub-font-mobile`, `--sensor-unit-font-mobile`) if this card pattern recurs.
- **Card-local patch list (P1/P2)**
  - P1: Raise `sensor-sub` and `sensor-unit` from `11px` to `12px` on mobile.
  - P1: Tighten row padding from `10px 2px` to `8px 2px` on mobile.
  - P2: Slightly raise header action readability (`12px -> 12.5/13px`) where used.

### 6) Acceptance Checks
- Phone portrait:
  - Sub-label and unit remain readable at arm’s length.
  - At least 6+ rows fit without feeling visually sparse.
- Tablet:
  - Row rhythm still clean; no cramped labels.
  - Value/sub-label hierarchy remains clear.

---

## Card 2: `tunet_actions_card.js`

### 1) Mobile Repro Context
- Typical surfaces: overview utility band and popup action strips.
- Compact mode is default (`compact: true` in stub config).

### 2) Current Compact/Mobile CSS Values
- Host font-size anchor:
  - Base: `16px` (`:host`, line 169)
  - Mobile: `15px` (`@media`, line 255)
- Compact card shell: `padding: 0.625em` desktop, `0.5em` mobile (lines 177, 256).
- Chip typography and spacing:
  - `.action-chip` font-size `0.6875em` (~11px at 16px base, ~10.3px at 15px mobile), line 209.
  - Padding `0.5em 0.25em` (line 204), mode-strip same scale (line 191).
  - Icon size `1.25em` (line 226).
- No explicit chip min-height for reliable touch target.

### 3) Issue Classification
- `whitespace`: **Low/Medium**
  - Not overly roomy; issue is more readability/tap compactness.
- `tiny text`: **High**
  - Effective font size is too small for primary controls on iOS mobile.
- `hit-target`: **High**
  - No enforced minimum chip height; depends on tiny font + minimal vertical padding.
- `clipping`: **Low/Medium**
  - Long names can compress due narrow horizontal padding and fixed row behavior.

### 4) Root Cause Type
- **Card-local dominant**
  - EM-based micro-scaling drives chips too small on mobile.
  - Shared base card density does not control chip internals here.

### 5) Proposed Fix Plan
- **Central-token adoption opportunities (P1)**
  - Introduce shared compact chip tokens in base:
    - `--chip-compact-min-h`
    - `--chip-compact-font`
    - `--chip-compact-pad-y/x`
    - `--chip-compact-icon`
  - Reuse these tokens in both actions and scenes cards.
- **Card-local patch list (P1)**
  - P1: Increase chip text to ~`12-13px` equivalent in compact mode.
  - P1: Enforce `min-height` (target ~`34-38px`) for tap reliability.
  - P1: Increase horizontal padding from `0.25em` to avoid cramped labels.
  - P2: Keep host anchor at `16px` on mobile (remove reduction to 15px) or use tokenized clamp.

### 6) Acceptance Checks
- Phone portrait:
  - Chips are readable without zoom.
  - Tap success is reliable one-handed (no accidental misses).
  - Longer labels truncate gracefully without collapsing chip height.
- Tablet:
  - Chips do not look oversized; row remains balanced.

---

## Card 3: `tunet_scenes_card.js`

### 1) Mobile Repro Context
- Typical surfaces: overview/popup scene strip and utility-band companion row.
- Compact mode commonly enabled (`compact: true` default path).

### 2) Current Compact/Mobile CSS Values
- Compact shell:
  - `.card.compact { padding: 12px; }` (line 105)
- Header title:
  - `.hdr-title { font-size: 12px; }` (line 136)
- Compact chips:
  - `min-height: 30px` (line 183)
  - `font-size: 11.5px` (line 185)
  - `padding: 5px 9px 5px 7px` (line 184)
  - Icon wrap `19px`, icon `14px` (lines 213-228)
- Empty state text: `12px` (line 299).

### 3) Issue Classification
- `whitespace`: **Low/Medium**
  - Shell padding can feel slightly roomy depending on section density.
- `tiny text`: **Medium**
  - 11.5px compact chip text is borderline small for iOS primary actions.
- `hit-target`: **Medium**
  - 30px chip height is below preferred comfortable touch range.
- `clipping`: **Low**
  - Horizontal scroll/wrap handling exists; major clipping not obvious.

### 4) Root Cause Type
- **Mixed (card-local heavy)**
  - Uses base card surface, but chip internals are card-local and below ideal touch/readability scale.

### 5) Proposed Fix Plan
- **Central-token adoption opportunities (P1)**
  - Adopt same shared compact chip token system as actions card.
- **Card-local patch list (P1/P2)**
  - P1: Raise compact chip min-height from 30px to ~34-36px.
  - P1: Raise compact chip text from 11.5px to ~12-12.5px.
  - P2: Reduce shell padding from 12px to tokenized mobile compact shell value if surrounding card stack still feels roomy.
  - P2: Bump header title readability slightly for handheld glance scans.

### 6) Acceptance Checks
- Phone portrait:
  - Scene chips remain one-tap reliable.
  - Text legible at glance with no zoom.
- Tablet:
  - Chip strip remains compact and does not dominate vertical rhythm.

---

## Unified Compact Chip Token Recommendation (Actions + Scenes)

Recommendation: **Yes, they should share a unified compact chip token contract**.

Why:
- Both are utility-band chips with nearly identical interaction weight.
- Current divergence creates inconsistent tap target size and text readability.
- Shared tokens reduce drift and speed future tuning.

Proposed shared token set (base-level):
- `--chip-compact-min-h`
- `--chip-compact-font`
- `--chip-compact-pad-y`
- `--chip-compact-pad-x`
- `--chip-compact-icon-size`
- `--chip-compact-radius`

Rollout:
1. Define tokens in `tunet_base.js`.
2. Bind `tunet_actions_card.js` and `tunet_scenes_card.js` compact chip rules to those tokens.
3. Validate both cards together in one visual tranche on phone + tablet.


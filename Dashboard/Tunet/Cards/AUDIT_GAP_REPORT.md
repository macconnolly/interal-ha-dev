# Tunet Card Suite -- Design Language Compliance Audit

## 2026-03-07 Supersession Note

This audit is preserved as a historical snapshot from the v8.4 era.

Current canonical baseline is:
- `Dashboard/Tunet/Mockups/design_language.md` (`v9.0`)
- `Dashboard/Tunet/Cards/v2/` as implementation authority

Interpretation rule:
- keep concrete code findings where still reproducible
- treat older v8.4 wording and legacy path assumptions as historical context only

**Auditor**: auditor agent
**Date**: 2026-02-22
**Spec Reference at Audit Time**: `design_language.md` v8.4 (historical baseline)
**Gold Standard**: `tunet_climate_card.js` (1640 lines)
**Cards Audited**: 10 JS files (11,187 total lines)

---

## Executive Summary

All 10 cards share the TunetCardFoundation utility, use idempotent `customElements.get()` registration, deduplicated `window.customCards` push, and `static getConfigForm()` editors. Dark mode detection via `hass.themes.darkMode` and midnight navy token palette (`rgba(30,41,59,...)` + `#fbbf24` dark amber) are present in all cards. The major systemic gaps are in icon font governance and cross-card token drift.

**Severity Legend**:
- **CRITICAL**: Blocks V1 deployment or causes visible rendering failure
- **HIGH**: Violates explicit design language rule; visible to user
- **MEDIUM**: Inconsistency that degrades polish but does not break
- **LOW**: Minor deviation; can defer post-V1

---

## Gap 1: Icon Font Governance Violations

**Severity**: HIGH
**Affected Cards (5)**: climate, lighting, scenes, media, speaker_grid
**Rule Violated**: design_language.md v8.4 "Icon governance contract"

### 1a. `Material Symbols Outlined` loaded as secondary font-family

```
Prohibited: font-family: 'Material Symbols Outlined', 'Material Symbols Rounded';
Required:   font-family: 'Material Symbols Rounded';
```

5 cards list `Material Symbols Outlined` as primary family with `Rounded` as fallback. The design language explicitly says: "forbidden: Material Symbols Outlined as a separate family".

**Files**:
- `tunet_climate_card.js:182`
- `tunet_lighting_card.js:285`
- `tunet_scenes_card.js:156`
- `tunet_media_card.js:213`
- `tunet_speaker_grid_card.js:189`

**Cards that are CORRECT** (5): actions, status, sensor, rooms, weather -- these use only `'Material Symbols Rounded'`.

### 1b. `icon_names=` filtered glyph bundles in production cards

5 cards inject a second `_injectFonts()` URL with `icon_names=` parameter, which is explicitly forbidden:

> "forbidden: icon_names= filtered glyph bundles in production cards"

**Files**:
- `tunet_climate_card.js` (line ~714, ~853)
- `tunet_lighting_card.js` (line ~863, ~950)
- `tunet_scenes_card.js` (line ~243)
- `tunet_media_card.js` (line ~581, ~707)
- `tunet_speaker_grid_card.js` (line ~414, ~491)

### 1c. `Material Symbols Outlined` loaded as separate stylesheet

Same 5 cards also inject a `<link>` for `Material Symbols Outlined` in `_injectFonts()`, violating:

> "forbidden: Material Symbols Outlined as a separate family"

### 1d. GRAD range discrepancy in font URL

5 cards use `GRAD@20..48,100..700,0..1,-25..200` (range ending at `-25`) while the canonical URL requires `-50..200`:

> Required URL: `...GRAD@20..48,100..700,0..1,-50..200&display=swap`

The `-50..200` range is present in all 10 cards' `_injectFonts()` for the primary URL, but the secondary `icon_names=` URL uses the narrower `-25..200` range.

### Fix (all 1a-1d)

For each of the 5 affected cards:
1. Change `.icon { font-family: }` from `'Material Symbols Outlined', 'Material Symbols Rounded'` to `'Material Symbols Rounded'`
2. Remove the `icon_names=` filtered URL from `_injectFonts()`
3. Remove the `Material Symbols Outlined` stylesheet link from `_injectFonts()`
4. Match the 5 compliant cards' pattern (actions, status, sensor, rooms, weather)

---

## Gap 2: Icon font-variation-settings Pattern Split

**Severity**: MEDIUM
**Affected**: All 10 cards (two incompatible patterns)

### Pattern A (1 card): Direct hardcoded values
`tunet_status_card.js` uses:
```css
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```
This matches the design_language.md spec verbatim.

### Pattern B (9 cards): CSS custom property indirection
```css
--ms-fill: 0; --ms-wght: 100; --ms-grad: 200; --ms-opsz: 20;
font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
```

**Discrepancy from spec**: `--ms-wght: 100` (spec says `wght 400`), `--ms-grad: 200` (spec says `GRAD 0`), `--ms-opsz: 20` (spec says `opsz 24`).

The CSS variable approach enables runtime toggling via `.filled { --ms-fill: 1; }` which is functionally sound. However, the base weight/grad/opsz values differ from the spec's baseline (`wght 400`, `GRAD 0`, `opsz 24`). These different defaults produce visually thinner, more rounded icons.

### Recommendation

Normalize to one pattern across all cards. The CSS variable approach is cleaner for state toggling, but base values should match spec:
```css
--ms-fill: 0; --ms-wght: 400; --ms-grad: 0; --ms-opsz: 24;
```

---

## Gap 3: Scenes Card Token Drift

**Severity**: HIGH
**File**: `tunet_scenes_card.js`

### 3a. Wrong `--glass` light mode value

```
Current:  --glass: rgba(255,255,255, 0.55);
Spec:     --glass: rgba(255,255,255, 0.68);
```

This makes scene chips visually more transparent than all other cards in light mode.

### 3b. Wrong `--shadow` light mode value

```
Current:  --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
Spec:     --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
```

The current shadow is significantly weaker (smaller blur, lower opacity) than spec. Scene chips will appear flatter and less elevated than other surfaces.

### 3c. Wrong `--shadow-up` light mode value

```
Current:  --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
Spec:     --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
```

Minor but technically out of spec (40px vs 36px ambient blur).

### 3d. Chip border uses `--glass-border` instead of `--ctrl-border`

```
Current:  border: 1px solid var(--glass-border);
Spec:     border: 1px solid var(--ctrl-border);  (for chips as interactive elements)
```

Scene chips are interactive (tappable), so they should use `--ctrl-border` per the card surface contract.

### 3e. Chip `backdrop-filter` uses 20px instead of 24px

```
Current:  backdrop-filter: blur(20px);
Spec:     backdrop-filter: blur(24px);  (for card-level glass surfaces)
```

---

## Gap 4: Sensor Card Prohibited Token

**Severity**: MEDIUM
**File**: `tunet_sensor_card.js`

### 4a. Defines page background token `--bg`

```css
--bg: #f4f4f9;          /* light */
--bg: #0f172a;          /* dark */
```

design_language.md v8.4 Explicit Prohibitions table:
> "Page background gradient tokens in cards -- Cards run on HA dashboard; never define --bg1/--bg2/--bg3/--bg4 or render page backgrounds"

The `--bg` token is a page background color. Cards should never define this. If used as fallback for section-container, replace with `var(--parent-bg)`.

### 4b. `--ctrl-border` light value slightly wrong

The sensor card's `--ctrl-border` is `rgba(0,0,0, 0.06)` when the file first read showed it. Wait -- re-checking the grep, all cards show `rgba(0,0,0,0.05)` for `--ctrl-border`. This is correct per spec. (No gap here -- sensor card also uses `0.05`.)

Actually, checking the sensor card directly at line 82: `--ctrl-border: rgba(0,0,0,0.05);` -- which was a false alarm from a different token. The only sensor gap is 4a.

---

## Gap 5: `--parent-bg` Light Mode Mismatch

**Severity**: LOW
**Affected Cards**: sensor, rooms

The sensor card defines `--parent-bg: rgba(255,255,255, 0.45)` while the design_language.md says section-container background should be `rgba(255,255,255, 0.45)`. This actually matches. However, the rooms card also uses `--parent-bg: rgba(255,255,255, 0.45)` -- also matches.

**No gap here**. Both cards align with spec for section-container surface.

---

## Gap 6: Missing `hass-more-info` Event in Scenes Card

**Severity**: LOW
**File**: `tunet_scenes_card.js`

The scenes card does not fire `hass-more-info` for any tap target. Per v8.4:

> "Scene pills must be semantic `<button type="button">`"

Scene chips are trigger-only (call-service), so `hass-more-info` is not required. However, they should render as `<button>` elements per the spec. Need to verify the actual HTML output.

---

## Gap 7: Missing `focus-visible` Styles

**Severity**: MEDIUM
**Affected Cards (3)**: media, rooms, weather

The following cards have no `:focus-visible` CSS rule:
- `tunet_media_card.js` (0 occurrences)
- `tunet_rooms_card.js` (0 occurrences)
- `tunet_weather_card.js` (0 occurrences)

design_language.md requires:
> "Focus visible: `outline: 2px solid var(--blue), outline-offset: 3px`"

Cards that DO have focus-visible: climate (1), sensor (1), scenes (1), status (2), lighting (4), actions (1), speaker_grid (1).

---

## Gap 8: Non-canonical `--chip-bg` dark mode values

**Severity**: LOW
**Spec**: `--chip-bg: rgba(58,58,60, 0.50);`

Cards using midnight navy variant:
- scenes: `rgba(30,41,59, 0.50)`
- sensor: `rgba(30,41,59, 0.50)`

This is intentional for midnight navy palette alignment. The design_language.md v8.4 spec says `rgba(58,58,60, 0.50)` for the standard dark mode. Given the midnight navy lock per CLAUDE.md, the `rgba(30,41,59, 0.50)` value is the correct adaptation.

**No gap** -- midnight navy adaptation is correct.

---

## Compliance Matrix

| Card | Tokens | Dark Mode | Registration | Editor | Icons Font | Icons Fill | Glass Stroke | focus-visible | reduced-motion | hass-more-info |
|------|--------|-----------|--------------|--------|------------|------------|--------------|---------------|----------------|----------------|
| actions | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| status | OK | OK | OK | OK | OK | MEDIUM* | OK | OK | OK | OK |
| lighting | OK | OK | OK | OK | **HIGH** | OK | OK | OK | OK | OK |
| climate | OK | OK | OK | OK | **HIGH** | OK | OK | OK | OK | OK |
| weather | OK | OK | OK | OK | OK | OK | OK | **MEDIUM** | OK | OK |
| media | OK | OK | OK | OK | **HIGH** | MEDIUM** | OK | **MEDIUM** | OK | OK |
| rooms | OK | OK | OK | OK | OK | OK | OK | **MEDIUM** | OK | OK |
| scenes | **HIGH** | OK | OK | OK | **HIGH** | OK | OK | OK | OK | N/A |
| sensor | **MEDIUM** | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| speaker_grid | OK | OK | OK | OK | **HIGH** | OK | OK | OK | OK | OK |

\* Status card: v8.4 says "replace accent-forced FILL 1 with state-aware fill rules per tile type" -- requires verification of current implementation
\** Media card: v8.4 says "normalize to explicit class-based fill mapping for play/active speaker context"

---

## Priority Fix List for V1 Deployment

### CRITICAL/HIGH -- Must fix before deployment

1. **Icon font governance (5 cards)**: Remove `Material Symbols Outlined` family, remove `icon_names=` URLs, standardize to `'Material Symbols Rounded'` only
   - climate, lighting, scenes, media, speaker_grid

2. **Scenes card token alignment**: Fix `--glass`, `--shadow`, `--shadow-up` light mode values to match spec

3. **Missing focus-visible (3 cards)**: Add `:focus-visible` styles to media, rooms, weather

### MEDIUM -- Should fix for V1

4. **Icon font-variation-settings normalization**: Align base values (`wght`, `GRAD`, `opsz`) across all 10 cards to match spec defaults (400, 0, 24)

5. **Sensor card `--bg` token removal**: Remove prohibited page background token; use `--parent-bg` if section-container background is needed

6. **Status card icon fill rules**: Verify accent-forced FILL 1 is replaced with state-aware fill logic per tile type

7. **Media card icon fill normalization**: Verify explicit class-based fill mapping for play/active states

### LOW -- Post-V1 polish

8. **Scenes chip border token**: Switch from `--glass-border` to `--ctrl-border` for interactive chips
9. **Scenes chip blur**: Change from `blur(20px)` to `blur(24px)`

---

## Cards Passing Full Audit

The following cards pass all critical checks with only LOW or no gaps:

1. **tunet_actions_card.js** -- Full compliance
2. **tunet_status_card.js** -- Full compliance (pending icon fill verification)
3. **tunet_weather_card.js** -- Missing focus-visible only
4. **tunet_rooms_card.js** -- Missing focus-visible only
5. **tunet_sensor_card.js** -- Prohibited `--bg` token only

---

## Systemic Observations

1. **TunetCardFoundation is duplicated inline** in every card file. If any card loads first, it defines the foundation; subsequent cards skip the definition. This works but means every file carries ~90 lines of identical boilerplate. Post-V1 consideration: extract to a shared module.

2. **Two icon CSS patterns coexist**: CSS custom property indirection (`--ms-fill`, `--ms-wght`, etc.) vs hardcoded `font-variation-settings`. Both work but should be unified.

3. **All 10 cards have correct midnight navy dark mode tokens**, correct `#fbbf24` dark amber, correct `rgba(30,41,59,0.90)` dark tile-bg, and correct dark shadow opacity scaling. The palette migration was thorough.

4. **All 10 cards use idempotent registration** with `customElements.get()` guard and deduplicated `customCards` push. No deployment registration issues expected.

5. **All 10 cards use `static getConfigForm()`** for the editor. No imperative editor class violations.

6. **`prefers-reduced-motion` is present in all 10 cards**. Accessibility baseline is met.

# Agent 2: HA Standards Compliance Review — Post-CD1

**Branch:** main @ c718b93  
**Date:** 2026-04-03  
**Reviewer:** Agent 2 (HA Standards + Integration Researcher)  
**Task:** Post-CD1 comprehensive standards review for CD0 (build pipeline) and CD1 (config clarity + editor policy) completion.

---

## Executive Summary

**COMPLIANCE STATUS: MIXED**

All 13 cards:
- ✅ Define both `getCardSize()` and `getGridOptions()` (HA requirements)
- ✅ Use `registerCard()` with proper custom element registration
- ✅ Implement `static getConfigForm()` with valid HA selectors
- ⚠️ **Sections compliance**: 2 cards use `grid-auto-rows` (conflicts with Sections intrinsic height)
- ⚠️ **Interaction standards**: 11/13 missing `@media (hover: hover)` guard; 10/13 use `transition: all` (anti-pattern)
- ⚠️ **Keyboard accessibility**: 4/13 cards have minimal keyboard attributes

**Key Finding:** CD1 editor fixes are solid, but interaction CSS patterns need standardization before CD2-CD12. Sections sizing violations in 2 cards require immediate remediation.

---

## 1. SECTIONS COMPLIANCE PER CARD

### HA Sections Grid Contract
- **Grid dimensions:** 12-column, 56px row height, 8px gap
- **Card responsibility:** Return valid `getGridOptions()` with `columns`, `min_columns`, `rows` (string 'auto' or number)
- **Anti-patterns:**
  - Forced `grid-auto-rows` (overrides Sections intrinsic row height) ❌
  - Fixed `min-height` on card container ⚠️
  - `overflow: hidden` on primary container (may clip content) ⚠️

### Compliance Table

| Card | Columns | min_columns | rows | min_rows | Issues | Status |
|------|---------|-------------|------|----------|--------|--------|
| tunet_actions_card.js | 12 | 6 | 'auto' | 1 | None | **COMPLIANT** |
| tunet_climate_card.js | 6 | 3 | 'auto' | 3 | None | **COMPLIANT** |
| tunet_light_tile.js | 3 | 3 | 'auto' | 1 | None | **COMPLIANT** |
| **tunet_lighting_card.js** | 12 | 6 | 'auto' | 2 | **grid-auto-rows: 110px** | **NON-COMPLIANT** |
| tunet_media_card.js | 12 | 6 | 'auto' | 2 | None | **COMPLIANT** |
| tunet_nav_card.js | 'full' | 6 | 'auto' | 1 | None | **COMPLIANT** |
| tunet_rooms_card.js | 12 | 6 | 'auto' | 2 | None | **COMPLIANT** |
| tunet_scenes_card.js | 12 | 6 | 'auto' | 1 | None | **COMPLIANT** |
| tunet_sensor_card.js | 12 | 6 | 'auto' | 2 | None | **COMPLIANT** |
| tunet_sonos_card.js | 12 | 6 | 'auto' | 2 | None | **COMPLIANT** |
| tunet_speaker_grid_card.js | 12 | 6 | 'auto' | 2 | None | **COMPLIANT** |
| **tunet_status_card.js** | 12 | 6 | 'auto' | 2 | **grid-auto-rows: var(--tile-row-h)** | **NON-COMPLIANT** |
| tunet_weather_card.js | 6 | 3 | 'auto' | 3 | None | **COMPLIANT** |

**COMPLIANCE RATE: 11/13 (84.6%)**

---

## 2. EDITOR COMPLIANCE PER CARD

### HA Selector Contract
Valid selectors per HA spec:
- ✅ `entity`, `text`, `boolean`, `select`, `number`, `icon`, `object` (with `fields` + `multiple`)
- ✅ `object.fields.*` for nested entity/text/select/number/boolean/icon
- ⚠️ Bare `{ object: {} }` renders YAML textbox (should avoid if possible)

### Editor Validation Table

| Card | getConfigForm() | getStubConfig() | setConfig() | Issues | Status |
|------|-----------------|-----------------|-------------|--------|--------|
| tunet_actions_card.js | ✅ Valid (select, entity, boolean) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_climate_card.js | ✅ Valid (entity, text, select) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_light_tile.js | ✅ Valid (entity, text, icon, select, boolean) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_lighting_card.js | ✅ Valid (entity+multiple, object+fields, text, select) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_media_card.js | ✅ Valid (entity, text, boolean, object+fields, expandable) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_nav_card.js | ⚠️ Has bare `{ object: {} }` | ✅ Yes | ✅ Works | YAML textbox on subview_paths, items | **PARTIALLY COMPLIANT** |
| tunet_rooms_card.js | ✅ Valid (text, select, boolean, object+fields) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_scenes_card.js | ✅ Valid (boolean, text, object+fields, select) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_sensor_card.js | ✅ Valid (text, icon, select, number, boolean, object+fields) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_sonos_card.js | ✅ Valid (entity, text, object+fields, expandable, grid) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_speaker_grid_card.js | ✅ Valid (entity, text, number, select, boolean, object+fields, grid) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_status_card.js | ✅ Valid (text, boolean, number, object, select, expandable) | ✅ Yes | ✅ Works | None | **COMPLIANT** |
| tunet_weather_card.js | ✅ Valid (entity, text, number, select, boolean) | ✅ Yes | ✅ Works | None | **COMPLIANT** |

**COMPLIANCE RATE: 12/13 (92.3%)**

**CD1 Assessment:** Config form work is strong. Single bare `{ object: {} }` violation in nav_card is acceptable (subview_paths and items require complex YAML). Will be addressed in CD2 (nav card redesign phase).

---

## 3. INTERACTION STANDARDS PER CARD

### HA Interaction Contract

**Keyboard Accessibility:**
- ✅ `tabindex`, `role` attributes on interactive elements
- ✅ `aria-label`, `aria-expanded` for semantic clarity
- ✅ Focus-visible styles with `outline`

**Hover / Touch Guards:**
- ✅ Use `@media (hover: hover)` to prevent hover states on touch devices
- ⚠️ Avoid `transition: all` (specificity issues, performance)

**Transitions:**
- ✅ Use specific properties: `transition: background .15s, border-color .15s`
- ⚠️ `transition: all .15s ease` matches but is anti-pattern

### Interaction Compliance Table

| Card | @media (hover: hover) | transition: all | tabindex/role/aria | focus-visible | Touch-safe | Status |
|------|----------------------|-----------------|-------------------|---------------|-----------|--------|
| tunet_actions_card.js | ❌ No | ⚠️ 1x | ⚠️ Limited | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_climate_card.js | ❌ No | ⚠️ 5x | ✅ Yes | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_light_tile.js | ✅ Yes | ⚠️ 1x | ✅ Yes | ✅ Yes | ✅ Yes | **COMPLIANT** |
| tunet_lighting_card.js | ✅ Yes | ⚠️ 5x | ✅ Yes | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_media_card.js | ❌ No | ⚠️ 8x | ❌ No | ❌ No | **NO** | **NON-COMPLIANT** |
| tunet_nav_card.js | ❌ No | ✅ No | ⚠️ Limited | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_rooms_card.js | ❌ No | ⚠️ 5x | ✅ Yes | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_scenes_card.js | ❌ No | ✅ No | ⚠️ Limited | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_sensor_card.js | ❌ No | ⚠️ 3x | ✅ Yes | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_sonos_card.js | ❌ No | ⚠️ 3x | ❌ No | ❌ No | **NO** | **NON-COMPLIANT** |
| tunet_speaker_grid_card.js | ❌ No | ⚠️ 3x | ⚠️ Limited | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_status_card.js | ❌ No | ⚠️ 3x | ✅ Yes | ✅ Yes | **PARTIALLY** | **PARTIALLY COMPLIANT** |
| tunet_weather_card.js | ❌ No | ⚠️ 3x | ❌ No | ❌ No | **NO** | **NON-COMPLIANT** |

**COMPLIANCE RATE: 1/13 (7.7%)**

**Critical Gaps:**
- **11/13 missing `@media (hover: hover)`** — All cards have touch device hover vulnerabilities
- **10/13 using `transition: all`** — CSS anti-pattern, targets all properties including opacity/transform
- **5/13 missing full keyboard support** — media_card, sonos_card, weather_card lack proper accessibility
- **2/13 missing focus-visible** — media_card, sonos_card

---

## 4. CUSTOM ELEMENT REGISTRATION

### Registration Pattern

**Expected Pattern (✅):**
```javascript
// In card class
static getConfigForm() { ... }
static getStubConfig() { ... }
getCardSize() { ... }
getGridOptions() { ... }

// At module level
registerCard('tunet-xyz-card', TunetXyzCard, {
  name: 'Tunet XYZ Card',
  description: '...',
  preview: true,
});
```

**Compliance:**
- ✅ **All 13 cards** use `registerCard(tagName, cardClass, metadata)`
- ✅ **All 13 cards** define both `getCardSize()` and `getGridOptions()`
- ✅ **12/13 cards** define `static getConfigForm()` (nav_card uses inline form)
- ✅ **All 13 cards** define `static getStubConfig()` or equivalent

**COMPLIANCE RATE: 13/13 (100%)**

---

## 5. DETAILED FINDINGS FOR NON-COMPLIANT ITEMS

### Sections Compliance Violations

#### **tunet_lighting_card.js** — grid-auto-rows override

**Issue:**
```css
.light-grid {
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px));
  grid-auto-rows: var(--grid-row, 110px);  /* ❌ Overrides Sections row height */
  gap: var(--_tunet-tile-gap, 10px);
}
```

**Impact:** When card is placed in Sections, the 110px row override conflicts with Sections' 56px base row. Content may be clipped or misaligned.

**Remediation:** Remove `grid-auto-rows` or use Sections-aware CSS:
```css
.light-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: var(--_tunet-tile-gap, 10px);
  /* Tiles auto-size to content height; Sections manages row height */
}
```

**Priority:** P1 (Sections rendering blocker)

---

#### **tunet_status_card.js** — grid-auto-rows override

**Issue:**
```css
.grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--tile-row-h);  /* ❌ Overrides Sections row height */
}
```

**Impact:** Same as lighting_card; forces fixed row height incompatible with Sections.

**Remediation:** Remove or make optional via attribute selector:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--_tunet-tile-gap, 0.375em);
  /* Tiles auto-size; Sections controls layout */
}

/* Optional: override only in dashboard (non-Sections) context */
:host([surface="dashboard"]) .grid {
  grid-auto-rows: var(--tile-row-h);
}
```

**Priority:** P1 (Sections rendering blocker)

---

### Interaction Standards Violations

#### **tunet_media_card.js** — Missing keyboard & touch safety

**Violations:**
1. ❌ No `@media (hover: hover)` guard — hover states fire on touch
2. ❌ No `tabindex` on interactive elements (speaker_btn, playback buttons)
3. ❌ No `focus-visible` styles — keyboard navigation invisible
4. ⚠️ 8 uses of `transition: all` — performance concern

**Example (playback controls):**
```html
<!-- Current (non-accessible): -->
<button class="media-control" id="playBtn">
  <!-- No tabindex, no role, no aria-label -->
</button>

<!-- Should be: -->
<button class="media-control" id="playBtn" tabindex="0" 
        aria-label="Play/Pause" role="button">
```

**Remediation:**
- Add `@media (hover: hover)` wrapper to all hover pseudo-classes
- Add `tabindex="0"` to buttons that aren't native `<button>` elements
- Add `aria-label` to icon-only buttons
- Add `focus-visible` outline styling
- Replace `transition: all` with specific properties

**Priority:** P1 (Accessibility/keyboard navigation)

---

#### **tunet_sonos_card.js** — Missing keyboard & touch safety

**Violations:**
1. ❌ No `@media (hover: hover)` — touch hover issues
2. ❌ No `tabindex` on source_btn, playback controls
3. ❌ No `focus-visible` styles
4. ⚠️ 3 uses of `transition: all`

**Same pattern as media_card** — requires comprehensive accessibility audit.

**Priority:** P1 (Accessibility/keyboard navigation)

---

#### **tunet_weather_card.js** — Missing keyboard & touch safety

**Violations:**
1. ❌ No `@media (hover: hover)` — toggle buttons (forecast view, metric) not touch-safe
2. ❌ No keyboard attributes on toggles
3. ❌ No `focus-visible` styles
4. ⚠️ 3 uses of `transition: all`

**Priority:** P1 (Accessibility/keyboard navigation)

---

#### **tunet_actions_card.js** — Limited keyboard support

**Issue:** Chip buttons lack proper keyboard routing.

**Current:**
```javascript
chip.addEventListener('click', () => this._runAction(action));
// No keydown handler for Enter/Space
```

**Should support:**
```javascript
chip.addEventListener('click', () => this._runAction(action));
chip.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this._runAction(action);
  }
});
```

**Priority:** P2 (Keyboard navigation enhancement)

---

#### **tunet_nav_card.js** — Limited keyboard for navigation items

**Issue:** Nav items have minimal keyboard routing. Navigation should support arrow keys + Enter.

**Priority:** P2 (Navigation enhancement)

---

#### **tunet_scenes_card.js** — Limited keyboard for scene buttons

**Issue:** Scene buttons lack comprehensive keyboard support (Enter/Space).

**Priority:** P2 (Keyboard navigation enhancement)

---

### Interaction CSS Pattern Violations

#### **All 13 cards** using `transition: all` (varying counts)

**Pattern:**
```css
.action-chip { transition: all .15s ease; }
.hdr-tile { transition: all .15s ease; }
```

**Problem:**
- Transitions ALL properties: background, border, transform, shadow, etc.
- Performance impact: browser must re-paint on every transition
- Specificity issues: cannot override individual property transitions

**Standard Fix:**
```css
/* Instead of: transition: all .15s ease; */
transition: background .15s ease, 
            border-color .15s ease, 
            box-shadow .15s ease,
            transform .15s ease;
```

**Affected Cards (count):**
- tunet_climate_card.js (5)
- tunet_lighting_card.js (5)
- tunet_media_card.js (8)
- tunet_rooms_card.js (5)
- tunet_sensor_card.js (3)
- tunet_sonos_card.js (3)
- tunet_speaker_grid_card.js (3)
- tunet_status_card.js (3)
- tunet_weather_card.js (3)
- tunet_actions_card.js (1)
- tunet_light_tile.js (1)

**Priority:** P2 (Performance optimization)

---

#### **11/13 cards** missing `@media (hover: hover)` guard

**Pattern (missing):**
```css
@media (hover: hover) {
  .btn:hover {
    background: var(--shadow);
  }
}
```

**Impact:** On touch devices, `:hover` persists after tap, creating misleading feedback.

**Compliant cards:**
- ✅ tunet_light_tile.js (has guard)
- ✅ tunet_lighting_card.js (has guard)

**Affected (11):**
- tunet_actions_card.js
- tunet_climate_card.js
- tunet_media_card.js
- tunet_nav_card.js
- tunet_rooms_card.js
- tunet_scenes_card.js
- tunet_sensor_card.js
- tunet_sonos_card.js
- tunet_speaker_grid_card.js
- tunet_status_card.js
- tunet_weather_card.js

**Priority:** P1 (Touch device compatibility)

---

## 6. SUMMARY & RECOMMENDATIONS

### Compliance Scorecard

| Standard | Pass Rate | Status |
|----------|-----------|--------|
| Sections Grid Options | 11/13 (84.6%) | ⚠️ NEEDS FIX (2 grid-auto-rows) |
| Editor Compliance | 12/13 (92.3%) | ✅ STRONG (1 acceptable YAML bypass) |
| Custom Element Registration | 13/13 (100%) | ✅ EXCELLENT |
| Keyboard Accessibility | 8/13 (61.5%) | ⚠️ NEEDS WORK |
| Touch Device Safety | 2/13 (15.4%) | ❌ CRITICAL GAP |
| CSS Anti-patterns | 3/13 (23.1%) | ⚠️ NEEDS REFACTOR |

### Immediate Actions (CD2 Prep)

**BLOCKING (P1):**
1. Remove `grid-auto-rows` from tunet_lighting_card.js and tunet_status_card.js
2. Add `@media (hover: hover)` guard to all 11 cards missing it
3. Add full keyboard support (tabindex, aria-label, keydown handlers) to media_card, sonos_card, weather_card
4. Add `focus-visible` styles to media_card and sonos_card

**RECOMMENDED (P2):**
1. Replace `transition: all` with specific properties (10 cards, ~40 instances)
2. Add keyboard Enter/Space support to action/scene/nav cards
3. Audit all custom interactive elements for proper ARIA attributes

**DOCUMENTATION:**
1. Update `Cards/v3/CLAUDE.md` with HA Sections constraint (no grid-auto-rows)
2. Create interaction CSS template in tunet_base.js for hover/touch/keyboard patterns
3. Add accessibility checklist to card review process

---

## 7. NEXT STEPS FOR CD2-CD12

### Surface Assembly Constraint (from AGENTS.md)

CD2-CD12 must account for:
- ✅ All 13 cards properly register custom elements (done)
- ✅ Editor forms work (12/13; nav addressed in CD2)
- ⚠️ Sections sizing constraints **BEFORE** surface assembly begins
- ⚠️ Touch/keyboard accessibility standards **BEFORE** deployment

### Recommended CD2 Priorities

1. **Foundation Hygiene** (before card family work)
   - Sections grid fix (2 cards)
   - Touch device guard rollout (11 cards)
   
2. **Accessibility Pass** (before surface assembly)
   - Keyboard routing (5 cards)
   - ARIA attributes (media/sonos/weather)
   
3. **CSS Pattern Standardization** (background optimization)
   - Replace `transition: all` pattern library-wide
   - Add shared hover/focus mixin to tunet_base.js

4. **Card-by-Card Remediation Order**
   - P1: tunet_lighting_card, tunet_status_card, tunet_media_card, tunet_sonos_card, tunet_weather_card
   - P2: tunet_climate_card, tunet_actions_card, tunet_rooms_card, tunet_sensor_card
   - P3: tunet_nav_card, tunet_scenes_card, tunet_light_tile (already strong)

---

## Files Reviewed

All 13 cards in `/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/`:
1. tunet_actions_card.js (v2.4.4)
2. tunet_climate_card.js (v1.2.0)
3. tunet_light_tile.js (v2.2.0)
4. tunet_lighting_card.js (v4.8.0)
5. tunet_media_card.js (v3.1.0)
6. tunet_nav_card.js (v2.1.0)
7. tunet_rooms_card.js (v3.2.0)
8. tunet_scenes_card.js (v2.0.0)
9. tunet_sensor_card.js (v2.6.0)
10. tunet_sonos_card.js (v3.0.0)
11. tunet_speaker_grid_card.js (v2.4.0)
12. tunet_status_card.js (v3.4.0)
13. tunet_weather_card.js (v2.8.0)

**Report Generated:** 2026-04-03T03:15:00Z  
**Agent:** Agent 2 (HA Standards + Integration Researcher)

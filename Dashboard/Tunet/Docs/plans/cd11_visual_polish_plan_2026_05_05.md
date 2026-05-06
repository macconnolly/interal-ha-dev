# CD11 Visual Polish Plan — Live-Diagnostic-Grounded Quality Pass

**Authored**: 2026-05-05 (post-CD11 closure visual review)
**Owning tranche**: CD11 visual polish (subsidiary to closed CD11 contracts; does not reopen the four contract gaps)
**Scope**: visual quality fixes grounded in measured per-tile computed styles + user manual review against live state

> **Visual verification rule (locked 2026-05-04)** is in force throughout. Every commit's claim of completion must include manual per-tile inspection at every locked breakpoint, not just screenshot capture or test-pass signal.

## Empirical baseline (computed at 1440px on `?v=build_20260505_063622Z`)

```
Variant         Numeric   Text    Long    Label   Spread   Notes
home_summary    18.375    14.0    14.0    12.25   31%      ⚠ Largest chaos in suite
home_detail     15.7      14.0    13.1    13.125  16%      ✓ Reference baseline
alarms          21.0/15.7 13.1    13.1    12.69   varies   Timer prominent (intentional)
room_row        14.7      14.7    14.7    13.3    0%       ⚠ Long content overflows tile (DOM-measured valOverflow=true on "Environmental Boost")
info_only       20.1      16.6    16.6    10.5    17%      ⚠ Labels below 12px readability floor
custom          19.25     11.2    11.2    13.1    42%      ⚠⚠ Long content below readability + biggest spread
```

## Sign-offs in force from prior conversation

1. **OAL sensor consolidation**: `sensor.oal_system_status` is the canonical attribute-bearing source; `sensor.oal_real_time_monitor` is the concise status string; `sensor.oal_global_brightness_offset` is the boost amount.
2. **Container queries with media-query fallback** for row variant internal stack flip.
3. **Truncation is failsafe of last resort, not design**. Auto-shrink within min/max guardrails is the primary mechanism. `compact_label` aliases keep content within budget.

## Operating Constraints

### Allowed implementation files
- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml` (lab fixtures only)
- `plan.md`, `FIX_LEDGER.md`, `handoff.md`

### Do not touch
- `~/.claude/plans/synthetic-dazzling-oasis.md` (immutable post-adoption)
- `tunet_base.js`
- CD10/CD12 files
- Other cards

### Quality bar (locked, non-negotiable)
- Manual per-tile visual inspection at 390/768/1024/1440 light + dark BEFORE any "done" claim
- No truncation visible in default-config rendering
- All interactive elements ≥ 32×32px
- Live deploy + Playwright capture + manual screenshot review per commit
- Each commit message includes the diagnostic numbers (computed font-size deltas, tap-target sizes, etc.) it changed

## Five themes, in execution order

### Theme A — Recipe content + sensor rebinding

**Why first**: cleanest, lowest visual risk, unblocks the typography work because content lengths get shorter when recipes use the right entities/attributes.

**Changes:**

1. **`system_state` recipe**: change default entity to `sensor.oal_real_time_monitor` (state: "Boosted" — concise). Mark binding 'fixed'. Update lab fixtures to remove explicit `entity:` override on system_state recipes (let default carry).

2. **`lights_on` recipe**: fix `attribute: 'number_on'` → `attribute: 'lights_on_formatted'` (returns "15/16" string directly from `sensor.oal_system_status`). Change `format: 'integer'` → `format: 'state'` since the formatted attribute is already a string. Default entity: `sensor.oal_system_status` (mark 'fixed').

3. **NEW recipe `weather_modifier`**: reads `sensor.oal_system_status.attributes.active_modifiers[0]` to display "Rainy +20%" or similar. `show_when: active_modifiers.length > 0`. Hidden when no active modifier. Default entity: `sensor.oal_system_status` ('fixed').

4. **`home_presence` recipe**: change `label: 'Home'` → `label: 'Presence'` and `compact_label: 'Home'` → `compact_label: 'Presence'`. Resolves the value/label duplication.

5. **`mode_ttl` recipe**: keep `entity: 'timer.oal_mode_timeout'` (already correct). Verify `show_when.state: 'active'` works when mode is active (live verification needed via state change). The timer renders `--:--` when idle which is acceptable, but better to hide via show_when. Confirmed present in current code.

6. **`next_alarm` recipe in summary variant**: extend `_applyVariantRecipeDefaults` so when variant === 'home_summary' and recipe === 'next_alarm', the synthesizer:
   - Uses `format: 'time_short_hm'` (new, strips seconds → HH:MM)
   - Reads `attributes.alarm_id` or similar attribute for room name → uses as label
   - Falls back to `compact_label: 'Alarm'` if no room attribute available

7. **Drop `enabled_alarms` from `home_detail` stub**: per user. Keep recipe defined for `alarms` variant or custom authoring.

8. **Drop `boost_offset` 3-line tile**: investigate `secondary` field source; ensure recipe doesn't emit secondary text (just value + label). If existing renderer adds a secondary based on entity attributes, override to null in boost_offset recipe defaults.

9. **`STATUS_RECIPE_ENTITY_BINDING` updates**: `lights_on: 'fixed'`, `system_state: 'fixed'`, `weather_modifier: 'fixed'`. Update existing entries.

**Tests added**:
- recipe shorthand `{ recipe: 'lights_on' }` (no entity needed) synthesizes runtime tile with lights_on_formatted attribute path
- recipe shorthand `{ recipe: 'weather_modifier' }` synthesizes correctly with show_when guard
- recipe shorthand `{ recipe: 'home_presence', entity: 'person.x' }` produces label='Presence' not 'Home'
- summary variant + next_alarm recipe applies time_short_hm format and pulls room from attributes
- home_detail stub config does NOT contain enabled_alarms

**Lab YAML changes**:
- Remove explicit `entity: sensor.oal_system_status` overrides on system_state recipe usages (let default carry the new `sensor.oal_real_time_monitor`)
- Add `weather_modifier` recipe to home_detail and info_only fixtures (gated by show_when)
- Update home_detail stub fixture to drop enabled_alarms

**Doc**: cards_reference.md §9 recipe table updated with new entity bindings, new weather_modifier recipe row, updated lights_on attribute path.

**Commit**: `feat(tunet): cd11 visual polish theme A — recipe content + oal sensor consolidation`

---

### Theme B — Typography min/max guardrails per variant

**Why second**: depends on theme A (shorter content fits within tighter ranges).

**Architectural approach**: tighten the existing 3-tier (`base` / `.is-text` / `.is-long`) range per variant + apply CSS `clamp()` so font-size cannot drop below readability floor or exceed variant ceiling. The 3-tier class system stays — it's the auto-fit mechanism — just bounded.

**Per-variant proposed values:**

```css
/* home_summary — tighten from 18.4/14/14 spread to ~17/16/15 */
:host([layout-variant="home_summary"]) {
  --_tunet-status-value-font: 1.0625em;          /* was 1.15625em → ~17px */
  --_tunet-status-text-font: 1em;                /* was 1.0625em → ~16px */
  --_tunet-status-long-font: 0.9375em;           /* keep at ~15px */
  --_tunet-status-value-min: 0.9375em;           /* readability floor */
  --_tunet-status-value-max: 1.125em;            /* matrix-coherence ceiling */
  --_tunet-status-label-font: 0.8125em;          /* keep at 13px */
}
:host([layout-variant="home_summary"]) .tile-val {
  font-size: clamp(
    var(--_tunet-status-value-min),
    var(--_tunet-status-value-font, 1.0625em),
    var(--_tunet-status-value-max)
  );
}
:host([layout-variant="home_summary"]) .tile-val.is-text {
  font-size: clamp(var(--_tunet-status-value-min), var(--_tunet-status-text-font, 1em), var(--_tunet-status-value-max));
}
:host([layout-variant="home_summary"]) .tile-val.is-long {
  font-size: clamp(var(--_tunet-status-value-min), var(--_tunet-status-long-font, 0.9375em), var(--_tunet-status-value-max));
}

/* home_detail — already well-behaved; minor refinement only */
:host([layout-variant="home_detail"]) {
  --_tunet-status-value-min: 0.875em;            /* 14px floor */
  --_tunet-status-value-max: 1.125em;            /* 18px ceiling */
}

/* room_row — tighten so "Environmental Boost" doesn't overflow */
:host([layout-variant="room_row"]) {
  --_tunet-status-value-font: 1em;
  --_tunet-status-text-font: 0.9375em;
  --_tunet-status-long-font: 0.875em;
  --_tunet-status-value-min: 0.8125em;           /* 13px floor */
  --_tunet-status-value-max: 1em;                /* 16px ceiling */
}
/* + use compact_label aggressively in row variant via _applyVariantRecipeDefaults */

/* info_only — bump label floor */
:host([layout-variant="info_only"]) {
  --_tunet-status-label-font: 0.75em;            /* was 0.65625em → 12px floor */
  --_tunet-status-value-min: 0.9375em;
  --_tunet-status-value-max: 1.375em;
}

/* alarms — preserve timer prominence; bump non-timer floor */
:host([layout-variant="alarms"]) {
  --_tunet-status-value-min: 0.875em;
  --_tunet-status-value-max: 1.375em;
}

/* custom — fix readability floor */
:host([layout-variant="custom"]) {
  --_tunet-status-value-min: 0.875em;            /* 14px floor — was rendering at 11.2px ⚠ */
  --_tunet-status-value-max: 1.25em;
  --_tunet-status-text-font: 0.9375em;
  --_tunet-status-long-font: 0.875em;
}
```

**`compact_label` discipline (for row + summary variants)**:
- Variant-aware label selection in `_applyVariantRecipeDefaults`: when variant ∈ {'home_summary', 'room_row'}, use `tile.compact_label` if defined, else `tile.label`. When variant ∈ {'home_detail', 'info_only'}, use `tile.label`.
- Recipes ensure every recipe with a long potential `label` has a sensible `compact_label`.

**Phone-density block** (`@media (max-width: 27.5em)`):
- All variants compress proportionally
- Floor stays at the variant's `--_tunet-status-value-min`

**Tests added**:
- per-variant computed font-size at 1440 within `[min, max]` clamp range
- per-variant computed label-font ≥ 12px readability floor
- per-variant `is-long` content (e.g., 30+ char string) renders at floor without overflowing tile
- `room_row` + "Environmental Boost" content does NOT overflow tile (asserts `valEl.scrollWidth <= valEl.clientWidth + 1`)
- `compact_label` is used over `label` in summary + room_row when both defined

**Lab YAML**: add a "long-content stress" fixture per variant to lock the no-overflow contract.

**Commit**: `feat(tunet): cd11 visual polish theme B — typography clamp ranges per variant`

---

### Theme C — Tap target +30% (aux-action, dropdown chevron, reset pill)

**Architectural approach**: a single token bump propagates through all aux-action chips.

**Changes:**

```css
:host {
  /* Was implicit in existing button styling; now explicit */
  --_tunet-status-aux-min-h: 2em;                /* ~32px at 16px base */
  --_tunet-status-aux-min-w: 2.5em;              /* ~40px */
  --_tunet-status-aux-icon: 1.125em;             /* ~18px glyph */
  --_tunet-status-aux-pad-x: 0.5em;
  --_tunet-status-aux-pad-y: 0.25em;
}

.aux-action, .tile-aux, .aux-label {
  min-height: var(--_tunet-status-aux-min-h, 2em);
  min-width: var(--_tunet-status-aux-min-w, 2.5em);
  padding: var(--_tunet-status-aux-pad-y) var(--_tunet-status-aux-pad-x);
}
.aux-action .icon, .tile-aux .icon, .aux-label .icon {
  font-size: var(--_tunet-status-aux-icon, 1.125em);
  width: var(--_tunet-status-aux-icon);
  height: var(--_tunet-status-aux-icon);
}

/* Dropdown chevron — bump from existing tiny size */
.tile-dd-val .chevron {
  font-size: 1em;
  width: 1.25em;
  height: 1.25em;
}
```

**Tests added**:
- live state with `active_zonal_overrides > 0` (mocked in test) → reset pill computed `getBoundingClientRect()` ≥ 32×32px
- dropdown chevron computed size ≥ 16×16px (1em)
- regression: `manual_overrides` aux-action chip min-size assertion

**Live verification approach**: Setting OAL config to Manual triggers `active_zonal_overrides` increment when zones get manual brightness offsets. Easier path: lab fixture forces `manual_overrides` show_when to true via mock attribute. Add a "force-show aux" lab fixture for visual review.

**Commit**: `feat(tunet): cd11 visual polish theme C — tap-target +30% bump`

---

### Theme D — Row variant phone behavior: 3-up wrap + container query stack

**Architectural approach**: at phone width, row tiles wrap to 3-up (or 4-up); within each tile, container query flips internal layout to vertical stack when tile width is below threshold.

**Changes:**

```css
@media (max-width: 27.5em) {
  :host([layout-variant="room_row"]) .grid {
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 0.5em;
  }
  /* 3-up baseline at phone width */
  :host([layout-variant="room_row"]) .tile {
    flex: 1 1 calc((100% - 1em) / 3);
    min-width: calc((100% - 1em) / 3);
    container-type: inline-size;
    container-name: room-row-tile;
  }
}

/* Container query: flip to vertical stack when tile is too narrow */
@container room-row-tile (max-width: 110px) {
  .tile {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.125em;
    padding: 0.625em 0.4em;
  }
  .tile-label {
    display: none;       /* drop label; icon implies semantics */
  }
  .tile-val {
    text-align: center;
  }
}

/* Media-query fallback for browsers without container queries */
@supports not (container-type: inline-size) {
  @media (max-width: 26em) {  /* approximation: at viewport ~390px, tiles fall below 110 */
    :host([layout-variant="room_row"]) .tile {
      flex-direction: column;
      align-items: center;
      gap: 0.125em;
    }
    :host([layout-variant="room_row"]) .tile-label {
      display: none;
    }
  }
}
```

**Tests added**:
- at 390px viewport with 5-tile row variant, tiles wrap to multiple rows of ≤3 tiles each (no horizontal scroll)
- at simulated tile-width < 110px, internal stack layout active (label hidden, icon-above-value)

**Commit**: `feat(tunet): cd11 visual polish theme D — row variant phone 3-up + container stack`

---

### Theme E — Layout polish (row title font, right padding, orphan tile half-width)

**Changes:**

```css
:host([layout-variant="room_row"]) {
  --_tunet-header-title-font: 1.125em;    /* was 1em — bumped per user feedback */
}

:host([layout-variant="room_row"]) .tile {
  padding-right: 1.25em;                  /* bump from 0.75em */
}

/* Orphan tile in info_only: don't span full row when alone */
:host([layout-variant="info_only"]) .grid > .tile:last-child:nth-child(odd) {
  max-width: calc((100% - var(--grid-gap, 0.5em)) / 2);
}
```

**Tests added**:
- info_only with odd tile count: last tile width ≤ half of grid width
- room_row title font computed ≥ 18px (1.125em at 16px base)
- room_row tile right-padding computed ≥ 1.25em

**Commit**: `feat(tunet): cd11 visual polish theme E — row title + padding + orphan tile`

---

### Theme F — Documentation + control-doc sync (final)

After themes A-E commit:

- Update `cards_reference.md` §9 with new recipe table (entity bindings + weather_modifier + lights_on attribute correction), new typography clamp ranges per variant, new tap-target floor, new row-variant phone behavior
- Update `sections_layout_matrix.md` per-variant table if any grid options changed (don't expect changes)
- Append session delta to `plan.md` (Theme A-E summary + acceptance evidence)
- Add fix entries to `FIX_LEDGER.md` at TOP (reverse-chrono per top-of-file rule)
- Update `handoff.md` Last Updated diff block

**Commit**: `docs(tunet): cd11 visual polish closeout — sync control docs`

## Manual visual verification protocol (mandatory per commit)

Per the Visual Verification Standard memory rule, every commit's "done" claim requires:

1. **Pre-commit**: `npm run tunet:build` clean, `npm test` green
2. **Pre-commit**: `node --check` passes for the source file
3. **Deploy**: `npm run tunet:deploy:lab` (with explicit user authorization)
4. **Live capture**: Playwright at 390/768/1024/1440 viewports
5. **Manual review**: Open every captured screenshot, inspect each variant section per-tile for typography, alignment, truncation, tap-target adequacy, density, balance. Report per-tile findings as a table in the commit message.
6. **Computed-style verification**: re-run the diagnostic browser_evaluate and compare current per-tile font-sizes / overflow flags against the locked contract. Any regression aborts the commit.
7. **User signoff** before declaring closure of any theme.

## Closure conditions for the visual polish pass

CD11 is fully closed (visual polish included) when **all** of these hold:

1. Live computed font-size deltas ≤ 20% per variant (down from 31% in summary, 42% in custom)
2. No DOM-measured `valOverflow: true` for any tile in any variant at any locked breakpoint with the lab fixtures
3. All labels ≥ 12px readability floor at all breakpoints (info_only label fixed)
4. All interactive elements ≥ 32×32px tap target
5. Row variant on phone: no horizontal scroll at default-stub fixtures (5-7 tiles)
6. Orphan tile half-width on info_only odd-count fixtures
7. All recipes consume their canonical OAL sensor (oal_real_time_monitor for system_state, oal_global_brightness_offset for boost, oal_system_status for everything else attribute-bearing)
8. Manual visual review per commit per protocol above
9. No regression on the 4 prior CD11 closure contracts (gap 1-4 tests still green)
10. Tranche pointer not advanced unilaterally — surface CD11 closure to user for adjudication

## Safety rules (carried from CD11 closure plan)

1. Never `rm -rf <path>/` for any path matching system directory names
2. Never `--no-verify` or skip pre-commit hooks
3. Never amend or reset published commits
4. Never push to origin/main
5. Never deviate from `~/.claude/plans/synthetic-dazzling-oasis.md` without surfacing
6. Never widen scope: visual polish stays card-local; no `tunet_base.js` changes; no cross-card; no CD10/CD12
7. Never deploy without explicit user authorization
8. Never advance the active tranche pointer unilaterally
9. Stop and ask if any theme requires more than ~80 lines of card-local code or any change outside Allowed files

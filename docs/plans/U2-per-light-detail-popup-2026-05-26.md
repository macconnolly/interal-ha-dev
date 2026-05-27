# U.2 — Per-Light Detail Popup (Icon-Tap Split Gesture)

**Created**: 2026-05-26 evening MDT
**Parent**: `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md`
**Authority**: focused line-level plan; gates through adversarial review before stamp.
**Surface**: per-light tiles on subviews + (potentially) popups; new `#light-detail-<entity>` Bubble Card popup template
**Gesture lock**: **Icon-tap split** (Apple-aligned, genesis R1) confirmed by Mac 2026-05-26
**Classification**: Type C (Foundation) change per global CLAUDE.md — affects tile interaction contract suite-wide

---

## 1. Empirical Baseline

### Current tile interaction contract (cards_reference.md §Interaction Model Contract)

| Tile element | Tap | Hold (400ms) | Drag |
|---|---|---|---|
| Light tile body (`tunet-light-tile`) | Toggle on/off | Enter brightness drag mode | Brightness adjust |
| Light tile body (`tunet-lighting-card` inline) | Toggle | Enter brightness drag | Brightness adjust |
| Tile icon (top region) | Same as body (no split) | Same as body | n/a |

**Hold is consumed by brightness drag** — cannot be re-used for detail popup.

### Why this is Type C (Foundation)

`tunet-light-tile` and `tunet-lighting-card`'s inline tiles are consumed by:
- preview, cosmos, suite-storage, card-rehab-yaml dashboards
- Possibly other surfaces (need grep)
- Cards-reference Interaction Model Contract documents the current tap=toggle behavior as locked

Changing the tile interaction model affects every consumer. Per global CLAUDE.md §Change Classification: "Type C: Foundation — affects system invariants. Requires explicit user acknowledgment of risk." Mac chose icon-tap split with description acknowledging "Some learning curve" — counts as the acknowledgment.

---

## 2. Design — Icon-Tap Split

### 2.1 Gesture contract (NEW)

| Tile region | Tap | Hold (400ms) | Drag |
|---|---|---|---|
| **Icon area** (top ~30% of tile or named icon region) | Toggle on/off (PRESERVE current body-tap toggle behavior here) | Enter brightness drag | Brightness adjust |
| **Body area** (lower ~70%, name + percent + slider) | **Open `#light-detail-<entity>` popup** | (no separate hold action; would conflict with icon-area drag) | n/a — drag belongs to icon area |

Rationale per genesis R1 (Apple HIG): tap-on-icon = primary action (toggle), tap-on-name/body = open detail sheet. Hold remains brightness drag for power-user continuous control.

### 2.2 The new `#light-detail-<entity>` popup

Bubble Card 3.2.1 popup template that renders for any light entity. Contents (per genesis spec + native HA more-info pattern):

- Header: light name + icon + ✕ close
- Large light tile (the existing `tunet-light-tile` in expanded mode, OR HA's native `light` more-info card)
- Brightness slider (full-width, continuous)
- Color picker (HA-native or `simple-thermostat`-style or `lovelace-mushroom`-style — investigate which renders best in popup)
- Color temperature slider (Kelvin range from entity attributes)
- Effect picker (if light supports effects, from `effect_list` attribute)
- Quick scenes for this light (room-scoped scenes that affect this light, optional)

**Implementation choice**: build a `#light-detail` Bubble popup template that takes the entity_id as a variable, OR one popup per light. Variable-templated is cleaner but Bubble 3.2.1 capability needs verification.

### 2.3 Icon-vs-body region split — implementation in `tunet_light_tile.js`

Add two event listeners on the tile:
- `iconEl.addEventListener('click', toggleHandler)` — preserves current behavior
- `bodyEl.addEventListener('click', openDetailHandler)` — NEW, dispatches hash navigation to `#light-detail-<entity_id>`
- `iconEl.addEventListener('pointerdown' + 400ms timer, enterDragMode)` — preserves current brightness drag

CSS clarification: icon area must have visual affordance distinct from body area. Possible:
- Slightly raised/elevated icon background
- Hover state on body region (cursor changes to indicate "tap for detail")
- Subtle border between icon and body

### 2.4 Lighting-card inline tile parity

`tunet-lighting-card` renders inline tiles that mirror `tunet-light-tile` behavior. Same icon-vs-body split must apply to inline tiles or the gesture model becomes inconsistent across surfaces. Touch both files in the same tranche.

---

## 3. Implementation Phases

### Phase 3.0 — Pre-flight (~30 min)

- Confirm Bubble Card 3.2.1 supports popup template variables for `#light-detail-<entity>` pattern. Read `Dashboard/Tunet/Docs/cards_reference.md` Bubble Card section + bubble-card source if needed.
- Investigate HA native `more-info` card vs `lovelace-mushroom` card for color picker UX. Compare visual fit with Tunet design language.
- Verify entity attribute capabilities (color, color_temp, effect_list) across the light entities in scope.
- Search all consumers of `tunet-light-tile` and `tunet-lighting-card` to size suite-wide impact.

### Phase 3.1 — `#light-detail` Bubble popup template (~1.5h)

Define one popup template (variable: `entity_id`) OR per-light popups (5+ lights × 5 rooms = ~20 popups). Recommend templated approach if Bubble supports; else per-light list.

Visual review at 390 + 1440 for color picker / temp picker / effect picker layout.

### Phase 3.2 — `tunet_light_tile.js` icon-tap split (~1.5-2h)

Code change: split click event handling into icon vs body regions. CSS visual distinction. Backward-compat consideration:
- Existing tap-to-toggle expectations across all consumers — body-tap now opens detail instead of toggling. **This IS the behavior change.**
- Mitigation: prominent visual affordance on body (cursor + subtle hover) signals "different action"

Tests: `npm test -- light_tile` after change. Manual capture at all 4 breakpoints on each consumer (preview, cosmos, suite-storage).

### Phase 3.3 — `tunet_lighting_card.js` inline tile parity (~1-1.5h)

Same icon-vs-body split on inline tiles. Same backward-compat consideration. Tests + visual check.

### Phase 3.4 — Cards-reference + visual_defect_ledger update (~30 min)

Update Interaction Model Contract documentation. Update ledger to mark the gesture change shipped.

### Phase 3.5 — Suite-wide M1 capture sweep (~1h)

Capture every dashboard using `tunet-light-tile` or `tunet-lighting-card` at 4 breakpoints. Mac M1 stamp gate.

### Total: ~6-7h focused execution

---

## 4. Adversarial Review

### Pressure scenarios

1. **Tap-on-icon vs tap-on-body region detection** at small tile sizes (compact tile, 390×844): how big is the icon region in pixels? Is it reliably hittable without accidentally triggering body? Per Apple HIG 44pt minimum tap target.
2. **Brightness drag initiation** when user actually wanted to open detail: drag must start within icon area (to be hold→drag), but user might tap-then-drag from body area expecting toggle-or-detail and instead get nothing.
3. **Habituated muscle memory**: every existing user (Mac) has muscle memory of tap-anywhere = toggle. Body-tap now opens popup. Will Mac mis-tap many times before the new model lands?
4. **Speaker tile parity**: speaker tiles use same tap-toggle pattern (select active) — do they get the same icon-vs-body split for symmetry, or stay as-is? Asymmetry across tile types may confuse.
5. **Popup-open-from-popup**: tapping a light tile inside `#room-living-room` opens `#light-detail-<entity>`. Bubble Card 3.2.1 popup-from-popup is fragile — verify it works at all 4 breakpoints + dismissal cascade (close light-detail → return to room popup or to home?).
6. **HA more-info native conflict**: native HA more-info long-press is `holdAction: { action: 'more-info' }`. Tunet currently overrides this. Need to confirm icon-area-hold = brightness-drag does NOT accidentally fire HA's more-info.
7. **Test coverage gaps**: existing vitest suite tests current tap=toggle behavior. After change, tests must update OR will fail and block the M1 gate.
8. **Light without color/effect**: many lights are CCT-only (no RGB). Popup should adapt — hide color picker, show only brightness + CCT. Edge: light becomes unavailable mid-popup — render gracefully.

### Per-phase rollback

| Phase | Rollback |
|---|---|
| 3.1 | Delete popup template block in preview yaml |
| 3.2 | Revert `tunet_light_tile.js`; rebuild + redeploy |
| 3.3 | Revert `tunet_lighting_card.js`; rebuild + redeploy |
| 3.4 | Revert docs |
| 3.5 | n/a (capture only) |

Type C foundation change: full rollback restores tap=toggle behavior across all surfaces.

---

## 5. Definition of Done

- `npm test` passes (updated tests reflect new gesture model)
- Icon-tap on tile = toggle confirmed at 390, 768, 1024, 1440 (Mac live test)
- Body-tap on tile = detail popup opens at all breakpoints
- Hold-on-icon = brightness drag (preserved)
- Color picker, CCT slider, effect picker render correctly in popup (where light supports)
- Light-detail popup dismissal returns to underlying view cleanly
- Cards-reference Interaction Model Contract updated
- visual_defect_ledger updated (D.1 marked, originally listed in U.1 deferred registry)
- Mac M1 stamp

---

## 6. Out of Scope

- U.1 rooms/popup polish (separate)
- U.3 Lights page (separate)
- HA more-info card replacement (use as one of the popup primitives if it fits, but don't reimplement)
- Color picker creation from scratch (use existing HA / lovelace-mushroom / native picker)
- Light effect choreography (`turn_on` with `effect: rainbow` etc.) — popup exposes the picker; downstream effect-script orchestration is separate scope

---

## 7. Open Decisions for Mac

**BLOCKING — resolve before Phase 3.1 starts**:
1. **Color picker primitive** — HA native `more-info` light card OR `lovelace-mushroom` light card OR custom Tunet picker? Each has different visual fit + capability. Recommend HA native for fastest ship; lovelace-mushroom for cleaner aesthetic.
2. **Popup template variables** — confirm Bubble Card 3.2.1 supports templated `#light-detail-<entity>` OR commit to per-light popup definitions (more YAML, less elegance, more reliable).
3. **Speaker tile gesture parity** — also adopt icon-vs-body split on speaker tiles for symmetry, OR keep speaker tiles as-is (tap=select-active)? If keep, document the asymmetry in cards-reference.

**INFORMATIONAL**:
4. **Backward-compat acknowledgment** — Mac already chose icon-tap split, which is the breaking change. Confirm willingness to retrain muscle memory.
5. **Effect picker scope** — show only if `effect_list` not empty? Or always show with disabled state?

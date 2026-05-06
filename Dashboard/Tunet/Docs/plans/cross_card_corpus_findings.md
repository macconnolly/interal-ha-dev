# Tunet Corpus Findings — Pre-CC0 Research

**Generated**: 2026-04-30 from `tunet-architecture` claude-mem corpus (500 obs, 234k tokens)

**Filter**: types=[decision,feature,refactor,discovery,change,bugfix]; project=implementation_10; files=[v3 cards + base + design/contract docs]; limit=500

> **2026-04-30 numbering update**: Sections below were authored using CC1–CC4 numbering from the previous plan version. The plan was rewritten to CC0–CC3 after the adversarial review (`cross_card_spec_layer_review_2026-04-30.md`). Mapping: original CC4 → new **CC0** (foundation: em-anchor + primitive adoption — promoted to first pass since adoption is 0/14, not "completion"); original CC1 → new **CC1** (shape reconciliation, not parallel-add); original CC2 → new **CC2** (type/icon reconciliation); original CC3 → new **CC3** (composition, expanded to 10 rules). Section titles below preserve the original CC1–CC4 labels because the questions and answers were authored against that numbering; the substance still applies.

Each section is a substantive corpus-synthesized answer to a research question that informs the cross_card_spec_layer_extraction_plan.md. Caveat: corpus uses CD0-CD12 tranche numbering; the CC labels are forward-looking pass labels, so the agent often calls out the terminology gap before answering substance.

---

## CC1 — Corner / shape migration risks

## Preliminary Note on "CC1"

The corpus documents consistency-driver tranches **CD0–CD12** only — "CC1" as a named corner/shape migration tranche does not appear in the 56 observations. This is either a tranche being planned beyond the corpus date range or a naming variant. I'll answer the substance of your question — which cards carry load-bearing `border-radius` interactions that require careful handling — using everything the corpus does document. Where line numbers are known I'll cite them; where they aren't I'll say so explicitly.

---

## 1. `overflow:hidden` Masking

This is the most explicitly flagged risk area in the corpus. `overflow:hidden` is called out as a **CD4 target concern** in per-card tranche assignments inside `cards_reference.md`:

> *"CD4 targets (profile migration, overflow:hidden, grid-auto-rows)"*

The implication is that several cards use `overflow:hidden` on containers whose `border-radius` is doing active visual masking work — not decorative clipping. A naive token migration that changes radius values on those containers would alter the visual mask.

**Specific cards flagged:**

**`tunet_status_card.js`** — The most confirmed case. The corpus documents:
- `--_tunet-tile-radius: 0.875em` is a profile token actively consumed by the card's tile layout
- A **height drift issue at L216** was noted and deferred to CD11 (scope lock enforced)
- The status card has five tile subtypes with distinct geometry (indicator, timer, dropdown, alarm, value). Any container using `overflow:hidden` to enforce tile shape across these subtypes is load-bearing — removing or changing the radius breaks subtype visual containment

The dropdown subtype is the highest-risk case: `--_tunet-dd-radius: 0.5em` defines the dropdown panel's own radius, and the smart viewport-flip behavior (repositions above tile if insufficient space below, constrains `max-height` dynamically) means the panel's clipping geometry changes at runtime. A radius token change must account for both positions.

> *Sources: "Status Card Profile Token Consumption" (2026-04-03); "cards_reference.md: All 13 Cards Fully Documented" (2026-04-03); "CD4 Complete" (2026-04-04)*

**`tunet_rooms_card.js`** — Also in the CD4 `overflow:hidden` concern list. The rooms card's three layout variants (tiles, row, slim) each have different tile geometries. In **row** and **slim** modes, light orbs are rendered inside the tile's controls area — small circular elements that rely on the parent tile's `overflow:hidden` + `border-radius` to clip correctly. Changing the parent radius without adjusting the orb geometry breaks the composition.

> *Sources: "Deep Behavioral Audit: All 13 Tunet Cards" (2026-04-03); "cards_reference.md: All 13 Cards Fully Documented" (2026-04-03)*

---

## 2. Scroll-Snap Alignment

**`tunet_lighting_card.js`** — The only card in the corpus with a confirmed scroll-snap implementation. From the v3.2.0 discovery observation:

> *"Layout modes: 'grid' (2-5 columns, optional max rows) and 'scroll' (snap scrolling with pagination dots)"*

In scroll mode, tiles snap into position. The snap alignment is calculated against the tile's layout box. If `border-radius` is applied to the **scroll container** (which is common for glassmorphic styling) and that container has `overflow:hidden`, the visible snap frame is the masked area — not the full scroll track. A radius token change that grows the container radius will shift where content is visible and potentially misalign snap targets.

The overview config also exercises this path directly: `layout: scroll, scroll_rows: 1, tile_size: compact` on the lighting hero. This is a production surface, not a lab instance.

**L-numbers:** The corpus does not provide specific line numbers for the scroll container's `border-radius` in `tunet_lighting_card.js`. The file is 1,892 lines (v3 count) or 1,936 lines (the v3.2.0 audit count). The scroll implementation details are confirmed but L-numbers for the radius specifically are not documented.

> *Sources: "tunet_lighting_card.js V3.2.0" (2026-02-25); "Tunet Overview Config" (2026-02-20); "Tunet v3 card file line counts" (2026-04-03)*

---

## 3. Drag Pill Clipping

**`tunet_lighting_card.js`** — The highest-risk case for drag pill clipping. The corpus documents explicitly:

> *"floating pill that shows brightness percentage during the drag"*

This pill is absolutely positioned over the tile during a drag gesture. If the tile or its grid container has `overflow:hidden` active (which is likely given the glassmorphic masking pattern), the pill will be clipped by the container's border-radius. The pill needs to overflow the tile boundary to be readable — it's a transient overlay, not content within the tile. Any radius change on the container must be validated against pill visibility at drag initiation.

Additional drag surface details from the corpus: pointer capture is used with graceful fallback for WebViews/Safari that reject capture. The tile shadow lifts during drag (rest: `0 4px 12px / 0 1px 2px` → lifted: `0 12px 32px / 0 4px 12px`). Shadow clipping by `overflow:hidden` is a separate but related concern — shadow is rendered outside the border-box and will be cut by `overflow:hidden`.

**`tunet_media_card.js` / `tunet_speaker_grid_card.js`** — Volume drag is also present on speaker tiles (drag-for-volume, 4px drag threshold distinguishing tap from drag). The corpus does not document a floating pill for volume drag, but the same `overflow:hidden` + radius interaction concern applies to the drag track itself.

**`tunet_climate_card.js`** — The dual-thumb slider has a drag surface at thumb elements. The corpus flags thumb scale at **L421**: `scale(1.08)` was called out as needing migration to `var(--drag-scale)` in the CD2 planning pass. The thumb elements are rendered within the slider track — if the track has `overflow:hidden` + `border-radius` to produce a pill-shaped track, changing the track radius clips the thumb at travel extremes.

> *Sources: "tunet_lighting_card.js V3.2.0" (2026-02-25); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "Tunet Media Card v2 Complete Implementation Plan" (2026-02-19); "Deep Behavioral Audit" (2026-04-03)*

---

## 4. Focus-Ring Visibility

Focus rings sit **outside** the element's border-box. If a parent container has `overflow:hidden`, the focus ring is clipped to the container's radius — potentially making it invisible or partially visible. The corpus identifies several cards with compounded risk here:

**`tunet_speaker_grid_card.js`** — The highest-risk case. The corpus states directly:

> *"speaker_grid uses `--accent` and `--spring` variables that are undefined in tunet_base.js TOKENS — focus ring is likely invisible, spring transition falls back to initial"*

The focus ring is likely invisible already (undefined token). A shape migration that changes the container radius on top of an already-broken focus ring compounds the debt — the fix must address both the token gap and the overflow geometry.

**L-number:** `--spring` confirmed used at **L162** in `tunet_speaker_grid_card.js`.

**`tunet_media_card.js`**, **`tunet_sonos_card.js`**, **`tunet_weather_card.js`** — The corpus states all three have **ZERO focus-visible styling**. These cards have no `:focus-visible` rules at all, meaning the UA default outline (which respects `outline-offset` but not `overflow:hidden`) is the only focus indicator. If containers on these cards gain `overflow:hidden` during a shape migration pass, even the UA fallback outline could be clipped.

**`tunet_nav_card.js`** — Designated as the **CD2 reference implementation** for correct focus-visible behavior. Uses `--focus-ring-*` tokens correctly. However, the nav card uses a `position:fixed` dock with `ensureGlobalOffsetsStyle()` global CSS injection (called at **L411** in `connectedCallback`). The nav's own container radius is part of its fixed chrome — any shape token migration must treat the nav container radius as load-bearing for the overall page chrome geometry, not just for focus rings.

> *Sources: "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "cards_reference.md Expanded" (2026-04-03); "CTRL_SURFACE and REDUCED_MOTION Already Have Correct Patterns" (2026-04-03); "getGridOptions() Inventory" (2026-03-10)*

---

## 5. Grouping Badge Composition

Badges are composed on top of rounded surfaces. Changing the host surface radius without adjusting the badge anchor creates visual misalignment (badge hangs off a corner that no longer matches its expected position).

**`tunet_lighting_card.js`** — The manual count badge:

> *"Manual count badge on adaptive toggle button shows number of manually-controlled lights"*

This badge is anchored to the adaptive toggle button's corner. The toggle button is a rounded control — its `border-radius` defines where the badge's absolute-position anchor sits. A radius token migration that changes the button's corner geometry shifts the badge anchor point.

**`tunet_media_card.js`** — Two badge/overlay cases:
1. **TV mode badge**: displayed when `sensor.sonos_smart_coordinator` reports `is_tv_mode: true`. Positioned relative to the media surface, anchored to a corner defined by the card's tile radius.
2. **Group membership state**: uses blue accent tokens (`--blue`, `--blue-fill`, `--blue-border`). Speaker tiles show group membership via border/background state changes that interact with the tile's radius.

**L-numbers:** The corpus does not provide specific line numbers for badge anchor CSS in these cards.

**`tunet_speaker_grid_card.js`** — Group membership state dot/badge on speaker tiles. The corpus documents that binary sensor state drives a visual group-membership indicator per tile. The tile radius defines the composition frame for this indicator.

> *Sources: "Tunet Media Card v2 Complete Implementation Plan" (2026-02-19); "tunet_lighting_card.js V3.2.0" (2026-02-25); "cards_reference.md: All 13 Cards Fully Documented" (2026-04-03)*

---

## Risk Summary Table

| Card | Risk Area | Specific Concern | L-Number Known? |
|---|---|---|---|
| `tunet_status_card.js` | `overflow:hidden` masking | Tile-radius token (`--_tunet-tile-radius: 0.875em`) load-bearing; dropdown panel radius (`--_tunet-dd-radius: 0.5em`) runtime-repositioned | Height drift at **L216**; radius token values confirmed, not L-numbers |
| `tunet_rooms_card.js` | `overflow:hidden` masking | Light orbs clipped by parent tile radius in row/slim variants | Not documented |
| `tunet_lighting_card.js` | Scroll-snap + drag pill | Scroll container radius shifts snap frame; floating brightness pill clipped by tile `overflow:hidden` | Not documented for radius; file is 1,892 lines |
| `tunet_climate_card.js` | Drag pill / thumb | Slider track radius clips thumb at travel extremes | Thumb scale at **L421** |
| `tunet_speaker_grid_card.js` | Focus-ring + badge | Focus ring already likely invisible (undefined token at **L162**); group membership badge anchored to tile corner radius | **L162** for `--spring` |
| `tunet_media_card.js` | Focus-ring + badge | Zero focus-visible styling; TV mode badge + group state badge anchored to card radius | None documented |
| `tunet_sonos_card.js` | Focus-ring | Zero focus-visible styling; `--spring` undefined at **L252** | **L252** for `--spring` |
| `tunet_weather_card.js` | Focus-ring | Zero focus-visible styling | Not documented |
| `tunet_nav_card.js` | Focus-ring + page chrome | Correct focus-visible (reference impl), but fixed-position container radius is page chrome — load-bearing for global offset geometry | `ensureGlobalOffsetsStyle()` at **L411** |
| `tunet_lighting_card.js` | Badge composition | Manual count badge anchored to adaptive toggle button corner radius | Not documented |

---

## CC2 — Type scale + em-anchor risks

## Honest Scope Assessment First

**"CC2" does not appear in the corpus.** The consistency-driver tranches are numbered CD0–CD12, with CD2 being *Shared Interaction Adoption* (hover guards, press scales, transitions) and CD4 being *Shared Sizing and Sections Adoption*. There is no "CC2 type scale + em-anchor enforcement" tranche documented in any of the 56 observations.

Critically: **the corpus does not contain per-card `:host { font-size }` audit data.** No observation inventories which cards set host font-size, at what value, or whether the declaration appears inside an `@media` block vs. top-level `:host`. That line-level CSS detail was never captured as an observation.

---

## What the Corpus *Does* Say About the em/px Tension

### The em-unit principle was explicitly softened

> "Design principle #4 changed from 'Em-based, not px' mandate to 'Prefer em for new geometry' directional preference."

The rationale: existing base tokens in `tunet_base.js` are already px-valued (e.g. `--focus-ring-width: 2px`), and forcing an immediate full rewrite was deemed counterproductive. **Existing px tokens stay px until explicitly migrated.**

> *"cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03)*

### The profile system uses em throughout — but relative to an unanchored context

`PROFILE_BASE` and the `SIZE_PROFILES` registry define all sizing in `em` units — `1.25em`, `0.875em`, `0.8125em`, etc. — explicitly described as "relative to the card's base font size." The status card's profile token consumption is the clearest example: `--_tunet-name-font: 0.8125em`, `--_tunet-value-font: 1.125em`, `--_tunet-timer-font: 1.125em`, dropdown geometry all in em.

The implied assumption is that each card's shadow DOM has *some* base font-size to resolve against — but the corpus **never documents what that anchor is per card**, nor confirms it's uniformly 16px.

> *"Tunet Card Unified Size Profile System" (2026-03-08); "Status Card Profile Token Consumption" (2026-04-03)*

### The `--spring` variable gap is a known example of token fallback risk

`tunet_sonos_card.js` (L252) and `tunet_speaker_grid_card.js` (L162) use `--spring` which is **not defined in `TOKENS`**, causing silent fallback to `initial`. This is the pattern of risk the corpus already acknowledges — tokens referenced but not defined cause silent degradation.

> *"CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "cards_reference.md Expanded" (2026-04-03)*

---

## What Would Break with `font-size: var(--type-row-title, 18px)` + a 16px Anchor

Even without a per-card audit, the corpus gives enough to reason through this:

**Scenario:** A card has declarations like `font-size: var(--type-row-title, 18px)` and you introduce `:host { font-size: 16px }`.

### Case 1: `--type-row-title` is undefined (fallback fires)
The `18px` fallback is an **absolute px value** — it is completely unaffected by the `:host` font-size anchor. Nothing breaks, nothing changes. The 18px renders as 18px regardless.

### Case 2: `--type-row-title` is defined as an em value (e.g. `1.125em`)
Before the anchor: the em resolves against whatever the browser's inherited font-size is for that shadow root — typically 16px from the HA default, but not guaranteed. After anchoring `:host { font-size: 16px }` explicitly, it now resolves against exactly 16px. **If the inherited value was already 16px, nothing changes. If it was anything else, the computed size shifts.**

### Case 3: `--type-row-title` is defined as a px value (e.g. `18px`)
Absolute — unaffected by the anchor, same as Case 1.

### Case 4: Mixed context — some children use em, others use the px fallback
This is the real danger. If you anchor `:host { font-size: 16px }` and some nested elements use em-based sizing (either directly or via profile tokens like `--_tunet-value-font: 1.125em`), those will now resolve against 16px. **But elements still falling back to px literals (18px, 14px, etc.) won't.** The result is a **split reference frame** — some text scales with the anchor, some doesn't — producing layout drift that's hard to spot because both may look roughly correct at 16px but diverge at any other base size.

### Case 5: Cards with profile token consumption via `_setProfileVars`
The 6 profile-consuming cards (light_tile, lighting, rooms, sensor, speaker_grid, status) inject em-valued tokens programmatically at runtime. If those cards *also* have hardcoded px fallbacks in their CSS (e.g. `font-size: var(--_tunet-name-font, 13px)`), adding the host anchor makes the token path and the fallback path diverge in computed size — the token path now scales proportionally; the fallback path stays at 13px absolute. Since the profile system was built assuming em resolves against a consistent base, any card where some declarations use the profile tokens and others fall back to px will show **size inconsistency between tile subtypes** post-anchor.

> *"Tunet Card Unified Size Profile System" (2026-03-08); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD4 Sizing System Deep Map" (2026-04-04)*

---

## What You'd Need to Do the Full Audit

The corpus does not contain it, but you'd need to grep across all 13 `Dashboard/Tunet/Cards/v3/tunet_*.js` files for:
1. `:host\s*{[^}]*font-size` — find host-level font-size declarations and their values
2. `@media[^{]+{[^}]*font-size` — find font-size inside media queries
3. `font-size:\s*var\([^,)]+,\s*[0-9]+px\)` — find mixed em/px fallback patterns
4. `font-size:\s*[0-9]+px` — find hardcoded px font sizes outside token system

The corpus's CD4 sizing audit (`getGridOptions()` inventory) and the profile token consumption map for the status card are the closest existing artifacts — neither goes to the font-size declaration level. That audit is a gap in the documented work as of the corpus cutoff (2026-04-05).

---

## CC3 — Surface composition rules (additional)

Based on the corpus, here are the additional implicit cross-cutting composition rules — ones that caused actual bugs, required exemptions, or left explicit fragility warnings in the codebase:

---

## F. Nav Card Global DOM Mutation (`ensureGlobalOffsetsStyle()`) — FL-011

**The pattern:**
`tunet_nav_card.js` injects a `<style>` tag directly into `document.head` (not into its own shadow root) to shift HA's own view elements (`hui-view`, `hui-sections-view`, etc.) away from the nav chrome. This is not scoped to the card's shadow DOM — it mutates the global document.

**Why it's a composition rule:**
Every other Tunet card renders inside a layout that has already been physically shifted by the nav card's injected CSS. If the nav card fires *after* other cards render, or fires on a non-Tunet route, those view elements get permanently offset for the wrong context.

**The exemption that was required:**
An explicit escape hatch was added: `window.TUNET_NAV_OFFSETS_DISABLED = true` suppresses the injection. The G5 gate validation notes explicitly warn that this flag *must be set* before any regression testing session, or the entire Sections sizing validation is contaminated by the offset injection. The G3.0 neutralization pass was a prerequisite gate for multiple subsequent architecture phases.

**The deeper fragility:**
Agent 2's report flagged that HA 2026.2 footer cards *might* eliminate the need for this entirely — but as of the corpus it was unverified whether custom cards work in the footer slot.

> *Sources: "Cross-Cutting Architecture Assessment" (2026-03-01); "agent2_ha_standards_report.md" (2026-03-03); "getGridOptions() Inventory" (2026-03-10); "G5 Sections Validation" (2026-03-10); "Deep Behavioral Audit" (2026-04-03)*

---

## G. `history.pushState` in 3 Cards — FL-012

**The pattern:**
Three cards call `history.pushState()` directly, bypassing HA's own Lit-based router. This is a cross-cutting composition conflict: HA's router owns the browser history stack, and cards pushing directly onto it can produce a state where the browser back button takes the user to a URL that HA's router doesn't recognize as a valid navigation event.

**Why it's a composition rule:**
Any card that calls `history.pushState` is implicitly assuming it is the only writer to the history stack on that navigation event. When HA's router also writes (e.g., on a `navigate` action triggered elsewhere), the two writes can interleave incorrectly. The corpus identifies this as a standards violation alongside FL-011 (global CSS injection) and FL-013/FL-018 (config editor mismatches).

> *Sources: "agent2_ha_standards_report.md — Full Native vs Custom Card Verdicts" (2026-03-03); "Agent 2 HA Standards Report Completed" (2026-03-03)*

---

## H. Rooms Card Event Propagation Fragility

**The pattern:**
`tunet_rooms_card.js` in row mode uses `stopPropagation()` on orb clicks and the power button click to prevent those events from bubbling up to the tile-body's tap handler (which navigates). The entire routing contract — tap navigates, orbs toggle individual lights, power button toggles the room — depends on this propagation order being undisturbed.

**The explicit fragility warning:**
The corpus labels this contract as **FRAGILE** in `cards_reference.md` and states directly: *"stopPropagation() on orbs and power button must not be disturbed."* This means any refactor that restructures the DOM nesting of the controls area (e.g., for the unified tile architecture migration) must preserve the exact propagation topology or the routing contract silently breaks — tapping an orb navigates the room instead of toggling the light.

**How it's a sibling/ancestor concern:**
If the rooms card is ever composed inside a parent element that itself has a tap handler (e.g., a wrapper card or a Sections container with gesture capture), the stopPropagation calls may not be sufficient to prevent the parent from also receiving the event.

> *Sources: "cards_reference.md Expanded" (2026-04-03); "Deep Behavioral Audit: All 13 Tunet Cards" (2026-04-03); "cards_reference.md: All 13 Cards Fully Documented" (2026-04-03)*

---

## I. `visibility: hidden` vs `display: none` Grid Space Composition

**The pattern:**
`tunet_status_card.js` uses `visibility: hidden` (not `display: none`) for tiles governed by `show_when` conditions. Hidden tiles remain in the CSS Grid flow and occupy their grid cell.

**Why it's a composition rule:**
This is an intentional layout stability contract: if the hidden tile used `display: none`, the grid would reflow and adjacent tiles would shift position whenever the condition changed. The `visibility: hidden` approach means the grid layout is deterministic regardless of which tiles are currently visible.

**The implicit rule this creates:**
Any downstream card refactor (e.g., migrating status tiles to the unified `tunet_display_tile` architecture) must preserve this `visibility: hidden` behavior, not the more intuitive `display: none`. If a refactor accidentally switches to `display: none`, the status card grid will visibly jump when conditional tiles appear or disappear — a regression that would only surface during runtime testing against real HA state, not unit tests.

**Related token:**
The profile token `--_tunet-status-pad-top` / `--_tunet-status-pad-bottom` applies asymmetric padding to tiles, which further relies on grid cells being consistently sized. Invisible-but-space-occupying tiles are load-bearing for this padding geometry.

> *Sources: "Deep Behavioral Audit: All 13 Tunet Cards" (2026-04-03); "Tunet Card Suite — Deep Behavioral Audit" (2026-04-03); "Status Card Profile Token Consumption" (2026-04-03)*

---

## J. `--spring` CSS Variable Undefined in `TOKENS` — Cross-Card Invisible Regression

**The pattern:**
`tunet_sonos_card.js` (L252) and `tunet_speaker_grid_card.js` (L162) both reference a `--spring` CSS custom property for transition timing. This variable is **not defined anywhere in `tunet_base.js` TOKENS**. When a CSS custom property is unresolved, the property falls back to `initial` — meaning the transition on those elements silently disappears rather than throwing an error.

**Why it's a composition rule:**
This is an implicit naming contract between two cards and the shared token registry. Both cards independently assumed `--spring` would be in TOKENS (likely copied from each other or from an earlier design iteration). The result:
- The speaker grid's hover uses `translateY(-1px)` — a non-standard lift pattern noted as a CD2 fix item
- The sonos card press scale is hardcoded `.90` instead of using `var(--press-scale)`, likely because the spring transition fallback made the token-based approach feel broken during development

**The compounding risk:**
If a future tranche adds `--spring` to TOKENS with any value other than what the two cards were implicitly expecting, it changes both cards' transition behavior simultaneously. The corpus flags this as a CD2 decision point: either add `--spring` to TOKENS or replace all usages with `--ease-emphasized`.

> *Sources: "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "cards_reference.md Expanded" (2026-04-03); "CTRL_SURFACE and REDUCED_MOTION Already Have Correct Patterns" (2026-04-03)*

---

## K. Scenes Card `allow_wrap: false` Default Conflicting with Sections Container

**The pattern:**
`tunet_scenes_card.js` had `allow_wrap: false` as its default — meaning the chip strip would never wrap to a second line. In a Sections layout where the card is narrower than the chip total width, this caused chips to overflow their container without wrapping.

**The explicit fix required (CD4):**
The CD4 tranche changed the default to `allow_wrap: true` to make the card Sections-safe. The `strip` mode (non-wrapping) is retained as an explicit opt-in YAML configuration.

**Why it's a composition rule:**
The card's internal layout decision (never wrap) directly conflicted with the Sections container's width constraint. The card had no knowledge of its container width — it was using a viewport-derived breakpoint — so it couldn't adapt. The fix was a behavioral default change, not a responsive fix. This is a case where the card's layout assumptions about its own minimum width were violated by the ancestor container.

> *Sources: "CD4 Complete — Shared Sizing and Sections Adoption" (2026-04-04); "CD4 Sizing System Deep Map" (2026-04-04)*

---

## L. Rooms Card O(rooms × lights × AL_switches) hass Scanning

**The pattern:**
`tunet_rooms_card.js` scans **all** `adaptive_lighting` switches in the HA entity registry on **every** `set hass()` call to find which lights are under manual control, by checking if each AL switch's `lights` attribute overlaps with each room's light list.

**Why it's a composition rule:**
This is O(rooms × lights × AL_switches) work triggered on every HA state update — including updates to completely unrelated entities. In a large HA install, this means every entity state change (motion sensor, door sensor, etc.) fires a full scan of all AL switches. If multiple Tunet cards are on the same dashboard, each card's `set hass()` fires independently, compounding the total work.

**The explicit concern in the corpus:**
The cross-cutting architecture assessment labels this the **main performance concern for scalability** in the entire Tunet suite and flags it as a potential issue for large HA installs. No fix was applied within the corpus date range — it was identified but deferred.

> *Sources: "Cross-Cutting Architecture Assessment: Consistent Patterns with Known Limitations" (2026-03-01)*

---

## M. CSS Custom Property Shadow DOM Cascade as Implicit Profile Contract

**The pattern:**
The profile token system relies on CSS custom properties cascading *through* shadow DOM boundaries. When `tunet-card` sets `--profile-icon-box: 38px` on its host element, that value cascades into nested shadow roots (e.g., into a `tunet-tile` shadow DOM, and further into a `tunet-row` shadow DOM that composes a `tunet-tile` inside it).

**Why it's a composition rule:**
CSS custom properties pierce shadow DOM by design in the spec — but this behavior is implicit and invisible. The architecture explicitly relies on it: the statement *"profile tokens set on the card host cascade through tunet-row shadow DOM into nested tunet-tile shadow DOM"* is documented as a prerequisite for the nested composition model to work.

**The risk it creates:**
If any ancestor element in the HA view hierarchy sets a conflicting `--profile-icon-box` value (e.g., a HACS card-mod rule, or a Lovelace theme variable using the same name), it will silently override the card's profile token for all nested tiles. The profile system has no shadow DOM isolation from its ancestors — only from its own descendants.

> *Sources: "Architecture Refined to 5 Components: tunet-tile + tunet-row + tunet-indicator + tunet-card + Editor" (2026-03-07)*

---

## N. `injectFonts(shadowRoot)` Argument Silently Ignored

**The pattern:**
`tunet_light_tile.js` calls `injectFonts(shadowRoot)` passing the shadow root as an argument, but the `injectFonts()` function in tunet_base.js ignores the argument entirely (it injects into `document.head`, not the shadow root).

**Why it's a composition rule:**
The card author intended font injection to be scoped to the tile's shadow DOM (correct behavior for encapsulation). The actual behavior injects fonts globally into `document.head`. This means:
1. The fonts are injected every time a `tunet_light_tile` connects, potentially producing duplicate `<link>` tags in the document head
2. The shadow DOM does not get the fonts via the expected mechanism — it gets them only because `document.head` fonts cascade globally

If a future refactor correctly scopes `injectFonts` to the shadow root, `tunet_light_tile` would be the first card that breaks (fonts missing in tile shadow DOM) because it was the only card passing an argument suggesting the scoped behavior was the intent.

> *Sources: "Cross-Cutting Architecture Assessment" (2026-03-01)*

---

## Summary

| Rule | Type | Status | Cards Affected |
|---|---|---|---|
| **F.** Nav global `<style>` injection | Ancestor DOM mutation | Active — window flag escape hatch exists | All cards in Tunet views |
| **G.** `history.pushState` | HA router conflict | Active — FL-012 unfixed | 3 unspecified cards |
| **H.** Rooms propagation fragility | Event bubbling contract | Active — FRAGILE label in docs | rooms card |
| **I.** `visibility:hidden` grid space | CSS Grid layout contract | Intentional — must be preserved | status card |
| **J.** `--spring` undefined | Implicit token contract | Active — CD2 decision pending | sonos, speaker_grid |
| **K.** `allow_wrap: false` default | Container width conflict | Fixed in CD4 | scenes card |
| **L.** O(rooms×lights×AL) scan | Performance — every hass update | Active — deferred | rooms card |
| **M.** CSS var shadow cascade | Implicit profile inheritance | Active — architecture relies on it | all profile-consuming cards |
| **N.** `injectFonts` argument ignored | Silent scoping failure | Active — dead argument | light_tile |

---

## CC4 — INTERACTIVE_SURFACE migration risks

I need to flag a terminology gap before answering: my corpus tracks **CD tranches** (CD0–CD12, the Consistency Driver program), not "CC tranches." There is no "CC4" in any of my 56 observations. The INTERACTIVE_SURFACE export itself was documented as a **CD2 base task that had not yet been implemented** as of the corpus cutoff (2026-04-05).

That said, the corpus does contain substantive information about per-card hover/press/focus divergences and the token mismatch risks. Here is what I can answer from that material:

---

## Cards with Known Local Divergences from the INTERACTIVE_SURFACE Shape

### `tunet_speaker_grid_card.js`
**Divergences (two):**
1. Hover uses `translateY(-1px)` — non-standard. The INTERACTIVE_SURFACE/TILE_SURFACE pattern uses shadow-lift only, not vertical translate. The CD2 plan explicitly states this must be removed in favor of shadow-lift.
2. Uses `--accent` and `--spring` CSS variables that are **undefined in tunet_base.js TOKENS** — the focus ring is likely invisible and the spring transition falls back to `initial`.

**Behavior change or refactor?**
- Removing `translateY(-1px)` is a **behavior change** — a subtle but visible upward nudge on hover disappears.
- Replacing `--spring` with `var(--ease-emphasized)` (the proposed resolution) is a **behavior change** if the spring physics curve differs materially from ease-emphasized. The corpus flags this as a decision point, not a settled resolution.
- Token mismatches: `--accent` is card-local; if `INTERACTIVE_SURFACE` uses `--focus-ring-color` from TOKENS and the card was using `--accent` as its focus color, the focus ring color changes.

> *Sources: "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "cards_reference.md Expanded" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

### `tunet_sonos_card.js`
**Divergences (two):**
1. Uses `--spring` variable (undefined in TOKENS) — falls back to `initial`, meaning the transition is effectively disabled.
2. Hardcoded `.90` press scale — not `var(--press-scale)`.

**Behavior change or refactor?**
- Replacing hardcoded `.90` with `var(--press-scale)`: if `--press-scale` resolves to a different value (the corpus does not state the resolved value of `--press-scale`, only that it exists in TOKENS), this is a **behavior change**. The press depth changes visually.
- Resolving `--spring` → `var(--ease-emphasized)` or adding `--spring` to TOKENS: **behavior change** if the timing function changes.
- Token mismatch: `.90` vs whatever `--press-scale` resolves to — the corpus confirms this diverges but does not give the TOKENS value for `--press-scale`.

> *Sources: "cards_reference.md Expanded" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

### `tunet_climate_card.js`
**Divergence:**
Drag thumb uses hardcoded `scale(1.08)` instead of `var(--drag-scale)`.

**Behavior change or refactor?**
The CD2 plan explicitly acknowledges this is a **potential behavior change**: *"if 1.05 is visually regressive, use card-local `--drag-scale: 1.08` override."* This means the corpus authors anticipated that naively adopting `var(--drag-scale)` would produce a visually smaller thumb lift than the climate card's gold-standard feel. The recommended resolution is to adopt the token but override its value on the climate card's host — meaning `.interactive` class composition would require an accompanying host-level token override to be a pure refactor.

Token mismatch: `--drag-scale` in TOKENS vs `1.08` hardcoded. The resolved value of `--drag-scale` from TOKENS is not stated in the corpus.

> *Sources: "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

### Cards with `transition: all .15s ease` — Six Cards
The corpus explicitly names these cards as using the anti-pattern: **lighting, climate, status, actions, rooms, media, weather, sensor**.

**Behavior change or refactor?**
Replacing `transition: all` with an explicit multi-property transition list is **architecturally a refactor** but has a **practical behavior risk**: `transition: all` animates *every* animating property, including ones the author did not consciously decide to animate (e.g., color changes from state updates, width changes from content reflow). Switching to explicit properties may reveal or suppress transitions on properties that were accidentally animated before. This is surfaced in the cross-card interaction vocabulary as an anti-pattern to migrate, not as a known-safe no-op.

> *Sources: "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03)*

---

### `tunet_sensor_card.js`
**Special case — intentional exemption:**
`.sensor-row[data-interaction="none"]:hover` is explicitly marked **PRESERVE** in the CD2 plan. This selector disables hover on non-interactive sensor rows. If `.interactive` class composition applied hover styles unconditionally, adopting it on `.sensor-row` elements would **re-enable hover on non-interactive rows** — a behavior regression. The card must either conditionally apply `.interactive` only to interactive rows, or the `.interactive` class needs a mechanism to be suppressed per-element.

> *Source: "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

### `tunet_media_card.js`, `tunet_sonos_card.js`, `tunet_weather_card.js`
**Focus-visible gap:**
The corpus explicitly identifies these three cards as having **zero focus-visible styling** — described as "critical accessibility debt." Adopting `.interactive` would add focus rings where none existed before. This is **additive and not a regression**, but it is a visible change for keyboard/AT users and constitutes a behavior difference from the prior state.

> *Source: "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03)*

---

### Cards Already Correct — Marked KEEP

| Card | Elements | Status |
|---|---|---|
| `tunet_lighting_card.js` | `.l-tile` (lines 435–440) | Hover already guarded; `:active` already uses `var(--press-scale-strong)` — KEEP |
| `tunet_light_tile.js` | `.tile` (lines 78–82, 85–87) | Hover already guarded; transition already multi-property — KEEP |
| `tunet_scenes_card.js` | Line 178 transition | Already uses correct multi-property token pattern — KEEP |
| `tunet_nav_card.js` | All elements | Designated reference implementation for CD2 target state — no changes needed |

For these four, adopting `.interactive` would be a **pure refactor** (or no-op if they already match the shape exactly), with the caveat that the INTERACTIVE_SURFACE spec was not yet finalized as of corpus cutoff.

> *Sources: "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "cards_reference.md: All 13 Cards Fully Documented" (2026-04-03)*

---

## Consolidated Risk Summary

| Card | Change Type | Primary Risk |
|---|---|---|
| `speaker_grid` | Behavior change | `translateY(-1px)` removal visible; `--spring`/`--accent` token substitution |
| `sonos` | Behavior change | Hardcoded `.90` scale vs token value; `--spring` resolution |
| `climate` | Behavior change unless overridden | `scale(1.08)` → `var(--drag-scale)` — requires host-level token override to preserve feel |
| `media`, `sonos`, `weather` | Additive change | Focus rings appear for first time |
| `sensor` | Regression risk | Must not apply `.interactive` to `[data-interaction="none"]` rows |
| `lighting, climate, status, actions, rooms, media, weather, sensor` | Practical refactor risk | `transition: all` removal may expose or suppress accidental property animations |
| `lighting`, `light_tile`, `scenes`, `nav` | Pure refactor / no-op | Already match target shape |

---

**One meta-limitation to note:** since INTERACTIVE_SURFACE had not been built as of the corpus cutoff, the exact resolved values of `--press-scale` and `--drag-scale` from TOKENS are not stated anywhere in my observations. The token mismatch risks above are structural conclusions — the specific magnitude of the visual delta cannot be confirmed from this corpus alone.

---

## cross_card_interaction_vocabulary.md v1.0 → v2.0 gaps

Two important caveats before diving in:

1. **"CC4" does not appear in this corpus.** The rehabilitation program uses `CD0–CD12` (Consistency Driver tranches). I have no observations about a "CC" phase series. I'll answer about what would block a **v1.0 → v2.0 promotion of `cross_card_interaction_vocabulary.md`** based on what the corpus documents — but I cannot speak to CC4 specifically.

2. **I am working from second-order observations** — observations that *describe* the document rather than the document itself. There may be inline TODOs in the file that weren't surfaced in any observation. I'll be explicit about confidence level per item.

---

## Pre-Creation Gap Audit vs. Post-Creation Coverage

The "Design Documentation Audit" observation (2026-04-03) was written *before or concurrent with* the document's creation and identified items as **COMPLETELY MISSING**. The "cross_card_interaction_vocabulary.md Created and Refined" observation (2026-04-03) then describes what the creation pass covered. Comparing these two is the most reliable way to identify residual gaps.

---

## §1 — Hover

**What the created doc covers:**
Shadow lift as the hover state mechanism. The hover `@media (hover: hover)` guard is defined as the required pattern.

**Confirmed gaps:**

- **Hover color values are not confirmed added.** The pre-creation audit explicitly flagged "hover state color values (light + dark)" as COMPLETELY MISSING. The creation observation describes the hover state only as "shadow lift" — no specific hex/rgba values for background tint, border brightening, or icon highlight are confirmed as having been written into the document. If the spec only says "shadow lifts" without specifying *by how much* and *what color changes occur*, it cannot drive consistent implementation across 13 cards.

- **Card container vs. control behavior differentiation is not confirmed resolved.** The pre-creation audit specifically called out "card container vs. control interaction behavior differentiation (does the card background lift on hover? different from slider hover?)" as missing. The creation observation does not confirm this was addressed. This is a meaningful gap: a tile hover and a card-background hover are visually distinct in the glassmorphic system, and without explicit rules, card-level hover (e.g., on `tunet-climate-card`'s outer shell) will be inconsistently implemented.

- **11 of 13 cards lack `@media (hover: hover)` guard.** The document *describes* this as non-compliant, but the compliance table is a snapshot from Apr 3, 2026. As CD2 work lands, the table would become stale without a versioning or update policy — blocking promotion to a stable v2.0.

> *Sources: "Design Documentation Audit" (2026-04-03); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03)*

---

## §2 — Active / Press

**What the created doc covers:**
Scale-down values (0.97/0.95), the decision to reserve 1.08x scale-up exclusively for drag/thumb, explicit supersession of tunet-design-system.md v8.3 §6 "pop feedback."

**Confirmed gaps:**

- **The `--spring` variable is unresolved.** `tunet_sonos_card.js` (L252) and `tunet_speaker_grid_card.js` (L162) use `--spring` for their press/transition behavior, but `--spring` is **not defined in TOKENS**. The CD2 planning observation explicitly frames this as "a decision point" — add to TOKENS or replace with `--ease-emphasized` — that was not resolved by the time the vocabulary doc was written. Until `--spring` is either canonized in TOKENS or explicitly deprecated with a migration target, the §2 active state spec has a hole for those two cards.

- **The "press-down 0.95 vs 0.97" split rule is not confirmed fully specified.** The document gives two scale values (0.97 for lighter press, 0.95 for stronger) but the corpus does not confirm the document specifies *which element types* get which value. Without that map (e.g., "chips use 0.97; tiles use 0.97; control buttons use `--press-scale-strong` which resolves to 0.95"), implementers will make inconsistent choices.

- **The `--drag-scale` (1.08x) exception boundary is implicit.** The document says 1.08x is "reserved only for drag/thumb" but the climate card's thumb `scale(1.08)` was specifically noted as needing migration to `var(--drag-scale)` with a possible card-local override if 1.05 is visually regressive. This exception pattern — card-local `--drag-scale` override — is not confirmed as a documented policy in the vocabulary doc.

> *Sources: "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "cards_reference.md Expanded" (2026-04-03)*

---

## §3 — Focus

**What the created doc covers:**
`:focus-visible` outline ring pattern, the token reference approach for focus ring width/color/offset.

**Confirmed gaps:**

- **Focus outline specification values not confirmed written.** The pre-creation audit listed "focus outline specs (:focus-visible, width, color, offset)" as COMPLETELY MISSING. The creation observation says focus-visible is covered as a pattern ("outline ring") but does not confirm the specific values — the exact width token value, the exact color token value, and the exact offset token value — were filled in. The only concrete value mentioned in the corpus for this area is `--focus-ring-width: 2px` (existing in TOKENS, px-valued and explicitly noted as staying px for now per the softened em principle). Whether the doc specifies `--focus-ring-color` and `--focus-ring-offset` with concrete values is not confirmed.

- **`speaker_grid` focus ring is likely invisible — unresolved in spec.** `speaker_grid` uses `--accent` and `--spring` in its focus-visible rule, both of which are undefined in TOKENS. The vocabulary doc flags this as accessibility debt but the corpus does not confirm a resolution path was written into the doc itself. A v2.0 spec should either assign canonical token values or explicitly prescribe a fallback.

- **Three cards with ZERO focus-visible styling are identified but no remediation spec is confirmed written.** `tunet_media_card.js`, `tunet_sonos_card.js`, and `tunet_weather_card.js` have zero focus-visible styling per the compliance table. The doc documents the gap but whether it specifies the *exact CSS to add* to those cards — vs. just flagging them — is not confirmed.

> *Sources: "Design Documentation Audit" (2026-04-03); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

## §4 — Disabled

**What the created doc covers:**
Two-tier disabled model: entity-off opacity 0.55 vs. truly-disabled opacity 0.38. These values are named in the creation observation.

**Confirmed gaps:**

- **The three disabled tokens do not yet exist in tunet_base.js TOKENS.** The CD2 planning observation explicitly lists `--disabled-opacity: 0.55`, `--disabled-surface-opacity: 0.35`, and `--disabled-control-opacity: 0.38` as tokens *to be added*. The vocabulary document specifies these values but the underlying token infrastructure isn't in place. This creates a situation where the spec is written but unverifiable — you can't confirm card compliance against a token that doesn't resolve. A v2.0 promotion should require that the tokens actually exist in base before the spec is considered authoritative.

- **`--disabled-surface-opacity: 0.35` value is not mentioned in the creation observation.** The creation observation only mentions 0.55 and 0.38. The 0.35 value appears in the CD2 planning observation's token list. It's unclear whether 0.35 is documented in the vocabulary doc's §4 or only in the planning file — this is a potential internal inconsistency.

- **No per-component-type disabled behavior spec confirmed.** "Disabled" manifests differently on a tile (dimmed, no interaction), a chip (dimmed, pointer-events none), a slider thumb (hidden or locked), and a dropdown (greyed, no open). The corpus does not confirm §4 specifies behavior per component type beyond the opacity values.

> *Sources: "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

## §5 — Transitions

**What the created doc covers:**
The anti-pattern (`transition: all .15s ease`) is named and condemned. The explicit multi-property transition with named tokens is defined as the required pattern. `tunet_scenes_card.js` (L178), `tunet_nav_card.js`, and `tunet_light_tile.js` are identified as reference implementations.

**Confirmed gaps:**

- **State transition timing map by component type is not confirmed written.** The pre-creation audit explicitly listed "a state transition timing map by component type" as COMPLETELY MISSING. The creation observation does not confirm this was added. Without a map like "tile hover: Fast tier (150ms); chip press: Micro tier (60–100ms); modal enter: Enter tier (250ms cubic-bezier)", each card will continue making independent timing decisions.

- **The 6 named animation tiers are documented in tunet-design-system.md §11 but their mapping to §5 transition patterns is not confirmed integrated.** The design system has Instant/Micro/Fast/Standard/Enter/Exit tiers. Whether the vocabulary doc's §5 cross-references these tiers or simply uses raw ms values is not confirmed — if it uses raw values, the two documents will drift.

- **`transition: all` usage in 8 cards is catalogued but per-property replacement lists are not confirmed in the doc.** The CD2 planning observation provides exact line-level replacement specs per card (this was added to `flickering-herding-wolf.md`, the execution plan — not to `cross_card_interaction_vocabulary.md`). The vocabulary document is meant to be the *contract*; the execution plan is the *implementation guide*. If the per-card property lists only live in the execution plan, the vocabulary doc cannot serve as a standalone compliance reference.

> *Sources: "Design Documentation Audit" (2026-04-03); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03)*

---

## Explicit TODOs / Unresolved Decision Points

These are items the corpus explicitly frames as open decisions rather than confirmed spec:

| Item | Status per corpus | Location |
|---|---|---|
| `--spring` token: add to TOKENS or replace with `--ease-emphasized` | **"Decision required"** — not resolved | CD2 planning obs |
| Em-unit principle: "Prefer em for new geometry" is directional, not mandatory | **Explicitly softened** — not a hard rule | Creation obs |
| Climate card `--drag-scale` override policy | **"If 1.05 is visually regressive, use card-local override"** — conditional, not resolved | CD2 planning obs |
| `INTERACTIVE_SURFACE` export | **"Proposed"** — not yet implemented in tunet_base.js | Multiple obs |
| Compliance table staleness policy | **No update cadence defined** | Creation obs |

---

## Summary: What Would Block v2.0 Promotion

Ranking by severity:

1. **`--spring` unresolved** — two cards have undefined press/transition behavior; spec cannot be authoritative without resolving this token gap
2. **`INTERACTIVE_SURFACE` doesn't exist yet** — the document specifies a primitive it requires, but the primitive isn't in the codebase
3. **Hover color values (light + dark) not confirmed written** — shadow-lift alone is insufficient for a complete hover spec
4. **Disabled tokens not in TOKENS** — spec is unverifiable against non-existent token names
5. **Transition timing map by component type missing** — largest structural gap in §5
6. **Card container vs. control hover differentiation not resolved** — implicit behavior difference with no canonical rule
7. **Compliance table has no update/versioning policy** — will be stale the moment CD2 lands its first card fix

> *All sources: "Design Documentation Audit" (2026-04-03); "cross_card_interaction_vocabulary.md Created and Refined" (2026-04-03); "CD1 Shared Interaction Adoption Plan Expanded" (2026-04-03); "TILE_SURFACE Already Has Correct Interaction Patterns" (2026-04-03); "CTRL_SURFACE and REDUCED_MOTION Already Have Correct Patterns" (2026-04-03); "cards_reference.md Expanded" (2026-04-03)*

---


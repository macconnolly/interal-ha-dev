# Agent 4: Architecture / UX / Feasibility Critic

**Date:** 2026-03-06
**Agent role:** Architecture / UX / Feasibility Critic (Agent 4 of 4)
**Branch:** `claude/dashboard-nav-research-QnOBs`
**HEAD:** `98d961c`
**Plan under review:** `Dashboard/Tunet/Docs/popup-fix.md` (decision-locked 2026-03-06)

**Mandate:** Make sure weak plans do not survive. Precision over encouragement.

---

## A. Architecture Coherence

### A1. Is tap=toggle, hold=popup the right model?

**Verdict: DEFENSIBLE BUT RISKY.**

The plan inverts the current interaction model (tap=navigate/popup, hold=toggle) to tap=toggle, hold=popup. This is the iOS Home app pattern and it works there because:

1. The primary action (toggle lights) is the most frequent gesture
2. Popup provides secondary detail on demand

However, there are problems the plan ignores:

**Discoverability failure.** Hold-to-popup has ZERO visual affordance. Nothing on the room tile tells the user that holding will open a popup. The iOS Home app solves this by making the tile itself an obvious toggle (large, with clear on/off state) and by having hold-to-popup be a well-known iOS convention. In a custom HA dashboard used by household members who have not internalized this convention, the popup feature will be invisible.

**The plan provides no feedback during the 400ms hold window.** When a user presses and holds, they see the `:active` state trigger `scale(0.95)` at press, then nothing for 400ms, then a `scale(0.9)` pulse when the popup fires. There is no progressive visual cue (e.g., radial fill, opacity ramp, haptic at threshold) that communicates "keep holding, something is about to happen." This makes the gesture feel accidental rather than intentional.

**Keyboard accessibility is broken.** The current code maps Enter/Space to the tap handler only (line 488-492 of `tunet_rooms_card.js`). There is no keyboard path to trigger hold_action. Agent 2 identified this (F3 edge case 3) but the plan has no remediation. Hold-based popups are unreachable for keyboard-only users.

**Recommendation:** The gesture model is acceptable as a starting point, but the plan must add:
- Visual feedback during hold (e.g., a ring fill animation starting at ~100ms)
- A keyboard-accessible way to trigger hold_action (Shift+Enter or a visible "..." affordance)
- An explicit decision about whether new household members will realistically discover this gesture

### A2. Is 7-destination nav viable on mobile?

**Verdict: NO AT 320px. MARGINAL AT 375px. NEEDS CONDITIONAL REDUCTION.**

The plan says: "Icons-only condensed dock; horizontal swipe/scroll allowed." Let us check the math.

The current mobile dock is a 3-item grid at 64px height, full width minus 24px padding (12px each side). On a 375px iPhone SE screen, that gives `(375 - 24) / 3 = 117px` per item. Generous.

With 7 items: `(375 - 24) / 7 = 50px` per item. That is exactly the 44px minimum touch target plus 6px gap. Barely viable, and only if labels are removed.

At 320px (smallest supported): `(320 - 24) / 7 = 42px` per item. **Below the 44px touch target. This violates the design language's own touch target minimum.**

The plan acknowledges this risk ("validate at 320px width") but does not provide a concrete solution. Horizontal scroll on a nav bar is hostile UX -- users should not have to scroll to find a room.

**More fundamentally:** 7 destinations is a content model problem, not a layout problem. Home + Media + Living + Kitchen + Dining + Bedroom + Rooms index = 7 items because the plan treats every room as a top-level destination. But if rooms are accessible from a Rooms index page AND from room tile hold-to-popup, then per-room nav items are redundant wayfinding. The user has THREE ways to reach a room page:

1. Nav: tap "Living Room" nav item
2. Rooms page: tap room tile (though this now toggles lights, not navigates)
3. Popup: hold room tile, then tap "Open Room" inside popup

Path 2 is now broken by the tap=toggle change. Path 3 requires two interactions. So the plan relies on path 1 (nav) as the ONLY one-tap route to a room page, which is why it needs 7 destinations.

**This is a circular dependency.** The tap=toggle decision forces nav to carry room routing, which forces 7 items, which breaks at small screens.

**Recommendation:** Either:
- Keep 3-4 nav items (Home, Rooms, Media, maybe Settings) and make the Rooms page the room-routing hub (tap=navigate, hold=popup), OR
- Use 7 items but implement a "more" overflow pattern (show 4-5 visible, rest behind a "..." drawer), OR
- Accept that room pages are reachable only via Rooms index or popup path

The plan cannot ship 7 items on a fixed-width bottom dock at 320px. This must be resolved before NAV-01.

### A3. Is the shared action adapter worth the coupling?

**Verdict: YES, BUT IT IS A TRANCHE OF ITS OWN.**

Agent 3 mapped the duplication precisely:
- 3 cards independently implement `history.pushState` + `location-changed`
- 2 cards independently implement `_handleTapAction` with near-identical switch statements
- 9 cards manually construct `CustomEvent('hass-more-info')` instead of using the existing `fireEvent` from base

The adapter consolidates this and adds `fire-dom-event` support. The coupling risk is low because:
- The adapter is a pure function, not a mixin or base class
- Cards import and call it explicitly
- The `fire-dom-event` case is trivial (6 lines)

**However,** the plan buries the adapter inside INT-01 alongside the interaction contract lock, config schema updates, and per-card interface changes. That is too much scope for one tranche. The adapter should be its own atomic slice: add `executeAction` to base, migrate rooms and status cards, verify. The interaction model swap should be a separate tranche.

### A4. HA 2026.3 footer cards -- does this change nav strategy?

**Verdict: YES. THIS IS THE MOST IMPORTANT FINDING THE PLAN IGNORES.**

Agent 2 discovered that HA 2026.3 (the version currently running on this install -- confirmed HA.05 in plan.md as `2026.3.0b1`) adds native footer card support to Sections view. Footer cards are "sticky at the bottom of the viewport" -- this is EXACTLY what `tunet-nav-card` currently achieves through `position: fixed` + global CSS variable injection into `document.documentElement`.

The current nav architecture has a documented HIGH-severity defect (FL-011): it injects global `hui-view` margin offsets that affect ALL dashboards on the HA instance. The `disconnectedCallback` cleanup is fragile (depends on `window.__tunetNavCardCount` reaching zero).

If the nav card can be deployed as a Sections footer card:
- FL-011 (global offset pollution) is eliminated
- `ensureGlobalOffsetsStyle()` (nav card lines 143-156) is deleted
- `document.documentElement.style.setProperty()` calls (lines 303-308) are deleted
- The `window.__tunetNavCardCount` hack (lines 265-280) is deleted
- The card participates in normal Sections layout flow
- Cross-dashboard side effects drop to zero

**The plan does not mention footer cards at all.** NAV-01 describes expanding the nav to 7 destinations and adding configurable items, but does not investigate the footer card option. This is a major architectural oversight because footer cards could make the mobile dock positioning problem trivially correct.

**Limitation:** Footer cards may not support the desktop side-rail pattern. The card may need a dual-mode approach: footer card for mobile, retained `position: fixed` for desktop. This is worth testing before committing to the current architecture for NAV-01.

**Recommendation:** Add a pre-NAV-01 spike to test `tunet-nav-card` as a Sections footer card on HA 2026.3. If it works for mobile, redesign the mobile positioning around native footer cards and keep `position: fixed` only for the desktop rail. This is a one-hour investigation that could save 10+ hours of offset debugging.

### A5. Two incompatible popup architectures

**Verdict: PICK ONE. THE PLAN SHIPS TWO.**

Agent 2 identified this (Section E1, G2). The plan defines:

**Architecture A (popup-fix.md Sections 5 and 7):** Hidden `custom:popup-card` definitions with `popup_card_id` in the dashboard YAML.

**Architecture B (popup-fix.md room config):** `fire-dom-event` with `browser_mod.service: browser_mod.popup` and `popup_card_id` reference.

**Architecture C (current deployed storage config, lines 174-230):** `tap_action: call-service` with `service: browser_mod.popup` and inline popup content.

These are three different mechanisms. The plan appears to want A+B together (hidden card definition + fire-dom-event trigger referencing it), but this requires:
1. `custom:popup-card` HACS component installed and compatible with Sections
2. Hidden cards not consuming visible layout space in Sections (unverified, plan's own known risk PR #747)
3. Browser Mod correctly interpreting `popup_card_id` from `fire-dom-event` payloads

Architecture C is already deployed and working. It has one downside: popup content is duplicated inline in room configs (~60 lines per room). But it requires zero additional HACS dependencies and zero hidden card definitions.

**Recommendation:** For POP-01 (Living Room POC), use Architecture C (`call-service browser_mod.popup` with inline content) because it is already proven. Move it from `tap_action` to `hold_action`, add `fire-dom-event` support as an option, but use the working mechanism for the first proof. Evaluate the hidden `popup-card` approach in a later tranche only if the inline approach proves unmaintainable at scale.

---

## B. UX Coherence

### B1. With navigate_path removed, only nav reaches room pages. Fallback if nav fails?

**Verdict: SINGLE POINT OF FAILURE.**

The plan removes `navigate_path` from room tile config (8 locations in `tunet-suite-storage-config.yaml`, confirmed at lines 173, 251, 315, 326, 379, 400, 441, 452). After this change:
- Tap on room tile = toggle lights (no navigation)
- Hold on room tile = popup (not a room page, just quick controls)
- Nav bar = only direct path to room pages

If the nav card fails to render (JS error, resource 404, cache issue), room pages become completely unreachable. There is no fallback. The popup's "Open Room" button provides a secondary path, but only if the popup itself works.

**The plan does not acknowledge this.** It states "Nav bar must reliably provide room page access before removing navigate fallback" (Known Risks table), but never specifies a gate condition or acceptance test for this.

**Recommendation:** Keep `navigate_path` as a fallback on the room tile, but move it from tap default to an explicit `tap_action: navigate` config option that is NOT the default. The default tap remains toggle. If a user wants tap-to-navigate, they can configure it. This preserves the escape hatch without changing the default gesture model.

Alternatively, include a visible "Open Room" affordance somewhere on the room tile (a small chevron or icon) that provides a non-gestural navigation path.

### B2. Hold-to-popup feedback on touchscreens

**Verdict: PLAN SPECIFIES NO INTERMEDIATE FEEDBACK.**

Current feedback sequence during hold (from `tunet_rooms_card.js` lines 447-457):
1. `t=0ms`: `:active` CSS state triggers `scale(0.95)` on the tile (line 143)
2. `t=0ms to 400ms`: nothing happens visually
3. `t=400ms`: `scale(0.9)` pulse fires (line 454), popup opens

The 400ms dead zone is a problem. On mobile, users receive no signal that their press is being tracked. They may lift their finger too early (accidental toggle) or too late (confused by the delay). iOS solves this with Haptic Feedback at the threshold moment and a progressive scale/blur animation. The plan specifies neither.

Agent 2's F3 edge case analysis mentions this but the plan does not include remediation. The `scale(0.9)` pulse at 400ms is feedback AFTER the fact, not progressive feedback during the hold.

**Recommendation:** Add at minimum a CSS transition that begins at press-start and reaches a visible threshold at 400ms. For example: `transition: transform 0.4s ease; transform: scale(0.92)` on pointerdown, snapping to `scale(0.88)` on timer fire. This gives the user a continuous visual cue that something is happening.

### B3. Popup content is just a lighting card

**Verdict: CORRECT FOR POC, BUT THE PLAN OVERSELLS IT.**

The popup content for each room is (from popup-fix.md lines 190-222):
- A markdown header ("## Living Room") -- generic HA markdown card
- An All Off button + Open Room button -- generic HA button cards
- A `tunet-lighting-card` in compact mode -- the only Tunet-quality element

This is fine as a quick-control sheet. But the plan calls for "iOS-grade sheet / overlay feeling" and "premium popup surfaces" (nav_popup_ux_direction.md). A markdown header and generic button cards inside a Browser Mod popup are not iOS-grade. The `tunet-lighting-card` in compact mode is the only Tunet-quality element in the popup.

More importantly: where are room-relevant quick actions beyond "All Off"? Where is the temperature? Where is media status? The plan says "quick actions + one primary interaction surface + route to deeper room view" but delivers only one quick action (All Off) and one surface (lighting).

**Recommendation:** For POP-01, accept this as a "lighting quick-control" popup, not a "room popup." Rename accordingly. A true room popup should have 2-3 quick action buttons (All Off, Scene, etc.), a temperature readout, and optionally a media status line. Schedule these enrichments for POP-02 or later.

---

## C. Delivery Feasibility

### C1. 7 tranches before visible progress?

**Verdict: YES. CP-01 AND LAY-01 PRODUCE NOTHING USER-VISIBLE.**

The plan mandates: "No implementation starts until CP-01 and LAY-01 are complete and accepted." The tranche dependency chain:

```
CP-01 (governance docs) --> LAY-01 (layout research) --> LAY-02 (grid policy)
CP-01 --> INT-01 (interaction contract) --> POP-01 (first popup)
                                         --> NAV-01 (nav expansion)
POP-01 --> POP-02 (scale popups)
```

CP-01 is pure documentation. LAY-01 is pure research. Neither produces a user-visible change. The user must wait through two non-visible tranches before anything changes on screen.

For a project that has already produced extensive planning documentation (plan.md at 582 lines, FIX_LEDGER.md at 917 lines, nav_popup_ux_direction.md, agent_driver_pack.md, TRANCHE_TEMPLATE.md, DEPLOYMENT_RESOURCES.md, two prior agent reviews, and now this plan itself), adding two more documentation-only tranches before any code ships is a bureaucratic trap.

**Recommendation:** CP-01 is already substantially done. The control docs, precedence rules, tranche template, and Change ID scheme exist. Declare CP-01 complete based on existing documentation, with the understanding that the DoR/DoD gates apply to all subsequent tranches.

LAY-01 should be merged into the first implementation tranche. The layout research can be done AS PART of implementing the first popup or nav change, not as a preceding academic exercise. The first working popup IS the layout prototype.

### C2. Can INT-01 and POP-01 merge?

**Verdict: PARTIALLY. THE ADAPTER SHOULD SEPARATE, BUT HOLD_ACTION AND POPUP CAN MERGE.**

INT-01 as defined includes:
1. Interaction contract documentation (already substantially done in popup-fix.md interaction matrix)
2. Shared action adapter (`executeAction` in base)
3. Config schema updates for `hold_action`, `fire-dom-event`
4. Nav card configurable items

Items 1 and 4 are different scopes than items 2 and 3. The nav card expansion is a large piece of work that does not need to block the popup POC.

Items 2 and 3 ARE the popup POC prerequisites. You cannot ship a hold-to-popup without `hold_action` support and `fire-dom-event` handling (though as noted in A5, `fire-dom-event` is not even needed since `call-service` already works). So these should merge into POP-01.

**Recommended split:**
- **Tranche A (adapter + hold_action):** Add `executeAction` to base, add `fire-dom-event` case to rooms card `_handleTapAction`, add `hold_action` config reading. 1-2 files, minimal risk.
- **Tranche B (popup POC):** Swap tap/hold behavior, add hold_action config to Living Room, verify popup opens. 1-2 files.
- **Tranche C (nav expansion):** Separate tranche, no dependency on popup.

Or combine A and B into a single POP-01 tranche since they are small enough together.

### C3. Is LAY-02 needed?

**Verdict: NO. AGENT 3 PROVED IT IS A NON-ISSUE.**

Agent 3's comprehensive `getGridOptions` audit (Section A1) shows:
- 10 of 12 cards use `max_columns: 12`, which is the Sections grid maximum and functionally uncapped
- No card has a restrictive `max_columns` cap that would prevent Sections from sizing it
- The only anomaly is `columns: 'full'` (string) on the nav card, which may be non-standard API
- `max_columns: 12` does NOT "force full width" -- it means "I CAN span up to 12 columns"; the `columns` default determines the actual default span

The plan's LAY-02 ("Card grid policy normalization") was designed to "unify custom card layout mechanics around Sections-native responsiveness." Agent 3 found there is nothing to unify. The cards are already consistent. The `max_columns: 12` pattern is the expected default.

The one real issue -- `grid-auto-rows: 124px` in the lighting card (line 332) -- is a card-internal concern, not a `getGridOptions` policy problem. It can be fixed as a one-line change in any tranche that touches the lighting card.

**Recommendation:** Eliminate LAY-02. Record the `columns: 'full'` anomaly (nav card line 252) and the lighting card fixed row height (line 332) as backlog items, not as a tranche.

### C4. Minimum viable path to ONE working popup

**Verdict: 3 CHANGES, NOT 7 TRANCHES.**

The minimum path to a working Living Room popup that matches the plan's interaction model:

1. **In `tunet_rooms_card.js` (4 surgical edits):**
   - Line 340: Add `hold_action: room.hold_action || null` to `setConfig`
   - Lines 450-456: Swap the pressTimer callback to check `hold_action` before falling back to toggle
   - Lines 459-474: Change tap handler to default to toggle instead of navigate
   - After line 561: Add `fire-dom-event` case to `_handleTapAction` (6 lines)

2. **In `tunet-suite-storage-config.yaml` (Living Room overview, lines 170-230):**
   - Move the existing `tap_action: { action: call-service, service: browser_mod.popup, ... }` block to `hold_action`
   - Remove `navigate_path`
   - Default tap becomes toggle (no config change needed since toggle is the new default)

3. **Deploy and test:**
   - Copy updated JS to `/config/www/tunet/v2_next/`
   - Bump `?v=` on the rooms card resource
   - Hard refresh
   - Verify: tap toggles lights, hold opens popup, popup controls work

That is ONE tranche touching TWO files. No governance tranche. No layout research tranche. No grid policy tranche. No interaction contract documentation tranche.

**Critical insight:** The current `call-service browser_mod.popup` mechanism ALREADY WORKS (confirmed in storage config lines 174-230). The popup already opens via tap. The ONLY behavioral change is moving it from tap to hold. This simplifies even further:

1. Add `hold_action` config reading to setConfig
2. Swap the timer callback to check `hold_action`
3. Move the existing config from `tap_action` to `hold_action`
4. Done -- no `fire-dom-event` needed for the POC

No `fire-dom-event` support needed for the POC. No hidden `popup-card` definitions needed. No new HACS dependencies. The plan over-engineers the popup trigger mechanism when the existing one already works.

---

## D. Tranche Critique

### D1. Recommended reordering and elimination

| Original | Verdict | Rationale |
|---|---|---|
| CP-01 (Control-plane reset) | **DECLARE DONE** | The governance infrastructure already exists. plan.md (582 lines), FIX_LEDGER.md (917 lines), TRANCHE_TEMPLATE.md, and Change ID scheme are present. Adding more governance docs before shipping code is bureaucratic drift. |
| LAY-01 (Sections layout research) | **ELIMINATE** | Merge the research into the first implementation tranche. The working popup or nav change IS the prototype that validates layout behavior. |
| LAY-02 (Card grid policy normalization) | **ELIMINATE** | Agent 3 proved there is no policy to normalize. `max_columns: 12` is already consistent across all cards. File the `columns: 'full'` anomaly as a backlog bug, not a tranche. |
| INT-01 (Interaction contract unification) | **SPLIT AND SHRINK** | The shared adapter and `hold_action` support are popup prerequisites -- merge them into POP-01. The nav expansion is a separate scope -- defer to NAV-01. The documentation updates are already substantially done. |
| POP-01 (Living Room popup POC) | **SHIP FIRST** | This is the minimum viable deliverable that produces user-visible progress. Merge the essential INT-01 prerequisites (hold_action, fire-dom-event or keep call-service) into this tranche. |
| NAV-01 (Nav expansion) | **DEFER AND DESCOPE** | 7-destination nav is not validated at 320px. Investigate HA 2026.3 footer card first. Keep the 3-item nav as-is until the footer card question is resolved and the 7-item layout is proven at small screens. |
| POP-02 (Popup scale-out) | **KEEP, BUT AFTER NAV SPIKE** | Applying the popup pattern to remaining rooms is low-risk once POP-01 validates the approach. |

### D2. Recommended execution order

1. **SPIKE-01: Footer card investigation** (1 hour)
   - Test whether `tunet-nav-card` works as a Sections footer card in HA 2026.3
   - Result determines whether NAV-01 needs `position: fixed` or can use native positioning
   - No code changes committed

2. **POP-01: Living Room popup POC** (merged with essential INT-01 pieces, half day)
   - Add `hold_action` to rooms card `setConfig` (line 340)
   - Add `fire-dom-event` to `_handleTapAction` (after line 561, 6 lines)
   - Swap tap/hold behavior in rooms card (lines 450-474)
   - Move Living Room popup config from `tap_action` to `hold_action` in storage YAML
   - Optional: add visual hold feedback (CSS animation during 400ms window)
   - Files: `tunet_rooms_card.js`, `tunet-suite-storage-config.yaml`
   - Verify: tap toggles, hold opens popup, popup controls work

3. **POP-02: Popup scale-out** (2-3 hours)
   - Apply popup pattern to Kitchen, Dining, Bedroom
   - Template the config to reduce per-room duplication

4. **NAV-01: Nav architecture decision** (1 day)
   - If SPIKE-01 succeeds: implement footer card for mobile, keep fixed-position for desktop
   - If SPIKE-01 fails: scope-limit to fixing FL-011 (route-aware offsets) and keeping 3-4 items
   - Defer 7-destination expansion until validated at 320px with a working prototype

Total: approximately 2 days of implementation work. Not 7 tranches of governance, research, policy, and documentation.

---

## E. Sections-Native Reality Check

### Are the "hard-scrutiny" cards actually Sections-native?

| Card | Claim | Reality |
|---|---|---|
| `tunet-nav-card` | Plan calls it "chrome" | **NOT Sections-native.** Uses `position: fixed` (line 38), injects global CSS variables on `document.documentElement` (lines 303-308), adds a `<style>` to `document.head` targeting `hui-view` (lines 143-156). Renders entirely outside the Sections grid. The Sections placeholder it occupies is a dead-weight invisible box. Agent 2's A10 finding (footer cards) could fix this. |
| `tunet-rooms-card` | Plan assumes it participates in Sections | **Partially native.** `getGridOptions` is correct (lines 389-395). But the card uses `aspect-ratio: 1` on tiles (line 103), which creates fixed heights per tile. The Sections grid can resize the card's column span but the card's internal height is driven by tile count and fixed aspect ratio. This is acceptable -- card-internal layout does not need to be Sections-controlled. |
| `tunet-lighting-card` | Plan says LAY-02 will normalize it | **Partially native.** `grid-auto-rows: var(--grid-row, 124px)` (line 332) hard-codes tile row height at 124px. This is not a Sections concern (Sections does not control card-internal grids), but it does mean the card's height is fixed-per-row rather than content-intrinsic. Agent 3 correctly identified this. |
| `tunet-status-card` | Plan treats it as fully native | **Yes, fully native.** Uses `grid-auto-rows: auto`, correct `getGridOptions`, intrinsic height. |
| `tunet-climate-card` | Gold standard | **Yes, fully native.** `columns: 6, min_columns: 3`. Allows half-width layouts. |
| `tunet-weather-card` | Companion card | **Yes, fully native.** `columns: 6, min_columns: 3`. |

**Bottom line:** The nav card is the only card with a genuine Sections-compliance problem, and that problem has a potential native solution (HA 2026.3 footer cards) that the plan does not investigate.

---

## F. Risk Assessment

### F1. PR #747 (hidden popup-card in Sections)

**Risk level: MEDIUM-HIGH, but avoidable.**

The plan's Architecture A uses hidden `custom:popup-card` definitions in the dashboard. If these cards consume visible layout space in Sections (PR #747), the dashboard will have unexplained gaps.

**This risk is entirely avoidable** by using Architecture C (`call-service browser_mod.popup` with inline content), which requires no hidden card definitions. The plan introduces this risk unnecessarily by choosing a more complex popup mechanism when a simpler proven one exists.

### F2. Browser Mod 2.8.0 compat

**Risk level: LOW-MEDIUM.**

Browser Mod v2.8.2 was released the same day the plan was locked (2026-03-06). The current storage config already uses `browser_mod.popup` successfully (confirmed at lines 176, 254, 403). The risk is that a future HA 2026.3 stable release or Browser Mod update breaks the popup service.

**Mitigation:** The `call-service` mechanism (Architecture C) is more resilient than `fire-dom-event` because `call-service` goes through HA's service call infrastructure rather than custom events. If Browser Mod changes its event listening, `call-service` still works.

### F3. 7-item nav on 320px

**Risk level: HIGH. See section A2.**

At 320px viewport width, 7 nav items in the current dock layout yield `(320 - 24) / 7 = 42px` per item, below the design language's 44px minimum touch target. The plan's mitigation ("horizontal scroll") is hostile UX for a primary navigation surface.

This is not a minor layout issue. It is a fundamental content-model problem: 7 top-level destinations is too many for a bottom dock on small phones. The plan must either reduce destinations or implement a robust overflow pattern before NAV-01 ships.

### F4. Interaction model inversion and user re-learning

**Risk level: MEDIUM.**

Current users (even if just the builder) have learned: tap=navigate/popup, hold=toggle. The plan inverts this to tap=toggle, hold=popup. During migration, muscle memory will cause accidental toggles when trying to navigate and accidental holds when trying to toggle.

**Mitigation:** Ship the change on the storage evaluation surface first. Test for a few days of real use before porting to the YAML architecture surface.

### F5. Orphaned navigate_path removal

**Risk level: MEDIUM-HIGH.**

The plan removes `navigate_path` from room configs (8 locations in the storage config). After removal, the ONLY one-tap path to a room page is the nav bar. If the nav bar breaks or is not yet expanded to include room pages, room pages become unreachable except through direct URL entry.

---

## G. NEW DISCOVERIES

### G1. The plan's `custom:popup-card` YAML is structurally wrong for Sections

The popup-fix.md Sections 5 and 7 define hidden popup-card YAML as top-level cards:
```yaml
- type: custom:popup-card
  popup_card_id: living-room-popup
  popup_card_all_views: true
  card:
    type: custom:tunet-lighting-card
    ...
```

In a Sections dashboard, every card in a `cards:` array under a section consumes grid space. There is no "hidden" card concept in native Sections. If `custom:popup-card` does not render to zero height and zero width, it will create a visible gap in the layout. The plan's Known Risks section mentions PR #747 but has no tested solution. This is not a "risk to monitor" -- it is a structural incompatibility until proven otherwise.

### G2. The current `call-service` popup mechanism is ALREADY a working hold_action path

The plan treats `fire-dom-event` as a prerequisite for popups. It is not. The current `_handleTapAction` already supports `call-service` (rooms card lines 556-561), and the current popup configs already use `call-service: browser_mod.popup` (storage config lines 174-230). The ONLY code change needed for a working popup POC is:

1. Add `hold_action` config reading to `setConfig` (1 line at line 340)
2. Swap the press timer to check `hold_action` before falling back to toggle (5 lines at lines 450-456)
3. Change tap default to toggle (remove navigate_path fallback at lines 459-474)
4. Move the existing `call-service` config from `tap_action` to `hold_action` in YAML

No `fire-dom-event` support needed. No hidden `popup-card` definitions needed. No new HACS dependencies.

### G3. Nav card `columns: 'full'` may be invalid HA API

Agent 3 flagged this (F1). The `getGridOptions()` API expects `columns` to be a number (or undefined). The string `'full'` at line 252 of `tunet_nav_card.js` is documented in some HA changelog notes but may not be universally supported. The nav card should be tested to confirm that `columns: 'full'` does not cause the Sections grid to assign it zero width or default width.

### G4. Plan has no cache-bust or deployment step for JS changes

The plan specifies code changes to `tunet_rooms_card.js` and potentially `tunet_base.js`, but the tranche definitions in popup-fix.md do not include explicit deployment steps (copy to HA, bump `?v=`, hard refresh). The DEPLOYMENT_RESOURCES.md and plan.md Phase 0 both document this procedure, but the popup-fix.md tranches omit it. Every tranche that touches JS must include deployment as a validation prerequisite.

### G5. `CONTROL_DOC_CONFLICTS` between popup-fix.md and plan.md

`plan.md` Section "Near-Term Tranche Sequence" specifies: `T-005 Nav, T-006 Popup, T-007 UI/UX Shell, T-008 Home Layout`.

`popup-fix.md` specifies: `CP-01, LAY-01, LAY-02, INT-01, POP-01, NAV-01, POP-02`.

These are incompatible orderings. plan.md puts Nav before Popup. popup-fix.md puts Popup (POP-01) before Nav (NAV-01). Additionally, popup-fix.md introduces three new tranches (CP-01, LAY-01, LAY-02) that do not exist in plan.md's sequence.

By the control doc precedence rules (plan.md Section "Control Document Precedence"), plan.md outranks popup-fix.md. This means popup-fix.md's tranche ordering is technically invalid unless plan.md is updated to match.

### G6. Lighting card color_temp deprecation is real and unaddressed

Agent 2 discovered HA 2026.3 removes `color_temp`, `kelvin`, `min_mireds`, `max_mireds` light entity attributes (Agent 2 finding A9, G3). The lighting card header (line 4) references color temperature support. This is outside the popup/nav plan scope but is a ticking time bomb for the next HA stable release. It should be tracked as a HIGH-severity backlog item in FIX_LEDGER.md.

### G7. Nav card is duplicated 7 times in storage config

Agent 3 found this (F7). The `tunet-nav-card` config block is copy-pasted identically into 7 views in the storage config (overview, rooms, media, 4 subviews -- lines 350-360, 464-474, etc.). The nav expansion from 3 to 7 destinations requires updating ALL 7 copies. This is a maintenance burden that argues for either:
- YAML anchors (not available in storage dashboards)
- A simpler nav item schema so the duplication is minimal
- Footer card placement (which may only need to be declared once per dashboard)

### G8. Rooms card `_handleTapAction` already supports 4 of 5 needed action types

The existing `_handleTapAction` (lines 524-571) supports: `more-info`, `navigate`, `url`, `call-service`. The only missing type is `fire-dom-event`. Since `call-service` already works for Browser Mod popups, the `fire-dom-event` addition is an enhancement, not a prerequisite. The POC can ship without it.

---

## H. Final Verdict

### What the plan gets right

1. The interaction contract (tap=toggle, hold=popup) is a defensible model for a home dashboard
2. Browser Mod popup is the right platform choice over Bubble/hash
3. One popup per room is the correct content model
4. The shared action adapter eliminates real code duplication (3 cards, 2 near-identical switch statements)
5. The plan recognizes that governance and interaction contracts should precede broad implementation

### What must change before implementation

| # | Issue | Severity | Required Change |
|---|---|---|---|
| 1 | **Two incompatible popup architectures** | BLOCKING | Pick one. Use `call-service browser_mod.popup` (already working) for POP-01. Defer `popup-card`/`fire-dom-event` evaluation to a later tranche. |
| 2 | **HA 2026.3 footer cards ignored** | HIGH | Add a pre-NAV-01 spike to test nav card as a Sections footer card. This could eliminate FL-011 entirely. |
| 3 | **7-item nav breaks at 320px** | HIGH | Reduce to 3-4 items or design a validated overflow pattern before NAV-01 ships. |
| 4 | **3 phantom tranches** | HIGH | Eliminate CP-01 (declare done), LAY-01, and LAY-02. They produce no user-visible progress and the work is either already done or unnecessary. |
| 5 | **No hold-feedback during 400ms** | MEDIUM | Add progressive visual feedback (scale animation or ring fill) during hold gesture. |
| 6 | **Keyboard accessibility for hold_action** | MEDIUM | Add a keyboard path to trigger hold_action (Shift+Enter or visible affordance). |
| 7 | **navigate_path removal creates single point of failure** | MEDIUM | Keep navigate_path as an optional fallback, or add a visible navigation affordance on room tiles. |
| 8 | **CONTROL_DOC_CONFLICTS** | MEDIUM | Reconcile popup-fix.md tranche ordering with plan.md's Near-Term Tranche Sequence. plan.md says Nav first; popup-fix.md says Popup first. |

### Minimum viable subset

Ship these and only these, in this order:

1. **SPIKE-01** (1 hour): Test nav card as Sections footer card on HA 2026.3
2. **POP-01** (half day): Add `hold_action` to rooms card, swap tap/hold, move Living Room popup config from `tap_action` to `hold_action`, keep `call-service` mechanism. Two files: `tunet_rooms_card.js` and `tunet-suite-storage-config.yaml`.
3. **POP-02** (2-3 hours): Apply popup pattern to Kitchen, Dining, Bedroom.
4. **NAV-01** (1 day): Based on SPIKE-01 results, either implement footer card or fix FL-011 route-scoping. Keep 3-4 nav items until 7-item layout is validated at 320px.

Total: approximately 2 days of implementation work. Not 7 tranches of governance, research, policy, and documentation.

### What must NOT ship

- Hidden `custom:popup-card` definitions (unverified Sections compatibility, PR #747 risk)
- 7-item nav without validated 320px touch-target behavior
- Any documentation-only tranche that gates code delivery
- `navigate_path` removal without a verified fallback path to room pages
- The `fire-dom-event` mechanism as the ONLY popup trigger (keep `call-service` as proven fallback)

---

*This critique is intentionally adversarial. The plan's interaction model and technology choices are fundamentally sound. The plan's failure mode is over-engineering the delivery sequence and introducing unnecessary complexity in the popup trigger mechanism when simpler proven alternatives exist. Two days of focused code work will accomplish more than seven tranches of planning.*

---

## Attack Review of Agent 1 Drafts

**Date:** 2026-03-06
**Reviewing:** `agent1_master_ledger.md` (554 lines), `agent1_execution_plan.md` (463 lines), `agent1_decision_register.md` (233 lines)
**Reviewer:** Agent 4 (Architecture / UX / Feasibility Critic)
**Mandate:** Find weaknesses, missing items, incorrect priorities, overscoped tranches, hidden assumptions, and logical gaps.

---

### A. LEDGER QUALITY

#### A.1 Vague Items and Missing Specificity

**FL-014 (Media Card Speaker Cache):** No line numbers for the cache mechanism, no exact line for `_cachedSpeakers`, no code-level remediation steps. A coding agent would need to re-discover the location. Compare to FL-030, which has exact line numbers and change instructions. **MUST FIX:** Add file:line references and exact change description.

**FL-017 (Entity Inventory Drift):** Says "Three YAMLs with inconsistent entity references" but does not list which entities are inconsistent, or which YAML is canonical. A coding agent cannot act on "inconsistent entity references" without knowing WHICH references are wrong. **MUST FIX:** Either enumerate the specific drifted entities or downgrade to a documentation audit task with a clear deliverable.

**FL-018 (Config Editor Schema/Reality Gap):** "All V2 cards with `getConfigForm()`" is too broad. Agent 3 already mapped every card's config editor at A6. The ledger should reference Agent 3's table and specify which cards have broken fields vs which are already correct (e.g., climate, weather, light-tile are fine). **SHOULD FIX:** Narrow to the 3-4 cards with actual broken schema fields (rooms `object` selector, nav `subview_paths` as `object`, status missing `tiles`, lighting missing `zones`).

**FL-019 (Bug 4 Live Verification):** This is a task definition, not a defect. It has no current state, no intended state, and no code change. It belongs in a validation checklist, not in the fix ledger as a numbered item. **SHOULD FIX:** Reclassify as a validation task within POP-01 or NAV-01, not a standalone ledger entry.

**FL-020 (Storage Dashboard `sensor.aqi` References):** "Search and remove" is the remediation, but there are no file or line references for where these references exist in storage dashboards. Since storage dashboards are in the HA database, not in files, this needs "HA UI raw editor" as the tool, not file paths. **MINOR:** Adequate for a live-HA task, but should note the tool.

#### A.2 Severity Assessments

**FL-031 (Missing `fire-dom-event`) rated MEDIUM:** The ledger correctly notes this is "NOT required for POP-01 if `call-service` mechanism is used." This is correct. No change needed.

**FL-036 (Browser Mod `size` vs `initial_style`) rated LOW-MEDIUM:** I verified the storage config. Lines 179, 257, and 406 all use `size:`. Agent 2 A6 confirms Browser Mod 2.8.2 supports `initial_style`. However, this is a FORWARD-COMPAT concern, not a current breakage. LOW-MEDIUM is appropriate. No change needed.

**FL-037 (`navigate_path` Removal Creates SPOF) rated MEDIUM-HIGH:** This should be HIGH. After the tap/hold inversion (FL-032), tapping no longer navigates. If `navigate_path` is removed AND the nav card fails to render, room pages are unreachable. The only remaining paths are: (1) popup "Open Room" button (requires hold gesture + popup), (2) Rooms index page (requires nav to that page), (3) direct URL. For a household dashboard used by non-technical members, this is a significant resilience gap. **SHOULD FIX:** Upgrade to HIGH.

**FL-045 (User-Reported Bugs) rated LOW:** Reserving FL-045 through FL-055 for 11 uncaptured bugs is a hollow placeholder. The ledger claims "11 bugs were mentioned" but captures zero symptom descriptions, zero file references, and zero severity assessments. A ledger that cannot be implemented from is not a ledger -- it is a TODO comment. **MUST FIX:** Either (a) capture each bug with at minimum a one-sentence symptom description, or (b) explicitly state these are unlogged and will be captured in a separate session, with a clear owner and timeline. The current single-entry placeholder obscures the actual scope of known issues.

#### A.3 Duplicates and Merges

**FL-030 and FL-032 are tightly coupled.** FL-030 adds `hold_action` config reading. FL-032 swaps the tap/hold behavior. These cannot ship independently despite the ledger claiming "Can Ship Independently: Yes" on FL-030. Adding `hold_action` to `setConfig` without swapping the interaction model means the 400ms timer still calls `_toggleRoomGroup()` -- the `hold_action` field is read but never consumed. **MUST FIX:** Either (a) merge FL-030 and FL-032 into a single entry, or (b) correct FL-030 to note it is only independently shippable as a no-op config read (the `hold_action` check in the timer callback IS FL-032, not FL-030).

Wait -- rereading FL-030 more carefully: it says "Lines 450-456: Replace timer callback to check `hold_action` before toggle." That IS the timer callback change. And FL-032 says "Lines 459-474: Change `onPointerUp` to default to `_toggleRoomGroup()`". So the split is: FL-030 = hold path changes, FL-032 = tap path changes. This is a defensible split. But the "Can Ship Independently" claim on FL-032 says it depends on FL-030. The reverse dependency is not stated on FL-030 -- FL-030 CAN ship independently (hold checks hold_action, falls back to toggle). **Revised assessment:** The split is acceptable, but FL-030's "Exact Change" item 3 ("Lines 459-474: Change tap default from navigate to toggle") OVERLAPS with FL-032. This creates confusion about which item owns the tap path change. **SHOULD FIX:** Clarify that FL-030 owns only the hold path (setConfig + timer callback), and FL-032 owns only the tap path (onPointerUp default change). Remove item 3 from FL-030.

#### A.4 Stale Finding Reconciliation

The stale finding reconciliation table (Section: Preamble) is thorough. The `escapeHtml` finding correctly identified as stale/aspirational (memory claims it exists, grep shows it does not). FL-009, FL-010, FL-025, FL-026 correctly closed with evidence. **No issues found.**

#### A.5 User-Reported Bug Capture

The 11 user-reported bugs are NOT properly captured. As noted in A.2 above, a single placeholder entry FL-045 with "To Be Cataloged" and no symptom data is inadequate. The ledger claims to reserve FL-045-055 but provides zero content for items FL-046 through FL-055. These items do not appear in the ledger at all -- they are referenced only in a note. **MUST FIX:** See A.2 recommendation.

#### A.6 Independent Actionability

Most items are actionable by a coding agent. Exceptions:

- **FL-019:** Not actionable (it is a test plan, not a code change).
- **FL-021, FL-023, FL-024:** Correctly marked as decisions, not code. Acceptable.
- **FL-027:** Correctly marked as investigation. Actionable as a spike.
- **FL-045:** Not actionable (no content).

---

### B. EXECUTION PLAN QUALITY

#### B.1 SPIKE-01 -> POP-01 -> POP-02 -> NAV-01 Delivery Speed

This sequence is correct and delivers the FASTEST path to user-visible change among all reasonable orderings. SPIKE-01 is a 1-hour non-destructive investigation. POP-01 is the first visible deliverable. This is a significant improvement over the 7-tranche popup-fix.md plan that my original critique attacked.

**One concern:** The plan estimates POP-01 at "half day." Given that POP-01 requires 4 surgical JS edits and 1 YAML config change, with the existing `call-service` mechanism proven to work, "half day" is generous. A focused coding agent should complete POP-01 in 2-3 hours. The half-day estimate includes deployment and testing, which is prudent. **No change needed.**

#### B.2 Independent Shippability

- **SPIKE-01:** Independently shippable (no code committed). Correct.
- **POP-01:** Independently shippable. The JS changes are backward-compatible: rooms without `hold_action` configured still default to `_toggleRoomGroup()` on hold. The tap path changes affect ALL rooms (tap now defaults to toggle instead of navigate), which is a behavioral change even for rooms without popup config. **RISK NOT STATED:** POP-01 changes tap behavior for ALL rooms, not just Living Room. The acceptance criteria say "No regression on Kitchen/Dining/Bedroom rooms (their behavior unchanged)" -- but their tap behavior IS changed. Currently tap = navigate/popup via tap_action. After POP-01, tap = toggle (unless tap_action is explicitly configured). Kitchen currently has `tap_action: call-service browser_mod.popup`, so Kitchen tap still fires the popup. But Dining and Bedroom have no `tap_action` and only `navigate_path` -- after POP-01, their tap will toggle lights instead of navigating. **MUST FIX:** Acceptance criterion 6 ("Short tap on other rooms still works as before") is FALSE. Dining and Bedroom will change behavior. Either (a) acknowledge this in the acceptance criteria and flag it as an expected behavioral change, or (b) add a transitional `tap_action: navigate` to Dining and Bedroom configs to preserve their current behavior.
- **POP-02:** Shippable after POP-01. Correct. YAML-only changes.
- **NAV-01:** Shippable after SPIKE-01. Does not depend on POP-01 completing first. The plan says "blocked on SPIKE-01 and POP-01" but there is no technical dependency on POP-01. **SHOULD FIX:** Clarify that NAV-01 depends on SPIKE-01 for architectural direction but does not technically require POP-01 completion. They could execute in parallel if different agents work on them.

#### B.3 Validation Criteria Specificity

**SPIKE-01:** Acceptance criteria are appropriate for a spike: "Decision recorded with evidence." Testable.

**POP-01:** Acceptance criteria are specific and testable. 8 criteria, each with a clear observable outcome. **One gap:** No criterion for "popup closes correctly" (dismiss by tapping outside, dismiss by X button). Browser Mod handles this, but it should be verified. **MINOR.**

**POP-02:** Acceptance criteria are specific. 5 criteria. However, there is no criterion for popup styling consistency across rooms (all popups should use the same sizing, dismiss behavior, etc.). **MINOR.**

**NAV-01:** Acceptance criteria are specific. 5 criteria. However, they do not include a criterion for "footer card does not appear on non-Tunet dashboards" (if footer card approach is used). **SHOULD FIX:** Add a cross-dashboard isolation criterion.

#### B.4 POP-01 Scope Assessment

POP-01 is correctly scoped. Two files, four JS edits, one YAML config change. The inclusion of `fire-dom-event` support (6 lines) is listed in INTENDED_STATE but correctly noted as optional in Section 4 of EXACT_CHANGE_IN_ENGLISH. The plan correctly prioritizes `call-service` as the proven mechanism.

**One overscope concern:** POP-01 adds `fire-dom-event` support to `_handleTapAction`. This is not needed for the POC (the POC uses `call-service`). While the change is trivial (6 lines), it introduces a code path that is never exercised in POP-01. Untested code paths are risk. **MINOR:** Acceptable for a 6-line addition, but the plan should note this is untested in POP-01 and will be validated only if the `fire-dom-event` approach is adopted later.

#### B.5 Popup Architecture Inconsistency

The plan DOES address this. FL-028 explicitly records the `call-service` vs `fire-dom-event` inconsistency and resolves it: "Use `call-service browser_mod.popup` (proven) for POP-01." D-002 in the decision register locks this. **This is one of Agent 1's strongest contributions -- the reconciliation of this conflict is clear and well-evidenced.**

#### B.6 NAV-01 Scoping Given Footer Card Discovery

NAV-01 is correctly scoped as a conditional tranche with two branches depending on SPIKE-01 results. The plan explicitly lists what changes in each branch (footer card viable vs not). The 3-4 item count decision (D-006) is correctly gated on touch target validation.

**One missing consideration:** If SPIKE-01 shows footer cards work for mobile, the plan should address whether the footer card is declared per-view or per-dashboard. If per-view, the 7-view duplication problem (FL-038) persists. If per-dashboard, it is solved. **SHOULD FIX:** Add this as an UNKNOWN in SPIKE-01.

---

### C. DECISION REGISTER QUALITY

#### C.1 Lock Strength

**D-001 (Tap=Toggle, Hold=Popup):** Locked with evidence from iOS Home app pattern. Risks documented. Mitigations documented. **Sound.**

**D-002 (call-service browser_mod.popup):** Locked "for POP-01" with clear evidence. Revisit trigger is realistic (if duplication becomes unmaintainable at POP-02 scale). **Sound.**

**D-003 through D-005:** All properly locked with user evidence or plan.md precedence. **Sound.**

**D-006 (Nav 3-4 items):** Locked by Agent 1, not by user. The evidence (my A2 critique) is correctly cited. However, the "Locked By" field says "Agent 1 reconciliation of Agent 4 critique." This is agent-locked, not user-locked. If the user wants 7 items, this decision has no user backing. **SHOULD NOTE:** Add "Awaiting user confirmation" or mark as PROVISIONAL.

**D-009 (navigate_path Retention):** Correctly marked PROVISIONAL. This is the right status. **Sound.**

**D-010 (Browser Mod size vs initial_style):** Status is OPEN. This is not a decision -- it is an open question. It belongs in the ledger (FL-036) but not in the decision register unless it captures a decision about which to use. **SHOULD FIX:** Either remove from decision register (it is already FL-036) or convert to a decision: "Use `size` until verified that `initial_style` is preferred."

**D-011 (CP-01 DONE):** Properly declared with evidence. **Sound.**

**D-012 (LAY-01 and LAY-02 Eliminated):** Evidence from Agent 3 A1 and my C1/C3. Residual items tracked. **Sound.**

#### C.2 Revisit Triggers

All revisit triggers are realistic and specific. No unbounded triggers like "if things change." **Sound.**

#### C.3 Missing Decisions

**MISSING D-018: Popup Content Richness.** The decision register locks that popups use Browser Mod (D-003) and have one popup per room (D-004). But it does not lock what goes IN the popup. POP-01 ships a "lighting quick-control" popup (markdown header + All Off + Open Room + lighting card). Is this the permanent popup content model? Or is it a stepping stone to a richer room popup (temperature, media status, scenes)? My B3 critique raised this. The decision register should capture: "POP-01 popup content is a POC. Popup enrichment decisions are deferred to post-POP-02." **SHOULD FIX.**

**MISSING D-019: Keyboard Accessibility Path.** The register documents keyboard as a risk (D-001 Risk 3) but never records the decision about HOW to solve it (Shift+Enter? Visible affordance? Deferred entirely?). FL-034 tracks the defect but the register should lock the APPROACH. **MINOR** -- can be deferred to when FL-034 is scheduled.

**MISSING D-020: YAML Surface Sync Discipline.** D-016 locks the dual-surface model. But what is the sync rule? POP-01 changes storage config only. When does the YAML surface get updated? The execution plan says "YAML surface update deferred to after storage validation" but does not specify when "after" means. **SHOULD FIX:** Add a decision about when YAML sync happens (e.g., "after POP-02 validates the pattern across all rooms" or "after NAV-01 stabilizes the architecture").

#### C.4 Interaction Model Justification

D-001 cites iOS Home app as evidence. This is the right analogy but the justification could be stronger. The key insight is: **frequency of use determines gesture assignment.** Toggling lights is done 10-50x per day. Opening a popup for detailed control is done 1-5x per day. The more frequent action gets the faster gesture (tap). This frequency-based argument is implicit in the evidence but should be stated explicitly. **MINOR.**

---

### D. GAPS AND MISSING ITEMS

#### D.1 Items Missed from Agent 2

**Agent 2 A2 (nav card should set rows: 1, max_rows: 1):** Not captured in the ledger. Agent 2 recommended the nav card minimize its grid footprint since its visual content is `position: fixed` outside the flow. The current nav card omits `rows` from `getGridOptions()`, meaning Sections assigns it a default grid height. Since the card renders outside the grid, this placeholder space is wasted. **SHOULD ADD** as a LOW-MEDIUM item in the ledger, bundled with NAV-01.

**Agent 2 G5 (Status Card `statusEl.innerHTML` with entity-derived parts):** Not captured. Agent 2 identified that `tunet_rooms_card.js` line 627 uses `ref.statusEl.innerHTML = parts.join(' . ')` with entity-derived values. The risk is low but it is a second innerHTML sanitization concern alongside FL-039. **MINOR** -- could be merged into FL-039 or noted as a related finding.

**Agent 2 G8 (`configurable` static getter undocumented):** Not captured. All 13 cards define `static get configurable() { return true; }`. Agent 2 noted this is not in HA's custom card documentation. The ledger should at minimum note this as an informational finding. **MINOR** -- LOW priority, no breakage.

#### D.2 Items Missed from Agent 3

**Agent 3 F9 (Sonos card as media+speaker consolidation candidate):** Not captured. The Sonos card was built as a unified replacement for `tunet_media_card.js` + `tunet_speaker_grid_card.js`, but the storage config still uses the two separate cards. This is noted in project memory as "consolidation TBD." The ledger should track this as a deferred product decision. **SHOULD ADD** as a deferred decision or LOW item.

**Agent 3 B1 (getGridOptions boilerplate):** Agent 3 noted that 10 of 12 cards return identical `{columns:12, min_columns:6, max_columns:12}` and this could be a base class default. Not captured in the ledger. **MINOR** -- code consistency improvement, very low priority.

#### D.3 Items Missed from My Own Critique

**My G4 (No cache-bust deployment step in popup-fix.md tranches):** Agent 1's execution plan DOES include deployment steps in POP-01 (lines 234-238) with explicit "Bump `?v=` on rooms card resource" and "Hard refresh with cache disabled." **This gap is resolved.** Credit to Agent 1.

**My G1 (popup-card YAML structurally wrong for Sections):** Captured as part of FL-028 and D-002. The decision to use `call-service` eliminates this concern. **Resolved.**

**My B3 (Popup content is just a lighting card):** Partially captured in D-004 ("POP-01 popup content is intentionally narrow"). But as noted in C.3 above, the popup enrichment decision path is not registered. **Partially addressed.**

#### D.4 Cross-Cutting Concerns Not Captured

**Testing strategy is undefined.** The ledger and execution plan define per-tranche validation criteria, but there is no regression testing strategy. After POP-01 ships, how do we know POP-01 still works when NAV-01 ships? The answer is "manual re-test," which is fine for a small dashboard project, but it should be stated explicitly. **MINOR.**

**Browser Mod version pinning.** The plan depends on Browser Mod v2.8.2. If HA auto-updates Browser Mod, the popup behavior could change. The decision register notes Browser Mod as a risk (D-003) but does not recommend version pinning. **MINOR** -- HACS allows version pinning; should be noted as a mitigation option.

---

### E. VERDICT

#### Is the ledger ready for implementation?

**CONDITIONALLY YES.** The ledger is the strongest planning artifact produced in this session. It has proper stale-finding reconciliation, control-doc conflict documentation, exact file:line references on most items, and clear severity assessments. The following MUST-FIX items should be resolved before declaring it authoritative:

1. **FL-045 user bugs:** Either capture each bug with a one-sentence symptom or explicitly state they are deferred to a separate cataloging session. The current placeholder is inadequate.
2. **FL-030 item 3 overlaps FL-032:** Clarify ownership of the tap path change.
3. **FL-014 missing line references:** Add file:line for the speaker cache mechanism.
4. **FL-017 missing specifics:** Enumerate the drifted entities or downgrade to audit task.
5. **POP-01 acceptance criterion 6 is false:** Dining and Bedroom tap behavior WILL change. Acknowledge or mitigate.

#### Is the execution plan defensible?

**YES.** The SPIKE-01 -> POP-01 -> POP-02 -> NAV-01 sequence is the right order. Each tranche is scoped correctly. The conditional branching in NAV-01 based on SPIKE-01 results is architecturally sound. The plan correctly eliminates the phantom tranches (CP-01, LAY-01, LAY-02) and merges essential INT-01 pieces into POP-01.

The plan's primary weakness is the POP-01 behavioral blast radius on non-Living-Room tiles (see B.2 above). This is not a plan-level error -- it is a missing acceptance criterion that should be corrected before implementation.

#### Is the decision register defensible?

**YES, with minor additions.** D-001 through D-017 are properly structured with evidence, risks, and revisit triggers. Missing decisions D-018 (popup content enrichment path), D-019 (keyboard a11y approach), and D-020 (YAML sync timing) should be added but are not blocking.

#### What specific changes must Agent 1 make?

**MUST (blocking):**

| # | Item | Action |
|---|------|--------|
| 1 | FL-045 placeholder | Capture per-bug symptoms or explicitly defer with owner/timeline |
| 2 | FL-030 / FL-032 overlap | Remove FL-030 item 3 (tap path change) -- it belongs in FL-032 |
| 3 | POP-01 AC #6 | Correct acceptance criterion: Dining/Bedroom tap behavior CHANGES from navigate to toggle. Add transitional `tap_action: navigate` or acknowledge as expected change |
| 4 | FL-014 | Add file:line references |

**SHOULD (important but not blocking):**

| # | Item | Action |
|---|------|--------|
| 5 | FL-037 | Upgrade severity to HIGH |
| 6 | FL-017 | Enumerate drifted entities or downgrade to audit |
| 7 | D-006 | Note this is agent-locked, not user-locked; mark as PROVISIONAL or get user confirmation |
| 8 | D-010 | Remove from decision register (duplicates FL-036) or convert to a decision |
| 9 | SPIKE-01 UNKNOWNS | Add: "Is footer card declared per-view or per-dashboard?" |
| 10 | NAV-01 dependencies | Clarify POP-01 is not a technical dependency for NAV-01 |
| 11 | Add D-018 | Register popup content enrichment as deferred decision |
| 12 | Add D-020 | Register YAML sync timing decision |
| 13 | Agent 2 A2 (nav rows:1) | Add as LOW-MEDIUM ledger item |
| 14 | Agent 3 F9 (Sonos consolidation) | Add as deferred product decision |

**MINOR (tracked but non-blocking):**

| # | Item | Action |
|---|------|--------|
| 15 | FL-019 | Reclassify as validation task, not ledger defect |
| 16 | FL-018 | Narrow to specific cards with broken schema fields |
| 17 | NAV-01 AC | Add cross-dashboard isolation criterion for footer card |
| 18 | Agent 2 G5 (statusEl innerHTML) | Merge into FL-039 or note as related |
| 19 | Agent 2 G8 (configurable getter) | Add as LOW informational item |
| 20 | D-001 justification | Add explicit frequency-of-use argument |

---

### Overall Assessment

Agent 1 produced the strongest first-pass planning artifacts I have reviewed in this project. The stale-finding reconciliation is rigorous. The control-doc conflict table is transparent. The execution plan eliminates bureaucratic drift and delivers visible progress in the first working tranche. The decision register is well-structured with proper evidence chains.

The primary weaknesses are: (1) the POP-01 behavioral blast radius on non-popup rooms is unacknowledged, (2) the 11 user-reported bugs are a hollow placeholder, and (3) a handful of ledger items lack the file:line precision needed for a coding agent to act without re-discovery.

After the 4 MUST-FIX items are resolved, these artifacts are authoritative and ready to drive implementation.

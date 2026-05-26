# Tranche N.1 — Navbar Apple Liquid Glass + Active Tab + Conditional Media Widget

**Created**: 2026-05-26 4:32pm MDT
**Parent**: `docs/plans/next-tranche-rollup-2026-05-26.md` (Tranche N — Navbar Polish)
**Authority**: focused implementation plan; passes through adversarial review before stamp; empirical baseline captured BEFORE design per the lesson logged today.

---

## Phase 1: Empirical Baseline (COMPLETED 2026-05-26 4:30pm)

Captured `/tmp/navbar-baseline-2026-05-26/` with current navbar state at both breakpoints, while Spotify is playing on living_room. DOM probe results documented below.

### DOM observations — what's actually there

**Outer `.navbar` DIV** (the wrapper Mac configured):
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 3`
- `backdrop-filter: blur(20px)` ✓
- `border: 1px solid rgba(255,255,255,0.06)` ✓
- `border-radius: 22px` ✓
- `background: transparent` (wrapper is invisible itself)
- `box-shadow: none`

**Inner HA-CARDs** — TWO opaque elements inside the wrapper:

1. **`.media-player.type-custom-navbar-card`** (the music widget):
   - Width 351px, height 72px, position relative
   - `background-color: rgba(30, 41, 59, 0.72)` ← **opaque, defeats wrapper's blur**
   - `backdrop-filter: none`
   - `border-radius: 12px`
   - Always rendered regardless of playing state — visible even when no Sonos is playing

2. **`.navbar-card.mobile.bottom.type-custom-navbar-card`** (the 4-tab strip):
   - Width 390px (full bleed), height 81px
   - `background-color: rgba(30, 41, 59, 0.72)` ← **also opaque, defeats wrapper's blur**
   - `backdrop-filter: none`
   - `border-radius: 0`
   - `box-shadow: 0 -1px 4px rgba(0,0,0,0.14)` (subtle top edge)

### Empirical findings → defect inventory

| Defect | Visible? | Severity |
|--------|----------|----------|
| Glass effect not actually working — wrapper's `blur(20px)` is masked by opaque inner cards | YES (screenshot shows flat navy, no refraction through to wallpaper) | high — primary N.1 target |
| Media widget always-on even when idle — eats 72px of chrome on phone (21% total bar height) | YES (visible during Spotify playing capture, would also be visible at idle) | high — Mac flagged |
| Active-tab indicator (amber-fill on Home) — present but subtle; no animated highlight | YES (Home tab visible) | medium — Mac flagged |
| Rooms tab popup submenu — couldn't verify in headless capture (browser-mod intercepted click) | UNKNOWN | medium — Mac flagged; out of N.1 scope, defer to N.3 |
| Total bar chrome on phone = 177px (21% of 844px viewport) | YES | medium — reduces usable content area |

### Closed assumption from rollup plan
- Old assumption: "navbar's blur(20px) achieves glass effect, just need heavier blur to upgrade to Apple Glass"
- **Empirical truth**: blur is already there but defeated by opaque inner cards. The fix isn't just bumping the blur value — it's restructuring the layering so the blur is actually visible.

---

## Phase 2: Analysis

### Component: navbar styling + media widget visibility

**Upstream**:
- YAML anchor `&nav_card` at `tunet-home-preview-config.yaml` line 63-120
- `styles:` block at lines 83-91 — controls outer `.navbar` div via CSS variables + raw CSS
- `media_player:` block at lines 73-82 — declares the 5-speaker carousel
- Active speaker state (any of 5 media_player.* in playing state) determines whether media widget content is relevant

**Downstream**:
- Every view in tunet-home-preview that references `*nav_card` (Home + Stats + ~10 popups + subviews if added)
- Visual identity of the entire dashboard chrome layer

**Invariants at risk**:
- Routes (Home / Rooms / Stats / Settings) must remain tappable — CSS change must not break click targets
- The position:fixed dock must continue to NOT clip popups (per CD10 deferred concern from cosmos session, memory #13266)
- The media widget tap_action → `#media-living-room` popup must continue to work

**Change classification**: Type A (Isolated) — single YAML anchor edit, cascades only through `*nav_card` references which all consume the same styling.

---

## Phase 3: Design — line-level changes

### Change Set 1: Apple Liquid Glass styling on the OUTER navbar wrapper

**Strategy**: target the wrapper `.navbar` AND inner HA-CARDs together. Wrapper gets a stronger blur + saturate. Inner HA-CARDs become semi-transparent so the wrapper's blur shows through. Add iOS-signature top-edge highlight + soft outer drop shadow.

**File**: `Dashboard/Tunet/tunet-home-preview-config.yaml` lines 83-91

**Current state**:
```yaml
      styles: |
        .navbar {
          --navbar-background-color: rgba(30, 41, 59, 0.72);
          --navbar-primary-color: #fbbf24;
          --navbar-color: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
        }
```

**Proposed replacement**:
```yaml
      styles: |
        /* N.1 — Apple Liquid Glass treatment.
         * Empirical baseline captured 2026-05-26 showed wrapper's blur(20px)
         * was defeated by opaque inner HA-CARDs (rgba 30,41,59, 0.72).
         * Fix: strong backdrop blur + saturate on the wrapper; reduce inner
         * card opacity so the blur actually shows through; add iOS top-edge
         * highlight + soft drop shadow. */
        .navbar {
          /* CSS-var defaults consumed by lovelace-navbar-card internals.
           * Use a low-opacity tint so the wrapper's blur dominates. */
          --navbar-background-color: rgba(30, 41, 59, 0.48);
          --navbar-primary-color: #fbbf24;
          --navbar-color: rgba(255, 255, 255, 0.65);

          /* Apple Liquid Glass surface: strong blur + saturation boost. */
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);

          /* Low-opacity gradient tint over the blurred backdrop. */
          background: linear-gradient(
            180deg,
            rgba(30, 41, 59, 0.32) 0%,
            rgba(30, 41, 59, 0.52) 100%
          );

          /* iOS top-edge highlight + thin outer stroke. */
          border-top: 1px solid rgba(255, 255, 255, 0.16);
          border-left: 1px solid rgba(255, 255, 255, 0.04);
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          border-bottom: none;
          border-radius: 24px 24px 0 0;

          /* Soft outer drop shadow for floating depth. */
          box-shadow:
            0 -12px 40px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* Make the inner HA-CARDs transparent so the wrapper's blur shows through.
         * They currently carry opaque rgba(30,41,59, 0.72) which blocks the glass. */
        .media-player.type-custom-navbar-card,
        .navbar-card.type-custom-navbar-card {
          background-color: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* N.3a — active-tab indicator improvement (Mac flagged 2026-05-26).
         * Source-verified class names from lovelace-navbar-card v1.6.0:
         * route div carries `.route` and `.active` classes (NOT
         * `.navbar-route` — corrected after adversarial review v1 HIGH-2).
         * Adversarial review v1 HIGH-3: must explicitly set `position: relative`
         * on the parent or the ::after underline anchors to .navbar (wrong place). */
        .route {
          position: relative;  /* anchor the ::after underline */
        }
        .route.active {
          color: var(--navbar-primary-color) !important;
        }
        .route.active::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 4px;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          border-radius: 2px;
          background: var(--navbar-primary-color);
          opacity: 0.95;
          transition: width 0.2s ease;
        }
```

**Why these specific values**:
- `blur(40px) saturate(180%)`: empirically chosen iOS Liquid Glass values per Apple HIG references; 40px gives strong refraction without being so blurry the underlying content is unrecognizable.
- Gradient `0.32 → 0.52` top-to-bottom: matches Apple's subtle vertical luminance gradient (lighter at top, slightly darker at bottom) suggesting curved glass.
- `border-top: 1px rgba(255,255,255,0.16)`: the iOS sheen — only on top edge to suggest light hitting a glass curve.
- `box-shadow: 0 -12px 40px rgba(0,0,0,0.32)`: lifts the bar off the viewport floor with a soft cast upward.
- `inset 0 1px 0 rgba(255,255,255,0.08)`: an inner highlight reinforcing the top edge from below.
- Inner HA-CARDs becoming transparent: the load-bearing fix — without this, the wrapper's blur is invisible.
- Active-tab underline 24px wide × 2px tall: visible but subtle; Apple Home active-state pattern.

### Change Set 2 (v2 — REPLACES conditional media widget): Hide media-player widget on mobile via plain CSS

**Why changed**: adversarial review confirmed via lovelace-navbar-card v1.6.0 source inspection that the `styles:` field uses `unsafeCSS()` — verbatim CSS injection, NO Jinja templating pipeline. The v1 plan's "Path A Jinja-in-styles" approach was confirmed impossible. Mac's redirect (2026-05-26 4:40pm): "Let's hide the media player on mobile then" — simpler and bypasses the entire conditional infrastructure.

**Strategy**: plain CSS `@media (max-width: 768px)` rule inside the navbar's existing `styles:` block. No new sensors, no card_mod wrapper, no Jinja. Mobile gets a slim 2-row navbar (just tabs, no media chrome); desktop keeps the full navbar with media widget.

**Edit**: extend the navbar's `styles:` block (same edit point as Change Set 1).

```yaml
        /* N.1 Change Set 2 — hide media-player widget on mobile.
         * Desktop (≥768px) still shows the full widget with album art +
         * transport. Phone (<768px) drops the widget entirely to reclaim
         * the 72px of chrome (~9% of viewport on 844px). Mac taps
         * #media-living-room via Rooms popup or dedicated media tap
         * target instead. */
        @media (max-width: 767px) {
          .media-player.type-custom-navbar-card,
          .media-player-carousel,
          .media-player-viewport,
          .media-player-track,
          .media-player-bg {
            display: none !important;
          }
          /* If .navbar uses flex gap, remove the gap that would otherwise
           * leave phantom whitespace where the widget was. */
          .navbar {
            gap: 0 !important;
          }
        }
```

**Trade-off**: media transport from the navbar disappears on phone. Mac retains access to media via:
- Tapping the Rooms popup → `#room-<name>` → that room's media controls
- A direct `#media-living-room` Bubble popup tap target (consider adding a Music tab to navbar routes if Mac wants one-tap access on phone)

Recorded as open decision (b) below for Mac's stamp.

### Change Set 3 (v3 — REPLACED after sub-agent research 2026-05-26 ~5:00pm): Fix navbar Rooms popup via missing `tap_action: open-popup`

**Why replaced**: Sub-agent research of lovelace-navbar-card v1.6.0 docs + GitHub issues confirmed the popup feature DOES work. The bug in current config is missing `tap_action: action: open-popup` on the Rooms route — the `popup:` field is a passive payload; the popup only opens when tap_action explicitly triggers it. Closed issue [#259](https://github.com/joseluis9595/lovelace-navbar-card/issues/259) describes the exact same symptom Mac saw; fix was the missing tap_action. Memory #13266 (cosmos rejection) was likely a misattribution conflating tunet-nav-card's older clipping issue with navbar-card's popup — no open issues blame navbar-card's popup for Sections-layout clipping.

**Memory update**: observation #13266 ("HACS navbar-card Rejected: Same position:fixed Clipping") should be marked SUPERSEDED or refined — the rejection rationale was based on an unverified premise (same pattern as M.1 today — see `feedback_empirical_baseline_before_fix`).

**Net effect**: NO new Bubble Card popup needed. Just fix the existing navbar `popup:` config with the missing tap_action + rewrite popup sub-routes to use `#room-<name>` hashes (which point to existing working Bubble popups).

**File**: `tunet-home-preview-config.yaml` lines 96-114 area (the Rooms route definition).

**Current state**:
```yaml
        - url: /tunet-home-preview/home
          icon: mdi:floor-plan
          label: Rooms
          popup:
            - url: /tunet-home-preview/living-room
              icon: mdi:sofa
              label: Living
            - url: /tunet-home-preview/kitchen
              ...
```

**Proposed replacement** (adds `tap_action: open-popup` + rewrites sub-route URLs to use existing `#room-<name>` Bubble popup hashes):
```yaml
        - icon: mdi:floor-plan
          label: Rooms
          tap_action:
            action: open-popup
          # Sub-routes navigate to existing #room-<name> Bubble Card popups
          # (working infrastructure shipped in T8 and validated for all 5 rooms).
          popup:
            - url: /tunet-home-preview/home#room-living-room
              icon: mdi:sofa
              label: Living
            - url: /tunet-home-preview/home#room-kitchen
              icon: mdi:silverware-fork-knife
              label: Kitchen
            - url: /tunet-home-preview/home#room-dining-room
              icon: mdi:silverware-variant
              label: Dining
            - url: /tunet-home-preview/home#room-bedroom
              icon: mdi:bed
              label: Bedroom
            - url: /tunet-home-preview/home#room-office
              icon: mdi:desktop-classic
              label: Office
```

**Removed `url:` from outer Rooms route** — when `tap_action: open-popup` is set, the route's own `url:` is irrelevant; tapping fires the popup action instead of navigating.

**Behavior**: tap Rooms → navbar-card renders floating submenu (anchored above the tab on mobile, beside the tab on desktop) → tap "Living" → URL becomes `#room-living-room` → existing Bubble Card popup opens. Native navbar-card UI handles the popover backdrop + dismiss.

### Change Set 5 (NEW 2026-05-26 5:05pm — Mac added scope): Media tab on navbar

**Why added**: Change Set 2 hides the media-player widget on mobile (reclaim 72px chrome). Mac wants a one-tap media surface to remain accessible on phone. Add a 5th navbar route "Media" that opens `#media-living-room` Bubble Card popup directly (same hash already used elsewhere in dashboard navigation).

**File**: `tunet-home-preview-config.yaml` — navbar routes block. Insert between Rooms and Stats.

**Proposed addition**:
```yaml
        - url: /tunet-home-preview/home#media-living-room
          icon: mdi:music
          label: Media
```

**Result**: 5-tab navbar — Home / Rooms / Media / Stats / Settings. Each tab is ~78px wide at 390px viewport (still comfortably above HIG 44pt minimum tap target).

**Open question**: tab order. Default proposed = Home / Rooms / **Media** / Stats / Settings. Alternative orderings include Home / Media / Rooms / Stats / Settings (Media earlier reflects high-frequency usage), or Home / Rooms / Stats / Media / Settings (Media near Settings as utility). Mac's stamp.

**Open question**: should Media tab on desktop ALSO open the popup, OR remain as the always-visible widget on desktop (per Change Set 2's desktop-keep behavior)? Default: Media tab exists in routes for BOTH breakpoints (so the tab strip looks consistent across breakpoints), but on desktop the always-visible widget continues to render above the tabs. Slight redundancy on desktop is acceptable; both surfaces are valid.

### Change Set 6: package deploy + dashboard redeploy

After Change Sets 1 + 2 + 3 (v2 — no package deploy needed since Change Set 2 dropped the binary_sensor approach):
1. Redeploy dashboard: `npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview`.
2. Hard-refresh on phone/desktop browser (Ctrl+Shift+R or close-and-reopen tab) — required because navbar's `styles:` block is consumed inline by lovelace-navbar-card; HA's storage-mode WebSocket push delivers new YAML but the browser may cache the rendered shadow DOM.
3. M1 capture at both breakpoints, both states (Spotify playing + idle). Production-mirror capture per M1 contract.
4. **Mac live verification gate**: Mac taps the Rooms tab and confirms the `#rooms-index` popup opens (resolving N.3 concern). Mac confirms Apple Glass visible (refraction through to underlying content). Mac confirms active-tab underline visible. Mac confirms media-player widget is GONE on phone, RETAINED on desktop.

---

## Phase 4: Validation

### Live test sequence (Mac participation)

1. **Playing state** (Spotify still active on living_room or any room):
   - Open `/tunet-home-preview/home` on phone
   - Hard-refresh
   - Confirm: media-player widget visible above the tab strip with album art + transport
   - Confirm: glass refraction visible — underlying content (wallpaper, body text) shows through the navbar with blurred-and-saturated quality
   - Confirm: active tab (Home) shows amber color + underline accent
   - Confirm: 4 routes still tappable + navigate correctly
2. **Idle state**:
   - Stop Spotify (pause from external controller or wait until queue ends)
   - Wait ~5 seconds for `binary_sensor.tunet_any_media_playing` to flip off
   - Confirm: media-player widget disappears
   - Confirm: navbar reduces to just the 4-tab strip (~81px)
3. **Resume playing**:
   - Resume Spotify
   - Confirm: media widget re-appears within ~5 seconds

### Validation criteria

- [ ] Empirical baseline captured (DONE 2026-05-26 4:30pm)
- [ ] Apple Glass visible — wallpaper / content shows through navbar with blur + saturation
- [ ] Active-tab indicator more visible than baseline (Mac confirms)
- [ ] Media widget hides when no Sonos is playing
- [ ] Media widget shows when Sonos resumes
- [ ] Route navigation still works (Home/Stats nav, Settings)
- [ ] No regression on the existing 8 popups (popup shell evidence from T8.1 still holds)
- [ ] `binary_sensor.tunet_any_media_playing` returns correct state across the 5 Sonos players

### Out of scope for N.1 (deferred to follow-ups)

- N.3 Rooms popup submenu fix — needs dedicated investigation; likely correlates with memory #13266 "navbar-card position:fixed clipping in HA Sections"
- N.3 unified-lights-by-room page — Mac's "later separate scope" item
- Tranche M.2 volume debounce + M.3 Play:3 health sensor — separate tranche
- Tranche S sensor + page work — separate tranche

---

## Phase 5: Stop triggers

- If Path A (Jinja-in-styles) doesn't actually render the conditional CSS at runtime → STOP, switch to Path B with explicit user acknowledgment.
- If the inner-HA-CARD transparency breaks readability (e.g., text contrast falls below WCAG AA over real wallpaper) → STOP, adjust the gradient opacity values.
- If the new blur(40px) saturate(180%) causes noticeable performance lag on Mac's iPhone → STOP, dial back to blur(28px) without saturate.

---

## Awaiting

Mac's stamp on:
- (a) Apple Glass visual treatment values (blur 40px / saturate 180% / gradient 0.32→0.52 / border-top sheen / drop shadow) — starting values per HIG references; Mac may want lighter/heavier
- (b) Media tab position in route order. Proposed: Home / Rooms / **Media** / Stats / Settings (5 tabs). Mac may prefer a different order.
- (c) Tap-action precedence on the fixed Rooms route — confirm `tap_action: open-popup` cleanly replaces the broken navigation behavior with no regression
- (d) `Proceed to implementation` (adversarial review v1 + sub-agent docs research already complete)

---

## Appendix A — Adversarial Review v1 Findings + Disposition

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| H1 | High | Path A (Jinja-in-styles) confirmed dead via source inspection — `unsafeCSS()` verbatim CSS injection in v1.6.0; no Jinja pipeline | **NEUTRALIZED** — Mac redirected (4:40pm) to "hide media on mobile" via plain CSS `@media (max-width: 767px)`. No binary_sensor, no Jinja, no conditional infrastructure needed. Change Set 2 fully revised. |
| H2 | High | `.navbar-route` likely matches nothing; source shows class is `.route` not `.navbar-route` | **FIXED** — selectors corrected to `.route` and `.route.active`. |
| H3 | High | `.route` parent likely not `position: relative` by default; ::after underline would anchor to wrong ancestor | **FIXED** — explicit `.route { position: relative }` added in the same CSS block. |
| M4 | Med | `.navbar` may use flex `gap` rather than margins; hiding media-widget children may leave phantom gap | **ADDRESSED** — Change Set 2 includes `.navbar { gap: 0 !important }` inside the mobile media query as defensive measure. |
| M5 | Med | Hard-refresh on phone not mentioned in Phase 4 | **FIXED** — explicit hard-refresh step added to deploy chain step 2. |
| L (A,B,F,H) | Low | Various non-blockers (stacking analysis correct, 5s blink acceptable, underline geometry safe, selector stability acceptable) | **CLOSED** — no change needed. |

---

## Plan version history

- v1 (4:32pm 2026-05-26): initial plan with empirical baseline captured BEFORE design (lesson `feedback_empirical_baseline_before_fix` applied)
- v2 (4:50pm 2026-05-26): adversarial review v1 findings resolved + Mac scope redirect — Change Set 2 replaced with simple mobile CSS hide (no Jinja), Change Set 3 added for `#rooms-index` Bubble popup (replaces broken navbar-card popup primitive), selectors corrected to `.route` + `position: relative`, hard-refresh step added
- **v3 (5:05pm 2026-05-26)**: sub-agent research closed the rooms-popup premise — navbar-card v1.6.0 popup feature works; missing `tap_action: action: open-popup` was the actual bug per closed GitHub issue #259. Change Set 3 replaced with minimal config fix (no `#rooms-index` Bubble popup needed). Change Set 5 added per Mac's request — Media tab on navbar opening `#media-living-room` directly. Memory #13266 (cosmos navbar-card rejection) flagged for SUPERSEDED status — same empirical-baseline lesson as memory #12575 earlier today

# Tunet Interaction Plans — Bidirectional Adversarial Cross-Review

**Created**: 2026-05-23 ~2:25am MDT
**Trigger**: Mac asked "Which is better? Perform an adversarial review of each other's [plans]."
**Subject docs**:
- **A** — `docs/plans/tunet-home-v2-interaction-spec-2026-05-23.md` (883 lines, committed `2ce7e22`)
- **B** — `docs/plans/harmonic-bouncing-cosmos.md` (995 lines, committed `7e67453`)

**Verdict (TL;DR)**: Neither is strictly better. They are **complementary with material disagreements on 4 gesture/composition decisions** that need Mac's resolution. Recommended path is **merge into a single authoritative spec** with explicit "this comes from A / this comes from B" provenance, plus 4 Mac-decision-required disagreement entries promoted into the existing decision matrix.

---

## 1. Side-by-side scope coverage

| Topic | Doc A (interaction-spec) | Doc B (harmonic-bouncing-cosmos) | Stronger |
|---|---|---|---|
| Apple HIG specific citations (44pt, env safe-area, spring physics values) | YES (§12.10 with exact pt values + cubic-bezier) | partial (mentions patterns, no values) | **A** |
| 20-scenario adversarial review (tap-during-scroll, slow network, multi-touch, voice conflicts, HomeKit, ZEN32, HA restart, midnight reset, Sonos drop, Spotify rejection, multi-phone, popup overflow, etc.) | YES (§12.5.1-12.5.20) | partial (~12 scenarios in §A and risk register §J) | **A** |
| User flow walkthroughs (morning wake, cooking, movie night, bedtime, late-night, return-home, troubleshooting, stats-check) | YES (§12.6.1-12.6.8) | NO | **A** |
| Multi-modal control matrix (Dashboard × ZEN32 × Voice × HomeKit × Auto) | YES (§12.7) | partial | **A** |
| Per-card-position edge case matrix (unavailable / unknown / null / tap-anyway) | YES (§12.9) | NO | **A** |
| Sonos+Spotify FF/RW concrete fix (selectTransportEntity code snippet) | YES (§12.5.10) | references MEDIA-2 only | **A** |
| 19 new sensors specified by name (stats + zone snapshot) | YES (§9 + §10) | references sensor needs without enumeration | **A** |
| Tap-on-icon vs tap-on-name split (more Apple-Home-faithful) | YES (§1 R1) | NO (collapses to whole-body tap) | **A** |
| Detent sheet vs popup_mode:fit-content distinction + future-tranche flag | YES (§12.8) | NO | **A** |
| Bubble Card 3.2.1 limitations explicit (8 NOT-supported features listed) | YES (§12.8) | partial | **A** |
| Critical Discoveries section (live Playwright evidence, DOM-level orb defect, Mac's screenshot, Bubble 3.2.1 not-on-server discovery, IA inversion) | NO | YES (CD-1 through CD-8) | **B** |
| 4-alternative gesture matrix evaluated against 8 axes with star ratings | NO (recommends one without showing alternatives) | YES (Alt I/II/III/IV × Discoverability/Gesture/Apple/Cost/Cognitive/Back-stack/Deep-link/Page-justification) | **B** |
| Explicit disagreement framing ("Mac's verbal contract was X, recommended is Y, needs confirm/override") | partial (frames as "recommended unless Mac says no") | YES (3 explicit disagreements named in §L) | **B** |
| ASCII wireframes per surface | YES (~5 surfaces) | YES (9 surfaces) | **B** (more) |
| IA: nav graph + back-stack semantics + deep-link entry behavior locked tables | NO | YES (§C.4, §C.5) | **B** |
| Tranche mapping to Plans A-F + PA framework absorption recommendation | NO | YES (§H) | **B** |
| 5-app best-in-class comparison (Apple Home, Sonos, Nest, Tesla, Spotify) with adopt/reject matrix | partial (cites Apple, less on others) | YES (§B) | **B** |
| Risk register classified (subtle / catastrophic / user-eye / external) | partial | YES (§J) | **B** |
| Critical path with cross-tranche dependencies + effort estimates | partial (build sequence only) | YES (§H.4) | **B** |
| Decision matrix for Mac (blocking / per-tranche / deferrable) | YES (D1-D10) | YES (D1-D9 + per-tranche P1-P10 + deferrable F1-F10) | **TIE** |
| Verification protocol (end-to-end test sequence) | YES (§13) | YES (§K) | **TIE** |
| Build sequence (post-approval) | YES (§15, 15 steps) | NO (delegates to Plans A-F tranches) | **A** |

**Coverage tally**: A wins 11 categories, B wins 8 categories, 2 ties. A is **deeper on Apple-pattern fidelity + scenario coverage + code-level concreteness**. B is **stronger on live evidence + structural IA locks + tranche-portfolio integration + disagreement clarity**.

---

## 2. Material disagreements that need Mac's resolution

### DA-1: Tap-region semantics (split-tile vs whole-tile)

| | Position |
|---|---|
| Doc A | Tap-on-**icon** region = toggle; tap-on-**name/body** region = open detail. Apple Home pattern. Adds chevron `›` as drillable affordance. |
| Doc B | Tap on **body** = open popup. Per-light orbs are separate (stopPropagation = toggle individual). Power button = toggle all. |
| Disagreement | A splits the row into icon-zone + name-zone (Apple-faithful). B keeps the row body single-zone + delegates per-light toggle to orbs (simpler, less Apple-faithful). |
| Impact | Affects: rooms-card row CSS layout, hit-target sizing, per-row testability, learnability for guests. |
| Cost of getting wrong | A's split is unlearnable without onboarding (Apple users know it, guests don't). B's whole-body-tap is more universally legible but loses the quick-toggle ergonomic that A preserves. |
| My recommendation (post-cross-review) | **B's whole-body-tap-to-popup** for the row variant on Home (orbs do per-light, power does all), because: (a) row variant is already gesture-dense at 390px and split-zones make it worse; (b) the "toggle all room lights" use case is served by the explicit visible power button; (c) Apple's split works on iOS Home because tiles are larger and have more padding than a 60-72px Tunet row. The split MIGHT work in **tile variant on Rooms list** where tiles are larger. |

### DA-2: Long-press behavior (redundant path vs deprecated)

| | Position |
|---|---|
| Doc A | Long-press = open detail sheet (same target as tap-on-name). Redundant on purpose: discoverability fallback for users who don't notice the icon/name split. |
| Doc B | Hold = nothing (reserved; explicitly deprecated). Alt I rejects hold-as-action to avoid gesture-density saturation at 390px row. |
| Disagreement | A treats hold as a discoverability safety net. B treats hold as a danger zone (collision with scroll, with light-tile drag pattern). |
| Impact | If Mac picks DA-1=A (split-zone tap), then long-press as redundancy helps. If Mac picks DA-1=B (whole-body tap), long-press is gratuitous. |
| My recommendation | **Resolve DA-1 first; DA-2 falls out.** If DA-1=B, then long-press = reserved (B's position wins). If DA-1=A, then long-press = redundant detail-sheet path (A's position wins). |

### DA-3: Adaptive page existence (separate vs collapsed into Stats)

| | Position |
|---|---|
| Doc A | 5+ pages: Home / Rooms / Media / **Stats** / **Adaptive** (separate page for OAL detail with zone-baseline graph, mode timeline, override management) |
| Doc B | 5 pages: Home / Rooms list / Media / **Stats** (with Adaptive collapsed inside) / Settings |
| Disagreement | A separates Adaptive into its own surface. B folds it into Stats top-section. |
| Impact | Affects: nav count (A's spec has 6-item nav, B has 4-item nav + header gear). Affects URL pollution. |
| My recommendation | **B's collapse** because: (a) nav at 6 items at 390px = 65px each = sub-HIG; (b) OAL detail is fundamentally a sub-domain of Stats (lighting state vs HVAC state vs Electricity); (c) one Stats page with anchored sub-sections gives ONE mental model not two. **Counter-argument for A**: power-users may want to bookmark `/adaptive` directly; the OAL page in A has substantially more content than would fit comfortably as a Stats sub-section. **Mac decides.** |

### DA-4: Composition specifics (Weather + Lighting card placement on Home)

| | Position |
|---|---|
| Doc A | Weather card NOT on Home (moved to Stats). Lighting card on Home is *undecided*. |
| Doc B | Weather card compact on Home (next to Climate thin). Lighting card on Home is grid 3×2 compact (6 OAL zones). |
| Disagreement | A is more aggressive about thinning the Home page; B keeps more density. |
| Impact | Home page scroll height. Density vs minimalism tradeoff. |
| My recommendation | **A is closer to right**. Weather is a low-frequency look; it lives more naturally on Stats. Lighting is a moderate-frequency interaction but the rooms-card already exposes per-room lighting; a separate 6-zone Lighting grid on Home is redundant with rooms-row. **Recommend**: drop Weather from Home (→ Stats); drop Lighting card from Home (→ Rooms popups + Rooms list subviews). Home becomes leaner per A's vision. |

---

## 3. Where the two docs CONVERGE (no disagreement)

These are locked across both docs and can be encoded immediately:

1. **Bubble Card 3.2.1 popup primitive** (suite-wide; Browser Mod retired for in-card composition; alarm-edit migration in scope per A)
2. **Tap=popup, button-in-popup=page** (resolves Mac's verbal hold=popup; both docs reject hold-as-navigate)
3. **Per-room subviews exist** (5: Living / Kitchen / Dining / Bedroom / Office)
4. **Bedroom is the alarm surface** (tunet-alarm-card lives in #room-bedroom popup + bedroom subview)
5. **Dining is the climate surface** (thermostat lives in Dining subview; climate also in #climate-detail popup)
6. **3-mode scene cycle**: Adaptive / Evening / Late Night (rename "Dim Ambient Plus" → "Evening")
7. **Sonos+Spotify FF/RW fix via MA-entity routing** (`media_player.<room>_2` for next/prev when Spotify is the source)
8. **Bedroom Sonos health sensor** (template binary_sensor flipping on >5min unavailable)
9. **HVAC stats sensors** (heating/cooling minutes today, drift, cycles, yesterday history)
10. **Per-zone OAL baseline sensors** (extracted from oal_real_time_monitor attributes)
11. **Stats page exists** with HVAC + electricity + weather history + OAL detail (whether OAL gets its own page or sub-section is DA-3)
12. **Mini-player on Home** (compact Sonos transport above the nav)
13. **Inbox conditional render** on Home (only when items present)
14. **Light-groups audit needed** (HA `light.<room>` groups currently incomplete)
15. **68 orphaned browser_mod entities cleanup** (Plan A)
16. **Plan A is the Bubble Card 3.2.1 upgrade prerequisite** (server is on 3.1.1)

---

## 4. What each doc UNIQUELY contributes that the other should adopt

### A → B (B should adopt these from A):
- The 20-scenario adversarial review (B has ~12; adopt the missing 8: tap-during-scroll, multi-touch slider, voice conflict, HomeKit external state, ZEN32-with-dashboard-open, HA restart mid-day, midnight history_stats reset, multi-phone serialization)
- Apple HIG specific citations (44pt × 44pt, 0.5em gutter, cubic-bezier(0.34, 1.56, 0.64, 1) for sheet open, env(safe-area-inset-bottom))
- User flow walkthroughs (8 of Mac's daily journeys, end-to-end)
- Multi-modal control matrix (Dashboard × ZEN32 × Voice × HomeKit × Auto for every control)
- Per-card-position edge case matrix (unavailable / unknown / null / tap-anyway)
- selectTransportEntity code snippet for Sonos+Spotify routing
- 19 new sensors enumerated by name
- Tap-on-icon-vs-name split (Apple Home pattern), even if rejected for row variant — keep for tile variant + light tiles + speaker tiles

### B → A (A should adopt these from B):
- Critical Discoveries section (CD-1 orb defect at DOM level; CD-2 Mac's popup screenshot; CD-3 Bubble 3.2.1 not on server; CD-4 production IA inversion; CD-5 four dashboards / four models; CD-6 light-groups gap; CD-7 orphan entities; CD-8 pre-existing plans portfolio)
- 4-alternative gesture matrix with structured axis-evaluation
- IA: nav graph + back-stack semantics + deep-link entry behavior locked tables
- Tranche mapping to Plans A-F + PA02-PA11 absorption recommendation
- Risk register classification (subtle / catastrophic / user-eye-required / external dependency)
- 5-app best-in-class adopt/reject matrix (Apple Home + Sonos + Nest + Tesla + Spotify)
- Explicit disagreement framing (forces Mac's confirm/override on locked-direction reversals)
- Critical path with effort estimates spread across portfolio Plans A-F

---

## 5. Quality dimensions (where each fails)

### A's weaknesses
- Lacks live evidence — written before Playwright captures that proved Bubble 3.2.1 popups don't render today (no server-version check baked in)
- "REMOVE from home? Decision: keep on Home OR move to Lighting subview" leaves a coin-flip in §11 instead of committing
- Underweights the Plans A-F portfolio context (the 6 sibling plans Mac built today)
- Doesn't address PA01-PA11 framework (older artifact) absorption strategy
- Disagreement-with-Mac framing is soft ("recommended unless Mac says no") — easy for Mac to skim past
- 6-item nav at 390px is sub-HIG (5 items @ 78px is already tight; 6 @ 65px is wrong)

### B's weaknesses
- Misses the tap-on-icon-vs-name split nuance (collapses to whole-body tap; less Apple-faithful)
- Doesn't include the selectTransportEntity code-level fix (references MEDIA-2 but no implementation snippet)
- Doesn't enumerate the 19 new sensors by name
- Lacks the per-card-position edge case matrix (what shows when entity unavailable)
- Lacks user flow walkthroughs (Mac's daily journeys)
- Lacks specific Apple HIG citations (pt values, easing curves, safe-area inset)
- Build sequence delegated to Plans A-F rather than enumerated step-by-step
- "Disagreement with Mac" framing is appropriately direct but lacks the Apple HIG grounding A has

---

## 6. Recommended merged artifact

A SINGLE authoritative spec at `docs/plans/tunet-interaction-architecture-FINAL-2026-05-23.md` that:

| Section | Source | Notes |
|---|---|---|
| 0. Critical Discoveries (live evidence) | B (§CD-1 through CD-8) | Empirical grounding; must come first |
| 1. Apple-style interaction contract + HIG citations | A (§1, §12.10) | A's specific 44pt/spring/safe-area values are load-bearing |
| 2. Scene model (Adaptive / Evening / Late Night with per-zone table) | A (§2) | A has the per-zone values |
| 3. Page taxonomy + nav model | merged (A's §3 + B's §C.1, §C.3) | Resolve DA-3 (Adaptive separate vs collapsed) per Mac |
| 4. Home page composition + wireframe | B (§D.1) with A's removals (Weather, Lighting card → off Home per DA-4) | B's wireframe is fuller; A's removals are right |
| 5. Rooms list + per-room subview composition | merged (A §5/§7 + B §D.2/§D.3) | A's per-room template + B's per-room variation matrix |
| 6. Per-room popup composition | merged (A §6 + B §F.4) | Both have the same data; A's prose + B's matrix |
| 7. Media page + popup + Now Playing | A (§8) | A's detailed media architecture wins |
| 8. Stats page | A (§9) | A enumerated the 19 sensors |
| 9. Adaptive page (or section) | A (§10) with DA-3 resolution | A's content; B's collapse-into-Stats if DA-3=B |
| 10. Per-card variant + interaction map | merged (A §11 + B §G) | Resolve DA-1/DA-2 first |
| 11. Bubble Card 3.2.1 limitations + acceptances | A (§12.8) | A's 8-item NOT-supported list is exhaustive |
| 12. Adversarial review (20 scenarios) | A (§12.5.1-§12.5.20) | A has all 20; B's 12 are subset |
| 13. User flow walkthroughs (Mac's daily journeys) | A (§12.6) | A has 8 walkthroughs; B has none |
| 14. Multi-modal control matrix | A (§12.7) | A's table is complete |
| 15. Per-card-position edge case matrix | A (§12.9) | A's table; missing from B |
| 16. IA: nav graph + back-stack + deep-link entry behavior | B (§C.4, §C.5) | B's locked tables; missing from A |
| 17. Risk register (classified) | B (§J) | B's classification is useful |
| 18. Apple best-in-class adopt/reject (5 apps) | B (§B) | B has 5 apps; A focuses on Apple Home |
| 19. Tranche mapping to Plans A-F + PA absorption | B (§H) | B's portfolio integration; missing from A |
| 20. Decision matrix for Mac | merged (A's D1-D10 + B's D1-D9 + DA-1 through DA-4) | Single Mac-decision sheet |
| 21. Verification protocol | A (§13) + B (§K) | Combine |
| 22. Build sequence | A (§15) | A's step-by-step; B delegates to plans |

**Output**: a single ~1400-line spec that the next session (Plan F1 architecture lock + Plan F2 build) executes against. Both source docs marked as **SUPERSEDED** with cross-refs.

---

## 7. Verdict + path forward

**Verdict**: B is the BETTER FRAMEWORK (Critical Discoveries grounded in live evidence; structural IA locks; portfolio integration; disagreement framing). A is the BETTER DETAIL (Apple HIG citations; scenario depth; sensor enumeration; user flows; edge cases; code snippets). They are complementary, not competing.

**Path forward** (3 phases, Mac confirms each):

### Phase X — Mac resolves the 4 disagreements (DA-1, DA-2, DA-3, DA-4)
Mac's call. Effort: 10-20 minutes of his attention. Output: 4 decisions captured.

### Phase Y — Merge the docs into a single authoritative spec
Effort: 1-2 hours of Claude work. Output: `docs/plans/tunet-interaction-architecture-FINAL-2026-05-23.md`. Source docs marked SUPERSEDED with rationale.

### Phase Z — Plan F1 architecture lock (Mac stamps decisions D1-D10 + DA-1 through DA-4)
Per portfolio roadmap. Output: build-ready spec; Plan F2 begins.

---

## 8. Decisions Mac needs to make NOW (before Phase Y)

| # | Decision | A's position | B's position | My cross-review recommendation |
|---|---|---|---|---|
| DA-1 | Tap region: split (icon-toggle vs name-detail) OR whole-body (tap=popup) | split | whole-body | **whole-body for row variant; split for tiles/light_tile/speaker_tile** |
| DA-2 | Long-press: redundant path to detail sheet OR deprecated | redundant | deprecated | **falls out of DA-1: if whole-body wins → deprecated; if split wins → redundant** |
| DA-3 | Adaptive: own page OR collapsed into Stats | own page | collapsed into Stats | **collapsed** (4-item nav is HIG-correct at 390px) |
| DA-4 | Weather + Lighting on Home: keep vs remove | remove both | keep both | **remove both** (rooms-card already exposes lighting; weather is low-frequency) |

Mac's answer to these 4 unblocks Phase Y.

---

## 9. Risk this cross-review surfaces

The fact that two parallel planning efforts produced **substantially overlapping but materially disagreeing specs in the same 24-hour window** is itself a process signal. Two separate Claude sessions iterated with Mac, both came away with comprehensive but slightly different specs.

**Implication**: when planning at this scope, **launching planning effort in parallel with another planning effort risks divergence even when both agents have the same source material**. The cross-review is therefore not waste — it's the merge step that has to happen anyway when parallel planning produces parallel specs.

**Process recommendation for future Mac sessions**: when about to start a major planning effort, FIRST grep for existing in-repo plan files matching the topic. Both my opening (cosmos plan) and Mac's earlier session (interaction-spec) would have benefited from this check. The cross-review here is the correction.

---

## 10. End notes

This cross-review is itself an artifact in `docs/plans/`. It supersedes neither doc and proposes a merge that does.

**Status**: ready for Mac to read + decide DA-1/2/3/4 + authorize Phase Y merge.

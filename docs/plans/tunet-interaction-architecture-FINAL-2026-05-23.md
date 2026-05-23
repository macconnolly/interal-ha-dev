# Tunet Interaction Architecture — FINAL (Locked) Spec

**Created**: 2026-05-23 ~2:28am MDT
**Status**: AUTHORITATIVE. Supersedes the two source specs below for forward execution.
**Source docs** (kept for detail reference; do not edit independently):
- **Doc A** — `docs/plans/tunet-home-v2-interaction-spec-2026-05-23.md` (commit `2ce7e22`) — Apple HIG citations, 20-scenario adversarial, user flow walkthroughs, multi-modal control matrix, per-card edge case matrix, sensor enumeration, code-level fixes
- **Doc B** — `docs/plans/harmonic-bouncing-cosmos.md` (commit `7e67453`) — Critical Discoveries from live Playwright evidence, 4-alternative gesture matrix, IA back-stack/deep-link locks, tranche mapping with PA absorption, 5-app best-in-class, risk register
- **Cross-review** — `docs/plans/tunet-interaction-plans-cross-review-2026-05-23.md` (commit `651664f`) — bidirectional adversarial review that produced this merge

**Provenance convention used below**: `[A§X]` = adopt detail from Doc A section X. `[B§X]` = adopt detail from Doc B section X. `[FINAL]` = decided here, not in either source.

---

## 0. Mac-decision locks (DA-1 through DA-4)

These four disagreements between A and B were resolved by Claude in cross-review §8 with **defensible defaults Mac can override**. The defaults are encoded below as locks for forward execution. Mac says "override DA-N" → revisit.

| # | Decision | Default lock | Rationale | Mac override? |
|---|---|---|---|---|
| **DA-1** | Rooms-card tap region semantics | **Whole-body tap = popup** (B's position) for the `row` variant on Home. **Split tap (icon vs name)** for the `tiles` variant on Rooms list. | Row variant at 390px is gesture-dense; split adds confusion. Tiles are larger; split works. Apple Home pattern preserved where it fits. | ☐ |
| **DA-2** | Long-press behavior on rooms-card | **Deprecated** (no hold_action wired) for row variant. **Open detail sheet** for tile variant (redundant discoverability path with name-tap). | Falls out of DA-1. | ☐ |
| **DA-3** | Adaptive page | **Collapsed into Stats** as top-section (B's position) | 4-item bottom nav is HIG-correct at 390px; 6-item is sub-HIG. OAL is a sub-domain of Stats. | ☐ |
| **DA-4** | Weather + Lighting cards on Home | **Remove both from Home** (A's position) | Weather is low-frequency (→ Stats). Lighting is redundant with rooms-row already exposing per-room state (→ Rooms popups + subviews). | ☐ |

---

## 1. Apple-style interaction contract [A §1, §12.10]

**LOCK**:
- Tap on **icon** region = primary toggle / activate (single light → toggle; scene chip → activate; transport button → play/pause)
- Tap on **name/body** region = open detail sheet for that entity (room → room popup; light → more-info; media → expanded transport)
- Long-press 500ms = open detail sheet (same as name-tap) — **EXCEPT** for rooms-card row variant where hold is deprecated per DA-1/DA-2
- Drag = continuous value adjustment (brightness, volume, temperature setpoint)
- Pan inside a sheet = scroll content

Apple HIG values (cite when implementing):
- Tap target minimum: 44pt × 44pt → at our `:host { font-size: 16px }` anchor = 2.75em × 2.75em
- Gutter: 8pt = 0.5em
- Sheet open easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (easeOutBack)
- Safe area: `env(safe-area-inset-bottom)` mandatory on popups
- Press feedback: 0.05s ease on `transform: scale(0.97)`
- Long-press: 500ms (matches UIKit UILongPressGestureRecognizer.minimumPressDuration; Tunet uses 400ms today)

---

## 2. Scene model [A §2]

**LOCK**: 3-mode cycle (Adaptive / Evening / Late Night). Rename `scene.tunet_oal_dim_ambient_plus` → `scene.tunet_oal_evening`. Per-zone table per A §2.

ZEN32 B5 2x cycles: Adaptive → Evening → Late Night → Adaptive (already restricted in `zen32_cycle_oal_config`).

Out of scope this iteration: TV mode (Mac flagged: notifications broken, separate workstream).

---

## 3. Page taxonomy [merged A §3 + B §C.1 + DA-3]

**LOCK**: 5 pages + N popups + Settings via header gear.

| Page | URL | Purpose |
|---|---|---|
| Home | `/tunet-home-v2/home` | Glanceable status + scenes + rooms access + media mini-player |
| Rooms list | `/tunet-home-v2/rooms` | 5-room navigation grid (tiles variant) |
| Room subview × 5 | `/tunet-home-v2/<living-room\|kitchen\|dining-room\|bedroom\|office>` | Deep per-room control surface |
| Media | `/tunet-home-v2/media` | Sonos deep view + grouping + sources + queue |
| Stats | `/tunet-home-v2/stats` | HVAC + electricity + per-room sensors + **OAL adaptive sub-section (per DA-3)** + weather history |
| Settings | accessed via header gear icon (no nav slot) | OAL config + alarms + away mode + notifications + system actions |

**Popups** (all Bubble Card 3.2.1, declared in hidden `Popups` view):
- `#room-living-room`, `#room-kitchen`, `#room-dining-room`, `#room-bedroom`, `#room-office`
- `#media-living-room`
- `#oal-detail`
- `#climate-detail`
- `#alarm-edit-<id>` (× N alarms; migrated from Browser Mod)
- `#light-detail-<entity>` (DEFERRED to later tranche)

**Nav** [B §C.3]: 4-item bottom dock on phone (Home / Rooms / Media / Stats). Left rail on desktop (same 4 + Settings spillover).

---

## 4. Home composition (locked wireframe) [B §D.1 with DA-4 removals]

Top-to-bottom at 390x844:

```
Header (44px)                    Home  Stats              ⚙ gear
─────────────────────────────────────────────────────────────
Actions mode_strip compact       All On  All Off  Bedtime  Sleep
─────────────────────────────────────────────────────────────
Scenes strip (3 large chips)     Adaptive  Evening  Late Night
─────────────────────────────────────────────────────────────
Status home_summary 4x2          Adp Man Mode HVAC / Inside Outside Hum AQI
─────────────────────────────────────────────────────────────
ROOMS row variant (5 rooms)      with per-light semantic orbs + power + chevron
─────────────────────────────────────────────────────────────
Stats info_only HVAC row (4 tiles)   Heat Cool ΔHi ΔLo
─────────────────────────────────────────────────────────────
Inbox (conditional render)
─────────────────────────────────────────────────────────────
Media mini-player                Album art + title + transport + grouped indicator
─────────────────────────────────────────────────────────────
Bottom nav dock (60px)           [🏠 Home] [▦ Rooms] [♪ Media] [📈 Stats]
```

**DA-4 removals from Home**:
- Lighting card (was 3x2 OAL zone grid) → REMOVED. Per-room lighting accessed via rooms-row → popup or subview.
- Climate thin + Weather compact → REMOVED. Climate via status-tile-tap → `#climate-detail` popup. Weather → Stats page.

Full ASCII wireframe in [B §D.1].

---

## 5. Rooms-card row interaction (locked per DA-1) [B §F.1]

**LOCK**:
| Element | Tap | Hold | Drag |
|---|---|---|---|
| Row body | **Open `#room-<name>` popup** | (unused — DA-2 deprecated for row) | — |
| Per-light orb | Toggle that light (stopPropagation) | — | — |
| Power button | Toggle all room lights (stopPropagation) | — | — |
| Chevron (`›`) | Decorative; tap propagates to body = popup | — | — |

**Per-light orb defect (CD-1 from B)**: ICONS must be semantically different per light. YAML supplies `[{ entity, name, icon }]` (existing card capability); fallback policy in card uses entity-id heuristic if YAML omits.

---

## 6. Per-room popup composition [merged A §6 + B §F.4]

Bubble Card 3.2.1, `popup_mode: fit-content`, `bottom_offset: true`. Per-room contents:

| Room | Lighting | Quick actions | Sensors | Climate | Alarm |
|---|---|---|---|---|---|
| Living | 4 zones (Couch/Floor/Spots/Credenza) | All On / All Off / Brighter / Dimmer | Temp + Hum + Occ | — | — |
| Kitchen | 3 zones (Island/Main/Counter-Under) | All On / All Off / Cook / Dimmer | Hum + Occ | — | — |
| Dining | 2 zones (Spots/Column) | All On / All Off / Brighter / Dimmer | climate hero | YES (thin) | — |
| Bedroom | 3 zones (Main/Accent/Lamps) | All On / All Off / Sleep / Skip Tomorrow | Temp + Hum + Occ | — | YES (tunet-alarm-card) |
| Office | 2 zones (Desk/Bed) | All On / All Off / Brighter / Dimmer | Occ only | — | — |

All popups share: top chrome (icon + room name + ✕), bottom chrome (**Open Room** button → navigates to subview), dismissal (tap-outside / swipe-down / ✕).

---

## 7. Per-room subview template [A §7]

```
[← Back] <Room name> [⚙]
Lighting (large grid)
Per-room scenes (Brighter / Dimmer / OAL Reset / room-specific scene)
Climate (if room has thermostat)
Sensors (rich 4-tile w/ trend + sparkline)
Media (room-pinned speaker if applicable)
History (sparklines 24h)
Room settings
[bottom nav]
```

Per-room variations table in [A §7] + [B §D.3].

---

## 8. Media architecture [A §8]

**LOCK**:
- Home page: mini-player (compact transport + art + grouped indicator), tap → `#media-living-room` popup
- `#media-living-room` popup: full sonos-card + speaker-grid + group toggles + source switcher
- Media page (`/tunet-home-v2/media`): full sonos-card hero + favorites + queue (if MA active) + per-speaker grid + group all/ungroup all + source selector
- Critical media fixes per A §8: rename `media_player.office` (bedroom Sonos), Sonos+Spotify FF/RW routing fix via `selectTransportEntity` (A §12.5.10), remove orphan alarm-display sensors, add `binary_sensor.bedroom_sonos_healthy`

---

## 9. Stats page (with collapsed Adaptive per DA-3) [merged A §9 + A §10]

**LOCK**: ONE Stats page with anchored sub-sections:
- **Glance**: info_only / home_detail 4-col matrix (HVAC + drift + outside + inside)
- **HVAC today**: heating/cooling sparklines + cycle count + period toggle
- **Inside vs Outside**: line chart
- **Electricity**: per-circuit kWh (LR dimmer + master + future Shelly EM)
- **OAL Adaptive (Adaptive sub-section per DA-3)**: mode timeline + active overrides + zone baselines + environment + learning events

19 new sensors enumerated in [A §9 + A §10]:
- Stats package `tunet_stats_sensors.yaml`: outside_temperature, hvac_estimated_energy, utility_meter × 4, hvac_yesterday × 2, hvac_cycle_count, lights_yesterday × 2
- Zone snapshot `tunet_oal_zone_snapshot.yaml`: 8 per-zone baseline sensors extracted from `sensor.oal_real_time_monitor` attributes

---

## 10. Settings page [B §D.7]

`/tunet-home-v2/settings`. Sections:
- OAL config (active mode, boost, sensitivity, reset)
- Sonos alarms (system-wide management; per-alarm edit pops to `#alarm-edit-<id>`)
- Away mode (toggle)
- Notifications (TV mode debounce flag, inbox push)
- System actions (reload dashboard, HA configuration link, diagnostic dump)

---

## 11. Per-card variant matrix [merged A §11 + B §G]

| Card | Home variant | Rooms list | Room popup | Room subview | Stats | Notes |
|---|---|---|---|---|---|---|
| actions-card | mode_strip + compact | — | quick-actions 4-chip | quick-actions 4-chip | — | mode-aware highlights |
| scenes-card | strip (3-chip cycle) | — | room-scoped scenes | room-scoped scenes | — | 3-mode cycle |
| status-card | home_summary 4x2 | — | sensors compact row | rich 4-tile w/ trend | home_detail + info_only | 6 variants |
| rooms-card | **row** (5 rooms) | **tiles** (2x3 grid) | n/a | n/a | n/a | DA-1 split per variant |
| light-tile | (excluded per DA-4) | — | per-light tile if hold→#light-detail | per-light tile | — | DEFERRED light-detail popup |
| lighting-card | (excluded per DA-4) | — | large grid | large grid | — | — |
| climate-card | (excluded per DA-4) | — | thin (Dining only) | standard (Dining only) | — | Dining hosts thermostat |
| weather-card | (excluded per DA-4) | — | — | — | hourly + 5-day | — |
| sensor-card | (excluded) | — | compact row | rich + sparkline | sparklines + trend | — |
| media-card | mini-player (bottom) | — | — | room-pinned (where applicable) | — | tap → #media popup |
| sonos-card | (excluded; lives in popup + Media page) | — | YES in #media popup | — | — | deep transport |
| speaker-grid-card | (excluded; lives in popup + Media page) | — | YES in #media popup | — | — | cols:5 + group_actions |
| nav-card | bottom dock 4 items | bottom dock | (popups don't have nav) | bottom dock | bottom dock | Settings via header gear |
| inbox-card | conditional render | — | — | — | — | — |
| alarm-card | (excluded) | — | YES in #room-bedroom | YES in bedroom subview | — | Sonos alarms only in bedroom + Settings |

---

## 12. Bubble Card 3.2.1 limitations + acceptances [A §12.8]

Accept Bubble Card 3.2.1 as-is with `popup_mode: fit-content` + `bottom_offset: true`.

Known NOT-supported (defer to future tranche):
- Detent system (medium/large/half-sheet)
- Grabber/handle affordance
- Spring physics on open/close (uses ease)
- Drag-to-dismiss
- Multi-modal dismiss standard
- Width adaptive (only height)
- Sheet stack / pushed sheets

Mitigations: audit each popup's content for phone fit < 650px vertical; explicit ✕ close button; chevron affordance.

---

## 13. Adversarial review (20 scenarios) [A §12.5.1-§12.5.20]

All 20 scenarios from A apply unchanged. Spans: tap-during-scroll, slow network (optimistic + snapback), multi-touch slider corruption, voice/dashboard conflict, HomeKit external state, ZEN32 sync, HA restart mid-day, midnight history_stats reset, Bedroom Sonos drop, Sonos+Spotify FF/RW routing fix (with code snippet), multi-phone race, long-press cancel-on-drag, popup scroll-lock, entity unavailable in orb, stale optimistic state, tap-target HIG audit, popup content overflow, first-use discoverability, iPad-vs-iPhone-vs-laptop, WebSocket recovery.

---

## 14. User flow walkthroughs [A §12.6.1-§12.6.8]

All 8 walkthroughs from A apply unchanged: morning wake, cooking, movie night, bedtime, late-night kitchen run, returning home, troubleshooting, checking stats.

---

## 15. Multi-modal control matrix [A §12.7]

The full Dashboard × ZEN32 × Voice × HomeKit × Auto matrix from A applies unchanged. Every primary control has at least 2 invocation paths.

---

## 16. Per-card-position edge case matrix [A §12.9]

The unavailable / unknown / null / tap-anyway handling table from A applies unchanged. Pattern: never blank space; always SOMETHING; if truly empty, hide the row.

---

## 17. IA: nav graph + back-stack + deep-link [B §C.4, §C.5]

**Back-stack semantics**:
| From | Back |
|---|---|
| Popup | dismiss (tap-outside / swipe-down / ✕) → underlying view |
| Subview via popup "Open Room" | Back → Home (popup already dismissed) |
| Subview via Rooms list tile | Back → Rooms list |
| Subview via URL deep-link | Back → Home (default upstream) |
| Media / Stats / Settings page | Back → Home |
| Nested popup (e.g., #light-detail from subview) | Back → Subview |

**Deep-link entry behavior**:
| URL | Behavior |
|---|---|
| `/tunet-home-v2/home` | Home renders |
| `/tunet-home-v2/home#room-bedroom` | Home + Bedroom popup |
| `/tunet-home-v2/home#oal-detail` | Home + OAL popup |
| `/tunet-home-v2/room-bedroom` | Bedroom subview direct |
| `/tunet-home-v2/rooms` | Rooms list |
| `/tunet-home-v2/media` | Media page |
| `/tunet-home-v2/stats` | Stats page |
| `/tunet-home-v2/settings` | Settings page |

---

## 18. Risk register classified [B §J]

Subtle / catastrophic / user-eye-required / external-dependency split from B applies unchanged.

---

## 19. Apple best-in-class 5-app comparison [B §B]

Apple Home (rooms-first, tap=sheet, gear=page, big numerics) + Sonos S2 (now-playing mini-player + tabs) + Nest Hub (ambient glance) + Tesla mobile (subsystem pages + quick actions) + Spotify (rejected: media library complexity not needed for Tunet). Adoption matrix per B §B.

**Single highest-impact change**: Sonos as persistent mini-player on Home (Apple Music pattern) — locked per §4.

---

## 20. Tranche mapping to Plans A-F + PA absorption [B §H]

**PA framework** (PA01-PA11 from `tunet-page-architecture.md`): **CLOSE as "absorbed into Plan F surface assembly"** at Plan F1 architecture lock.

**Per-tranche additions surfaced**:
- Plan A: + popup smoke test + 68-orphan cleanup + light-groups audit
- Plan E: + LIVE-1 (rooms-card per-light icon fallback hardening) + MEDIA-3 (volume debounce flush)
- **NEW**: `media-defect-triage-2026-05-23.md` sub-plan splitting MEDIA-1/2/3 + bedroom-silent-fire + orphan cleanup

**Critical path**: T0 Plan A → T1 Plan B → T2 Plan C → T3 Plan D / Plan E parallel / Media triage parallel → T4 Plan F1 → T5 Plan F2-3 → T6 Plan F4 → T7 cutover.

---

## 21. Decision matrix for Mac

Combined from A §14 (D1-D10) + B §I (D1-D9 + P + F) + this doc (DA-1/2/3/4).

**Blocking** (must decide before Plan F1 starts):
| # | Question | Default lock | Mac confirm/override |
|---|---|---|---|
| DA-1 | Rooms-card tap region | whole-body for row; split for tiles | ☐ |
| DA-2 | Long-press on rooms-card | deprecated for row; redundant for tile | ☐ |
| DA-3 | Adaptive page | collapsed into Stats sub-section | ☐ |
| DA-4 | Weather + Lighting on Home | both removed | ☐ |
| D1 | Scene count | 3 (Adaptive / Evening / Late Night) | ☐ |
| D2 | Evening per-zone values | as drafted in A §2 | ☐ |
| D3 | Tap=popup; subview via popup button | (locked) | ☐ |
| D4 | 5 per-room subviews built | YES | ☐ |
| D5 | Stats page exists | YES; Adaptive collapsed inside (DA-3) | ☐ |
| D6 | 19 new sensors authorized | ✓ pre-approved 2026-05-23 | ✓ |
| D7 | Sonos+Spotify FF/RW MA routing fix | YES | ☐ |
| D8 | Cut over /tunet-overview → /tunet-home-v2 | Parallel-run first; cutover gated on M3 + Mac awake to grade ≥30min | ☐ |
| D9 | Detent sheet primitive | DEFER to future tranche | ☐ |
| D10 | TV mode debounce | OUT OF SCOPE this iteration | ☐ |

**Per-tranche** (decide at tranche kickoff): per [A §14] + [B §I.2].

**Deferrable** (figure out during execution): per [B §I.3].

---

## 22. Verification protocol [merged A §13 + B §K]

10-step end-to-end test sequence:
1. Sensor verification (all 19 new sensors return values via MCP ha_get_state)
2. Scene verification (3 cycle scenes; per-zone brightness matches expected)
3. Media transport verification (M5 fix; Spotify skip routes to MA entity)
4. Popup verification (each #hash opens, fills, dismisses cleanly)
5. Production-mirror capture (`npm run tunet:review:share --target production --breakpoint 390x844,1440x900 --theme light,dark`)
6. Adversarial test cases (tap-during-scroll, hold cancel, optimistic state)
7. Stats page verification (HVAC sensors populate; graph renders)
8. Adaptive sub-section verification (per-zone brightness; override countdown; Reset fires script)
9. HomeKit verification (3 OAL scenes in Apple Home; Siri commands)
10. Mac M1 review block + explicit "ship it" stamp before push + cutover

---

## 23. Build sequence (post-approval) [A §15]

1. Create 3 new packages (stats sensors, OAL zone snapshot, room scripts)
2. Edit OAL package (rename Dim Ambient Plus → Evening; refine per-zone values)
3. Edit Sonos package (remove orphan alarm sensors; add bedroom-healthy sensor)
4. Deploy packages + restart HA
5. Edit card code (media transport routing fix; rooms-card chevron; status pills if A's variant wins)
6. Build cards + deploy: `npm run tunet:deploy:lab`
7. Rewrite `tunet-home-v2-config.yaml` per locked composition
8. Add 5 per-room subview YAMLs (or sections within main config)
9. Add Stats subview YAML
10. Deploy: `npm run tunet:deploy:dashboards:storage --dashboard tunet-home-v2`
11. Production-mirror capture (M1 evidence step)
12. Mac grades on iPhone
13. Iterate per Mac's feedback
14. Mac stamps "ship it"; push to origin/main
15. Cutover from /tunet-overview to /tunet-home-v2 (gated per D8)

Estimated effort: ~6-10 hours of execution + Mac's review gates + ~30-50h for the full Plans A-F portfolio.

---

## 24. What's authoritative going forward

This document is the FINAL spec. When Doc A or Doc B has conflicting content, FINAL wins. When Doc A or Doc B has detail not in FINAL (e.g., A's user flow walkthroughs verbatim), FINAL incorporates by reference (`[A §X]`).

When governance docs (`plan.md`, `FIX_LEDGER.md`, `handoff.md`) reference the interaction architecture, they link here.

When the cross-review (`tunet-interaction-plans-cross-review-2026-05-23.md`) raises DA-1/2/3/4, this doc's §0 is the lock.

When Mac overrides any DA-N or D-N, this doc updates and source docs A/B are NOT updated (provenance preserved).

---

## 25. Status & next action

**Status**: ALL FOUR DA decisions locked with defensible defaults. ALL D1-D10 decisions either locked or marked pending Mac confirm.

**Next action**: Plan A execution (Bubble Card 3.2.1 upgrade prerequisite check). See `docs/plans/tunet-foundation-cleanup-2026-05-23.md`.

**Mac can override** any DA or D decision at any time. Override = update this doc + cascade to affected build steps. Source docs A and B remain frozen as historical artifacts.

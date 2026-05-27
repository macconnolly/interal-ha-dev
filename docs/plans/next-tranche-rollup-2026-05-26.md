# Next Tranche Rollup — Media Reliability + Stats/Adaptive + Navbar Polish

**Created**: 2026-05-26
**Master plan parent**: `docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md` (T1.6) + `docs/plans/tunet-home-v2-interaction-spec-2026-05-23.md` (Plan F)
**Authority**: this is a planning roll-up — each tranche below needs its own line-level plan + adversarial review before implementation, following the T8.1 pattern that just shipped.

Three independent tranches Mac selected for next planning cycle, ranked here by daily-impact-to-effort ratio:

---

## Tranche M (Media Reliability) — XS-S, highest-frequency daily wins

### Sub-tranche M.1 — Sonos+Spotify transport routing (M5 root cause shipped to plan F §8)
**Defect**: tap next/prev on `media_player.living_room` (native Sonos) when Spotify is the source → service call rejected by Sonos integration because Spotify owns the queue → no state change, looks broken.
**Fix shape**: in `tunet_media_card.js` AND `tunet_sonos_card.js`, route `_callTransport` to the MA shadow entity (`<room>_2` suffix) when source detection shows Spotify. Plan F §12.5.10 has the exact JS snippet (`selectTransportEntity()` helper).
**Owning files**:
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js` (`_callTransport` method)
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js` (`_callTransport` method)
**Effort**: ~30 min implementation + M1 capture confirming skip actually works on Spotify+Sonos sources
**Dependencies**: needs Mac to physically verify with Spotify playing in living room
**Open decision**: should `_callTransport` route ALL transport (play/pause/seek too) to MA when Spotify is source, OR only skip/prev? Conservative answer: only skip/prev since that's the documented rejection vector; play/pause works on either entity.

### Sub-tranche M.2 — Volume slider debounce flush/cancel (observation #12460)
**Defect**: drag the volume slider → debounced 100-300ms service call queue → finger lifts (pointerup) BEFORE the debounce timer fires → service call lost. User has to drag again. Same bug on pointercancel.
**Fix shape**: in `_volumePointerUp` and `_volumePointerCancel` handlers, FLUSH any pending debounced write (force-execute immediately on release) instead of letting it expire.
**Owning files**:
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
**Effort**: ~45 min implementation; need to read the debounce implementation to know what "flush" pattern fits
**Dependencies**: none
**Open decision**: same flush behavior on pointercancel (e.g., browser interrupt mid-drag) OR only on intentional pointerup? Likely flush on both; cancel typically means "interruption" not "discard."

### Sub-tranche M.3 — Bedroom Play:3 silent-fire detection sensor (memory `project_bedroom_sonos_alarm_silent_fire_pattern`)
**Defect**: bedroom Sonos can enter a degraded state where alarm-fire telemetry shows full 60-min playing sequence but produces NO audio. Same device + same buzzer URI via `media_player.play_media` DOES produce audio. HA cannot observe actual audio output — only Mac's ear closes that loop.
**Fix shape**: add `binary_sensor.bedroom_sonos_healthy` template that flips off when `media_player.bedroom` is unavailable >5min. Wire to a notification + dashboard "device offline" badge in tunet-alarm-card. NOTE: this does NOT detect the silent-fire pattern itself (no telemetry exposes it) — it only detects the unavailability that PRECEDES silent-fire most of the time.
**Owning files**:
- `packages/sonos_package.yaml` (new template binary_sensor)
- `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` (badge render for unhealthy state)
**Effort**: ~1h implementation (sensor + card badge + notify automation)
**Dependencies**: none
**Open decision**: notification verbosity — silent push only when next alarm is within X hours? Or always? Conservative: notify when speaker goes unavailable AND next alarm is within 8 hours.

### Tranche M overall
- Sequencing: M.1 → M.2 → M.3 (M.1 is the most-touched daily, M.3 is the safety net)
- Risk: low; all three are scoped to specific files with clear root causes
- M1 capture: M.1 + M.2 need live media testing; M.3 needs simulated unavailable state (disable speaker integration briefly)
- Estimated total: 2-3 hours implementation + verification

---

## Tranche N (Navbar Polish) — S, daily-glance + visual identity

### Current navbar state (read from `tunet-home-preview-config.yaml` lines 57-120)
- lovelace-navbar-card v1.6.0, anchor `&nav_card` at line 63
- Desktop: floating mode bottom, min_width 768, show_labels true
- Mobile: docked mode
- media_player widget: 5 Sonos speakers, album_cover_background true, desktop_position bottom-center, always rendered
- Styles: midnight navy `rgba(30,41,59,0.72)` + `backdrop-filter: blur(20px)` + amber primary + 22px radius
- Routes: Home / Rooms (popup submenu 5 rooms) / Stats / Settings

### Sub-tranche N.1 — Apple Liquid Glass styling
**Goal**: shift navbar surface from current "midnight navy semi-transparent + 20px blur" to iOS 26 Liquid Glass aesthetic.
**Fix shape**: rewrite the `styles:` block on the navbar with:
- `backdrop-filter: blur(40px) saturate(180%)` (heavier blur + saturation boost — the Apple Liquid Glass signature)
- Background as a multi-stop gradient with low-opacity light overlay over the navy base, suggesting a curved-glass refraction
- Border: `1px solid rgba(255,255,255,0.18)` top-edge for highlight + `inset 0 1px 0 rgba(255,255,255,0.08)` for the inner sheen
- Optionally a subtle gradient fade at the long edges (left/right) for depth
**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` (anchor block lines 83-91)
**Effort**: ~30 min styling + iterative M1 capture comparison
**Open decision**: dark-mode-only Apple Glass, OR also redesign light-mode? Tunet currently has both. Recommend dark-mode-first (Mac's daily-use mode per memory `bubble_card_sub_buttons` — actually that's not relevant; the dark-blue glass preference is recorded in MEMORY.md). Light-mode can follow same pattern with white-tinted glass.

### Sub-tranche N.2 — Conditional media player widget
**Goal**: media_player widget appears in navbar only when something is actively playing. When idle/paused/off, the navbar shows the route tabs without the player chrome.
**Fix shape**: lovelace-navbar-card v1.6.0 supports `template:` jinja conditions on routes — need to verify if same works on the `media_player:` block. Two paths:
- (a) Wrap the navbar in a `conditional` card that swaps between full-navbar (with media) and slim-navbar (without) based on `media_player.<coordinator>.state == 'playing'`. Requires two anchor definitions.
- (b) Use navbar-card's native `template:` if it supports media_player block visibility. Need to test or read source.
**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` (anchor restructure)
**Effort**: ~1-1.5h depending on which path works. (a) is the safer fallback.
**Open decision**: coordinator entity for "playing" detection. Currently 5 Sonos players; ANY-playing means navbar shows player widget. Use `sensor.sonos_smart_coordinator` if it tracks coordinator-of-active-group, OR a template binary_sensor that ORs across all 5 players. Recommend a new template `binary_sensor.tunet_any_media_playing` for clarity.

### Sub-tranche N.3 — Navigation flow improvements (Mac articulated 2026-05-26)
**Mac's specific friction**:
1. **Rooms popup submenu doesn't work** — tap Rooms tab → submenu doesn't reveal the 5 rooms. Either the popup binding is broken or the lovelace-navbar-card popup primitive isn't behaving as documented. Needs DOM inspection at runtime to determine if it's a config issue (anchor not wired correctly), CSS issue (popup hidden under another z-index), or a v1.6.0 capability gap.
2. **Active-tab indicator improvement** — the current active-tab styling (whatever it is) isn't crisp enough. Likely solutions: amber-fill background OR animated underline OR both. Need to capture current state first to baseline what's there.

**Out of scope for N.3 (Mac noted as later separate scope)**:
- A unified per-room lights page with EVERY light organized by room for granular control in one place. This is a substantial NEW dashboard surface that would replace the lighting card on home view OR add a 5th nav tab "Lights." Belongs as a future tranche of its own, scoped after Tranche S lands.

**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` (nav_card anchor styles + routes)
- Possibly the HACS lovelace-navbar-card source if popup submenu is a card-level gap

**Effort**: 1h investigation (DOM inspection of Rooms submenu + current active-tab CSS) + 30-60 min implementation depending on root cause

**Open decision**: if Rooms popup submenu is a navbar-card capability gap (not a config bug), do we (a) work around with a separate Bubble popup approach, (b) accept the submenu doesn't work and convert Rooms to a flat route to a Rooms-index page, or (c) fork navbar-card to fix? Recommend (b) for v1 (simplest), then revisit if Mac wants the popup-style submenu specifically.

### Tranche N overall
- Sequencing: N.1 (Apple Glass) → N.2 (conditional media) → N.3 (nav flow, after Mac clarifies)
- Risk: low for N.1, medium for N.2 (depends on navbar-card capabilities), depends-on-scope for N.3
- M1 capture: N.1 needs both breakpoints + both modes (idle and playing) to confirm glass works under varying conditions. N.2 needs playing AND idle states to verify the conditional swap. N.3 TBD.

---

## Tranche S (Stats + Adaptive Pages Buildout) — M-L, net-new daily value

This is the heaviest tranche. Plan F §9-10 authorizes 19 new template sensors and 2 new dashboard pages. Significant scope. Split into 4 sub-tranches.

> **Naming normalization (2026-05-26 evening)**: the "S.1" originally scoped here shipped as commit `c8c2ac0` with scope re-defined (sub-agent inventory revealed most of the 19 originally-listed sensors already existed; actual gap was 30+ values buried in `sensor.oal_real_time_monitor` attributes + 5 climate-attribute extractions). A SEPARATE follow-on shipped as commit `1a8a689` ("S.2 OAL zone status hybrid overhaul" — 17 new entities for graphable status + HVAC estimated energy + lights_on polish). That commit is **different scope** from the Stats-page tranche originally numbered S.2 below — naming collision. Renamed below: rollup `S.2` → `STATS.1` (Stats page composition), rollup `S.3` → `ADAPTIVE.1` (Adaptive page composition), rollup `S.4` → `ADAPTIVE.2` (Adaptive navbar route exposure). The shipped S.1/S.2 commits retain their git-history names; the rollup uses STATS.x / ADAPTIVE.x for the unshipped page composition work to avoid future confusion.

### Sub-tranche S.1 — Sensor package (Plan F §9 + §10) — SHIPPED `c8c2ac0`, scope re-defined
**Goal**: ship the 19 new template sensors so subsequent dashboard work has live data.
**New sensor inventory**:
- `sensor.outside_temperature` (numeric wrap of weather.home temperature)
- `sensor.hvac_estimated_energy_today` (heating_min × kW + cooling_min × kW)
- 4 utility_meter dailies (LR lights, master lights, HVAC heating, HVAC cooling)
- `sensor.hvac_heating_yesterday` + `sensor.hvac_cooling_yesterday` (history_stats)
- `sensor.hvac_cycle_count_today` (off→on edge counter)
- `sensor.living_room_lights_yesterday` + `sensor.master_lights_yesterday`
- 8 per-zone OAL brightness sensors (extract from sensor.oal_real_time_monitor attributes)
**Owning files**:
- `packages/tunet_stats_sensors.yaml` (new file, 11 sensors)
- `packages/tunet_oal_zone_snapshot.yaml` (new file, 8 sensors)
**Effort**: 2-3h sensor package + HA restart + validation each returns live values
**Open decision**: heating kW + cooling kW values for `hvac_estimated_energy_today` — Mac needs to fill in the actual furnace + AC kW ratings. Acceptable to ship with placeholder values (e.g., 30 kW heating, 3.5 kW cooling) and have Mac refine later.

### Sub-tranche STATS.1 — Stats page composition (was rollup S.2; renamed 2026-05-26)
**Goal**: build `/tunet-home-preview/stats` view per Plan F §9 wireframe.
**Sections**:
- HVAC today (heating/cooling minutes, cycles, current state) + bar chart
- Inside vs outside (line chart over 24h + delta)
- Electricity (per-circuit kWh + total)
- Weekly comparison (heating/cooling deltas + 7-day mini chart)
**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` (stats view)
- Possibly a new tunet card or use mini-graph-card + native sensor cards
**Effort**: 2-4h composition depending on whether we build a new tunet-stats-card OR compose from existing primitives
**Open decision**: build a bespoke `tunet-stats-card` (cleaner, matches design language, more work) OR compose Stats page from mushroom-template-card + mini-graph-card + native sensor cards (faster, less polished)? Recommend the composition path first, see if Mac wants bespoke after using it.

### Sub-tranche ADAPTIVE.1 — Adaptive page composition (was rollup S.3; renamed 2026-05-26)
**Goal**: build `/tunet-home-preview/adaptive` view per Plan F §10 wireframe.
**Sections**:
- Mode timeline today (stacked bar of minutes per OAL mode)
- Active overrides list with reset button per override
- Zone baselines live (8 zones, brightness % bar)
- Environment summary (sun elevation, color temp avg, env boost)
- Learning log link
**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` (adaptive view)
**Effort**: 2-3h depending on whether timeline visualization needs a custom card
**Open decision**: mode timeline visualization — HA's `history-graph` card can show input_select state over time, but it's ugly. Build a tunet-oal-timeline-card OR accept the native ugly? Recommend native first, refine if Mac dislikes.

### Sub-tranche ADAPTIVE.2 — Navbar route exposure (was rollup S.4; renamed 2026-05-26)
**Goal**: add Adaptive to navbar routes (currently Stats + Settings; Adaptive is missing).
**Owning files**:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` nav_card anchor
**Effort**: ~10 min YAML
**Depends on**: ADAPTIVE.1 (page must exist before route exposes it)

### Tranche S overall
- Sequencing: S.1 (sensors — SHIPPED) → STATS.1 (Stats page) AND ADAPTIVE.1 (Adaptive page) in parallel → ADAPTIVE.2 (navbar exposure last). Both STATS.1 + ADAPTIVE.1 are **BLOCKED on L1** per Mac's 2026-05-26 direction (don't wireframe Stats consumers against drifted room-group infrastructure).
- Risk: medium — sensor templates can have validation issues at HA restart; mini-graph-card may not render gracefully for some sensor types
- M1 capture: both pages × both breakpoints after each sub-tranche
- Estimated total: 6-10 hours implementation across 2-3 sittings

---

## Proposed Sequencing

If Mac wants to maximize daily-life return-on-time:

1. **Tranche M.1** (Sonos+Spotify FF/RW routing) — 30 min, every Sonos+Spotify session benefits immediately
2. **Tranche M.2** (Volume debounce) — 45 min, every volume drag benefits immediately
3. **Tranche N.1** (Apple Glass navbar) — 30 min, every glance benefits immediately
4. **Tranche N.2** (Conditional media in navbar) — 1-1.5h, removes visual clutter when idle
5. **Tranche M.3** (Bedroom silent-fire sensor) — 1h, safety net for alarm reliability
6. **Tranche S.1** (Sensor package) — SHIPPED `c8c2ac0` (scope re-defined per sub-agent inventory)
7. **Tranche STATS.1 + ADAPTIVE.1** (Stats + Adaptive pages) — 4-7h combined, net-new visibility — **BLOCKED on L1**
8. **Tranche N.3** (Nav flow refinement) — TBD effort, after Mac articulates specific friction
9. **Tranche ADAPTIVE.2** (Navbar route exposure) — 10 min, after ADAPTIVE.1 ships

Total daily-impact time investment to reach end-state: ~10-15 hours across 3-5 sittings, with each tranche shippable independently.

---

## What This Plan Is NOT

- NOT a Plan F v2 cutover. Mac's "Production cutover decision" option was not selected this round. The work in tranches M / N / S all happens on `/tunet-home-preview` and stays parallel-run with `/tunet-overview`.
- NOT a polish-defects sweep (the "Visible defect cleanup" option). Weather AAAAAA placeholder + compressed temps + inbox card defects remain backlog; can fold into δ-polish tranche after M/N/S land.
- NOT additional OAL or HVAC scene/automation work. OAL Campaign B/C and bed-lights deep-amber phases remain separate workstreams owned by other plans.

---

## Awaiting

Mac's stamp on:
- (a) sequencing — recommended M.1 → M.2 → N.1 → N.2 → M.3 → S.1 → S.2+S.3 → N.3 → S.4
- (b) any specific friction in Tranche N.3 (nav flow) so it can be scoped
- (c) which sub-tranche to plan in v5-quality line-level detail first

Once stamped, the chosen sub-tranche gets its own focused plan with adversarial review pass before implementation, per the T8.1 pattern.

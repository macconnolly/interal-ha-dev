# Tunet New Production Dashboard — Plan F

**Portfolio**: see `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
**Owner**: Mac, executed via `/claude-mem:do`
**Tranche tag**: γ-surface / new production dashboard
**Depends on**: Plans A (Bubble Card 3.2.1), B (sensors), C (scenes), D (HomeKit if exposing scenes), E (cards hardened)
**Estimated effort**: 12-20 hours

## Intent

Build a net-new storage-mode dashboard that:
- Uses Bubble Card 3.2.1 standalone popups for rich room and media drill-down
- Composes all 15 Tunet cards in a deliberate Sections-grid layout (or panel; decision below)
- Defines the **detailed interaction layer** for every card type — what tap, hold, drag does
- Surfaces the new sensors from Plan B (HVAC graphs, per-room data)
- Surfaces the new OAL mode + 3-scene cycle from Plans B + C
- Optionally exposes HomeKit-curated entities/scenes for cross-device parity
- Uses the existing `tunet-overview-storage-config.yaml` as inspiration but goes deeper

## Required reading

1. `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
2. `/home/mac/HA/implementation_10/CLAUDE.md` — M1-M7
3. `/home/mac/HA/implementation_10/Dashboard/Tunet/AGENTS.md` §7B (Sections design workflow) + §7C (surface-by-surface standardization)
4. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md` — per-card contract
5. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/sections_layout_matrix.md` — sizing model
6. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_hierarchy.md` — 4-layer model
7. `/home/mac/HA/implementation_10/Dashboard/Tunet/Mockups/design_language.md` — tokens + interactions
8. `/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-overview-storage-config.yaml` — the inspiration baseline
9. `~/.claude/plans/tunet-page-architecture.md` — EXISTING architecture sub-plan (PA02-PA10 tranches scoped)
10. Plans A-E completion artifacts

## Pending Mac decisions before Phase F starts

(Referenced in roadmap; required for plan execution.)

1. **`tunet-overview` vs `tunet-home` URL** — cut over to `/tunet-home`, keep `/tunet-overview`, or parallel-run?
2. **Rooms card interaction lock revision** — Mac said "On the rooms card, open the wider rooms popup." This may revise the 2026-05-04 lock (tap=toggle, hold=subview). Options:
   - (a) Revert: tap = popup, hold = subview
   - (b) Keep tap=toggle, hold=popup (and remove subview), per Mac's latest direction
   - (c) Keep tap=toggle, hold=subview, ADD a chevron icon for popup
3. **Sections vs Panel mode** — current production is `panel`; AGENTS.md §7B mandates Sections for the new dashboard. Confirm Mac wants Sections.

## Phase F1: Architecture decisions sub-plan

**Goal**: Resolve the open decisions before any composition lands.

**Steps**:

1. **Cut-over URL**: Mac picks. Document in `Dashboard/Tunet/Docs/visual_defect_ledger.md` Global section.

2. **Rooms interaction lock**: Mac picks. Update `Dashboard/Tunet/AGENTS.md` § Locked Direction Rules AND any memory entries that cite the 2026-05-04 lock. If the lock is reversed, document the WHY (Mac's preference 2026-05-23) so future agents don't re-litigate.

3. **Sections vs Panel**: Mac picks. If Sections (recommended per AGENTS.md §7B):
   - Define `max_columns` (likely 4 for desktop, with phone collapsing to 1).
   - Define `dense_section_placement` (false for orchestration clarity).
   - Sketch section sequence + column_span per section.

4. **Lock the breakpoint behavior**:
   - 390x844 (iPhone): single column, vertical scroll
   - 768x1024 (iPad portrait): 2 columns
   - 1024x1366 (iPad landscape / desktop): 3-4 columns
   - 1440x900 (desktop): 4 columns

**Commit**: `docs(tunet): lock Plan F architecture decisions — URL, rooms interaction, sections mode, breakpoint matrix`.

---

## Phase F2: Per-card interaction contract design

**Goal**: For every card, define EXACTLY what tap/hold/drag does, where popups go, and what's inline vs subview.

Use this contract table as the design artifact. Mac reviews + locks before implementation.

| Card | Tap (single) | Hold (400ms) | Long-press (800ms+) | Drag | Popup contents (if any) |
|------|---|---|---|---|---|
| **tunet-actions-card** chip | Execute service | n/a | n/a | n/a | n/a |
| **tunet-scenes-card** chip | Activate scene | More-info on scene entity | n/a | n/a | n/a |
| **tunet-status-card** tile (value/dropdown) | More-info or `tap_action` override (e.g., nav) | More-info | n/a | n/a | n/a |
| **tunet-light-tile** | Toggle | More-info | n/a | Brightness adjust (after hold gate) | n/a |
| **tunet-lighting-card** zone tile | Toggle zone | More-info on zone | n/a | Brightness (after hold gate) | n/a |
| **tunet-lighting-card** info tile | More-info | n/a | n/a | n/a | n/a |
| **tunet-rooms-card** tile | (Mac decides Phase F1) | (Mac decides) | (Mac decides) | n/a | **Wider Rooms Popup** — see below |
| **tunet-climate-card** | More-info | n/a | n/a | Thumb drag → instant adjust | n/a |
| **tunet-weather-card** | More-info | n/a | n/a | n/a | n/a |
| **tunet-sensor-card** row | More-info | n/a | n/a | n/a | **Optional: Sensor Graph Popup** — see below |
| **tunet-media-card** transport | Action (play/pause) | n/a | n/a | Volume drag | **Media Popup** — see below |
| **tunet-media-card** art | More-info on media_player | n/a | n/a | n/a | (same media popup) |
| **tunet-sonos-card** | (mobile-vs-desktop variant) | n/a | n/a | Volume drag | (same media popup or sonos-specific) |
| **tunet-speaker-grid-card** speaker tile | Select active speaker | More-info | n/a | Volume drag | Group-controls popup (existing) |
| **tunet-nav-card** chrome | Navigate | n/a | n/a | n/a | n/a |
| **tunet-inbox-card** item | Item action | More-info | n/a | n/a | n/a |
| **tunet-alarm-card** row | Toggle alarm | Edit popup (existing Browser Mod exception per AGENTS.md §3) | n/a | n/a | Alarm edit popup |

### Popup contents (design specs)

**Wider Rooms Popup** (`#room-<name>` per Bubble Card 3.2 hash routing):
- Header: room name + close
- Lights section: full `tunet-lighting-card` (room-specific zones)
- Climate section: `tunet-climate-card` if room has climate (Dining Room only today; future rooms add)
- Sensors section: temperature, humidity, lux, occupancy — per-room sensor card
- Media section: room speakers via `tunet-speaker-grid-card` filtered
- Scenes section: scene chips relevant to room
- Mode: `fit-content` (Adaptive height); bottom-offset enabled (Tunet nav-card aware, NEW in 3.2.1)

**Media Popup** (`#media-<player>`):
- Header: now-playing track + close
- Transport: large play/pause/next/prev (transport buttons fixed per Plan E Phase 6)
- Volume: room slider + per-speaker grid
- Source selector: switch between Spotify / TV / Sonos line-in (if applicable)
- Queue: optional next-up list
- Mode: `fit-content`

**Sensor Graph Popup** (`#sensor-<entity>`):
- Header: sensor name + current value
- Mini-graph: 24h trend
- Thresholds + alerts: from sensor card config
- Related sensors: e.g., for kitchen humidity, also show kitchen temp + ventilation if available
- Mode: `dialog` (centered)

**Steps**:

1. Mac reviews + locks the interaction contract table.
2. Update `Dashboard/Tunet/Docs/cards_reference.md` per-card sections to reflect any contract changes.
3. Document the popup specs in `Dashboard/Tunet/Docs/popup-specs.md` (NEW or update existing).

**Commit**: `docs(tunet): lock per-card interaction contract + popup composition specs for new dashboard`.

---

## Phase F3: Compose the new dashboard YAML

**Goal**: Build the new dashboard composition.

**Steps**:

1. Pick the source file location:
   - If cut-over to `/tunet-home`: write `Dashboard/Tunet/tunet-home-config.yaml` (REPLACE the current scaffolded version).
   - If keep `/tunet-overview`: edit `Dashboard/Tunet/tunet-overview-storage-config.yaml` IN PLACE.
   - If parallel-run: create new file alongside.

2. **Compose the overview view** (Sections mode):
   - Use the existing 8-card vertical-stack as inspiration BUT translate into Sections:
     - Section 1 (column_span 4): tunet-actions-card (mode_strip, compact) + tunet-status-card (Home Status, 4-col)
     - Section 2 (column_span 4): tunet-lighting-card (grid layout, 6 zones)
     - Section 3 (column_span 2): tunet-climate-card | Section 4 (column_span 2): tunet-weather-card
     - Section 5 (column_span 4): tunet-sensor-card (4 environmental sensors)
     - Section 6 (column_span 4): tunet-media-card (full transport)
     - Section 7 (column_span 4): tunet-speaker-grid-card (group affordances)
     - Section 8 (column_span 4): tunet-rooms-card (5 rooms — interaction per Phase F1 lock)
     - Section 9 (column_span 4): tunet-nav-card (chrome) — full-width

3. **Add the new HVAC sensor surface** from Plan B2: integrate `sensor.hvac_action_today_minutes_heating` etc. into the sensor-card OR a new dedicated HVAC card config.

4. **Add per-room subview pages** (one per room: living-room, kitchen, dining-room, bedroom, office):
   - Each is a separate Sections view inside the dashboard.
   - Composition per the page-architecture sub-plan (`~/.claude/plans/tunet-page-architecture.md`).

5. **Add Media subview page** for full media surface (composition per PA07 of the page-architecture plan).

6. **Add Info subview page** (if Mac wants it now, otherwise defer to Plan E Phase 9's `info_only` mode landing): graphable sensors, system status aggregations.

7. **Add Settings subview page**: OAL config overrides, alarm management, away mode (if Issue #3 lands).

8. **Add the Bubble Card 3.2.1 standalone popups** as top-level cards:
   - `#room-living-room`, `#room-kitchen`, etc. for each room
   - `#media-living-room`, `#media-kitchen` for each Sonos speaker
   - `#sensor-<entity>` for sensors Mac wants graphable popup access to

9. **Wire interactions** per Phase F2's contract:
   - Update each card's `tap_action` / `hold_action` / etc. to navigate to the right hash.

**Verification**:
- The new YAML parses cleanly.
- `node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --dry-run --dashboard <new>` confirms.

**Commit**: `feat(tunet): new production dashboard composition — sections grid + bubble card 3.2.1 popups + per-room subviews`.

---

## Phase F4: Deploy + production-mirror capture

**Steps**:

1. Push via `npm run tunet:deploy:dashboards:storage` (or yaml mode if Mac chose that).

2. Production-mirror capture at all 4 locked breakpoints, light + dark:
   ```bash
   npm run tunet:review:share -- --target production --breakpoint 390x844,768x1024,1024x1366,1440x900 --theme light,dark
   ```

3. HA push notify lands; Mac taps deep-link to grade.

4. Read each captured PNG into context (M1).

5. Produce the M1 review block with defect inventory.

6. Iterate per Mac's feedback. Each iteration: re-deploy, re-capture, re-grade.

**Verification**:
- Mac confirms the new dashboard meets quality bar at all breakpoints.
- All interaction contracts (Phase F2) work as designed.

**Commit**: per iteration; final iteration `feat(tunet): production dashboard final iteration — Mac graded ship-it`.

---

## Phase F5: Cut-over + governance close

**Steps**:

1. If cutting over from `/tunet-overview` to `/tunet-home`:
   - Update `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` — flip `production: true` to the new entry.
   - Update `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_tunet_dashboard_inventory.md`.
   - Update sidebar config in HA so Mac's primary view is the new dashboard.

2. Update governance docs:
   - `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` § Production target → new URL
   - `Dashboard/Tunet/Docs/visual_defect_ledger.md` → close all CD12 surface composition open items that landed
   - `Dashboard/Tunet/Docs/deploy_workflow_canary.md` → add canary entry for the new dashboard

3. Push to origin/main after Mac's explicit ship-it.

**Commit**: `docs(tunet): governance sync after new dashboard cutover (Plan F closed)`. Then `git push origin main`.

---

## Verification (Plan F overall)

- New dashboard live and graded by Mac on iPhone.
- All 15 Tunet cards compose per the contract.
- Bubble Card 3.2.1 popups work for rooms / media / sensors.
- Per-room subviews navigate correctly.
- HVAC + new sensors surface meaningfully.
- All interaction contracts hold across 4 breakpoints + light/dark.

## Out of scope

- Any new HA backend (Plans B, C handle).
- Any card-level hardening (Plan E handles).
- HomeKit (Plan D handles).
- Architecture-first sub-plan iterations (already in `~/.claude/plans/tunet-page-architecture.md`; this plan implements).
- Notification response page (CD12 implementation backlog, separate).
- Away Mode (Issue #3, separate).

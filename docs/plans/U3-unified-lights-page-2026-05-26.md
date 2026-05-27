# U.3 — Unified Lights Page + Lighting Strip Retention

**Created**: 2026-05-26 evening MDT
**Parent**: `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md`
**Authority**: focused line-level plan; gates through adversarial review before stamp.
**Surface**: NEW `/tunet-home-preview/lights` page + retain existing 6-zone Lighting strip on Home + extend navbar from 4 tabs to 5
**Scope shape lock**: **BOTH** per Mac 2026-05-26 — Home Lighting strip stays as overview; new Lights page provides full per-light deep control

---

## 1. Empirical Baseline

### Current lighting surfaces

- **Home Lighting strip** (yaml line 354): `tunet-lighting-card` with 6 functional zones (Living, Kitchen, Bedroom, Spots, Ceiling, Columns) at `columns: 2` with `column_breakpoints` for desktop. Glance-level overview. Mac confirmed this stays.
- **Per-room popups** (`#room-<name>`): each room's `tunet-lighting-card` shows that room's per-light tiles. Quick adjust from anywhere on Home.
- **Per-room subviews** (`/tunet-home-preview/<room>`): same room's lighting card with more detail + actions + sensors. Deeper control.
- **NEW Lights page** (`/tunet-home-preview/lights`): comprehensive per-room organized view of EVERY light with full granular control. Mac's stated friction surface.

### Why a 5th surface

Current scrolling pain: to control e.g. the office bed-left light, user must navigate Rooms → Office popup → Office subview → find Light Left tile. With U.3, user taps Lights tab in nav → see ALL lights organized by room → control directly without subview navigation.

This is the "every light organized by room for granular control in one place" Mac articulated.

### Navbar capacity check

Current navbar: 4 tabs (Home / Rooms / Media / Stats). At 390×844, each tab is ~97px wide — comfortable touch target. Adding 5th tab makes each ~78px — cramped but viable per iOS HIG 44pt minimum (78px > 44pt). At 1440 navbar is comfortable.

Per consolidated plan §3 the 4-item cap was a "choice fatigue" decision. Going to 5 is a deliberate trade-off Mac confirmed.

---

## 2. Design

### 2.1 Layout shape for the Lights page

Three viable layouts; Mac decision needed (BLOCKING):

#### Option A — Rooms-as-sections

```
[Lights Page]
+-------------------------------------+
| Living Room (5 lights)              |
|   [Couch][Floor][Spots][Credenza][Column]    ← lighting-card horizontal
+-------------------------------------+
| Kitchen (3 lights)                  |
|   [Island][Main][Counter]                    ← lighting-card horizontal
+-------------------------------------+
| Dining (2 lights)                   |
|   [Spots][Column]                            ← lighting-card horizontal
+-------------------------------------+
| Bedroom (3 lights)                  |
|   [Main][Accent][Lamps]                      ← lighting-card horizontal
+-------------------------------------+
| Office (3 lights)                   |
|   [Desk][Left][Right]                        ← lighting-card horizontal
+-------------------------------------+
```

Phone: each section stacks vertically with horizontal scroll for many-light rooms OR wraps to 2-col grid.
Desktop: 2-3 columns of sections side-by-side.

#### Option B — Functional-zone grid

```
[Lights Page]
+-------------------------------------+
| Functional Zones                    |
| [Lighting][Spots][Ceiling][Columns][Accent][Bedside] ← top filter pills
+-------------------------------------+
| [grid of all ~16 lights, current filter applied]
+-------------------------------------+
```

Phone-first; filter pills + responsive grid.

#### Option C — Hybrid (rooms above, functional below)

Both axes available. Top half rooms-as-sections; bottom half functional-zone filter for cross-room queries (e.g., "all bedside lamps").

**Recommendation**: Option A for v1 (simplest, matches rooms-mental-model). Add Option C as v2 if Mac wants functional-zone slice later.

### 2.2 Per-light tile depth

Each light tile on the Lights page is the same `tunet-light-tile` used elsewhere — leveraging U.2's icon-tap split:
- Icon tap = toggle / hold = brightness drag
- Body tap = open `#light-detail-<entity>` popup (color, CCT, effect)

The Lights page is composition; it doesn't introduce a new tile.

### 2.3 Navbar extension to 5 tabs

Edit `nav_card` anchor in preview yaml. Add 5th route:
```yaml
- title: Lights
  icon: mdi:lightbulb-group
  url: /tunet-home-preview/lights
```

Position: 4th position (Home / Rooms / **Lights** / Media / Stats), since lighting is the next-most-frequent interaction after rooms.

### 2.4 Lighting strip retention on Home

No change required. Existing 6-zone glance card stays exactly as is. Mac's UX layering principle: Home glance (Lighting strip) → Rooms quick (popups) → Lights deep (new page).

### 2.5 Dependency on L1

The Lights page references room groupings (Living/Kitchen/Dining/Bedroom/Office). These are room concepts; per L1 problem statement, "what counts as a Living Room light" has drift. The Lights page must either:
- Use explicit `lights[]` per room (manual list, drift-prone) — matches rooms-card pattern
- Pull from `light.all_<room>_lights` groups (uses L1-affected groups)
- Pull from HA area assignment (post-L1 if Mac chose area-based scope)

Recommendation: defer Lights page implementation until L1 resolves the room-group source of truth. Document the dependency. Ship the layout + composition empty-shell now if Mac wants a preview surface for design feedback.

---

## 3. Implementation Phases

### Phase 3.0 — Layout decision + Mac stamp (~30 min Mac)

Mac picks Option A / B / C per §2.1. Confirm 5-tab navbar acceptable. Confirm Lights tab position (after Rooms vs after Media).

### Phase 3.1 — Lights page YAML composition (~2-3h, depends on Phase 3.0) (PARAMETERIZED per Mac 2026-05-26 DRY directive)

Build the new `/tunet-home-preview/lights` view. **Reuse pattern (Option A)**: use a single decluttering-card template OR YAML anchor for the per-room section, parameterized by `room_id`. Avoid hand-duplicating 5 near-identical `tunet-lighting-card` blocks.

**Approach A — `decluttering-card` HACS card**:
```yaml
# Template definition (once, in shared location)
decluttering_templates:
  lights_room_section:
    card:
      type: vertical-stack
      cards:
        - type: heading
          heading: '[[room_name]]'
        - type: custom:tunet-lighting-card
          name: '[[room_name]] Lights'
          zones: '[[zones]]'
          # ... other config

# Instances in /lights view (thin)
- type: custom:decluttering-card
  template: lights_room_section
  variables:
    room_name: Living Room
    zones: [...]
- type: custom:decluttering-card
  template: lights_room_section
  variables:
    room_name: Kitchen
    zones: [...]
```

**Approach B — YAML anchors + merge** (Lovelace-storage compatibility limited; works for YAML-mode dashboards):
```yaml
.lights_section_template: &lights_section
  type: vertical-stack
  cards: [...]

views:
- sections:
  - cards:
    - <<: *lights_section
      name: Living Room
      zones: [...]
```

**Approach C — Code generation** (last resort): a `Dashboard/Tunet/scripts/lights_page_generator.mjs` reads a room registry + emits the lights view YAML block at deploy time. Authoring is single-source; runtime is N instances. Acceptable if A and B aren't viable for our deployment mode.

**LOCKED 2026-05-26 post-advisor**: Approach C (build-step generation). Empirical verification via `ha_config_list_dashboard_resources` confirms `decluttering-card` is NOT installed in HA (full resource list earlier in session — only Button-Card, Bubble-Card, mini-graph-card, layout-card, auto-entities, etc.). Installing decluttering-card is possible but adds a HACS dependency for a single use case. Approach C fits the existing `tunet:deploy:dashboards` pipeline naturally — write a `Dashboard/Tunet/scripts/lights_page_generator.mjs` that reads the room registry + emits the lights view YAML block at deploy time.

**Room registry as data**: per the parameterized-reuse principle, define the room list ONCE (e.g. `Dashboard/Tunet/scripts/tunet_rooms_registry.mjs` or a YAML helper) consumed by:
- rooms-card on Home (currently hand-authored)
- Lights page (Phase 3.1)
- Per-room subviews (currently hand-authored — could refactor later)
- Per-room popups (currently hand-authored — could refactor later)

Refactoring rooms-card + popups + subviews to consume the registry is OUT OF SCOPE for U.3 (would balloon scope) but the registry's existence enables future consolidation. L1 may also touch this — coordinate.

M1 capture at 4 breakpoints after composition.

### Phase 3.2 — Navbar 5th tab insertion (~30 min, depends on Phase 3.1)

Edit `nav_card` anchor. Add Lights route. M1 capture at 4 breakpoints showing 5-tab layout + active-state highlighting.

### Phase 3.3 — Cross-surface consistency check (~30-45 min)

Confirm Home Lighting strip + Rooms popups + per-room subviews + new Lights page all reflect the same per-light data. No phantom lights, no missing lights.

### Phase 3.4 — Adversarial review pass (~30 min)

Per §4 below.

### Phase 3.5 — Mac M1 stamp + commit

### Total: ~4-6h focused execution

---

## 4. Adversarial Review

### Pressure scenarios

1. **Lights page scroll length at 390×844**: 16-20 lights × tile height. If each section's lighting card is horizontally scrolling per room, page is ~5 sections tall ≈ acceptable. If wrapping to 2-col grids vertically, page may be 10+ sections tall = excessive scroll.
2. **Navbar 5-tab cramping**: at 360×640 (very narrow phone), 5 tabs at ~72px each may not fit labels — degrade to icon-only? Acceptable trade-off?
3. **Functional zone overlap (D2.LIGHTING territory)**: a light may be in both "Living Room" and "Spots" functional zone. Page-level dedup needed OR users see same light twice.
4. **L1 dependency**: shipping Lights page before L1 means it references drifted room-group infrastructure. Renders accurately TODAY (whatever drift exists is what user sees) but the abstraction is on shaky ground.
5. **Per-light popup invocation from Lights page**: U.2 must ship before Lights page is useful at deep-control level. OR Lights page ships with deferred per-light popup, user gets tile-level toggle + slider only initially.
6. **Performance**: 16-20 `tunet-light-tile` instances on one page with live state subscriptions. Verify no render lag, no flicker on state updates.
7. **U.1 chevron change interaction**: D5 chevron now opens popup; Rooms tab navigates to /rooms page. With Lights tab, the user has multiple paths to lights — discoverability of which path leads where becomes important.
8. **Cosmos parallel surface**: cosmos doesn't have a Lights page. Adding to preview only widens the cosmos-vs-preview divergence. Acceptable if both stay parallel; flagged for the "cosmos disposition" decision later.

### Per-phase rollback

| Phase | Rollback |
|---|---|
| 3.1 | Remove the lights view block from preview yaml |
| 3.2 | Remove 5th tab from nav_card anchor |
| 3.3 | n/a (verification only) |

Lights page can ship without navbar tab (accessible via URL); navbar tab depends on page existing. Order matters.

---

## 5. Definition of Done

- `/tunet-home-preview/lights` accessible
- All ~16-20 lights organized per chosen layout (Option A/B/C)
- Per-light tile interactions work (toggle, brightness, color via U.2 popup)
- Navbar 5th tab present, active-state highlights when on /lights
- 4-breakpoint M1 capture (390, 768, 1024, 1440) — Mac stamp
- Home Lighting strip unchanged (verify no regression)
- Per-room popups + subviews unchanged (verify no regression)

---

## 6. Out of Scope

- L1 light-entity-management-architecture (separate plan; Lights page accepts L1's eventual fixes when they land)
- U.1 rooms/popup polish (separate)
- U.2 per-light detail popup gesture (separate; Lights page leverages U.2 when it ships)
- Cosmos surface — preview-only addition; cosmos disposition decision separate
- New functional zone definitions (use existing groups; L1 will rationalize)

---

## 7. Open Decisions for Mac

**BLOCKING — resolve before Phase 3.1 starts**:
1. **Layout shape**: Option A (rooms-as-sections), B (functional-zone grid), or C (hybrid).
2. **L1 sequencing**: ship Lights page now against drifted groups (acceptable if Mac understands the L1 cleanup will refactor it later), OR wait for L1 to land first.
3. **U.2 sequencing**: ship Lights page before U.2 (tile-level toggle only initially), OR after U.2 (full deep-control on day 1).

**INFORMATIONAL**:
4. **Lights tab position in navbar**: after Rooms (Home / Rooms / **Lights** / Media / Stats) OR after Media (Home / Rooms / Media / **Lights** / Stats)?
5. **Functional zone secondary view**: Option C hybrid OR defer functional-zone slice to a v2?
6. **Cosmos cross-port**: also add Lights page to cosmos surface for parity, OR keep preview-only?

# U.1 — Rooms Row + Popup Polish (Preview Surface)

**Created**: 2026-05-26 evening MDT
**Parent**: `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md`
**Authority**: focused line-level plan; gates through adversarial review before stamp; empirical baseline already captured (19 screenshots @ `/tmp/preview-room-audit-2026-05-26/`).
**Surface**: `/tunet-home-preview/home` + 5 room popups (`#room-<name>`) + 5 room subviews

---

## Phase 1: Empirical Baseline (COMPLETED 2026-05-26 evening)

Captured 19 screenshots across preview + cosmos at 390×844 + 1440×900. Inline-read per M1. Defects D1-D8 catalogued from inspection.

### Surface state at baseline

- Preview yaml: `Dashboard/Tunet/tunet-home-preview-config.yaml` (65,537 bytes, last touched 2026-05-26 17:03)
- Latest preview commit: `e39ca0e` (N.1 navbar Apple Glass)
- Live HA state: 19/19 lights, 1 manual override (per home_status), 70°F inside
- Preview is on the `tunet-rooms-card` v3.1.1+ with `layout_variant: slim` + per-room `tap_action: navigate → '#room-<name>'`

### Defect inventory (verified against captures + yaml; Mac feedback applied 2026-05-26)

#### Active in U.1

| ID | Defect | Evidence | Owning file |
|---|---|---|---|
| **D1.LR** | Living Room row shows 3 orbs, popup has 5 light tiles. Missing: Credenza, Column | `preview-home-390-v3.png` row vs `preview-pop-living-390.png` tiles | `tunet-home-preview-config.yaml:406-412` |
| **D1.K** | Kitchen row shows 2 orbs, popup has 3 (Island/Main/Counter). Missing: Main | `preview-home-390-v3.png` vs `preview-pop-kitchen-390.png` | `tunet-home-preview-config.yaml:415-423` |
| **D1.B** | Bedroom row shows 2 orbs, popup has 3 (Main/Accent/Lamps). Missing: Lamps (currently unavailable entity but slot should reserve) | `preview-home-390-v3.png` vs `preview-pop-bedroom-390.png` | `tunet-home-preview-config.yaml:436-442` |
| **D1.O** | Office row shows 2 orbs but popup has 3 (Desk + Light Left + Light Right). Row uses `light.office_bed_lights` GROUP → 1 orb for 2 physical lights | `preview-home-390-v3.png` vs `preview-pop-office-390.png` | `tunet-home-preview-config.yaml:446-452` |
| **D3** | At desktop 1440, popup lighting card uses `columns: 2` with NO `column_breakpoints` (yaml line 555 Living, 760 Bedroom, 855 Office). Tiles wrap to 2+1 / 3+2 layouts despite popup container being plenty wide. **Fix**: copy the `column_breakpoints` pattern from the home Lighting strip at yaml line 361-367 (which uses min_width:500 → columns:6) into each popup's lighting card. Popup width itself is NOT the issue. | `preview-pop-living-1440.png` + yaml line 354-367 | `tunet-home-preview-config.yaml` lighting cards inside popups |
| **D4.B-ALARMS** | Bedroom popup missing alarms section (cosmos has it; genesis §6 specifies it) | `preview-pop-bedroom-390.png` vs `cosmos-pop-bedroom-390.png` + genesis §6 | `tunet-home-preview-config.yaml` `#room-bedroom` popup |
| **D4.B-SPEAKER** | Bedroom popup sensor section missing Speaker entity row (cosmos has it) | same | same |
| **D4.LR-MINI** | Living Room popup missing per-zone mini-status rows for related groups (Ceiling/Columns shown in cosmos) | `preview-pop-living-390.png` vs `cosmos-pop-living-390.png` | `#room-living-room` popup |
| **D5** | Chevron at right of each rooms row does not open popup. Body tap navigates to `#room-<name>` correctly. Chevron should mirror the action for affordance redundancy. | Mac report 2026-05-26; needs in-card investigation | `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` chevron handler |
| **D7 (broadened)** | **G1-G11 Genesis-vs-Preview gap audit** — see §1.X below. Mac directive 2026-05-26: "identify all of the other places where the genesis plan is now executed below par in preview" | Genesis spec §6+§7 vs 5 popups + 5 subviews captures | preview yaml multiple sections |
| **D8** | Initial home capture at 390 timed out at 3sec wait (showed only HA splash); 6sec wait succeeded. Bump default. | `preview-home-390.png` (v1) vs `preview-home-390-v3.png` | `.scratch_room_capture.mjs` / canonical harness |

#### Deferred from U.1 (per Mac 2026-05-26)

| ID | Defect | Disposition |
|---|---|---|
| **D2.B** | Stale `corner_accent_govee` in Bedroom row (migrated to Office per Campaign A3) | **Deferred to L1** — Mac chose to defer cosmetic patch; structural fix happens with L1 group rationalization |
| **D2.LIGHTING** | Lighting strip vs row group disagreement (`bedroom_primary_lights` vs `master_presence`) | **Deferred to L1** — same scope; L1 is the right home |

### 1.X — Genesis §6 (popups) + §7 (subviews) gap audit (G1-G11)

Per Mac directive 2026-05-26: identify every place preview executes below the genesis wireframe spec.

#### Popup gaps (Genesis §6 vs preview popups)

| ID | Gap | Genesis says | Preview has | Owning popup |
|---|---|---|---|---|
| **G1** | Living Room popup missing room-scoped quick action chips | `[Evening] [Off] [Full Bright]` quick actions + "Open Room" button | NO action chips visible | `#room-living-room` |
| **G2** | Kitchen popup has generic chips instead of room-scoped scenes | `[Cook Mode] [Counter Only] [Off]` | `[Open Room] [All Off] [All On]` (generic) | `#room-kitchen` |
| **G3** | Dining popup missing Dinner Mode chip | `[Dinner Mode] [Off]` | `[Open Room] [All Off] [All On]` (generic) | `#room-dining-room` |
| **G4** | Bedroom popup missing scenes + alarms | `[Sleep] [Bedside Only] [Off]` + Sonos alarms section | speaker row but no alarms, no scene chips | `#room-bedroom` (overlaps D4.B-*) |
| **G5** | Office popup missing Focus scene chip | `[Focus] [Off]` | `[Open Room] [All Off] [All On]` (generic) | `#room-office` |

#### Subview gaps (Genesis §7 vs preview subviews)

| ID | Gap | Genesis says | Preview has | Owning subview |
|---|---|---|---|---|
| **G6** | Living subview missing Temperature + Humidity + Lux sensor rows + room-scoped scene chips | Hero lighting + support (occupancy/temp/lux) + per-room scene chips (`[Cook] [Dinner] [Movie] [Off]`) | Lighting + Occupancy only + generic chips (`All On / All Off / Brighter / Dimmer`) | `/tunet-home-preview/living-room` |
| **G7** | Kitchen subview missing Temperature + Lux + complete scene set | Support sensors + scenes including Cook ✓ partial / Dinner / Off | Humidity + Occupancy + `[Cook]` ✓ + generic Brighter/Dimmer | `/tunet-home-preview/kitchen` |
| **G8** | Dining subview missing sensor support rows + Dinner Mode scene | Climate hero ✓ + support sensors + scenes | Climate ✓ + sensors-section-header-truncated + generic chips | `/tunet-home-preview/dining-room` |
| **G9** | Office subview missing Focus scene chip | `[Focus] [Off]` | Generic chips | `/tunet-home-preview/office` |
| **G10** | ALL subviews use generic room scripts (All On/Off/Brighter/Dimmer) instead of room-scoped scene scripts | Per-room scene chips trigger room-scoped scripts per genesis §10 (NEW scripts to be added) | Generic chips | `packages/` scene scripts (NEW); all subviews + popups quick-action rows |
| **G11** | ALL subviews missing the "filtered speaker grid" per genesis §7 template | "Media: room speaker (if applicable) + filtered speaker grid" | Media row present, no filtered speaker grid below it | All subviews |

---

## Phase 2: Design (adversarial-review-gated)

### 2.1 — D1 (missing orbs) fix shape

Edit `rooms[].lights[]` in preview yaml per-room to add the missing entities. The card supports `{ entity, name, icon }` per-light overrides; use semantically distinct icons.

| Room | Current `lights:` | Proposed addition | Semantic icon |
|---|---|---|---|
| Living | couch_lamp, floor_lamp, spot_lights | + `living_room_credenza_light`, `living_column_strip_light_matter` | Credenza: `light_bulb`, Column: `view_column` |
| Kitchen | island_pendants, counter_cabinet_underlights | + `kitchen_main_lights` (verify entity_id) | Main: `light` or `recessed_light` |
| Bedroom | master_presence, **corner_accent_govee** (STALE) | Replace stale with current bedroom entities. Investigate: what's actually in master bedroom now post-A3? Probably just master_presence + `master_bedroom_column_accent`. Lamps may be perma-unavailable; consider hiding-when-unavailable vs showing-unavailable-slot. | TBD per investigation |
| Office | desk_lamp, **bed_lights** (group) | Replace bed_lights group with two individual entities: `office_bed_light_left`, `office_bed_light_right`. Add `master_bedroom_corner_accent_govee` (Campaign A3 destination) | Left: `sign-pole` (matches current friendly icon), Right: `sign-pole`, Govee: `nightlight` |

**Open decision (Mac BLOCKING)**: Bedroom — what's the actual current physical light set post-A3? Mac to confirm or I investigate via `ha_get_states` on `light.master_*` and `light.bedroom_*` entities.

### 2.2 — D2 cosmetic patch (D2.B stale entity)

Replace `light.master_bedroom_corner_accent_govee` in Bedroom row with the actual current bedroom Accent. Pending §2.1 investigation. **Note**: D2.LIGHTING (lighting-strip vs row group disagreement) is L1-scope; this patch does NOT fix that. Add a note in the row config that the underlying group-naming is L1-deferred.

### 2.3 — D3 popup lighting card column_breakpoints (REVISED per Mac 2026-05-26)

Popup container is already plenty wide at desktop — no container width override needed. The actual defect is the popup lighting card uses `columns: 2` with no breakpoint scaling. Apply the existing-working pattern from yaml line 354-367 (home Lighting strip):

```yaml
columns: 2
column_breakpoints:
  - min_width: 500
    columns: 5    # or 3 for rooms with 3 lights (Kitchen/Bedroom/Office)
  - columns: 2
```

Per-popup column targets:
- `#room-living-room` (5 lights): breakpoint columns: 5
- `#room-kitchen` (3 lights): breakpoint columns: 3
- `#room-dining-room` (2 lights): breakpoint columns: 2 (no change needed; 2 already fits)
- `#room-bedroom` (3 lights): breakpoint columns: 3
- `#room-office` (3 lights): breakpoint columns: 3

### 2.4 — D4 cosmos parity (port to preview popups)

For `#room-bedroom` popup, add these sections after the lights grid:

- **Speaker row** in sensor section: `light.bedroom_sonos_healthy` shown as sensor row with on/off state arrow (mirror cosmos pattern, see cosmos yaml `#room-bedroom` definition for exact card)
- **Alarms card** (Sonos Alarms with "Next: HH:MM · Room · N enabled" and current alarm row). Port from cosmos popup verbatim.

For `#room-living-room` popup, add after sensor section:
- **Per-zone mini-status rows** for related light groups (Ceiling, Columns). Mirror cosmos pattern.

**Investigation owed**: read cosmos yaml `#room-bedroom` + `#room-living-room` definitions to extract the exact card configs to port.

### 2.5 — D5 chevron wiring

Investigate `tunet_rooms_card.js` to find current chevron click handler (likely a stop-propagation no-op or a navigate to subview). Wire it to dispatch the same hash-navigation as body tap. Suite-wide impact: ALL rooms-card consumers (preview, cosmos, suite, suite-storage) get the new behavior — verify each surface still does the right thing post-change.

### 2.6 — D7 (broadened) Genesis-vs-preview gap closeout (G1-G11)

#### G1-G5 — Popup quick-action scene chips

Replace generic `[Open Room] [All Off] [All On]` rows with per-room scene chips per genesis §6. NEW scene scripts owned by `packages/oal_lighting_control_package.yaml` (or new `packages/tunet_room_scenes.yaml`):
- `script.scene_living_evening`, `script.scene_living_off`, `script.scene_living_full_bright`
- `script.scene_kitchen_cook`, `script.scene_kitchen_counter_only`, `script.scene_kitchen_off`
- `script.scene_dining_dinner`, `script.scene_dining_off`
- `script.scene_bedroom_sleep`, `script.scene_bedroom_bedside_only`, `script.scene_bedroom_off`
- `script.scene_office_focus`, `script.scene_office_off`

Mac decision (BLOCKING for G1-G5 implementation): exact per-zone brightness/color values per scene. Some overlap with OAL Evening mode (`6caad51`). Defer specific scene composition to a follow-on tranche if scope blows.

#### G4 — Bedroom popup alarms + speaker (overlaps D4.B-*)

Port from cosmos `#room-bedroom`. See §2.4.

#### G6 — Living subview enrichment

Add to Living Room subview yaml:
- Temperature row: `sensor.living_room_temperature` if exists; else fallback `sensor.dining_room_temperature` (shared HVAC sensor); else flag for backlog
- Humidity row: `sensor.living_room_humidity` if exists; else flag for backlog
- Lux row: `sensor.living_room_lux` or motion-sensor lux attribute if exists; else flag for backlog
- Room-scoped scene chips replace generic chips (see G10)

#### G7 — Kitchen subview enrichment

Add Temperature + Lux rows (Humidity already present). Complete scene set: add Dinner + Off room-scoped chips alongside existing Cook.

#### G8 — Dining subview support row

Already has climate hero. Add Temperature + Humidity below climate; add Dinner Mode chip alongside generic chips OR replace generic with room-scoped.

#### G9 — Office subview Focus scene

Add Focus chip; optionally retain All On / All Off as utility chips.

#### G10 — Room-scoped scene scripts (NEW backend work)

Per genesis §10: each room gets dedicated scene scripts triggered by chips. These are NEW automations/scripts:
- 5 rooms × 2-4 scenes each ≈ 12-16 new scripts
- Scope decision (Mac BLOCKING): create all 16 in one tranche, or just create the chips that map to existing automations + flag the missing ones?
- Risk: scene script composition is non-trivial UX (what does "Evening" actually do for Living Room — same as global Evening mode? Different per-zone tuning?)

#### G11 — Filtered speaker grid in subviews

Add `tunet-speaker-grid-card` below media row in each subview, filtered to the room's relevant speakers. Cards-reference defines the filter pattern. Bedroom subview already has media block; extend with filtered speaker grid.

### 2.7 — D8 capture harness timing

Bump default hydration wait in `.scratch_room_capture.mjs` and the canonical `tunet:review:production` harness from 3s → 6s for `domcontentloaded` paths. OR switch to `waitUntil: 'networkidle'` + 4s buffer.

---

## Phase 3: Implementation Phases

### Phase 3.0 — Pre-flight investigations (~30 min)

- `ha_get_states` on `light.master_*` + `light.bedroom_*` + `light.master_bedroom_*` → confirm current physical bedroom light set
- `ha_search_entities` for `kitchen_main_lights` → confirm entity_id naming
- Read cosmos `#room-bedroom` + `#room-living-room` popup definitions in `Dashboard/Tunet/tunet-home-cosmos-config.yaml` → extract exact card configs for porting
- Read `tunet_rooms_card.js` chevron handler → identify current behavior + change point

### Phase 3.1 — D1 + D2 cosmetic (~1h, parallel-safe with 3.4)

Edit `rooms[].lights[]` arrays per §2.1 + §2.2. Single commit. Production-mirror M1 capture at 390 + 1440 showing all 5 rooms with corrected orb counts.

### Phase 3.2 — D3 desktop popup width (~30-45min, depends on 3.1 to not interact)

card_mod popup width + lighting-card max_columns at desktop. M1 capture at 1440 showing all 5 popups with single-row tile layout.

### Phase 3.3 — D4 cosmos parity (~1.5h, depends on 3.0 investigation)

Port cosmos alarm card + speaker row + mini-status rows. M1 capture at 390 + 1440 confirming sections render correctly with live data.

### Phase 3.4 — D5 chevron wiring (~45min, card-level change; parallel-safe)

`tunet_rooms_card.js` chevron handler edit. `npm test` AND visual check on all 4 surfaces using rooms-card (preview, cosmos, suite-storage, card-rehab-yaml lab). `npm run tunet:deploy:lab` after.

### Phase 3.5 — D7 Living subview (~30-45min, parallel-safe)

Add sensor block to Living Room subview yaml. M1 capture at 390.

### Phase 3.6 — D8 harness timing (~15min, parallel-safe)

Bump wait + commit.

### Phase 3.5 (REPLACED) — D7 Genesis-vs-preview gap closeout (G1-G11)

Significantly larger than original D7 (Living subview only). Recommend splitting into sub-tranches:

- **3.5a — G1-G5 popup scene chips** (~1.5h, gated on G10 scripts existing or being created in parallel)
- **3.5b — G10 room-scoped scene scripts** (~3-4h, backend work, gates 3.5a chip wiring)
- **3.5c — G6-G9 subview sensor enrichment** (~1.5h, may need new sensor entities flagged for backlog)
- **3.5d — G11 filtered speaker grid in subviews** (~1.5h, depends on tunet-speaker-grid-card filter capability — verify)

**Open decision (Mac BLOCKING for 3.5b)**: scope of new scene scripts — all 12-16 in one tranche, OR ship chips wired to existing automations + backlog the missing scenes.

### Sequencing (revised)

```
3.0 (investigations + genesis audit confirm) ─┬─→ 3.1 (D1)
                                              ├─→ 3.3 (D4 cosmos parity = G4 alarms+speaker)
                                              ├─→ 3.4 (D5 chevron)         ┐
3.2 (D3 popup lighting columns) ──────────────┤                             │
3.5b (G10 scripts BACKEND) ───────────────────┼─→ 3.5a (G1-G5 popup chips) ─┤
3.5c (G6-G9 subview enrichment) ─ parallel ──┤                             │
3.5d (G11 filtered speaker grid) ─ parallel ─┤                             │
3.6 (D8 harness) ──────── parallel ──────────┘                             │
                                                                            ↓
                                                                  Mac M1 stamp
```

Total: ~9-13h focused execution across 4-6 sittings — significantly larger than original U.1 (~4-5h) due to genesis audit broadening.

---

## Phase 4: Definition of Done — per phase

| Phase | DoD (evidence-bound) |
|---|---|
| 3.0 | Investigation outputs documented inline in this plan §2 (Mac eye on bedroom entity decision) |
| 3.1 | M1 capture at 390 + 1440 shows: Living=5 orbs, Kitchen=3, Bedroom=correct-count, Office=3. Stale corner_accent_govee gone from Bedroom row. |
| 3.2 | M1 capture at 1440 shows all 5 popups with single-row light tile layout. No overflow / clipping. |
| 3.3 | M1 capture at 390 + 1440 shows Bedroom popup with alarms section + speaker row; Living Room popup with mini-status rows. Visual parity check against cosmos screenshots. |
| 3.4 | Chevron tap on rooms row opens corresponding popup. Verified on preview (390 + 1440), cosmos, and suite-storage. `npm test` passes. |
| 3.5 | M1 capture at 390 shows Living subview with Temperature + Humidity + Speaker rows. |
| 3.6 | Capture script reproduces consistent results across 3 consecutive runs without timing failures. |
| **U.1 overall** | Mac M1 stamp on shipped surface. All 6 phases land on `main`. visual_defect_ledger updated to mark D1-D8 closed (where actually closed). |

All phases: M1-M7 contract per CLAUDE.md applies. Mac holds done stamp per M3.

---

## Phase 5: Adversarial Review (gate before any implementation)

### Pressure scenarios

1. **D1 over-fix**: 5 orbs per room at 390×844 width — does the row layout overflow? Per current row width, orb size, and per-room name length, does Living Room "On · 70°F" + 5 orbs + power + chevron fit? Test in Playwright before commit.
2. **D2 entity rename risk**: if Mac confirms a different bedroom entity, that entity may NOT yet have appropriate icon/friendly_name in HA registry. Need to set those at the source first.
3. **D3 popup width override**: card_mod popup width change is GLOBAL across all Bubble popups, not just rooms. May break other popups (#media-living-room, #oal-detail, #alarm-edit). Test all 8 popups at 1440 post-change.
4. **D4 cosmos port**: cosmos yaml may reference entities or templates that don't exist in preview's context. Validate every entity_id referenced in the ported cards.
5. **D5 chevron wiring**: changing chevron behavior in tunet_rooms_card is SUITE-WIDE. Existing consumers may rely on chevron being a no-op (or whatever it currently is). Visual check on every dashboard using rooms-card.
6. **D7 Living subview**: `sensor.living_room_temperature` may not exist — Plan F sensor inventory may have only created dining_room_temperature. Verify via probe before commit.
7. **General**: every phase's commit must include the "before" capture so reviewer can diff vs "after" capture in the same review block.

### Rollback per phase

| Phase | Rollback |
|---|---|
| 3.1 | `git revert <hash>` on the rooms[] edit |
| 3.2 | Remove the card_mod overlay; lighting-card max_columns reverts via revert |
| 3.3 | Revert popup section additions |
| 3.4 | Revert chevron handler in tunet_rooms_card.js + `npm run tunet:deploy:lab` |
| 3.5 | Revert Living subview sensor block |
| 3.6 | Revert harness change |

All phases ship in separate commits → per-phase rollback is clean.

---

## Phase 6: Out of Scope

- **D2.LIGHTING** (lighting-strip group vs row group disagreement) — L1 architectural fix
- **U.2** per-light detail popup (icon-tap split) — separate tranche
- **U.3** unified Lights page + 5th nav tab — separate tranche
- **Cosmos surface** — parallel; cosmos has its own R4 backlog
- **M.3 finish** (bedroom alarm safety net) — separate tranche per consolidated plan §3.1
- **STATS.1 + ADAPTIVE.1** — blocked on L1
- New entity creation (e.g., `sensor.living_room_temperature` if missing) — out of scope; either entity exists or fallback OR the row is omitted with a flag for backlog

---

## Phase 7: Open Decisions for Mac

**BLOCKING — resolve before Phase 3.1 starts**:
1. **Bedroom actual physical light set post-A3** — Mac confirm, OR I investigate via `ha_get_states` probe and surface findings.
2. **D1.O Office split** — split `light.office_bed_lights` group into 2 individual orbs (Light Left + Light Right) OR keep as 1 group orb. Adding corner_accent_govee makes it 3 total — confirm desired state.

**INFORMATIONAL — when convenient**:
3. **D4 cosmos port — which sections** — confirm Bedroom alarm card + Living mini-status rows are the right things to port; any others (e.g., speaker rows for non-bedroom rooms)?
4. **D7 Living subview enrichment scope** — Mac confirm Temperature + Humidity + Speaker are the right adds (vs richer set).

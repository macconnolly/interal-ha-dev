# Post-Compaction Continuation Prompt

## READ THIS FIRST
Read the plan at `/home/mac/.claude/plans/buzzing-bubbling-starlight.md` for full progress tracker.

---

## What Was Done This Session

### Phase 3: Media Card Fixes (DONE)
**File**: `Dashboard/Tunet/Cards/tunet_media_card.js` (v3.0.0 → v3.1.0)
- Fix 1: Host z-index elevation on dropdown open (`this.style.position='relative'; this.style.zIndex='10'`)
- Fix 2: Volume drag entity capture — already done in prior session (dragEntity pattern)
- Fix 3: Dropdown positioning — V1 already used `position: absolute` (correct). Added horizontal clamping in `_positionSpeakerMenu()` to prevent right-side cutoff.

### Room Cards Refined (DONE)
**Option C chosen**: All 3 room cards deployed for A/B testing.

**`room_alt_c.js`** v1.0.0 → v1.1.0 (820 → 1142 lines):
- Token block replaced with climate card authoritative tokens
- Icon system changed to CSS variable approach (--ms-fill)
- Inline dimmer ported from alt_2 (pointer capture on track)
- Room icon tap → toggle all room lights
- Two-column desktop grid (600px breakpoint)
- Navigate event fixed (CustomEvent bubbles+composed)
- Section container inset shadow verified
- Event bubbling fixed (pointerdown/up skip .room-orb targets)
- Room name truncation + controls flex-shrink for mobile
- `lamp` icon aliased to `table_lamp`

**`tunet_room_alt_2_card.js`** v1.0.0 → v1.1.0 (1164 → 1280 lines):
- Section glass stroke added (::before XOR mask)
- Section inset shadow added
- Long-press toggle all ported from alt_c (400ms)
- Room icon tap → toggle all room lights
- Optimistic UI + per-entity cooldown (1500ms)
- callServiceSafe pendingEl support added
- Pointer capture replaced document-level listeners
- Row gap changed to CSS grid (removed inline marginTop)
- Two-column desktop grid (600px breakpoint)
- Event bubbling fixed (pointerdown/up skip .room-orb targets)
- `lamp` icon aliased to `table_lamp`, allowlist removed

### Bug Fix Pass (DONE)
| Bug | Card | Fix |
|-----|------|-----|
| Lighting tiles cutoff left | Lighting | `overflow-x: hidden` → `overflow: visible` |
| Status bottom text cutoff | Status | Removed `height: 100%` on `.tile` |
| Status aux pill transparent | Status | `background: var(--tile-bg)`, `color: var(--text)` |
| Speaker grid grouping idle | Speaker Grid | `in_playing_group` → `in_active_group` |
| Room icons fallback | All rooms | Removed restrictive allowlists |
| `lamp` icon broken | All rooms | Aliased to `table_lamp` |
| Rooms card tiny mobile | Rooms (square) | Increased minmax 4.5em→6em, mobile 3col→2col, font 15→16px |
| Rooms card no grid options | Rooms (square) | Added `columns` config key |

### Full Deployment (DONE)
- All 13 JS files deployed via SCP to `root@10.0.0.21:/config/www/tunet/`
- SSH creds: from `.env` (user=root, password=password, host=10.0.0.21)
- Lovelace resources registered via HA MCP tools
- Resources at v=8000 (base), v=8001 (first fix pass), v=8002 (room card fixes)
- No stale/duplicate resource registrations

---

## What To Do Next

### Verify on Live Dashboard
User needs to hard refresh (Ctrl+Shift+R) and verify:
1. Status card `show_when` — does Manual tile hide when system is Adaptive?
2. Weather card — does forecast section display?
3. All cards on mobile — responsive breakpoints working?
4. Which rooms card variant the user prefers

### Phase 6: Dashboard Layout (TODO)
- HA layout-card HACS integration IS installed
- Configure `Dashboard/Tunet/tunet-overview-config.yaml` with layout-card wrapper
- Update speaker grid config for v2.0.0 options (tile_size, show_metadata)
- Set canonical rooms card type in overview config

### Deploy Script Fix (LOW PRIORITY)
- `skills/ha-card-deploy/scripts/deploy_cards.sh` line 91 has `.end` typo (should be `.env`)
- Lines 143-144 hardcode credentials instead of using .env values
- Currently deploying via direct SCP commands instead

---

## Key File Paths

| What | Path |
|------|------|
| Plan | `/home/mac/.claude/plans/buzzing-bubbling-starlight.md` |
| Speaker Grid | `Dashboard/Tunet/Cards/tunet_speaker_grid_card.js` |
| Rooms Square | `Dashboard/Tunet/Cards/tunet_rooms_card.js` |
| Room Alt 2 | `Dashboard/Tunet/Cards/tunet_room_alt_2_card.js` |
| Room Alt C | `Dashboard/Tunet/Cards/room_alt_c.js` |
| Media | `Dashboard/Tunet/Cards/tunet_media_card.js` |
| Status | `Dashboard/Tunet/Cards/tunet_status_card.js` |
| Lighting | `Dashboard/Tunet/Cards/tunet_lighting_card.js` |
| Climate (GOLD STD) | `Dashboard/Tunet/Cards/tunet_climate_card.js` |
| Weather | `Dashboard/Tunet/Cards/tunet_weather_card.js` |
| Dashboard Config | `Dashboard/Tunet/tunet-overview-config.yaml` |
| Design Language | `Dashboard/Tunet/Mockups/design_language.md` (v8.4) |
| V2 Reference Files | `Dashboard/Tunet/Cards/v2/*.js` (12 files, READ-ONLY) |
| Deploy Script | `skills/ha-card-deploy/scripts/deploy_cards.sh` |
| SSH .env | `.env` (HA_SSH_HOST=10.0.0.21, root/password) |

## YAML Configs for Room Cards
All 3 room cards use identical config schema. Only `type:` differs:
- `type: custom:tunet-rooms-card` (square tiles, supports `columns: N`)
- `type: custom:tunet-room-alt-2-card` (horizontal rows)
- `type: custom:room-alt-c` (horizontal capsules)

Config structure:
```yaml
type: custom:tunet-rooms-card  # or tunet-room-alt-2-card or room-alt-c
name: Rooms
columns: 3  # only tunet-rooms-card, optional
rooms:
  - name: Room Name
    icon: weekend
    temperature_entity: sensor.xxx
    navigate_path: /tunet-overview/xxx
    lights:
      - entity: light.xxx
        icon: table_lamp  # NOT 'lamp' — use table_lamp
        name: Display Name
```

## Architecture Rules
- All production cards are V1 SELF-CONTAINED (no ES module imports, no build tools)
- Each card inlines `window.TunetCardFoundation`, full token block, all CSS
- Dark mode via `hass.themes.darkMode` → `.dark` class toggle on `:host`
- Change detection via reference equality on `hass.states[entity]`
- Midnight Navy dark palette LOCKED: canvas `#0f172a`, card `rgba(30,41,59, 0.72)`, amber `#fbbf24`
- NO atomic reusable tile components — combined self-contained cards only
- Deploy via SCP: `sshpass -p "password" scp file root@10.0.0.21:/config/www/tunet/file`
- Register resources via HA MCP: `ha_config_set_dashboard_resource`
- Icon `lamp` is NOT a valid MS ligature — always alias to `table_lamp`

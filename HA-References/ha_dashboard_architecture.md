# Dashboard Architecture Document

**System:** OAL v13 + Sonos Multi-Room + Climate
**Generated:** 2025-12-02
**Philosophy:** Respect the automation system, surface state prominently, layer controls by depth

---

## System Understanding

### OAL v13 Is The Brain

OAL (Organic Adaptive Lighting) is NOT just a collection of lights - it's a sophisticated automation system with:

**Modes:**
- **Normal/Baseline** - Adaptive Lighting follows sun position
- **Movie Mode** - `input_boolean.oal_movie_mode_active` - Dims lights, warm color
- **Sleep Mode** - Per-zone via Adaptive Lighting switches
- **Force Sleep** - `input_boolean.oal_force_sleep` - Override all zones to sleep
- **System Paused** - `input_boolean.oal_system_paused` - Master kill switch
- **Environmental Boost** - `input_boolean.oal_environmental_boost_enabled` - Weather compensation

**Configuration:**
- `input_select.oal_active_configuration` - Current preset ("Config 1: Baseline (All On)")
- `input_select.oal_isolated_override_mode` - Per-zone override mode

**Offset System:**
- Global brightness/warmth offsets
- Config-specific offsets
- Environmental compensation offsets
- Sunset curve offsets
- Per-zone manual brightness offsets (6 zones)

**Timing:**
- Late night start: 22:00
- Zonal timeout: 4 hours
- Transition speed: 2 seconds

### 6 Adaptive Lighting Zones

| Zone | Entity Group | Lights | Color Support |
|------|-------------|--------|--------------|
| main_living | light.main_living_lights | 5 Hue lamps | CT, XY, Effects |
| kitchen_island | light.kitchen_island_lights | 1 pendant | Brightness only |
| bedroom_primary | light.bedroom_primary_lights | 2 lights | CT, RGB, Effects |
| accent_spots | light.accent_spots_lights | 2 spots | Brightness only |
| recessed_ceiling | light.recessed_ceiling_lights | 2 ceiling | Brightness only |
| column_lights | light.column_lights | 2 Govee columns | CT, HS, XY |

Each zone has 4 Adaptive Lighting switches:
- switch.adaptive_lighting_[zone] - Master on/off
- switch.adaptive_lighting_adapt_brightness_[zone] - Brightness adaptation
- switch.adaptive_lighting_adapt_color_[zone] - Color adaptation
- switch.adaptive_lighting_sleep_mode_[zone] - Sleep mode

### Sonos Ecosystem

**5 Speakers:**
- media_player.living_room (Primary/Soundbar)
- media_player.kitchen
- media_player.bedroom
- media_player.bath
- media_player.dining_room

**Group Status Sensors:**
- binary_sensor.sonos_[room]_in_playing_group - Is room in current group?
- sensor.sonos_[room]_group_label - Group membership display

**Alarm System:**
- 26 configured alarms across rooms
- sensor.sonos_alarms_for_tomorrow
- sensor.sonos_upcoming_alarms
- input_boolean.sonos_alarm_notifications
- input_boolean.sonos_auto_group_enabled
- script.disable_tomorrows_sonos_alarms

**Grouping Scripts:**
- script.sonos_group_all_to_playing
- script.sonos_ungroup_all
- script.sonos_all_pause
- script.sonos_toggle_group_membership (with target_speaker param)

---

## Dashboard Architecture

### Layer 0: Badges/Header
Quick glance at system state without taking up card space.

**Essential Badges:**
- light.all_lights (state + on count)
- OAL Status indicator (Normal/Movie/Sleep/Paused)
- climate.dining_room (temperature)
- weather.home (current conditions)
- Sonos playing indicator (if playing)
- Alarm indicator (if alarms tomorrow)

### Layer 1: Primary Control Cards
Most common actions, always visible.

**Card 1: OAL System Status**
A prominent card showing current OAL state with quick toggles.

```
┌─────────────────────────────────────────────┐
│ 🌙 Adaptive Lighting              [Normal]  │
│                                             │
│ [Config Dropdown ▼]  [Movie] [Sleep] [Pause]│
│                                             │
│ Global Brightness: ═══════════●═════ 75%   │
│ Global Warmth:     ════●═════════════ 2700K │
└─────────────────────────────────────────────┘
```

**Card 2: Zone Quick Access**
Zone buttons that show brightness and allow quick adjustment.

```
┌─────────────────────────────────────────────┐
│ ◉ Light Zones                    [All 98%] │
│                                             │
│ [Living]  [Kitchen]  [Bedroom]              │
│   75%       100%       65%                  │
│                                             │
│ [Spots]   [Ceiling]  [Columns]              │
│   50%       25%        80%                  │
└─────────────────────────────────────────────┘
```

Tap: Toggle zone
Hold: Open zone detail popup
Double-tap: Jump to individual light control

**Card 3: Sonos Now Playing**
Compact media player with group controls.

```
┌─────────────────────────────────────────────┐
│ 🔊 Stay Here - Rivo                   ▶ ▋▋  │
│ Playing on: Living Room + 4 rooms           │
│                                             │
│ [◀] [⏯] [▶] ══════●══════════ 19%         │
│                                             │
│ [Living✓] [Kitchen✓] [Dining✓] [+2 more]   │
└─────────────────────────────────────────────┘
```

### Layer 2: Secondary Cards
Less common actions, still visible on scroll.

**Card 4: Climate Control**
Simple thermostat card.

**Card 5: Scene Shortcuts**
Quick access to common scenes.

**Card 6: Sonos Alarms Summary**
Tomorrow's alarms at a glance with disable button.

### Layer 3: Pop-ups
Detailed controls accessed on demand.

**#oal-config Pop-up**
Full OAL configuration:
- All offset sliders (global, config, environmental, sunset)
- Zone-specific offset sliders (6 zones)
- Timing configuration
- System controls (watchdog status, last engine run)

**#zone-[name] Pop-ups**
Individual light control for each zone:
- Individual light brightness sliders
- Color temperature (if supported)
- Effect selection (if supported)
- Zone offset slider
- AL switch controls

**#sonos-detail Pop-up**
Full Sonos interface:
- All 5 speakers with individual volume
- Group membership toggles
- Favorites grid
- Queue management
- Alarm management

---

## Key OAL Entities for Dashboard

### Mode Indicators (input_boolean)
```yaml
- input_boolean.oal_system_paused          # Master pause
- input_boolean.oal_movie_mode_active       # Movie mode
- input_boolean.oal_force_sleep             # Force sleep
- input_boolean.oal_disable_sleep_mode      # Disable scheduled sleep
- input_boolean.oal_environmental_boost_enabled  # Weather boost
```

### Configuration (input_select)
```yaml
- input_select.oal_active_configuration     # Current config preset
- input_select.oal_isolated_override_mode   # Per-zone override
```

### Global Offsets (input_number)
```yaml
- input_number.oal_offset_global_manual_brightness  # Master brightness
- input_number.oal_offset_global_manual_warmth      # Master color temp
- input_number.oal_offset_config_brightness         # Config brightness
- input_number.oal_offset_config_warmth             # Config color temp
- input_number.oal_offset_environmental_brightness  # Env compensation
- input_number.oal_offset_sunset_brightness         # Sunset curve
```

### Zone Offsets (input_number)
```yaml
- input_number.oal_manual_offset_main_living_brightness
- input_number.oal_manual_offset_kitchen_island_brightness
- input_number.oal_manual_offset_bedroom_primary_brightness
- input_number.oal_manual_offset_accent_spots_brightness
- input_number.oal_manual_offset_recessed_ceiling_brightness
- input_number.oal_manual_offset_column_lights_brightness
```

### Timing (input_datetime, input_number)
```yaml
- input_datetime.oal_late_night_start       # 22:00
- input_datetime.oal_last_engine_run        # Last adjustment time
- input_number.oal_control_zonal_timeout_hours  # 4 hours
- input_number.oal_control_transition_speed     # 2 seconds
```

### Scripts for Dashboard Buttons
```yaml
- script.oal_global_manual_brighter    # Global brighten
- script.oal_global_manual_dimmer      # Global dim (if exists, or service call)
- script.oal_reset_soft                # Clear manual overrides
- script.oal_global_adjustment_start   # Trigger recalculation
```

---

## Key Sonos Entities for Dashboard

### Media Players
```yaml
- media_player.living_room   # Primary/hub
- media_player.kitchen
- media_player.bedroom
- media_player.bath
- media_player.dining_room
```

### Group Status (binary_sensor)
```yaml
- binary_sensor.sonos_living_room_in_playing_group
- binary_sensor.sonos_kitchen_in_playing_group
- binary_sensor.sonos_bedroom_in_playing_group
- binary_sensor.sonos_bath_in_playing_group
- binary_sensor.sonos_dining_room_in_playing_group
```

### Info Sensors
```yaml
- sensor.sonos_alarms_for_tomorrow
- sensor.sonos_upcoming_alarms
- sensor.sonos_favorites                 # Count: 8
- sensor.sonos_current_playing_group_coordinator
- sensor.sonos_[room]_group_label       # Group membership text
```

### Control Scripts
```yaml
- script.sonos_group_all_to_playing
- script.sonos_ungroup_all
- script.sonos_all_pause
- script.sonos_toggle_group_membership  # data: {target_speaker: media_player.xxx}
- script.disable_tomorrows_sonos_alarms
```

### Config Helpers
```yaml
- input_boolean.sonos_auto_group_enabled
- input_boolean.sonos_alarm_notifications
- input_number.sonos_default_volume
- input_select.sonos_group_selector
```

---

## Bubble Card 3.1 Implementation

### Recommended Card Types

**For OAL Status:**
- `card_type: separator` with sub_button groups for mode toggles
- Use state-based styling for mode indicators
- Include slider for global brightness

**For Zone Control:**
- `card_type: button` with `button_type: state` for zones
- `card_layout: large-sub-buttons-grid` for zone buttons
- Each zone button shows brightness percentage
- Tap: toggle, Hold: more-info, Double-tap: popup

**For Sonos:**
- `card_type: media-player` for primary control
- `card_layout: large-2-rows` for compact display
- Sub-buttons for group management
- Pop-up for detailed Sonos Card

**For Popups:**
- `card_type: pop-up` with hash navigation
- Width optimized for content
- Include back navigation

### Styling Patterns

**State-based Colors:**
```css
/* Mode active indicator */
background: ${hass.states['input_boolean.oal_movie_mode_active']?.state === 'on'
  ? 'rgba(255, 100, 0, 0.2)'
  : 'transparent'};

/* Zone brightness display */
${Math.round((hass.states['light.zone']?.attributes?.brightness || 0) / 2.55)}%
```

**Consistent Design:**
- Border radius: 24px (main), 16px (sub-buttons)
- Accent color: rgb(255, 149, 0) (orange)
- Transitions: 0.2s ease
- Button height: 85px for sliders, 40px for chips

---

## Mobile vs Desktop

**Mobile (< 768px):**
- Single column layout
- Compact zone buttons (icon + percentage)
- Swipe for popups
- Bottom navigation for views

**Desktop (> 768px):**
- 2-3 column layout
- Full zone names visible
- Side panels for popups
- Top navigation for views

---

## Implementation Priority

1. **OAL System Status Card** - Shows mode, config, global slider
2. **Zone Quick Access Card** - 6 zones with brightness indicators
3. **Sonos Media Card** - Current playback with group controls
4. **OAL Config Popup** - All offsets and settings
5. **Zone Detail Popups** - Individual light control per zone
6. **Sonos Detail Popup** - Full Sonos Card integration

---

## Files Reference

**Input Documents:**
- ha_inventory_main.md - System overview
- ha_lights.md - All 34 lights detailed
- ha_media.md - Sonos and entertainment
- ha_automations_scripts.md - Automation details
- ha_sensors_inputs.md - All helpers and sensors

**Output:**
- dash-2.yaml - Implementation of this architecture

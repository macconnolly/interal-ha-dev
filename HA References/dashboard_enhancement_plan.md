# Dashboard Enhancement Plan
## Elevating from Functional to Exceptional

---

## Philosophy Reminder
> "Every room card is a living organism that reflects:
> - What's happening now
> - What could happen next
> - What needs attention"

---

## 1. UNTAPPED PACKAGE VALUE INVENTORY

### Sonos Package - Available for Dashboard

| Entity | Type | Purpose | Currently Used |
|--------|------|---------|----------------|
| `sensor.sonos_upcoming_alarms` | Sensor | All alarms today/tomorrow with timestamps | Partially |
| `sensor.sonos_next_alarm_chip` | Sensor | is_enabled, hours_until, was_manually_disabled | Yes |
| `sensor.sonos_current_playing_group_coordinator` | Sensor | media_title, media_artist, source, volume, group_members | No |
| `sensor.sonos_*_group_label` | Sensors | Group membership status per room | No |
| `binary_sensor.sonos_*_in_playing_group` | Binary | Room in active group | Yes |
| `script.sonos_group_all_to_playing` | Script | Group all speakers to coordinator | No |
| `script.sonos_ungroup_all` | Script | Ungroup all speakers | No |
| `script.sonos_all_pause` | Script | Pause all speakers | No |
| `input_select.sonos_group_selector` | Input | Room picker dropdown | No |
| `input_number.sonos_default_volume` | Input | Default volume slider | No |

### OAL Package - Available for Dashboard

| Entity | Type | Purpose | Currently Used |
|--------|------|---------|----------------|
| `script.oal_global_manual_warmer` | Script | Decrease color temp | No |
| `script.oal_global_manual_cooler` | Script | Increase color temp | No |
| `script.oal_global_manual_dimmer` | Script | Decrease brightness | No |
| `script.oal_global_manual_brighter` | Script | Increase brightness | No |
| `input_number.oal_offset_global_manual_warmth` | Input | Manual warmth offset slider | No |
| `input_boolean.oal_environmental_boost_enabled` | Input | Toggle env boost | No |
| `input_boolean.oal_force_sleep` | Input | Force sleep mode | No |
| `sensor.oal_system_status` | Sensor | zones_adaptive, total_modification, overridden_zones | Partially |

---

## 2. BUBBLE CARD POPUP ARCHITECTURE

### Popup 1: #sonos-main (Now Playing Hub)
```yaml
type: custom:bubble-card
card_type: pop-up
hash: '#sonos-main'
# Contains:
# - Album art from coordinator
# - Title/Artist from sensor.sonos_current_playing_group_coordinator
# - Volume slider for coordinator
# - Play/Pause/Skip controls
# - Links to #sonos-groups and #sonos-alarms
```

### Popup 2: #sonos-groups (Speaker Grouping)
```yaml
type: custom:bubble-card
card_type: pop-up
hash: '#sonos-groups'
# Contains:
# - 5 speaker toggle tiles (Living, Dining, Kitchen, Bath, Bedroom)
# - Visual group membership indicators
# - "Group All" button -> script.sonos_group_all_to_playing
# - "Ungroup All" button -> script.sonos_ungroup_all
# - Coordinator badge on active coordinator
```

### Popup 3: #sonos-alarms (Alarm Management)
```yaml
type: custom:bubble-card
card_type: pop-up
hash: '#sonos-alarms'
# Contains:
# - List from sensor.sonos_upcoming_alarms.raw_alarm_list_sorted
# - Each alarm: time, room, toggle switch
# - "Disable Tomorrow's Alarms" -> script.disable_tomorrows_sonos_alarms
# - Simple alarm set shortcut (more-info on bedroom Sonos)
```

### Popup 4: #oal-settings (Lighting Controls)
```yaml
type: custom:bubble-card
card_type: pop-up
hash: '#oal-settings'
# Contains:
# - Visual preset buttons (Full, Ambient, TV Mode, Sleep)
# - Warmth slider -> input_number.oal_offset_global_manual_warmth
# - Environmental boost toggle
# - Override timeout slider
# - System pause toggle
```

---

## 3. UNIFORM INTERACTION MODEL

### Light Tiles
| Action | Behavior |
|--------|----------|
| **Tap** | Toggle on/off |
| **Hold** | Open more-info (detailed controls) |
| **Double-tap** | Set to 100% brightness |
| **Drag** | Adjust brightness via slider |

### Media/Sonos Tiles
| Action | Behavior |
|--------|----------|
| **Tap** | Play/Pause toggle |
| **Hold** | Open #sonos-main popup |
| **Double-tap** | Set volume to 30% (default) |
| **Drag** | Adjust volume via slider |

### Hero Quick Action Buttons
| Action | Behavior |
|--------|----------|
| **Tap** | Primary action (toggle, select) |
| **Hold** | Open related popup or more-info |

### Room Card Headers
| Action | Behavior |
|--------|----------|
| **Tap** | Toggle room light group |
| **Hold** | Open room controls popup |
| **Double-tap** | Set room to 100% |

### Alarm Chip
| Action | Behavior |
|--------|----------|
| **Tap** | Toggle next alarm on/off |
| **Hold** | Open #sonos-alarms popup |

### Speaker/Grouping Chip
| Action | Behavior |
|--------|----------|
| **Tap** | Toggle room in/out of group |
| **Hold** | Open #sonos-groups popup |

---

## 4. HERO QUICK ACTIONS - ADDITIONS

### Current Quick Actions:
1. All Lights Toggle
2. Config Dropdown
3. Reset (conditional)
4. Media Play/Pause (conditional)
5. Alarm Chip (conditional)
6. Speakers (conditional)

### Add:
7. **Warmer** button
   - Icon: `mdi:thermometer-minus`
   - Tap: `script.oal_global_manual_warmer`
   - Hold: `script.oal_global_manual_cooler`
   - Visibility: Always (lights provide context)

8. **Dimmer** button
   - Icon: `mdi:brightness-4`
   - Tap: `script.oal_global_manual_dimmer`
   - Hold: `script.oal_global_manual_brighter`
   - Visibility: Always

*These match the Zen32 controller patterns for muscle memory consistency*

---

## 5. SONOS CARD ENHANCEMENT

### Current State
- Simple room tiles with play/pause
- Basic group indicators

### Enhanced Three-Column Layout
```
┌─────────────────────────────────────────────────┐
│ [Album Art]  │  Now Playing Info    │ [Volume] │
│              │  Title / Artist      │ [Slider] │
│              │  Source indicator    │          │
├─────────────────────────────────────────────────┤
│ [Living] [Dining] [Kitchen] [Bath] [Bedroom]   │
│     Group membership toggles - tap to add/rem  │
├─────────────────────────────────────────────────┤
│ [Skip Prev] [Play/Pause] [Skip Next] [Shuffle] │
│           Transport controls row               │
└─────────────────────────────────────────────────┘
```

### Spotify Plus Integration
- Use existing Spotify Plus card for library browsing
- Trigger via hold on Sonos hero
- Provides playlist/album selection

---

## 6. BEDROOM ALARM SECTION

### Simple Alarm Shortcut
Add to bedroom card header area:
```yaml
- entity: sensor.sonos_next_alarm_chip
  name: ''  # Icon only
  icon: mdi:alarm
  show_state: true  # Shows time like "7:00"
  tap_action:
    action: perform-action
    perform_action: script.sonos_toggle_next_alarm
  hold_action:
    action: navigate
    navigation_path: '#sonos-alarms'
```

Visual states:
- **Enabled**: Blue icon, time visible
- **Disabled**: Gray strikethrough
- **Imminent (<30 min)**: Pulsing animation

---

## 7. IMPLEMENTATION PHASES

### Phase 1: Quick Wins (Immediate)
- [ ] Add Warmer/Dimmer buttons to hero
- [ ] Standardize double-tap = 100% on all light tiles
- [ ] Add hold = more-info on all tiles
- [ ] Add alarm shortcut to bedroom header

### Phase 2: Popup Foundation
- [ ] Create #sonos-main popup with now-playing
- [ ] Create #sonos-groups popup with toggles
- [ ] Create #sonos-alarms popup with list
- [ ] Wire hold actions to open popups

### Phase 3: Sonos Deep Customization
- [ ] Three-column Sonos card layout
- [ ] Integrate Spotify Plus card
- [ ] Add now-playing metadata display
- [ ] Add group coordinator indicator

### Phase 4: Refinement
- [ ] Audit all tiles for interaction consistency
- [ ] Add loading states and feedback
- [ ] Performance optimization
- [ ] Documentation update

---

## 8. COLOR SYSTEM REFERENCE

| State | Color | Usage |
|-------|-------|-------|
| Lights ON | `rgba(255, 149, 0, X)` | Orange accent |
| Sonos Active | `rgba(66, 133, 244, X)` | Blue accent |
| Override/Manual | `rgba(156, 39, 176, X)` | Purple accent |
| Manual Dot | `rgb(255, 110, 90)` | Coral dot |
| Alarm Imminent | `rgba(66, 133, 244, X)` | Blue pulse |
| Heating | `rgba(244, 67, 54, X)` | Red |
| Cooling | `rgba(66, 133, 244, X)` | Blue |
| Idle/Off | `rgba(100, 100, 100, X)` | Gray |

---

## 9. SOURCES

- [Bubble Card GitHub](https://github.com/Clooos/Bubble-Card) - Popup configuration
- [Home Assistant Sonos Integration](https://www.home-assistant.io/integrations/sonos/) - Alarm control
- [HA Community Forum](https://community.home-assistant.io/t/bubble-card-a-minimalist-card-collection-for-home-assistant-with-a-nice-pop-up-touch/609678) - Advanced examples

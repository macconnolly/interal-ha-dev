# Home Assistant System Inventory
## Complete Dashboard Planning Reference

**Generated:** 2025-12-02
**HA Version:** 2025.12.0
**Total Entities:** 480
**Total Domains:** 29
**Total Services Available:** 390

---

## System Overview

### Entity Count by Domain (Top 15)
| Domain | Count | Primary Purpose |
|--------|-------|-----------------|
| sensor | 131 | Environmental, device status, mobile devices |
| switch | 75 | Adaptive Lighting, Sonos alarms, Z-Wave controls |
| update | 35 | Add-on and integration updates |
| light | 34 | Hue lights, Govee columns, dimmers |
| number | 28 | Sonos EQ, LED settings, OAL controls |
| automation | 28 | OAL lighting, Sonos, Apple TV, remotes |
| binary_sensor | 21 | Motion, presence, focus modes, connectivity |
| script | 19 | OAL controls, Sonos grouping, notifications |
| input_number | 17 | OAL offset controls, Sonos volume |
| input_boolean | 12 | OAL toggles, Sonos settings, Apple TV |
| media_player | 12 | Sonos, Apple TV, Samsung TVs, Spotify |
| event | 11 | Button presses, backups, scene controller |
| select | 11 | LED indicators, music modes, power behavior |
| scene | 7 | All On, All Off, Dim, Entertain |
| button | 7 | Device identification, pings |

### Controllable Domains
- **Lights:** 34 entities (31 available, 3 unavailable)
- **Switches:** 75 entities (34 on, 41 off)
- **Climate:** 1 entity (Thermostat - heat_cool mode)
- **Media Players:** 12 entities (5 Sonos, 2 Samsung TVs, Apple TV, Spotify)
- **Remotes:** 3 entities (Apple TV, Samsung TVs)
- **Scenes:** 7 entities

### Person & Location
- **Mac Connolly:** Home
- **Device Trackers:** 7 (iPhones, iPad)
- **Zones:** 2 (Home zones defined)

---

## Major System Components

### 1. OAL (Organic Adaptive Lighting) System v13
A sophisticated circadian lighting automation system with:
- **17 Automations** managing brightness, color temperature, and scheduling
- **8 Scripts** for manual control adjustments
- **17 Input Numbers** for offset controls
- **12 Input Booleans** for system state toggles
- **3 Input Selects** for configuration profiles
- **6 Adaptive Lighting Zones:** main_living, kitchen_island, bedroom_primary, accent_spots, recessed_ceiling, column_lights

**Current State:**
- System Status: "Baseline Adaptation"
- Real-Time Monitor: "Boosted"
- Environmental Boost: Enabled
- Movie Mode: Off
- Sleep Mode: Off
- System Paused: Off

### 2. Sonos Multi-Room Audio
- **5 Sonos Speakers:**
  - Living Room TV Sonos Soundbar (with surround + subwoofer)
  - Kitchen Sonos
  - Bathroom Sonos
  - Bedroom Sonos
  - Dining Room Credenza Speaker

- **26 Sonos Alarms** configured across rooms
- **Grouping Automations:** All speakers currently grouped
- **Current Playback:** Paused - "Stay Here" by Rivo (Spotify integration)

**Features:**
- Group all/ungroup all functionality
- Per-room toggle in current group
- Nightly alarm management and prompts
- Auto-enable tomorrow's alarms at 21:00
- Favorites: 8 items (Daily Mixes, Country, Songs, etc.)

### 3. Apple TV & Entertainment
- **Apple TV:** Living Room (off, 22+ apps available)
- **Samsung TVs:** Living Room TV, Bedroom TV
- **Spotify Integration:** Idle, Premium user (macmac80210)
- **SpotifyPlus Integration:** Advanced Spotify control

**Automations:**
- Auto-off after inactivity
- Track last playing timestamp
- Prevent auto-off toggle

### 4. Scene Controller (Zooz ZEN32)
- **5-button Z-Wave scene controller**
- **LED Indicators:** Configurable per-button
- **Events:** Scene 001-006 for button presses
- **Integrated with OAL** for brightness/color control

### 5. Mobile Device Tracking
- **7 iPhones/iPads tracked** with:
  - Battery levels and states
  - Location (geocoded addresses)
  - Focus mode status
  - Activity tracking (steps, floors, pace)
  - Connection type (Wi-Fi/Cellular)
  - SIM information

---

## Integrations Detected

| Integration | Entities | Notes |
|-------------|----------|-------|
| Adaptive Lighting | 24 switches | 6 lighting zones |
| Sonos | 40+ entities | 5 speakers, alarms, grouping |
| Philips Hue | 15+ lights | Motion sensors, dimmer switch |
| Govee | 2 lights | Column accent lights |
| Samsung TV | 4 entities | 2 TVs (Living Room, Bedroom) |
| Apple TV | 3 entities | Remote, media player |
| Z-Wave (Z-Stick Gen5) | 15+ entities | Scene controller, status |
| Spotify | 2 entities | Standard + SpotifyPlus |
| Mobile App | 70+ sensors | iPhone/iPad tracking |
| Home Assistant Cloud | 3 entities | TTS, STT, Remote UI |
| Ecobee (implied) | 1 entity | Thermostat |
| HACS | 15+ custom cards | Bubble Card, Mushroom, etc. |

---

## Available Services by Category

### Most Useful for Dashboards

**Light Control:**
- `light.turn_on/turn_off/toggle`
- `adaptive_lighting.apply`
- `adaptive_lighting.set_manual_control`

**Media Control:**
- `media_player.play_media`, `media_pause`, `media_play`
- `media_player.volume_set`, `volume_up/down`
- `sonos.snapshot/restore`
- `spotifyplus.*` (107 services)

**Climate:**
- `climate.set_temperature`
- `climate.set_hvac_mode`
- `climate.set_preset_mode`

**Scene/Script:**
- `scene.turn_on`
- `script.turn_on`

---

## Files in This Inventory

1. **ha_inventory_main.md** (this file) - System overview
2. **ha_lights.md** - All lights, groups, and Adaptive Lighting
3. **ha_media.md** - Sonos, TVs, Apple TV, Spotify
4. **ha_automations_scripts.md** - Automations and scripts
5. **ha_sensors_inputs.md** - Sensors, inputs, helpers
6. **ha_dashboards.md** - Dashboard configurations

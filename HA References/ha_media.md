# Home Assistant Media & Entertainment System

**Generated:** 2025-12-02
**Total Media Player Entities:** 12
**Sonos Speakers:** 5 (all grouped)
**TVs:** 2 (Samsung)
**Other Players:** 3 (Apple TV, Spotify, SpotifyPlus)

---

## Sonos Multi-Room Audio System

### Active Sonos Speakers (5 Total)

| Entity ID | Name | Status | Volume | Current Track | Group |
|-----------|------|--------|--------|---------------|-------|
| media_player.living_room | Living Room TV Sonos Soundbar | paused | 19% (0.19) | Stay Here - Rivo | Grouped |
| media_player.kitchen | Kitchen Sonos | paused | 15% (0.15) | Stay Here - Rivo | Grouped |
| media_player.bedroom | Bedroom Sonos | paused | 5% (0.05) | Stay Here - Rivo | Grouped |
| media_player.bath | Bathroom Sonos | paused | 5% (0.05) | Stay Here - Rivo | Grouped |
| media_player.dining_room | Dining Room Credenza Speaker | paused | 5% (0.05) | Stay Here - Rivo | Grouped |

**Current Playback Status:**
- Media Content ID: x-sonos-spotify:spotify%3atrack%3a63B5eUEndzIY9BGwcUASmv
- Track: "Stay Here" by Rivo
- Album: "Stay Here"
- Playlist: Songs (1104 total tracks, queue position 34)
- Duration: 238 seconds
- Position: 142 seconds
- Shuffle: ON
- Repeat: OFF
- Last Updated: 2025-12-02 22:52:36

### Sonos Configuration & Features

**Supported Features:**
- Play/pause/stop control
- Volume control (0.0-1.0)
- Seek/position control
- Source selection
- Shuffle & repeat modes
- Queue management
- Playlist support
- Snapshot & restore functionality

**Sonos Grouping Status:**
- All 5 speakers currently grouped together
- Group Coordinator: Living Room TV Sonos (primary hub)
- Group Members: All 5 speakers synchronized

### Sonos Alarms (26 Total Configured)

**Alarm Helpers:**
| Entity | State | Purpose |
|--------|-------|---------|
| input_boolean.sonos_alarm_notifications | ON | Enable/disable alarm notifications |
| input_boolean.sonos_auto_group_enabled | ON | Auto-group speakers during alarms |
| input_number.sonos_default_volume | 0.0 | Default volume for alarm playback |
| input_text.sonos_alarms_disabled_for_tomorrow | (empty) | Track disabled alarms |

**Alarm State Sensors:**
| Entity | State |
|--------|-------|
| sensor.sonos_alarms_for_tomorrow | 0 alarm(s) scheduled for tomorrow |
| sensor.sonos_upcoming_alarms | 0 upcoming alarm(s) |
| sensor.soonest_sonos_alarm_info | unknown |

**Sample Alarms by Room:**
- Bedroom Sonos: 5 alarms (05:15, 06:30, 07:30, 09:15, 17:38)
- Kitchen: 2 alarms (03:45, 04:08)
- Bathroom: 7 alarms (04:15, 05:20, 06:55, 08:00, 06:57, 10:00, weekends)

### Sonos Group Management

**Automations:**
| Automation | State | Purpose |
|-----------|-------|---------|
| automation.sonos_group_selector_dropdown_handler | ON | Handle group selector UI |
| automation.sonos_alarm_state_change_trigger_update | ON | Track alarm changes |
| automation.sonos_nightly_alarm_prompt_21_30 | ON | Remind about tomorrow's alarms |
| automation.sonos_re_enable_tomorrow_s_alarms_at_21_00 | ON | Auto-enable alarms at 21:00 |

**Scripts:**
- script.sonos_group_all_speakers - Group all speakers
- script.sonos_ungroup_all - Ungroup all speakers
- script.sonos_all_pause - Pause all speakers
- script.sonos_toggle_group_membership - Toggle room in current group
- script.sonos_group_all_to_playing - Group to current playing

**Helper Controls:**
| Entity | Type | Current Value | Purpose |
|--------|------|---------------|---------|
| input_select.sonos_group_selector | Select | Select room | UI dropdown for grouping |

**Group Status Sensors:**
| Entity | State |
|--------|-------|
| sensor.sonos_living_room_group_label | In group with: Dining, Bath, Bedroom, Kitchen |
| sensor.sonos_kitchen_group_label | In group with: Dining, Living Room, Bath, Bedroom |
| sensor.sonos_bedroom_group_label | In group with: Dining, Bath, Living Room, Kitchen |
| sensor.sonos_bath_group_label | In group with: Dining, Living Room, Bedroom, Kitchen |
| sensor.sonos_dining_room_group_label | In group with: Bath, Living Room, Bedroom, Kitchen |

**Group Membership Indicators:**
| Entity | State | Meaning |
|--------|-------|---------|
| binary_sensor.sonos_living_room_in_playing_group | OFF | Not in playing group |
| binary_sensor.sonos_kitchen_in_playing_group | OFF | Not in playing group |
| binary_sensor.sonos_bedroom_in_playing_group | OFF | Not in playing group |
| binary_sensor.sonos_bath_in_playing_group | OFF | Not in playing group |
| binary_sensor.sonos_dining_room_in_playing_group | OFF | Not in playing group |

### Sonos Favorites (8 Total)

| Name | Type |
|------|------|
| Daily Mix (1-5) | Spotify Daily Mix playlists |
| Country | Genre playlist |
| Songs | General songs playlist |

Accessed via: sensor.sonos_favorites

### Sonos Audio Settings

**Bedroom Sonos Audio Controls:**
- switch.office_loudness - ON (loudness enhancement enabled)
- switch.office_crossfade - OFF (crossfade disabled)

---

## Samsung TVs (2 Total)

### Living Room TV

**Entity:** media_player.living_room_samsung_q60
- **Status:** OFF
- **Device Class:** TV
- **Features:** Source selection (TV, HDMI)
- **Supported Services:** Basic on/off, source control
- **Last Updated:** 2025-12-02 08:13:33

### Bedroom TV

**Entity:** media_player.samsung_tv_2
- **Status:** OFF
- **Device Class:** TV
- **Features:** Source selection (TV, HDMI)
- **Supported Services:** Basic on/off, source control
- **Last Updated:** 2025-11-30 02:57:53

### Legacy TV Entities (Unavailable)

| Entity | Name | Status |
|--------|------|--------|
| media_player.tv_samsung_tv | Samsung TV | unavailable |
| media_player.tv_samsung_q60_series_82 | Samsung Q60 Series (82) | unavailable |

---

## Apple TV

**Entity:** media_player.living_room_apple_tv
- **Name:** Living Room
- **Status:** OFF
- **Supported Features:** 450487 (extensive support)
- **Available Apps (22):**
  - App Store, Arcade, Computers, Disney+
  - FaceTime, Fitness, HBO Max, Hulu
  - Movies, Music, Netflix, Paramount+
  - Photos, Podcasts, Prime Video, Search
  - Settings, Spotify, TV, TV Shows, YouTube, YouTube TV

**Services Available:**
- Play/pause control
- App launching
- Source selection
- Remote control

---

## Spotify Integration

### Standard Spotify Player

**Entity:** media_player.spotify_mac_connolly
- **Status:** IDLE
- **User:** Mac Connolly (Premium)
- **Email:** macconnolly@kpmg.com
- **User ID:** macmac80210
- **Supported Features:** Limited (media control)

### SpotifyPlus Integration (Advanced)

**Entity:** media_player.spotifyplus_mac_connolly
- **Status:** OFF
- **User:** Mac Connolly
- **Account Type:** Premium
- **Country:** US
- **User ID (Spotify URI):** spotify:user:macmac80210
- **Supported Features:** 6737855 (extensive - 107 services)

**SpotifyPlus Capabilities:**
- Web player credentials: False
- Advanced playback control
- Device management
- Playlist manipulation
- Full SpotifyPlus service suite (107 available services)
- Album/track/artist browsing
- Smart search

**Device Source List:**
- Kitchen (primary device)

---

## All Media Players Summary

### Status Overview
| Count | Status |
|-------|--------|
| 5 | Paused (Sonos speakers) |
| 4 | OFF (Apple TV, Samsung TVs) |
| 2 | Idle (Spotify players) |
| 1 | Unavailable |

### Playback Capabilities by Device

| Device | Play | Pause | Volume | Seek | Source | Apps |
|--------|------|-------|--------|------|--------|------|
| Sonos (5) | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Apple TV | ✓ | ✓ | ✓ | ✓ | ✓ | 22 |
| Samsung TVs | ✓ | ✓ | - | - | ✓ | - |
| Spotify | ✓ | ✓ | ✓ | ✓ | - | - |
| SpotifyPlus | ✓ | ✓ | ✓ | ✓ | ✓ | Advanced |

---

## Media Service Integration

### Available Media Services

**Sonos Services:**
- `media_player.play_media` - Play track/playlist
- `media_player.volume_set` - Set volume (0-1)
- `media_player.volume_up/down` - Adjust volume
- `media_player.media_play/pause/stop` - Playback control
- `sonos.snapshot` - Save current state
- `sonos.restore` - Restore previous state

**SpotifyPlus Services (107 Available):**
- Advanced playback control
- Playlist creation/modification
- Device switching
- Feature control
- Analytics

**TV Services:**
- Source control
- Power on/off

### Dashboard-Ready Entities

**Best for Cards:**
- Sonos speakers (5) - Full playback control
- Apple TV - Source/app selection
- Samsung TVs (2) - Source selection
- Spotify - Playback control

**Sensor Entities for Info Display:**
- sensor.sonos_alarms_for_tomorrow
- sensor.sonos_upcoming_alarms
- sensor.sonos_current_playing_group_coordinator
- sensor.sonos_favorites

**Helper Entities for Control:**
- input_number.sonos_default_volume
- input_select.sonos_group_selector
- input_boolean.sonos_auto_group_enabled
- input_boolean.sonos_alarm_notifications

---

## Current Audio Setup Summary

**Active Audio System:** Sonos throughout home with Spotify integration
**Grouping Mode:** All 5 speakers currently grouped and synchronized
**Current Playback:** Paused at "Stay Here" by Rivo (142s/238s)
**Sonos Favorites:** 8 stored (Daily Mixes, Country, Songs)
**Alarms Configured:** 26 total (primarily Bedroom + Bath)
**Primary Music Source:** Spotify (Premium account)

**Last Activity:** 2025-12-02 22:52:36 UTC

# OAL Entity Reference Guide

## Complete Inventory of All 36+ OAL Entities

This guide documents every configuration, state, and monitoring entity in the OAL v13 system, organized by type and function.

---

## QUICK INDEX (Alphabetical)

**Input Boolean Entities (11 total)**
- `input_boolean.oal_autoreset_sync_lock`
- `input_boolean.oal_config_power_handoff_active`
- `input_boolean.oal_config_transition_active`
- `input_boolean.oal_disable_next_sonos_wakeup`
- `input_boolean.oal_disable_sleep_mode`
- `input_boolean.oal_environmental_boost_enabled`
- `input_boolean.oal_movie_mode_active`
- `input_boolean.oal_night_dimming_enabled`
- `input_boolean.oal_system_paused`
- `input_boolean.living_room_expanded`

**Input Select Entities (2 total)**
- `input_select.oal_active_configuration`
- `input_select.oal_isolated_override_mode`

**Input Number Entities (19 total)**
Global: 1 | Configuration: 2 | Environmental: 2 | Sunset: 2 | Night: 3 | Control: 2 | Per-Zone: 6 | Special: 1

**Input DateTime Entities (2 total)**
- `input_datetime.oal_last_engine_run`
- `input_datetime.oal_late_night_start`

**Template Sensors (3 total)**
- `sensor.oal_realtime_monitor`
- `sensor.oal_system_status`
- `sensor.oal_average_active_color_temperature`

---

## SECTION 1: INPUT BOOLEAN ENTITIES (Feature Toggles)

### System Control Booleans

#### `input_boolean.oal_system_paused`
- **Friendly Name**: OAL System Paused
- **Initial State**: OFF
- **Icon**: mdi:pause
- **Purpose**: Master emergency pause switch. When ON, all lighting automations freeze and lights stop responding
- **Design Intent**: Emergency stop for troubleshooting or testing
- **Used By**: Global Pause Manager, Core Engine (checks condition before executing)
- **Controls**: When toggled, turns ALL AL switches on/off immediately
- **Related**: Input_select.oal_active_configuration (independent, system pause overrides)
- **Behavior**: Respected by every calculation - pause = lights frozen in place
- **Recovery**: Turn OFF to resume normal operation

#### `input_boolean.oal_environmental_boost_enabled`
- **Friendly Name**: OAL Env Boost Enabled
- **Initial State**: ON
- **Icon**: mdi:weather-cloudy
- **Purpose**: Toggle environmental brightness adaptation on/off
- **Design Intent**: Allow user to disable weather-based brightness without full system pause
- **Used By**: Environmental Manager automation
- **Controls**: When OFF, environmental offset = 0 (no brightness boost from weather)
- **Related**: Input_number.oal_brightness_environmental_offset (dependent on this boolean)
- **Behavior**: Environmental Manager checks this before calculating offset
- **Typical Use**: Disable if brightness boosts during cloudy weather are unwanted

#### `input_boolean.oal_night_dimming_enabled`
- **Friendly Name**: OAL Night Dimming Enabled
- **Initial State**: ON
- **Icon**: mdi:moon-waning-crescent
- **Purpose**: Toggle deep-night automatic dimming on/off
- **Design Intent**: Allow user to prevent excessive dimming in evening/night hours
- **Used By**: Night Behavior Manager automation
- **Controls**: When OFF, night_offset = 0 (no automatic evening dimming)
- **Related**: Input_number.oal_night_dimming_strength (controls magnitude if enabled)
- **Behavior**: Checked at start of night dimming calculation
- **Special Note**: Different from sleep mode - this is automatic evening behavior

#### `input_boolean.oal_disable_sleep_mode`
- **Friendly Name**: OAL Disable Sleep Mode
- **Initial State**: ON (default disabled - meaning sleep mode IS enabled)
- **Icon**: mdi:sleep
- **Purpose**: Override and prevent sleep mode automation from activating
- **Design Intent**: For users who don't want automatic bedtime dimming
- **Used By**: Manage Sleep Mode Schedule automation (checks this condition)
- **Controls**: When ON, sleep mode scheduling is completely disabled
- **Related**: Sleep mode is activated by setting `input_select.oal_active_configuration` to "Sleep"
- **Behavior**: Blocks automatic sleep mode at configured bedtime
- **Recovery**: Turn OFF to re-enable sleep mode scheduling

#### `input_boolean.oal_movie_mode_active`
- **Friendly Name**: OAL Movie Mode Active
- **Initial State**: OFF
- **Icon**: mdi:movie
- **Purpose**: Indicates when movie mode is currently active
- **Design Intent**: UI indicator of movie mode state, used by various systems
- **Used By**: Movie Mode Handler (sets this), Multiple automations (check this)
- **Controls**: When ON, lights are dimmed per movie configuration
- **Related**: Input_select.oal_active_configuration (may switch to TV Mode when this is ON)
- **Behavior**: Set automatically when Apple TV starts playing, cleared when playback stops
- **Snapshot**: Scene.oal_before_movie is created/restored when this changes

#### `input_boolean.oal_disable_next_sonos_wakeup`
- **Friendly Name**: OAL Disable Next Sonos Wakeup
- **Initial State**: OFF
- **Icon**: mdi:alarm
- **Purpose**: Skip wake-up lighting on the next Sonos alarm trigger
- **Design Intent**: User can disable wake-up sequence without modifying automations
- **Used By**: Wake-up Sequence, Dynamic Sunrise Manager (check condition)
- **Controls**: When ON, wake-up lighting won't trigger next alarm
- **Related**: Input_select.oal_active_configuration (different - this disables lighting, not config)
- **Behavior**: Checked at wake-up time, auto-resets to OFF after wake-up completes
- **Typical Use**: One-time disable without configuration changes

---

### Coordination Booleans (Internal Synchronization)

#### `input_boolean.oal_config_transition_active`
- **Friendly Name**: OAL Config Transition Active
- **Initial State**: OFF
- **Icon**: mdi:transition
- **Purpose**: Lock flag that prevents Core Engine from running during configuration changes
- **Design Intent**: Prevent race conditions when switching profiles
- **Used By**: Configuration Manager (sets ON/OFF), Core Engine (respects as gate)
- **Controls**: When ON, Core Engine waits (won't run normal triggers)
- **Related**: Force-apply flag (watchdog can bypass this lock)
- **Behavior**: Set ON before config changes, OFF after transition completes
- **Typical Sequence**: Config select → Lock ON → Apply changes → Lock OFF → Engine runs
- **Safety**: Ensures smooth transitions without overlapping calculations

#### `input_boolean.oal_config_power_handoff_active`
- **Friendly Name**: OAL Config Power Handoff Active
- **Initial State**: OFF
- **Icon**: mdi:hand-right
- **Purpose**: Controls power handoff when switching configurations
- **Design Intent**: Coordinate light on/off during config transitions
- **Used By**: Configuration Manager (checks this)
- **Controls**: When ON, enables special light control handoff logic
- **Related**: Input_boolean.oal_config_transition_active (works alongside)
- **Behavior**: Manages which lights turn on/off during profile changes
- **Typical Use**: Ensure lights don't flicker during config switches

#### `input_boolean.oal_autoreset_sync_lock`
- **Friendly Name**: OAL Autoreset Sync Lock
- **Initial State**: OFF
- **Icon**: mdi:lock
- **Purpose**: Prevents ping-pong between input_number and AL switch autoreset timeouts
- **Design Intent**: Bidirectional sync without infinite loops
- **Used By**: Autoreset Sync automations (both Input→AL and AL→Input)
- **Controls**: When ON, sync automations skip execution (preventing feedback)
- **Related**: Input_number.oal_control_zonal_timeout_hours (synced by this lock)
- **Behavior**: Set ON during sync, OFF after sync completes, 1-second duration
- **Pattern**: Lock → Update entity → 1s delay → Unlock
- **Safety**: Prevents automation loops if both syncs run simultaneously

#### `input_boolean.living_room_expanded`
- **Friendly Name**: Living Room Card Expanded
- **Initial State**: ON
- **Icon**: (no icon set)
- **Purpose**: UI control for dashboard card expansion state
- **Design Intent**: Remember user's dashboard card visibility preference
- **Used By**: Dashboard cards (controls which details show)
- **Controls**: When ON, full card details visible; when OFF, card collapsed
- **Related**: Dashboard only - not used by OAL automations
- **Behavior**: Toggled by user clicking card expand/collapse button
- **Persistence**: State is remembered across page reloads

---

## SECTION 2: INPUT SELECT ENTITIES (Mode Selection)

### `input_select.oal_active_configuration`

- **Friendly Name**: OAL Active Configuration
- **Available Options**:
  - Adaptive
  - Full Bright
  - Dim Ambient
  - Warm Ambient
  - TV Mode
  - Sleep
  - Manual
- **Initial/Default**: Adaptive
- **Icon**: mdi:palette
- **Purpose**: Selects the current lighting profile/preset
- **Design Intent**: User can switch between pre-configured lighting scenes
- **Used By**: Configuration Manager (triggers on change), all offset automations (read for context)
- **Controls**: Changes offset_config_brightness and offset_config_warmth based on selected profile
- **Related**: Sleep option toggles AL sleep mode switches via Config Manager
- **Behavior**: User selects from dropdown → Configuration Manager applies settings → Core Engine recalculates
- **Typical Sequence**:
  1. User selects "TV Mode"
  2. Configuration Manager triggers
  3. Transition lock activated
  4. Config offsets set to TV Mode values
  5. Specific lights dimmed/off
  6. Transition lock cleared
  7. Core Engine applies new values
  8. Lights smoothly transition

**Profile Details**:
- **Adaptive**: No forced offsets, AL operates normally
- **Full Bright**: All lights on at AL's calculated values
- **Dim Ambient**: All lights dimmed for evening ambiance (-30 brightness, -500K warmth)
- **Warm Ambient**: Very dim and very warm for intimate settings (-50 brightness, -1000K warmth)
- **TV Mode**: Specific lights off/dimmed to prevent screen glare (-60 brightness, -1500K warmth)
- **Sleep**: All lights dimmed to minimum (coordinated with force_sleep flag)
- **Manual**: User in manual override mode (awaiting autoreset)

### `input_select.oal_isolated_override_mode`

- **Friendly Name**: OAL Isolated Override Mode
- **Available Options**:
  - Off
  - Work (Office Desk)
- **Initial/Default**: Off
- **Icon**: mdi:lamp-desk
- **Purpose**: Selects single-zone override mode for specific task lighting
- **Design Intent**: Quick access to zone-specific lighting without changing global config
- **Used By**: Isolated Override Manager automation
- **Controls**: When set to specific mode, that zone locks to specific brightness/color
- **Typical Use**: "Work (Office Desk)" → Office desk lamp fixed at 100% brightness, 4000K color
- **Behavior**:
  - OFF: All zones operate normally
  - Work (Office Desk): Office lamp set to work settings, other zones unaffected
- **Related**: Manual configuration selection (independent - one is global, this is per-zone)

---

## SECTION 3: INPUT NUMBER ENTITIES (Adjustment Parameters)

[Due to length constraints, detailed input_number documentation is in the complete guide - 18 entities covering global warmth, configuration offsets, environmental factors, sunset behavior, night behavior, control parameters, and per-zone brightness offsets]

---

## SECTION 4: INPUT DATETIME ENTITIES (Timing & Tracking)

### `input_datetime.oal_last_engine_run`

- **Friendly Name**: OAL Last Engine Run
- **Has Date**: YES
- **Has Time**: YES
- **Initial Value**: (none - set first run)
- **Icon**: mdi:timer
- **Purpose**: Tracks timestamp of last Core Engine execution
- **Design Intent**: Health monitoring - detect if engine is stalled
- **Updated By**: Core Engine (sets this after every calculation)
- **Read By**: Watchdog Service (checks if > 30 minutes stale)
- **Behavior**:
  - Every Core Engine run: Set to current timestamp
  - Watchdog checks: If timestamp > 30 min old, fires watchdog event
  - Normal operation: Updates every 15 minutes (periodic trigger)
  - Manual adjust: Updates on any offset change
- **Use Cases**: Debugging stalled automations, verifying engine health

### `input_datetime.oal_late_night_start`

- **Friendly Name**: OAL Late Night Start
- **Has Date**: NO (time only)
- **Has Time**: YES
- **Initial/Default**: 22:00:00 (10 PM)
- **Icon**: mdi:moon-waning-crescent
- **Purpose**: Defines when late-night (bedtime) behavior starts
- **Design Intent**: User can set when sleep mode schedule should activate
- **Read By**: Manage Sleep Mode Schedule automation (template time check)
- **Behavior**:
  - Checked every minute by automation
  - When current time matches this time: Switch config to Sleep
  - Uses template matching: `now().strftime('%H:%M') == input_datetime.oal_late_night_start`
- **Update Pattern**: User changes time via UI → Schedule automation respects new time next day
- **Typical Use**: Set to user's normal bedtime (10 PM, 11 PM, midnight, etc.)

---

## SECTION 5: TEMPLATE SENSORS (Monitoring & Status)

[See complete guide for detailed sensor documentation including attributes, update frequency, and interpretation guides]

---

## ENTITY MODIFICATION PATTERNS

### Which Entities Users Can Safely Change

**Safe to modify**:
- `input_select.oal_active_configuration` ✓ (toggle between profiles; "Sleep" activates sleep mode)
- `input_boolean.oal_system_paused` ✓ (emergency pause)
- `input_number.oal_control_zonal_timeout_hours` ✓ (adjust autoreset duration)
- `input_datetime.oal_late_night_start` ✓ (set bedtime)

**Risky to modify**:
- Any offset input_number (can break bounds checking)
- Configuration flags (can cause race conditions)
- Sync locks (can cause infinite loops)

**Never modify directly**:
- `input_datetime.oal_last_engine_run` (auto-managed)
- `input_boolean.oal_config_transition_active` (auto-managed)
- `input_boolean.oal_autoreset_sync_lock` (auto-managed)
- Template sensors (read-only)

---

## BACKUP & RESTORE INFORMATION

### Entities That Should Be Backed Up

User preferences (manually set values):
- `input_select.oal_active_configuration` - Current profile selection
- `input_boolean.oal_disable_sleep_mode` - User preference
- `input_datetime.oal_late_night_start` - User's bedtime preference
- All `input_boolean` toggles (user preferences)

All input_number offsets will reset to 0 on system startup or reset script execution, so no backup needed.

### Entities That Can Be Safely Reset

- All offset input_numbers (reset to 0)
- Manual override flags (clear manual control)
- Sync locks (reset to OFF)
- Status booleans (reset to defaults)

Safe reset command: Call `script.oal_reset_soft` or `script.oal_reset_global`

---

**Total Entities Documented**: 36
**File Format**: YAML/Home Assistant
**Last Updated**: 2026-01-07
**System Version**: OAL v13 Production

# Home Assistant Automations & Scripts

**Generated:** 2025-12-02
**Total Automations:** 28
**Total Scripts:** 19
**Active Automations:** 26 (93%)
**Disabled Automations:** 2 (7%)

---

## OAL v13 System Automations (17 Total)

### Core System Automations

**1. OAL v13 - Core Adjustment Engine (Master)**
- **Entity:** automation.oal_v13_core_adjustment_engine_master
- **State:** ON
- **Last Triggered:** 2025-12-02 23:46:01
- **Purpose:** Master control for all lighting adjustments
- **Frequency:** Real-time continuous

**2. OAL v13 - Configuration Manager (Transition-Locked)**
- **Entity:** automation.oal_v13_configuration_manager_power_handoff
- **State:** ON
- **Last Triggered:** 2025-12-02 20:42:16
- **Purpose:** Manage configuration transitions between states
- **Feature:** Prevents interruption during mode switches

**3. OAL v13 - Seamless Sunset Logic (Unified Gaussian Curve)**
- **Entity:** automation.oal_v13_seamless_sunset_logic_unified_gaussian_curve
- **State:** ON
- **Last Triggered:** 2025-12-02 23:46:00
- **Purpose:** Calculate and apply sunset-based color/brightness curves
- **Algorithm:** Gaussian curve for smooth transitions

### Environmental & Adaptation Systems

**4. OAL v13 - Environmental Adaptation Manager (Maximized)**
- **Entity:** automation.oal_v13_environmental_adaptation_manager_maximized
- **State:** ON
- **Last Triggered:** 2025-11-21 21:55:00
- **Purpose:** Adapt lighting based on external environmental conditions
- **Features:** Environmental sensor integration, boost capability

**5. OAL v13 - Isolated Override Manager**
- **Entity:** automation.oal_v13_isolated_override_manager
- **State:** ON
- **Last Triggered:** Never (handles override events)
- **Purpose:** Manage manual light control overrides
- **Feature:** Prevents conflicts between manual and automatic control

### Time-Based & Schedule Systems

**6. OAL v13 - Dynamic Sunrise Manager**
- **Entity:** automation.oal_v13_dynamic_sunrise_manager
- **State:** ON
- **Last Triggered:** 2025-12-02 10:05:00
- **Purpose:** Calculate and apply sunrise simulation
- **Frequency:** Daily at sunrise

**7. OAL v13 - Wake-up Sequence (Staged Brightening)**
- **Entity:** automation.oal_v13_wake_up_sequence_staged_brightening
- **State:** ON
- **Last Triggered:** Never
- **Purpose:** Gradual brightness increase during wake-up
- **Stages:** Multi-step brightness ramp

**8. OAL v13 - Manage Sleep Mode Schedule**
- **Entity:** automation.oal_v13_manage_sleep_mode_schedule
- **State:** ON
- **Last Triggered:** 2025-12-02 13:00:00
- **Purpose:** Schedule sleep mode activation/deactivation
- **Frequency:** Scheduled times

### Control & Interface Systems

**9. OAL v13 - Zen32 Controller Handler**
- **Entity:** automation.oal_v13_zen32_controller_handler
- **State:** ON
- **Last Triggered:** 2025-12-02 20:42:16
- **Purpose:** Handle Zooz ZEN32 scene controller button presses
- **Buttons:** 5-button interface integration

**10. OAL v13 - Global Manual Slider Handler**
- **Entity:** automation.oal_v13_global_manual_slider_handler
- **State:** ON
- **Last Triggered:** Never
- **Purpose:** Process manual brightness/color slider inputs
- **Sync:** Updates to lights and input number helpers

**11. OAL v13 - Movie Mode Handler**
- **Entity:** automation.oal_v13_movie_mode_handler
- **State:** ON
- **Last Triggered:** Never
- **Purpose:** Activate/deactivate movie mode (dims lights, reduces color)
- **Trigger:** Manual toggle or automation

### System Maintenance & Sync

**12. OAL v13 - Nightly Maintenance (Clear Stuck Manual)**
- **Entity:** automation.oal_v13_nightly_maintenance_clear_stuck_manual
- **State:** ON
- **Last Triggered:** 2025-12-02 10:00:00
- **Purpose:** Reset stuck manual control overrides
- **Frequency:** Nightly

**13. OAL v13 - Global Pause Manager**
- **Entity:** automation.oal_v13_global_pause_manager
- **State:** ON
- **Last Triggered:** 2025-11-29 19:44:52
- **Purpose:** Pause all lighting adjustments system-wide
- **Feature:** Prevents all AL updates when active

**14. OAL v13 - System Startup Initialization**
- **Entity:** automation.oal_v13_system_startup_initialization
- **State:** ON
- **Last Triggered:** 2025-11-30 02:58:05
- **Purpose:** Initialize system on Home Assistant startup
- **Actions:** Load configurations, sync states

**15. OAL v13 - Watchdog Service**
- **Entity:** automation.oal_v13_watchdog_service
- **State:** ON
- **Last Triggered:** 2025-11-20 08:30:00
- **Purpose:** Monitor system health and detect failures
- **Frequency:** Periodic checks

### Synchronization Systems

**16. OAL v13 - Autoreset Sync (Input → AL)**
- **Entity:** automation.oal_v13_autoreset_sync_input_al
- **State:** ON
- **Last Triggered:** 2025-11-20 08:02:54
- **Purpose:** Sync input_number helpers to Adaptive Lighting switches
- **Direction:** Input numbers → AL switches

**17. OAL v13 - Autoreset Sync (AL → Input)**
- **Entity:** automation.oal_v13_autoreset_sync_al_input
- **State:** ON
- **Last Triggered:** Never
- **Purpose:** Sync Adaptive Lighting states to input_number helpers
- **Direction:** AL switches → Input numbers

---

## Sonos System Automations (4 Total)

**1. Sonos Alarm State Change Trigger Update**
- **Entity:** automation.sonos_alarm_state_change_trigger_update
- **State:** ON
- **Last Triggered:** 2025-12-02 07:00:00
- **Purpose:** Update alarm state sensors when alarm configuration changes
- **Triggers:** Sonos alarm creation/modification/deletion

**2. Sonos Nightly Alarm Prompt 21:30**
- **Entity:** automation.sonos_nightly_alarm_prompt_21_30
- **State:** ON
- **Last Triggered:** 2025-12-02 04:30:00
- **Purpose:** Remind user about alarms set for next day
- **Time:** 21:30 (9:30 PM)
- **Action:** TTS notification

**3. Sonos Re-Enable Tomorrow's Alarms at 21:00**
- **Entity:** automation.sonos_re_enable_tomorrow_s_alarms_at_21_00
- **State:** ON
- **Last Triggered:** 2025-12-02 04:00:00
- **Purpose:** Auto-enable tomorrow's alarms (disabled by sleep mode)
- **Time:** 21:00 (9:00 PM)

**4. Sonos - Group selector dropdown handler**
- **Entity:** automation.sonos_group_selector_dropdown_handler
- **State:** ON
- **Last Triggered:** 2025-12-02 01:16:52
- **Purpose:** Handle UI dropdown for speaker grouping control
- **Trigger:** UI selection change

---

## Apple TV Automations (2 Total)

**1. Apple TV Track Last Playing**
- **Entity:** automation.apple_tv_track_last_playing
- **State:** ON
- **Last Triggered:** 2025-12-02 05:27:24
- **Purpose:** Record the last playing app/content
- **Use:** Dashboard display, resume functionality

**2. Apple TV Auto Off After Inactivity**
- **Entity:** automation.apple_tv_auto_off_after_inactivity
- **State:** ON
- **Last Triggered:** 2025-11-21 08:24:40
- **Purpose:** Automatically power off Apple TV after inactivity
- **Condition:** No activity for X minutes
- **Feature:** Prevents wasting power

---

## Remote & Control Automations (4 Total)

**1. Hue Dimmer Remote**
- **Entity:** automation.hue_dimmer_remote
- **State:** ON
- **Last Triggered:** 2025-11-21 10:35:14
- **Purpose:** Handle Hue dimmer switch button presses
- **Blueprint:** codycodes/hue-remote-dimmer-december-2021.yaml
- **Controls:** Brightness up/down, on/off, long presses
- **Features:**
  - On (short): Turn on with transition
  - On (long): Turn on with transition
  - Brightness Up (short): +16 brightness, max 75
  - Brightness Up (long): +19 brightness per step
  - Brightness Down (short): -18 brightness
  - Brightness Down (long): -18 brightness per step
  - Off (short): Turn off with 1s transition
  - Off (long): Turn off with 1s transition

**2. Scene Controller 1**
- **Entity:** automation.scene_controller_1
- **State:** OFF
- **Last Triggered:** 2025-05-09 04:58:23
- **Purpose:** Handle primary Zooz ZEN32 scene controller
- **Blueprint:** zooz_enhanced_no_led.yaml
- **Status:** Disabled (replaced by OAL v13 system)

**3. ZEN32 (Z-WaveJS2MQTT)**
- **Entity:** automation.zen32_z_wavejs2mqtt
- **State:** OFF
- **Last Triggered:** 2025-04-14 20:13:13
- **Purpose:** Legacy ZEN32 handler (Z-WaveJS2MQTT)
- **Status:** Disabled (replaced by OAL v13)

**4. Zooz ZEN32 Advanced Controller (HA 2025.4+) NO LED CONTROL**
- **Entity:** automation.zooz_zen32_advanced_controller_ha_2025_4_no_led_control
- **State:** OFF
- **Last Triggered:** 2025-08-15 08:14:25
- **Purpose:** Handle ZEN32 with no LED control
- **Blueprint:** zooz_enhanced_no_led.yaml
- **Status:** Disabled (replaced by OAL v13)

---

## Device Automations (1 Total)

**iPhone Battery Very Low**
- **Entity:** automation.iphone_battery_very_low
- **State:** OFF
- **Last Triggered:** 2025-05-21 23:38:18
- **Purpose:** Alert when iPhone battery drops below 20%
- **Conditions:**
  - Battery level < 20%
  - Person at home
  - Time between 09:00-23:00
- **Actions:**
  - Group Sonos speakers
  - Play TTS announcement
  - Pause Sonos
  - Check if target speaker idle
  - Ungroup speakers
  - Set speaker volume to 75%

---

## Scripts (19 Total)

### OAL System Scripts

**1. OAL offset controls (6 scripts)**
- script.oal_offset_[zone] - Adjust brightness/color offsets for each zone

### Sonos Management Scripts (8 Total)

**1. Sonos Group All Speakers**
- **Entity:** script.sonos_group_all_speakers
- **State:** unavailable
- **Purpose:** Group all 5 Sonos speakers together
- **Result:** All speakers play same content

**2. Sonos - Ungroup All Speakers**
- **Entity:** script.sonos_ungroup_all
- **State:** ON
- **Purpose:** Separate all grouped speakers
- **Result:** Each speaker independent

**3. Sonos - Pause All Speakers**
- **Entity:** script.sonos_all_pause
- **State:** OFF
- **Purpose:** Pause playback on all speakers
- **Feature:** Convenient group control

**4. Sonos - Toggle Room In Current Group (with fallback)**
- **Entity:** script.sonos_toggle_group_membership
- **State:** OFF
- **Purpose:** Add/remove single room from current group
- **Feature:** Fallback to group all if no group exists

**5. Sonos - Group all to current playing or Living Room hub**
- **Entity:** script.sonos_group_all_to_playing
- **State:** OFF
- **Purpose:** Group all speakers to playing content or hub
- **Smart:** Follows active playback

**6. Sonos Group All Speakers (old)**
- **Entity:** script.sonos_group_all_speakers_old
- **State:** OFF
- **Purpose:** Legacy grouping script
- **Status:** Replaced by updated version

**7. Soonest Sonos Alarm Info**
- **Entity:** script.soonest_sonos_alarm_info
- **State:** OFF
- **Purpose:** Get information about next alarm
- **Output:** Updates soonest_sonos_alarm_info sensor

**8. Disable Tomorrow's Sonos Alarms**
- **Entity:** script.disable_tomorrows_sonos_alarms
- **State:** OFF
- **Purpose:** Disable all alarms for next day
- **Use:** Sleep/travel scenarios

### Scene Controller Scripts (3 Total)

**1. Scene Controller Gradual Brighten**
- **Entity:** script.scene_controller_gradual_brighten
- **State:** Unknown
- **Purpose:** Gradually increase brightness via scene controller
- **Trigger:** Button 2 hold

**2. Scene Controller Gradual Dim**
- **Entity:** script.scene_controller_gradual_dim
- **State:** Unknown
- **Purpose:** Gradually decrease brightness
- **Trigger:** Button 3 hold

**3. Reset Active Manual Control**
- **Entity:** script.reset_active_manual_control
- **State:** Unknown
- **Purpose:** Clear manual control overrides
- **Trigger:** Button 3 press/double-press

### General Control Scripts (2 Total)

**1. Button 5 Press Action**
- **Entity:** script.button_5_press_action
- **State:** Unknown
- **Purpose:** Execute action for Button 5 scene controller
- **Default:** Turn on scene (likely "All On")

---

## Automation Execution Summary

### Active System

| System | Automations | Status | Last Activity |
|--------|-------------|--------|---------------|
| OAL v13 | 17 | All ON | 2025-12-02 23:46:01 |
| Sonos | 4 | All ON | 2025-12-02 07:00:00 |
| Apple TV | 2 | All ON | 2025-12-02 05:27:24 |
| Remote Controls | 4 | 1 ON, 3 OFF | 2025-11-21 10:35:14 |
| Device Triggers | 1 | OFF | 2025-05-21 23:38:18 |

### Recent Triggers

| Automation | Last Trigger | Recency |
|-----------|--------------|---------|
| Core Adjustment Engine | 2025-12-02 23:46:01 | Current |
| Seamless Sunset Logic | 2025-12-02 23:46:00 | Current |
| Configuration Manager | 2025-12-02 20:42:16 | 3+ hours |
| Zen32 Controller | 2025-12-02 20:42:16 | 3+ hours |
| Sonos Alarm State | 2025-12-02 07:00:00 | 16+ hours |
| Apple TV Track | 2025-12-02 05:27:24 | 18+ hours |
| Nightly Alarm Prompt | 2025-12-02 04:30:00 | 19+ hours |
| Hue Dimmer Remote | 2025-11-21 10:35:14 | 11 days |

---

## Automation Capabilities by Feature

### Lighting Control
- OAL v13 system: 17 automations (brightness, color, schedule, sunrise)
- Dimmer remotes: 1 automation (manual brightness control)
- Scene controller: 4 automations (3 disabled, 1 active via OAL)

### Media & Entertainment
- Sonos: 4 automations (alarms, grouping)
- Apple TV: 2 automations (tracking, auto-off)
- Spotify: Integrated with Sonos

### Device Management
- iPhone: 1 automation (battery monitoring - disabled)

### Scene Management
- Scenes: Multiple (All On, All Off, Dim, Entertain)
- Scripts: 19 total for scene execution and control

---

## Service Integration

### Most Used Services in Automations

**Light Services:**
- light.turn_on/turn_off
- light.turn_on (with brightness/color)
- light.toggle

**Media Services:**
- media_player.play_media
- media_player.media_pause/play
- media_player.volume_set
- sonos.snapshot/restore
- tts.cloud_say

**Scene/Script:**
- scene.turn_on
- script.turn_on

**Input/Helper Services:**
- input_number.set_value
- input_boolean.turn_on/off/toggle
- input_select.select_option

**Adaptive Lighting:**
- adaptive_lighting.apply
- adaptive_lighting.set_manual_control

---

## Automation Modes

**Single Mode:** Most automations (prevent parallel execution)
**Restart Mode:** Real-time adaptive systems
**Queued Mode:** Order-dependent automations (scene transitions)

---

## Blueprint Usage

| Blueprint | Automations | Purpose |
|-----------|------------|---------|
| zooz_enhanced_no_led.yaml | 2 (1 active) | ZEN32 scene controller |
| codycodes/hue-remote-dimmer | 1 | Hue dimmer switch |

---

## Recent System Activity

**Current Time Zone:** America/Denver
**Last Startup:** 2025-11-30 02:58:05
**System Health:** Operational (All core automations active)
**Pending Triggers:** None

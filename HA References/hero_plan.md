Hero Card & OAL Optimization Plan (Detailed Spec)
Goal Description
Comprehensive refactor of the Dashboard's Hero Card to improve mobile responsiveness, simplify frontend code by extracting logic to backend templates, and refine lighting presets to match specific user use-cases.

User Review Required
IMPORTANT

Layout Card Migration: This plan moves the main view from a standard vertical-stack to custom:layout-card with grid-layout. This allows precise control over column wrapping (4 on desktop -> 2 on mobile).

Preset Redefinition:

Old: Config 1-4 (cryptic names, unused logic)
New: Full Brightness, Dimmed Ambient, Warm Ambient, TV Mode
Action: This will completely replace the current behavior of Config 2, 3, and 4.
Proposed Changes
1. OAL Package (
packages/OAL_lighting_control_package.yaml
)
A. New Template Sensors (Logic Extraction)
Create a new template: block (or append to existing) to handle UI logic centrally.

template:
  - sensor:
      # CONFIG UI STATE
      - name: "Hero Button Config State"
        unique_id: hero_button_config_state
        state: >
          {% set config = states('input_select.oal_active_configuration') %}
          {% if 'Full Brightness' in config %} Baseline
          {% elif 'Dimmed Ambient' in config %} Dimmed
          {% elif 'Warm Ambient' in config %} Warm
          {% elif 'TV Mode' in config %} TV
          {% elif 'Sleep' in config %} Sleep
          {% else %} Manual {% endif %}
        attributes:
          is_baseline: >
            {{ 'Full Brightness' in states('input_select.oal_active_configuration') }}
          icon_color: >
            {% if 'Full Brightness' in states('input_select.oal_active_configuration') %} rgba(80, 80, 80, 0.5)
            {% else %} rgba(120, 80, 180, 0.9) {% endif %}
          bg_color: >
             {% if 'Full Brightness' in states('input_select.oal_active_configuration') %} rgba(120, 120, 120, 0.10)
             {% else %} rgba(138, 100, 200, 0.15) {% endif %}
      # RESET BUTTON STATE
      - name: "Hero Button Reset State"
        unique_id: hero_button_reset_state
        state: >
          {% set zones = ['switch.adaptive_lighting_main_living', 'switch.adaptive_lighting_kitchen_island', 
                          'switch.adaptive_lighting_bedroom_primary', 'switch.adaptive_lighting_accent_spots', 
                          'switch.adaptive_lighting_recessed_ceiling', 'switch.adaptive_lighting_column_lights'] %}
          {% set manual_count = namespace(value=0) %}
          {% for z in zones %}
             {% set manual_count.value = manual_count.value + (state_attr(z, 'manual_control') | default([]) | length) %}
          {% endfor %}
          {{ 'on' if manual_count.value > 0 else 'off' }}
        attributes:
          time_remaining: >
            {# Calculates lowest time remaining similar to current JS logic #}
            ... (logic from JS) ... 
      # ALARM UI STATE
      - name: "Hero Button Alarm State"
        unique_id: hero_button_alarm_state
        state: >
          {{ states('sensor.sonos_next_alarm_chip') }}
        attributes:
           formatted_time: ... (logic extracting HH:MM AM/PM) ... 
           is_enabled: ...
B. Redefined Presets (Input Select + Automation)
Update input_select.oal_active_configuration options:

Full Brightness (All On)
Dimmed Ambient (No Recessed)
Warm Ambient (No Overhead)
TV Mode (Living Dim)
Sleep Mode
Global Manual Adjustment
Update oal_configuration_manager_v13 automation variables:

config_profiles:
  "Full Brightness (All On)":
    b: 0
    k: 0
    lights_off: []
    lights_dimmed: {}
    is_baseline: true
  "Dimmed Ambient (No Recessed)":
    b: -30
    k: -500
    lights_off: []
    lights_dimmed:
      light.recessed_ceiling_lights: 1  # Minimal glow
      light.kitchen_main_lights: 1
  "Warm Ambient (No Overhead)":
    b: -50
    k: -1000
    lights_off:
      - light.recessed_ceiling_lights
      - light.kitchen_main_lights
    lights_dimmed:
      light.accent_spots_lights: 10 # Dim spots
  "TV Mode (Living Dim)":
    b: -60 # Global dim
    k: -1500 # Very warm
    lights_off:
      - light.column_lights # Per requirement
      - light.living_room_floor_lamp # "Floor lamp B" off/5%
      - light.kitchen_main_lights
    lights_dimmed:
      light.living_room_couch_lamp: 5 # "Much dimmer"
      light.kitchen_island_pendants: 15 # "Pendants down"
C. Instant Transition Fix
In oal_configuration_manager_v13 automation, immediately after variables definition:

action:
  - service: adaptive_lighting.apply
    target:
      entity_id: ... all switches ...
    data:
      transition: 1  # Immediate application
      turn_on_lights: false
2. Dashboard Refactor (
Dashboard/hero_card.yaml
)
A. Layout Architecture (Grid)
Replace root vertical-stack with custom:layout-card:

type: custom:layout-card
layout_type: custom:grid-layout
layout:
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr # Hero (2 slots) + 4 room cards
  grid-template-rows: auto
  grid-template-areas: |
    "hero hero hero hero hero"
    "living kitchen bedroom spots ceiling"
    "columns . . . ."
  mediaquery:
    # Desktop: Hero full width, Rooms 5 across (resizing to 160px min)
    "(min-width: 800px)":
      grid-template-columns: repeat(5, 1fr)
      grid-template-areas: |
        "hero hero hero hero hero"
        "living kitchen bedroom spots ceiling"
        "columns . . . ."
    # Mobile: Hero full width, Rooms 2 across
    "(max-width: 799px)":
      grid-template-columns: 1fr 1fr
      grid-template-areas: |
        "hero hero"
        "living kitchen"
        "bedroom spots"
        "ceiling columns"
cards:
  - type: custom:bubble-card
    view_layout:
      grid_area: hero
    ... 
  - type: custom:bubble-card
    view_layout: 
      grid_area: living
    ... (etc for all rooms) ...
B. Hero Top Card Styling
Size: Remove max-width constraints so it fills the grid area.
Top Buttons:
All Lights: Keep rgba(255, 149, 0, ...) (Yellow/Orange).
Sub-buttons 2-6 (Config/Reset/etc): Use rgba(138, 100, 200, ...) (Purple).
Gap: Add .bubble-sub-button { margin-left: 8px !important; } or similar specific targeting.
Dropdown Fix:
.bubble-sub-button-container { overflow: visible !important; }
/* Ensure z-index allows dropdown to float over cards below */
ha-card { z-index: 10 !important; }
C. Room Card Sizing
Remove max-width: clamp(...). Let Grid Layout handle width.
Set height: 90px !important; for taller, easier to tap targets.
Implementation Steps
OAL Package: Add template sensors.
OAL Package: Update input_select options and Automation logic for new Presets.
Hero Card: Replace specific vertical/horizontal stacks with one custom:layout-card.
Hero Card: Update styles to reference new sensor.hero_button_* entities (deleting inline JS).
Hero Card: Apply Purple styling to actions and Orange to 'All Lights'.
Verification Plan
Valid Config Check: Ensure template sensors pass validation.
Preset functionality:
Activate "TV Mode" -> Check Column Lights OFF, Couch Lamp 5%.
Activate "Warm Ambient" -> Check Recessed OFF.
Switch back to "Full Brightness" -> Check all ON.
Responsiveness:
Shrink browser to <800px -> Verify 2-column grid layout.
Expand to >800px -> Verify 5-column row.
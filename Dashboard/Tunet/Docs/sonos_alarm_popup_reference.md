# Sonos Alarm Popup — Working Reference

Working example of alarm tile + popup + edit flow using Bubble Card and Mushroom.
This is the design target for the alarm settings page (see visual_defect_ledger.md backlog).

## Architecture

- **Alarm tiles**: Bubble Card button/switch per alarm entity, grouped by room in horizontal-stack pairs
- **Alarm list popup**: `#sonos-alarms` — room-grouped alarm tiles with colored separators (Bedroom=orange, Bathroom=blue, Kitchen=purple)
- **Edit popup**: `#edit-alarm` — time display + +/-5/15 min buttons + volume slider + linked-zones toggle + save/cancel
- **Interaction**: tap = toggle alarm on/off; hold = load alarm for edit via `script.sonos_load_alarm_for_edit`
- **Helper entities**: `input_datetime.sonos_alarm_edit_time`, `input_number.sonos_alarm_edit_volume`, `input_boolean.sonos_alarm_edit_linked_zones`
- **Scripts**: `script.sonos_load_alarm_for_edit`, `script.sonos_adjust_edit_time`, `script.sonos_save_alarm_changes`

## Known Alarm Entities

| Entity | Room | Notes |
|--------|------|-------|
| `switch.sonos_alarm_182` | Bedroom | |
| `switch.sonos_alarm_234` | Bedroom | |
| `switch.sonos_alarm_37` | Bathroom | |
| `switch.sonos_alarm_823` | Bathroom | |
| `switch.sonos_alarm_15` | Kitchen | |
| `switch.sonos_alarm_1` | Kitchen | |
| `switch.sonos_alarm_1381` | (tile example) | |

## Room Color Scheme

| Room | Accent | RGB |
|------|--------|-----|
| Bedroom | Orange | `rgb(255, 152, 0)` |
| Bathroom | Blue | `rgb(10, 132, 255)` |
| Kitchen | Purple | `rgb(175, 82, 222)` |

## Design Patterns

- Alarm tile uses `card_mod` `::after` pseudo-elements to template time/recurrence from entity attributes
- Recurrence display: DAILY="Every day", WEEKDAYS="Weekdays", WEEKENDS="Weekends", ONCE="Once", else strip "ON_" prefix
- Time adjustment via script with `minutes` parameter (+/-5, +/-15)
- Edit popup uses Mushroom entity card for time display (tap = more-info for native time picker)
- Volume slider via Mushroom number card with `display_mode: slider`
- Light mode only in current example (dark mode adaptation needed for Tunet integration)

## Full YAML

```yaml
type: grid
cards:
  - type: heading
    heading: Sonos Alarm Popup Example
    heading_style: title
  - type: tile
    entity: switch.sonos_alarm_1381
    vertical: false
    features_position: bottom
    tap_action:
      action: navigate
      navigation_path: "#sonos-alarms"
  - type: custom:bubble-card
    card_type: button
    button_type: switch
    entity: switch.sonos_alarm_182
    name: Bedroom
    icon: mdi:alarm
    show_state: false
    show_attribute: true
    attribute: recurrence
    tap_action:
      action: toggle
    hold_action:
      action: perform-action
      perform_action: script.sonos_load_alarm_for_edit
      data:
        alarm_entity: switch.sonos_alarm_182
    sub_button:
      main: []
      bottom: []
    button_action:
      hold_action:
        action: perform-action
        perform_action: script.sonos_load_alarm_for_edit
        target: {}
        data:
          alarm_entity: switch.sonos_alarm_182
    styles: |
      :host {
        --bubble-accent-color: rgb(255, 152, 0) !important;
        --bubble-button-background-color: transparent !important;
      }
      .bubble-button-background,
      .bubble-button-background-color,
      .bubble-background {
        background: transparent !important;
        border-radius: 14px !important;
      }
      .bubble-button-card-container {
        position: relative !important;
        display: grid !important;
        grid-template-rows: auto auto 1fr !important;
        justify-items: center !important;
        align-items: center !important;
        text-align: center !important;
        min-height: 110px !important;
        padding: 14px 8px 14px 8px !important;
        border-radius: 14px !important;
        overflow: hidden !important;
        clip-path: inset(0 round 14px) !important;
        transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        background: ${state === 'on' 
          ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.25) 0%, rgba(255, 183, 77, 0.18) 100%)' 
          : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
        border: 1px solid ${state === 'on' 
          ? 'rgba(255, 152, 0, 0.35)' 
          : 'rgba(0,0,0,0.06)'} !important;
        box-shadow: ${state === 'on' 
          ? '0 4px 12px rgba(255, 152, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
          : '0 2px 6px rgba(0,0,0,0.04)'} !important;
      }
      .bubble-button-card-container:hover,
      .bubble-button-card-container:focus,
      .bubble-button-card-container:active {
        background: ${state === 'on' 
          ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.30) 0%, rgba(255, 183, 77, 0.22) 100%)' 
          : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
      }
      .bubble-button-card-container:active {
        transform: scale(0.96) !important;
      }
      .bubble-content-container {
        display: grid !important;
        grid-template-rows: auto auto 1fr !important;
        justify-items: center !important;
        width: 100% !important;
        position: relative !important;
        z-index: 5 !important;
        pointer-events: none !important;
      }
      .bubble-icon-container {
        grid-row: 1 !important;
        margin: 2px 0 8px 0 !important;
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: ${state === 'on' 
          ? 'rgba(255, 152, 0, 0.18)' 
          : 'rgba(0,0,0,0.06)'} !important;
        border: ${state === 'on' 
          ? '1.5px solid rgba(255, 152, 0, 0.25)' 
          : '1.5px solid transparent'} !important;
        pointer-events: none !important;
      }
      .bubble-icon {
        --mdc-icon-size: 26px !important;
        color: ${state === 'on' ? 'rgba(255, 152, 0, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
        filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.3))' : 'none'} !important;
        pointer-events: none !important;
      }
      .bubble-name-container {
        grid-row: 2 !important;
        margin: 0 !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        pointer-events: none !important;
      }
      .bubble-name {
        font-weight: 700 !important;
        font-size: 16px !important;
        line-height: 1.2 !important;
        justify-content: center !important;
        color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
        pointer-events: none !important;
      }
      .bubble-attribute {
        font-size: 11px !important;
        font-weight: 500 !important;
        margin-top: 3px !important;
        justify-content: center !important;
        color: ${state === 'on' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
        pointer-events: none !important;
      }
    card_mod:
      style: |
        ha-card { 
          background: transparent !important; 
          border: none !important; 
          box-shadow: none !important;
          border-radius: 14px !important;
          overflow: hidden !important;
        }
        ha-card:hover,
        ha-card:focus {
          background: transparent !important;
        }
        .bubble-name {
          font-size: 0 !important;
        }
        .bubble-name::after {
          font-size: 16px;
          font-weight: 700;
          content: '{{ state_attr("switch.sonos_alarm_182", "time")[:5] }}';
        }
        .bubble-attribute {
          font-size: 0 !important;
        }
        .bubble-attribute::after {
          font-size: 11px;
          font-weight: 500;
          content: '{% set r = state_attr("switch.sonos_alarm_182", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
        }
  - type: vertical-stack
    cards:
      - type: custom:bubble-card
        card_type: pop-up
        hash: "#edit-alarm"
        name: Edit Alarm
        icon: mdi:alarm-check
        show_header: true
        bg_color: rgba(255, 255, 255, 0.95)
        bg_opacity: 95
        bg_blur: 20
        close_on_click: false
        back_open: true
        styles: |
          .bubble-pop-up-container {
            padding: 16px !important;
          }
          .bubble-header {
            margin-bottom: 8px !important;
          }
          .bubble-name {
            font-weight: 600 !important;
            font-size: 1.3em !important;
          }
      - type: custom:mushroom-entity-card
        entity: input_datetime.sonos_alarm_edit_time
        name: " "
        icon: mdi:clock-outline
        tap_action:
          action: more-info
        card_mod:
          style: |
            ha-card {
              background: linear-gradient(145deg, rgba(255, 224, 178, 0.25) 0%, rgba(255, 183, 77, 0.18) 100%) !important;
              border: 1px solid rgba(255, 152, 0, 0.35) !important;
              border-radius: 14px !important;
              box-shadow: 0 4px 12px rgba(255, 152, 0, 0.12) !important;
              --primary-text-color: rgba(0,0,0,0.9);
              --secondary-text-color: rgba(255, 152, 0, 0.9);
            }
            mushroom-state-info {
              flex-direction: column !important;
              align-items: center !important;
            }
            .primary {
              font-size: 0 !important;
            }
            .primary::after {
              font-size: 32px !important;
              font-weight: 700 !important;
              letter-spacing: -1px !important;
              content: '{{ states("input_datetime.sonos_alarm_edit_time")[:5] }}';
            }
            .secondary {
              font-size: 12px !important;
              font-weight: 500 !important;
              margin-top: 2px !important;
            }
            .secondary::after {
              content: 'Tap to change';
              color: rgba(255, 152, 0, 0.8);
            }
            mushroom-shape-icon {
              --shape-color: rgba(255, 152, 0, 0.18) !important;
              --icon-color: rgba(255, 152, 0, 0.95) !important;
            }
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: "-15"
            icon: mdi:minus
            tap_action:
              action: perform-action
              perform_action: script.sonos_adjust_edit_time
              data:
                minutes: -15
            styles: |
              .bubble-button-card-container {
                min-height: 48px !important;
                padding: 10px !important;
                border-radius: 12px !important;
                background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
                border: 1px solid rgba(0,0,0,0.06) !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.95) !important;
                background: rgba(255, 152, 0, 0.15) !important;
              }
              .bubble-icon-container {
                display: none !important;
              }
              .bubble-name-container,
              .bubble-name {
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 600 !important;
                font-size: 15px !important;
                color: rgba(0,0,0,0.7) !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: "-5"
            icon: mdi:minus
            tap_action:
              action: perform-action
              perform_action: script.sonos_adjust_edit_time
              data:
                minutes: -5
            styles: |
              .bubble-button-card-container {
                min-height: 48px !important;
                padding: 10px !important;
                border-radius: 12px !important;
                background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
                border: 1px solid rgba(0,0,0,0.06) !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.95) !important;
                background: rgba(255, 152, 0, 0.15) !important;
              }
              .bubble-icon-container {
                display: none !important;
              }
              .bubble-name-container,
              .bubble-name {
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 600 !important;
                font-size: 15px !important;
                color: rgba(0,0,0,0.7) !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: "+5"
            icon: mdi:plus
            tap_action:
              action: perform-action
              perform_action: script.sonos_adjust_edit_time
              data:
                minutes: 5
            styles: |
              .bubble-button-card-container {
                min-height: 48px !important;
                padding: 10px !important;
                border-radius: 12px !important;
                background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
                border: 1px solid rgba(0,0,0,0.06) !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.95) !important;
                background: rgba(255, 152, 0, 0.15) !important;
              }
              .bubble-icon-container {
                display: none !important;
              }
              .bubble-name-container,
              .bubble-name {
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 600 !important;
                font-size: 15px !important;
                color: rgba(0,0,0,0.7) !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: "+15"
            icon: mdi:plus
            tap_action:
              action: perform-action
              perform_action: script.sonos_adjust_edit_time
              data:
                minutes: 15
            styles: |
              .bubble-button-card-container {
                min-height: 48px !important;
                padding: 10px !important;
                border-radius: 12px !important;
                background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
                border: 1px solid rgba(0,0,0,0.06) !important;
                justify-content: center !important;
                transition: all 0.2s ease !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.95) !important;
                background: rgba(255, 152, 0, 0.15) !important;
              }
              .bubble-icon-container {
                display: none !important;
              }
              .bubble-name-container,
              .bubble-name {
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 600 !important;
                font-size: 15px !important;
                color: rgba(0,0,0,0.7) !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
      - type: custom:bubble-card
        card_type: separator
        name: Volume
        icon: mdi:volume-high
        styles: |
          .bubble-separator { margin: 16px 0 8px 0 !important; }
          .bubble-name {
            color: rgba(0,0,0,0.6) !important;
            font-weight: 600;
            font-size: 0.9em;
          }
          .bubble-icon { color: rgba(0,0,0,0.5) !important; }
          .bubble-line { background: rgba(0,0,0,0.08) !important; }
      - type: custom:mushroom-number-card
        entity: input_number.sonos_alarm_edit_volume
        name: Alarm Volume
        icon: mdi:volume-medium
        display_mode: slider
        card_mod:
          style: |
            ha-card {
              background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
              border: 1px solid rgba(0,0,0,0.06) !important;
              border-radius: 14px !important;
              --primary-text-color: rgba(0,0,0,0.8);
              --secondary-text-color: rgba(0,0,0,0.5);
            }
            mushroom-shape-icon {
              --shape-color: rgba(255, 152, 0, 0.15) !important;
              --icon-color: rgba(255, 152, 0, 0.9) !important;
            }
            mushroom-slider {
              --slider-color: rgb(255, 152, 0) !important;
              --slider-bg-color: rgba(0,0,0,0.08) !important;
            }
      - type: custom:bubble-card
        card_type: separator
        name: Options
        icon: mdi:cog
        styles: |
          .bubble-separator { margin: 16px 0 8px 0 !important; }
          .bubble-name {
            color: rgba(0,0,0,0.6) !important;
            font-weight: 600;
            font-size: 0.9em;
          }
          .bubble-icon { color: rgba(0,0,0,0.5) !important; }
          .bubble-line { background: rgba(0,0,0,0.08) !important; }
      - type: custom:mushroom-entity-card
        entity: input_boolean.sonos_alarm_edit_linked_zones
        name: Include Linked Zones
        icon: mdi:speaker-multiple
        tap_action:
          action: toggle
        card_mod:
          style: |
            ha-card {
              background: linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)) !important;
              border: 1px solid rgba(0,0,0,0.06) !important;
              border-radius: 14px !important;
              --primary-text-color: rgba(0,0,0,0.8);
              --secondary-text-color: rgba(0,0,0,0.5);
            }
            mushroom-shape-icon {
              --shape-color: {{ 'rgba(48, 209, 88, 0.18)' if is_state('input_boolean.sonos_alarm_edit_linked_zones', 'on') else 'rgba(0,0,0,0.06)' }} !important;
              --icon-color: {{ 'rgba(48, 209, 88, 0.95)' if is_state('input_boolean.sonos_alarm_edit_linked_zones', 'on') else 'rgba(0,0,0,0.4)' }} !important;
            }
            mushroom-state-info .primary {
              color: {{ 'rgba(0,0,0,0.9)' if is_state('input_boolean.sonos_alarm_edit_linked_zones', 'on') else 'rgba(0,0,0,0.5)' }} !important;
            }
      - type: custom:bubble-card
        card_type: separator
        styles: |
          .bubble-separator { margin: 20px 0 12px 0 !important; }
          .bubble-line { background: rgba(0,0,0,0.08) !important; }
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: Cancel
            icon: mdi:cancel
            tap_action:
              action: navigate
              navigation_path: "#sonos-alarms"
            styles: ""
            sub_button:
              main: []
              bottom: []
            button_action:
              tap_action:
                action: navigate
                navigation_path: "#sonos-alarms"
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
          - type: custom:bubble-card
            card_type: button
            button_type: name
            name: Save
            icon: mdi:check
            tap_action:
              action: perform-action
              perform_action: script.sonos_save_alarm_changes
              data: {}
            styles: ""
            sub_button:
              main: []
              bottom: []
            button_action:
              tap_action:
                action: perform-action
                perform_action: script.sonos_save_alarm_changes
                target: {}
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                }
  - type: vertical-stack
    cards:
      - type: custom:bubble-card
        card_type: pop-up
        hash: "#sonos-alarms"
        name: Alarms
        icon: mdi:alarm
      - type: custom:bubble-card
        card_type: separator
        name: Bedroom
        icon: mdi:bed-outline
        styles: |
          .bubble-name {
            color: rgb(255, 152, 0) !important;
            font-weight: 600;
          }
          .bubble-icon { color: rgb(255, 152, 0) !important; }
          .bubble-line { background: rgba(255, 152, 0, 0.3) !important; }
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_182
            name: Bedroom
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_182
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_182
            styles: |
              :host {
                --bubble-accent-color: rgb(255, 152, 0) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.25) 0%, rgba(255, 183, 77, 0.18) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(255, 152, 0, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(255, 152, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.30) 0%, rgba(255, 183, 77, 0.22) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(255, 152, 0, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(255, 152, 0, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(255, 152, 0, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_182", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_182", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_234
            name: Bedroom
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_234
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_234
            styles: |
              :host {
                --bubble-accent-color: rgb(255, 152, 0) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.25) 0%, rgba(255, 183, 77, 0.18) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(255, 152, 0, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(255, 152, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(255, 224, 178, 0.30) 0%, rgba(255, 183, 77, 0.22) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(255, 152, 0, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(255, 152, 0, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(255, 152, 0, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_234", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_234", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
      - type: custom:bubble-card
        card_type: separator
        name: Bathroom
        icon: mdi:shower-head
        styles: |
          .bubble-separator { margin-top: 8px !important; }
          .bubble-name {
            color: rgb(10, 132, 255) !important;
            font-weight: 600;
          }
          .bubble-icon { color: rgb(10, 132, 255) !important; }
          .bubble-line { background: rgba(10, 132, 255, 0.3) !important; }
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_37
            name: Bathroom
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_37
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_37
            styles: |
              :host {
                --bubble-accent-color: rgb(10, 132, 255) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(173, 216, 255, 0.25) 0%, rgba(10, 132, 255, 0.15) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(10, 132, 255, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(10, 132, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(173, 216, 255, 0.30) 0%, rgba(10, 132, 255, 0.20) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(10, 132, 255, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(10, 132, 255, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(10, 132, 255, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(10, 132, 255, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_37", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_37", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_823
            name: Bathroom
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_823
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_823
            styles: |
              :host {
                --bubble-accent-color: rgb(10, 132, 255) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(173, 216, 255, 0.25) 0%, rgba(10, 132, 255, 0.15) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(10, 132, 255, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(10, 132, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(173, 216, 255, 0.30) 0%, rgba(10, 132, 255, 0.20) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(10, 132, 255, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(10, 132, 255, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(10, 132, 255, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(10, 132, 255, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_823", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_823", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
      - type: custom:bubble-card
        card_type: separator
        name: Kitchen
        icon: mdi:stove
        styles: |
          .bubble-separator { margin-top: 8px !important; }
          .bubble-name {
            color: rgb(175, 82, 222) !important;
            font-weight: 600;
          }
          .bubble-icon { color: rgb(175, 82, 222) !important; }
          .bubble-line { background: rgba(175, 82, 222, 0.3) !important; }
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_15
            name: Kitchen
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_15
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_15
            styles: |
              :host {
                --bubble-accent-color: rgb(175, 82, 222) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(230, 200, 255, 0.25) 0%, rgba(175, 82, 222, 0.15) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(175, 82, 222, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(175, 82, 222, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(230, 200, 255, 0.30) 0%, rgba(175, 82, 222, 0.20) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(175, 82, 222, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(175, 82, 222, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(175, 82, 222, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(175, 82, 222, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(175, 82, 222, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_15", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_15", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
          - type: custom:bubble-card
            card_type: button
            button_type: switch
            entity: switch.sonos_alarm_1
            name: Kitchen
            icon: mdi:alarm
            show_state: false
            show_attribute: true
            attribute: recurrence
            tap_action:
              action: toggle
            hold_action:
              action: perform-action
              perform_action: script.sonos_load_alarm_for_edit
              data:
                alarm_entity: switch.sonos_alarm_1
            sub_button:
              main: []
              bottom: []
            button_action:
              hold_action:
                action: perform-action
                perform_action: script.sonos_load_alarm_for_edit
                target: {}
                data:
                  alarm_entity: switch.sonos_alarm_1
            styles: |
              :host {
                --bubble-accent-color: rgb(175, 82, 222) !important;
                --bubble-button-background-color: transparent !important;
              }
              .bubble-button-background,
              .bubble-button-background-color,
              .bubble-background {
                background: transparent !important;
                border-radius: 14px !important;
              }
              .bubble-button-card-container {
                position: relative !important;
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                align-items: center !important;
                text-align: center !important;
                min-height: 110px !important;
                padding: 14px 8px 14px 8px !important;
                border-radius: 14px !important;
                overflow: hidden !important;
                clip-path: inset(0 round 14px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(230, 200, 255, 0.25) 0%, rgba(175, 82, 222, 0.15) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04))'} !important;
                border: 1px solid ${state === 'on' 
                  ? 'rgba(175, 82, 222, 0.35)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                box-shadow: ${state === 'on' 
                  ? '0 4px 12px rgba(175, 82, 222, 0.12), inset 0 1px 0 rgba(255,255,255,0.18)' 
                  : '0 2px 6px rgba(0,0,0,0.04)'} !important;
              }
              .bubble-button-card-container:hover,
              .bubble-button-card-container:focus,
              .bubble-button-card-container:active {
                background: ${state === 'on' 
                  ? 'linear-gradient(145deg, rgba(230, 200, 255, 0.30) 0%, rgba(175, 82, 222, 0.20) 100%)' 
                  : 'linear-gradient(145deg, rgba(0,0,0,0.03), rgba(0,0,0,0.05))'} !important;
              }
              .bubble-button-card-container:active {
                transform: scale(0.96) !important;
              }
              .bubble-content-container {
                display: grid !important;
                grid-template-rows: auto auto 1fr !important;
                justify-items: center !important;
                width: 100% !important;
                position: relative !important;
                z-index: 5 !important;
                pointer-events: none !important;
              }
              .bubble-icon-container {
                grid-row: 1 !important;
                margin: 2px 0 8px 0 !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${state === 'on' 
                  ? 'rgba(175, 82, 222, 0.18)' 
                  : 'rgba(0,0,0,0.06)'} !important;
                border: ${state === 'on' 
                  ? '1.5px solid rgba(175, 82, 222, 0.25)' 
                  : '1.5px solid transparent'} !important;
                pointer-events: none !important;
              }
              .bubble-icon {
                --mdc-icon-size: 26px !important;
                color: ${state === 'on' ? 'rgba(175, 82, 222, 0.95)' : 'rgba(0,0,0,0.4)'} !important;
                filter: ${state === 'on' ? 'drop-shadow(0 0 4px rgba(175, 82, 222, 0.3))' : 'none'} !important;
                pointer-events: none !important;
              }
              .bubble-name-container {
                grid-row: 2 !important;
                margin: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                pointer-events: none !important;
              }
              .bubble-name {
                font-weight: 700 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)'} !important;
                pointer-events: none !important;
              }
              .bubble-attribute {
                font-size: 11px !important;
                font-weight: 500 !important;
                margin-top: 3px !important;
                justify-content: center !important;
                color: ${state === 'on' ? 'rgba(175, 82, 222, 0.9)' : 'rgba(0,0,0,0.45)'} !important;
                pointer-events: none !important;
              }
            card_mod:
              style: |
                ha-card { 
                  background: transparent !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  border-radius: 14px !important;
                  overflow: hidden !important;
                }
                ha-card:hover,
                ha-card:focus {
                  background: transparent !important;
                }
                .bubble-name {
                  font-size: 0 !important;
                }
                .bubble-name::after {
                  font-size: 16px;
                  font-weight: 700;
                  content: '{{ state_attr("switch.sonos_alarm_1", "time")[:5] }}';
                }
                .bubble-attribute {
                  font-size: 0 !important;
                }
                .bubble-attribute::after {
                  font-size: 11px;
                  font-weight: 500;
                  content: '{% set r = state_attr("switch.sonos_alarm_1", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% else %}{{ r | replace("ON_", "") }}{% endif %}';
                }
```

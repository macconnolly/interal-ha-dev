# Debug ZEN32 Scene Controller — All Buttons Non-Functional

## Problem Statement

The ZEN32 modal controller handler automation (`zen32_modal_controller_handler_v4`) in `packages/zen32_modal_controller_package.yaml` does not respond to any button presses. Button events register on the scene controller (confirmed visually in HA), but no automations fire. Both B5 (toggle lights) and B3 (volume/music mode) confirmed broken. Likely all 5 buttons are dead.

---

## Root Cause Hypothesis: Entity Name Mismatch

The automation triggers reference entities that may not match the actual HA entity IDs.

### Automation uses (lines 1322-1337):

```yaml
trigger:
  - platform: state
    entity_id: event.scene_controller_scene_001  # Button 1
    id: "button_1"
  - platform: state
    entity_id: event.scene_controller_scene_002  # Button 2
    id: "button_2"
  - platform: state
    entity_id: event.scene_controller_scene_003  # Button 3
    id: "button_3"
  - platform: state
    entity_id: event.scene_controller_scene_004  # Button 4
    id: "button_4"
  - platform: state
    entity_id: event.scene_controller_scene_005  # Button 5
    id: "button_5"
```

### HA References doc (`HA References/ha_sensors_inputs.md:178-182`) says real entities are:

```
event.zen32_scene_controller_event_001
event.zen32_scene_controller_event_002
event.zen32_scene_controller_event_003
event.zen32_scene_controller_event_004
event.zen32_scene_controller_event_005
```

---

## Investigation Steps

Use the Home Assistant MCP tools to confirm or deny this hypothesis.

### Step 1: Search for the actual event entities

```
ha_search_entities(query="scene_controller", domain_filter="event")
```

This will reveal the real entity IDs for the ZEN32 button events.

### Step 2: Check if the automation's referenced entities exist

```
ha_get_state(entity_id="event.scene_controller_scene_005")
ha_get_state(entity_id="event.scene_controller_scene_001")
```

If these return errors/unavailable, the triggers are pointing at nothing.

### Step 3: Check the real entities for recent activity

User confirmed pressing B5, so these should show recent state changes with `event_type` attributes like `KeyPressed`.

```
ha_get_state(entity_id="event.zen32_scene_controller_event_005")
ha_get_state(entity_id="event.zen32_scene_controller_event_001")
```

### Step 4: Check the automation traces

```
ha_get_automation_traces(automation_id="automation.zen32_modal_controller_handler_v4", limit=5)
```

If empty/no traces, the automation has never triggered — confirming the trigger entities are wrong.

### Step 5: Check automation state

```
ha_get_state(entity_id="automation.zen32_modal_controller_handler_v4")
```

Verify it's enabled (state: `on`) and not errored.

### Step 6: Check logbook for any ZEN32 activity

```
ha_get_logbook(entity_id="automation.zen32_modal_controller_handler_v4", hours=24)
```

---

## Additional References That Need Fixing

If entity mismatch is confirmed, these lines in `packages/zen32_modal_controller_package.yaml` all need updating:

| Lines | What | Current (wrong) | Correct |
|-------|------|-----------------|---------|
| 1324 | Trigger B1 | `event.scene_controller_scene_001` | `event.zen32_scene_controller_event_001` |
| 1327 | Trigger B2 | `event.scene_controller_scene_002` | `event.zen32_scene_controller_event_002` |
| 1330 | Trigger B3 | `event.scene_controller_scene_003` | `event.zen32_scene_controller_event_003` |
| 1333 | Trigger B4 | `event.scene_controller_scene_004` | `event.zen32_scene_controller_event_004` |
| 1336 | Trigger B5 | `event.scene_controller_scene_005` | `event.zen32_scene_controller_event_005` |
| 218 | Device ID sensor state | `device_id('event.scene_controller_scene_001')` | `device_id('event.zen32_scene_controller_event_001')` |
| 219 | Device ID sensor availability | `device_id('event.scene_controller_scene_001')` | `device_id('event.zen32_scene_controller_event_001')` |
| 222 | Device ID sensor attribute | `event.scene_controller_scene_001` | `event.zen32_scene_controller_event_001` |
| 129-133 | Header comments | `event.scene_controller_scene_00X` | `event.zen32_scene_controller_event_00X` |

### Pattern

```
event.scene_controller_scene_00X  →  event.zen32_scene_controller_event_00X
```

---

## What to Report Back

1. The actual entity IDs found via `ha_search_entities`
2. Whether the automation has any traces (ever triggered or not)
3. Whether the automation is enabled
4. The last event state/attributes on the real B5 entity (confirms events fire)
5. Any other issues discovered

---

## Do NOT make code changes yet — report findings only.

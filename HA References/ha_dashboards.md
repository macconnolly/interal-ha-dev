# Home Assistant Dashboards & UI Configuration

**Generated:** 2025-12-02
**Total Dashboards:** 9
**Lovelace Mode:** Storage-based (7), YAML-based (2)
**Custom Cards:** Bubble Card 3.1, Mushroom, Sonos Card, Adaptive Lighting

---

## Dashboard Overview

### Storage Mode Dashboards (7 Total)

#### 1. **Adaptive Living** (Primary Dashboard)
- **URL Path:** adaptive-living
- **Title:** Adaptive Living
- **Icon:** mdi:home-automation
- **Mode:** YAML
- **File:** /dashboards/lovelace_bubble_dashboard.yaml
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Main home control and automation hub
- **Features:**
  - OAL v13 lighting system controls
  - Sonos multi-room audio management
  - Climate control integration
  - Mobile device tracking
  - Scene management

#### 2. **Test Dash**
- **URL Path:** test-dash
- **Title:** Test Dash
- **Icon:** mdi:home-automation
- **Mode:** YAML
- **File:** dashboards/templates/home_center_dashboard.yaml
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Testing and development dashboard

#### 3. **Lighting Manager**
- **URL Path:** lighting-manager
- **Title:** Lighting Control
- **Icon:** mdi:lightbulb-group
- **Mode:** YAML
- **File:** dashboards/lighting_manager_dashboard.yaml
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Dedicated lighting control interface
- **Features:**
  - All 34 lights organized by room
  - Brightness sliders for each zone
  - OAL configuration controls
  - Scene shortcuts
  - Manual override buttons

#### 4. **Mushroom Dashboard**
- **URL Path:** lovelace-mushroom
- **ID:** lovelace_mushroom
- **Title:** Mushroom
- **Icon:** mdi:account
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Alternative UI using Mushroom cards
- **Card Type:** Custom Mushroom integration
- **Features:** Minimalist card layout, state-based icons

#### 5. **Bubble Dashboard**
- **URL Path:** dashboard-bubble
- **ID:** dashboard_bubble
- **Title:** Bubble
- **Icon:** mdi:account
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Bubble Card 3.1 showcase
- **Features:** Advanced bubble card configurations

#### 6. **Main Dashboard (Dash)**
- **URL Path:** main-dashboard
- **ID:** main_dashboard
- **Title:** Dash
- **Icon:** mdi:account
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Default/fallback dashboard

#### 7. **Last Test**
- **URL Path:** last-test
- **ID:** last_test
- **Title:** last test
- **Icon:** (default)
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Testing environment

### Utility Dashboards

#### 8. **Test Dashboard**
- **URL Path:** dashboard-test
- **ID:** dashboard_test
- **Title:** Test
- **Icon:** mdi:account
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No

#### 9. **Map Dashboard**
- **URL Path:** map
- **ID:** map
- **Title:** Map
- **Icon:** mdi:map
- **Mode:** Storage
- **Sidebar:** Visible
- **Admin Only:** No
- **Purpose:** Device location tracking and zones

---

## Enhanced Dashboard: dash-2.yaml (Updated)

**File Location:** /home/mac/HA/implementation_10/dash-2.yaml
**Mode:** YAML (local file, not yet uploaded to Home Assistant)
**Version:** Updated 2025-12-02
**Card Framework:** Bubble Card 3.1
**Home Assistant Version:** 2025.12+

### Structure & Views

#### View 1: Lighting Overview
- **Path:** home-overview
- **Icon:** mdi:home-circle
- **Purpose:** Quick access to all lighting controls
- **Cards:**
  - All Lights Master Control (with slider)
  - OAL Configuration selector
  - Climate temperature display
  - Quick system status

#### View 2: Lighting Control
- **Path:** home-lighting
- **Icon:** mdi:lightbulb
- **Purpose:** Room-by-room light management
- **Sections:**
  1. **Light Areas** - Master controls for adaptive zones
  2. **Living Room** - 5 individual lights (Couch, Floor, Entry, Spots, Overhead)
  3. **Kitchen & Dining** - 3 lights (Island, Overhead, Dining)
  4. **Accent & Bedroom** - 4 lights (Credenza, Columns, Nightstands, Bed Accent)

#### View 3: Media & Entertainment
- **Path:** media-control
- **Icon:** mdi:speaker-multiple
- **Purpose:** Sonos and entertainment system control
- **Cards:**
  1. **Living Room Sonos** - Primary speaker control
     - Play/pause/volume
     - Group/ungroup controls
     - Current track display
  2. **Sonos Room Control** - 5 rooms with group toggles
     - Living, Dining, Kitchen, Bathroom, Bedroom
     - Individual room on/off in group
  3. **Climate Control** - Mushroom climate card
  4. **Sonos Card** - Advanced Sonos management
     - Player control
     - Volume per room
     - Grouping interface
     - Media browser
     - Queue management

### Modern Features (2025.12 Best Practices)

**1. Bubble Card 3.1 Integration:**
- Separator cards with sub-buttons
- Dynamic brightness percentage display
- State-based styling and colors
- Slider integration for continuous values
- Icon transitions and animations

**2. Grid Layout System:**
- max_columns: 4 for overview
- max_columns: 2 for detailed control
- Responsive column spanning
- Proper card sizing and spacing

**3. Action Handling:**
- Tap actions for toggle/more-info
- Hold actions for extended options
- Double-tap for navigation
- Service calls for script execution

**4. Visual Polish:**
- Consistent border-radius (24px main, 16px sub-buttons)
- Smooth transitions (0.2s ease)
- Orange accent color (RGB: 255, 149, 0)
- Proper icon sizing and centering
- State-aware background colors

**5. Mobile Responsiveness:**
- Flexible layout for different screen sizes
- Touch-friendly button sizing (85px height)
- Accessible text sizing (12-14px)
- Proper padding and spacing

### Card Types Used

| Card Type | Count | Purpose |
|-----------|-------|---------|
| bubble-card (separator) | 4 | Section headers with controls |
| bubble-card (media-player) | 1 | Sonos player control |
| bubble-card (button) | 1 | Room selection for grouping |
| mushroom-climate-card | 1 | Temperature control |
| sonos-card | 1 | Advanced Sonos interface |

### Styling Features

**CSS Variables Used:**
- `--bubble-border-radius: 24px` - Card corners
- `--bubble-sub-button-border-radius: 16px` - Sub-button corners
- `--bubble-icon-background-color: transparent` - Icon backgrounds
- `--ha-card-background` - Card background color
- `--primary-text-color` - Default text color

**Dynamic Styling:**
- State-based background colors (on/off)
- Brightness percentage in button labels
- Icon color changes based on entity state
- Smooth CSS transitions for all hover/state changes

---

## Integration with System Entities

### Lighting Integration
- **34 Light Entities** - All controlled from dashboard
- **6 OAL Zones** - Adaptive lighting groups
- **8 Scripts** - Manual control and reset
- **24 Switches** - Adaptive Lighting toggles

### Media Integration
- **5 Sonos Speakers** - All visible in dashboard
- **5 Group Indicators** - Binary sensors for status
- **6 Grouping Scripts** - Control speaker grouping
- **26 Alarms** - Scheduled wake-ups and alerts

### Climate Integration
- **1 Thermostat** - Dining room climate control
- **Humidity/Temp Sensors** - Environmental data
- **Manual Override** - Direct temperature control

### Helper Integration
- **12 Input Booleans** - Toggle states
- **17 Input Numbers** - Offset sliders
- **11 Input Selects** - Configuration dropdowns

---

## Navigation & Accessibility

### Multi-View Structure
- **Horizontal Navigation:** Views as separate pages
- **Path-Based:** Each view has unique URL path
- **Breadcrumb:** View title shows current location
- **Icons:** Visual indicators for each view

### Deep Linking
- Media view includes pop-up (#sonos-detail) for detailed control
- Internal navigation between views
- Scroll anchors for quick access

### User Experience
- **Quick Access:** Master controls on overview
- **Detailed Control:** Room-specific tabs
- **Grouped Functions:** Related items together
- **Clear Labels:** Icon + name for clarity

---

## Dashboard Performance Optimization

**Entity Efficiency:**
- Light groups reduce entity count visually
- Binary sensors for group status (not duplicates)
- Template sensors for computed values
- Minimal redundancy in displays

**Rendering Optimization:**
- CSS transitions instead of JavaScript animations
- Proper card grid sizing prevents reflow
- State-based styling (no watchers on CSS)
- Bubble Card caching for sub-buttons

**Load Time Considerations:**
- Sonos Card loads on demand (detail view)
- Primary view focuses on essential controls
- Lazy loading for extended sections
- Minimal custom JavaScript

---

## Customization Opportunities

### Easy Additions
1. **Scene Selection Cards** - Add scene buttons
2. **Device Status Cards** - Show device battery/availability
3. **Automations Tab** - View/control automations
4. **History Charts** - Energy, temperature trends
5. **Manual Override Panel** - Direct entity control

### Advanced Features
1. **Conditional Visibility** - Hide cards based on state
2. **Custom Lovelace Cards** - Integration with other custom cards
3. **YAML-Based Automations** - Control from UI
4. **Template Integration** - Dynamic labels and values
5. **Theme Customization** - Dark mode, color schemes

---

## Files & References

### Dashboard Files
- `/dashboards/lovelace_bubble_dashboard.yaml` - Main Adaptive Living dashboard
- `/dashboards/templates/home_center_dashboard.yaml` - Test dashboard template
- `/dashboards/lighting_manager_dashboard.yaml` - Lighting-focused dashboard
- `/home/mac/HA/implementation_10/dash-2.yaml` - Enhanced local dashboard

### Custom Card Dependencies
- **Bubble Card:** Version 3.1+ (https://github.com/Clooos/bubble-card)
- **Mushroom:** Latest version (https://github.com/piitaya/lovelace-mushroom)
- **Sonos Card:** Community edition (https://github.com/johanson/sonos-card)

### Configuration Location
- Home Assistant UI: Settings → Dashboards
- YAML Files: `/config/dashboards/`
- Cards: HACS (Home Assistant Community Store)

---

## Deployment Notes

### Current Status
- 9 dashboards configured and operational
- Primary dashboard: "Adaptive Living"
- Enhanced dashboard: dash-2.yaml (ready for import)
- All dashboards use modern Home Assistant 2025.12+ syntax

### To Deploy dash-2.yaml
1. Copy file to Home Assistant dashboards directory
2. Reload Lovelace from Developer Tools → YAML
3. Create new dashboard from UI pointing to YAML file
4. Verify all entities are available (no errors)

### Verification Checklist
- [ ] All 34 lights available and controllable
- [ ] 5 Sonos speakers showing status
- [ ] OAL configuration selector working
- [ ] Climate control accessible
- [ ] All scripts callable from buttons
- [ ] Navigation between views smooth
- [ ] Mobile responsive and touch-friendly

---

## Summary

**Modern Dashboard Architecture:** 2025.12 compliant with Bubble Card 3.1
**Coverage:** Lighting, Media, Climate, System Status
**User Experience:** Intuitive room-based organization with quick access controls
**Extensibility:** Ready for additional cards and automations
**Performance:** Optimized for mobile and desktop viewing

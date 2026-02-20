# Home Assistant Lighting System Details

**Generated:** 2025-12-02
**Total Light Entities:** 34 available, 3 unavailable
**Total Light Groups:** 14
**Adaptive Lighting Zones:** 6

---

## Individual Light Entities

### Philips Hue Lamps (Main Living Area)

| Entity ID | Name | Status | Brightness | Color Temp | Features | Zone |
|-----------|------|--------|-----------|-----------|----------|------|
| light.entryway_lamp | Entry Table Lamp | on | 250/255 | 2202K | CT, Effects | main_living |
| light.living_room_floor_lamp | Floor Lamp Living Room | on | 250/255 | 2202K | CT, Effects | main_living |
| light.living_room_couch_lamp | Couch Lamp | on | 250/255 | 2202K | CT, Effects | main_living |
| light.living_room_credenza_light | Credenza Light | on | 250/255 | 2000K | CT, XY | main_living |
| light.living_room_corner_accent | Living Room Corner Accent | on | 250/255 | 2000K | CT, XY | main_living |

**Hue Effects Available:** off, candle, sparkle, glisten, sunrise, sunset

**Hue Group:** light.cradenza_accent

---

### Kitchen Lighting

| Entity ID | Name | Status | Brightness | Color Temp | Features | Zone |
|-----------|------|--------|-----------|-----------|----------|------|
| light.kitchen_island_pendants | Kitchen Island Pendants | on | 249/255 | Brightness only | Dimmable | kitchen_island |
| light.kitchen_main_lights | Kitchen Main Lights | on | 58/255 | Brightness only | Dimmable | recessed_ceiling |

**Range:** 0-255 brightness
**Last Updated:** 2025-12-02 20:42

---

### Bedroom Lighting

| Entity ID | Name | Status | Brightness | Color Temp | Features |
|-----------|------|--------|-----------|-----------|----------|
| light.master_bedroom_table_lamps | Master Bedroom Table Lamps | on | 102/255 | Brightness only | Dimmable |
| light.master_bedroom_corner_accent | Bed Accent Lamp | on | 99/255 | 2000K | CT, RGB, Effects |

**Bed Accent Effects:** none, sunrise, sunset, movie, dating, romantic, twinkle, candlelight, snowflake, energetic, breathe, crossing

---

### Accent & Spot Lights

| Entity ID | Name | Status | Brightness | Features | Zone |
|-----------|------|--------|-----------|----------|------|
| light.dining_room_spot_lights | Dining Room Spot Lights | on | 124/255 | Brightness | accent_spots |
| light.living_room_spot_lights | Living Room Spot Lights | on | 124/255 | Brightness | accent_spots |
| light.office_desk_lamp | Office Lamp | on | 2/255 | CT, Effects | main_living |

---

### Govee Column Accent Lights

| Entity ID | Name | Status | Brightness | Color | Features |
|-----------|------|--------|-----------|-------|----------|
| light.dining_col_accent | Dining Room Column Accent | on | 197/255 | HS #28.3, 100% | CT, HS, XY |
| light.living_col_accent | Living Col Accent | on | 197/255 | HS #28.3, 100% | CT, HS, XY |

**Note:** Currently set to orange (RGB: 255, 120, 0)

---

### Hallway & Recessed

| Entity ID | Name | Status | Brightness | Features | Zone |
|-----------|------|--------|-----------|----------|------|
| light.living_room_hallway_lights | Living Room Hallway Lights | on | 58/255 | Brightness | recessed_ceiling |

---

### Unavailable Lights

| Entity ID | Name | Status | Type | Last Updated |
|-----------|------|--------|------|--------------|
| light.wall_accents | Wall Accents | unavailable | On/Off only | 2025-11-30 02:57 |
| light.dining_room_wall_accent | Dining Wall Accent | unavailable | CT, HS | 2025-11-30 02:57 |
| light.living_room_wall_accent | Living Wall Accent | unavailable | CT, HS | 2025-11-30 02:57 |

---

## Light Groups (14 Total)

### Adaptive Lighting Zone Groups

| Group | Members | Status | Brightness | Color Temp | Purpose |
|-------|---------|--------|-----------|-----------|---------|
| light.main_living_lights | 5 Hue lamps | on | 250/255 | 2121K | Main living area - color adaptive |
| light.living_room_lights | 9 lights | on | 194/255 | 2121K | All living room lights |
| light.kitchen_island_lights | Kitchen pendants | on | 249/255 | Brightness | Kitchen ambient |
| light.all_kitchen_lights | 2 lights | on | 153/255 | Brightness | All kitchen |
| light.bedroom_primary_lights | 2 lights | on | 100/255 | 2000K | Bedroom zone |
| light.recessed_ceiling_lights | 2 lights | on | 58/255 | Brightness | Ceiling fixtures |
| light.accent_spots_lights | 2 lights | on | 124/255 | Brightness | Accent spots |

### Feature Groups

| Group | Members | Status | Features |
|-------|---------|--------|----------|
| light.overhead_lights | 4 ceiling fixtures | on | Brightness |
| light.hue_lamps_only | 5 Hue lamps | on | CT, XY, Effects |
| light.column_lights | 2 Govee columns | on | CT, HS, XY |
| light.all_living_room_lights | 9 lights | on | CT, HS, XY, Effects |
| light.all_dining_room_lights | 4 lights | on | CT, HS, XY |
| light.all_adaptive_lights | 15 lights | on | CT, RGB, XY, Effects |
| light.all_lights | 15 lights | on | CT, RGB, XY, Effects |

---

## Adaptive Lighting Integration

### Zones Configuration

**6 Active Zones:**

1. **main_living** - Main living area lights
   - Entities: 5 Hue lamps (entryway, floor, couch, credenza, corner)
   - Features: Color temperature + brightness adaptation
   - Controls: Adapt Brightness ON, Adapt Color ON, Sleep Mode OFF

2. **kitchen_island** - Kitchen island pendants
   - Entities: Kitchen Island Pendants
   - Features: Brightness-only adaptation
   - Controls: Adapt Brightness ON, Adapt Color ON, Sleep Mode OFF

3. **bedroom_primary** - Bedroom primary lights
   - Entities: Master Bedroom Table Lamps + Bed Accent Lamp
   - Features: Color temperature + brightness adaptation
   - Controls: Adapt Brightness ON, Adapt Color ON, Sleep Mode OFF

4. **accent_spots** - Accent spot lights
   - Entities: Dining & Living room spots
   - Features: Brightness-only adaptation
   - Controls: Adapt Brightness ON, Adapt Color OFF, Sleep Mode OFF

5. **recessed_ceiling** - Recessed ceiling lights
   - Entities: Kitchen Main + Living Room Hallway
   - Features: Brightness-only adaptation
   - Controls: Adapt Brightness ON, Adapt Color OFF, Sleep Mode OFF

6. **column_lights** - Govee column accents
   - Entities: Dining & Living column accents
   - Features: Color temperature + brightness adaptation
   - Controls: Adapt Brightness ON, Adapt Color ON, Sleep Mode OFF

### Adaptive Lighting Switches (24 Total)

**Format:** switch.adaptive_lighting_[function]_[zone]

| Zone | Main Switch | Brightness | Color | Sleep Mode |
|------|-------------|-----------|-------|-----------|
| main_living | ON | ON | ON | OFF |
| kitchen_island | ON | ON | ON | OFF |
| bedroom_primary | ON | ON | ON | OFF |
| accent_spots | ON | ON | OFF | OFF |
| recessed_ceiling | ON | ON | OFF | OFF |
| column_lights | ON | ON | ON | OFF |

**Update Available:** update.adaptive_lighting_update (off)

---

## Color Capabilities by Zone

### Full Color Zones (RGB + Color Temp)
- main_living: 2000K-6535K, RGB effects
- bedroom_primary: 2000K-9000K, RGB effects
- column_lights: 15K-6535K, RGB/HS/XY

### Color Temperature Only
- kitchen_island: Brightness only (dimmer)
- accent_spots: Brightness only (dimmers)
- recessed_ceiling: Brightness only (dimmers)

### Available Color Effects

**Hue Lamps Effects:**
- Candle, sparkle, glisten, sunrise, sunset

**Bed Accent Effects:**
- Candlelight, breathing, twinkle, romantic, movie, energetic, dating

**Column Lights:**
- Support CT/HS/XY color modes

---

## Light Service Integration

### Standard Services Available
- `light.turn_on` - Turn on with optional brightness/color/effect
- `light.turn_off` - Turn off light
- `light.toggle` - Toggle light state

### Adaptive Lighting Services
- `adaptive_lighting.apply` - Apply AL settings to light
- `adaptive_lighting.set_manual_control` - Lock light from AL adjustments

### Dashboard-Friendly Entities for Tiles
- Individual lights (31 entities)
- Zone groups (6 AL zones)
- Feature groups (8 feature-based groups)

---

## Current Lighting State Summary

**System Status:**
- Total lights on: 31/34
- Lights off/unavailable: 3
- Average brightness: ~150/255
- Dominant color temp: 2100-2200K (warm evening)

**OAL Configuration:** Config 1: Baseline (All On)

**Adaptive Lighting Status:**
- System Status: "Baseline Adaptation"
- Real-Time Monitor: "Boosted"
- Environmental Boost: Enabled
- Movie Mode: Off
- Sleep Mode: Off
- System Paused: Off

# Tunet Overview IA - Locked Baseline

Working branch: `claude/dashboard-nav-research-QnOBs`
Purpose: lock the intended Overview information architecture as a later home-layout decision target, not as permission to keep reworking the overview before nav, popup, and integrated UI / UX decisions are settled.

This document is intentionally limited to:

- information architecture
- overview spatial hierarchy
- desktop / tablet / phone layout intent
- storage-dashboard section planning

This document does **not** redefine card internals.
It does **not** approve any card-core refactor by itself.
It does **not** claim the current storage dashboard already matches this layout.

## Why This Exists

The current storage Overview still behaves too much like:

- one card per section
- too much vertical stacking
- unclear desktop hierarchy
- missing the stronger V1-style top utility / chips band
- insufficiently deliberate use of wide desktop space

The goal of this document is to freeze the target layout so later home-layout work has a clear target once the upstream nav, popup, and integrated UI / UX tranches are complete.

## Locked Overview IA

The Overview should have **four intentional bands**, in this order:

1. **Top utility band**
   - mode / actions / quick controls
   - thin, dense, full-width
   - visually first, but not dominant

2. **Primary status band**
   - Home Status as the main equal-width grid
   - Environment as a supporting compact stack to the right on desktop

3. **Hero interaction band**
   - Lighting as the dominant whole-home hero surface

4. **Destination band**
   - Rooms as the drill-in entry surface
   - Media as a compact companion surface

This is the locked desktop hierarchy:

- utility first
- status second
- lighting third and visually dominant
- destination / media fourth

## Desktop Layout (Locked)

```text
+----------------------------------------------------------------------------------+
| [ MODE / ACTION CHIPS / SCENES / QUICK CONTROLS ]                                |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------+-----------------------+
|                  HOME STATUS 4 x 2 GRID                  |     ENVIRONMENT       |
| [ Adaptive ] [ Manual ] [ Boost ] [ Mode ]              |  [ Climate compact ]  |
| [ Weather  ] [ Humid. ] [ Config ] [ Inside ]           |  [ Weather compact ]  |
|                                                          |  [ key sensors ]      |
+----------------------------------------------------------+-----------------------+

+----------------------------------------------------------------------------------+
|                           LIGHTING HERO / WHOLE HOME                             |
|   [ Living ] [ Kitchen ] [ Bedroom ] [ Spots ] [ Ceiling ] [ Columns ]          |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------+-----------------------+
|                       ROOMS ENTRY                         |        MEDIA          |
| [ Living ] [ Kitchen ] [ Dining ] [ Bedroom ]            |  [ now playing ]      |
| room state + popup affordance                            |  [ compact controls ] |
+----------------------------------------------------------+-----------------------+
```

### Desktop intent

- The top band must feel like a control strip, not a full content section.
- Home Status must be one coherent equal-width surface.
- Environment is not a peer to Lighting; it is a compact support stack.
- Lighting deserves the widest and most visually dominant row.
- Rooms and Media share the last row because both are drill-in surfaces, not overview-dominant content.

## Tablet Layout (Locked)

```text
+--------------------------------------------------------------+
|                 MODE / ACTION CHIPS STRIP                    |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|                 HOME STATUS 4 x 2 EQUAL GRID                 |
| [ Adaptive ] [ Manual ] [ Boost ] [ Mode ]                   |
| [ Weather  ] [ Humid. ] [ Config ] [ Inside ]                |
+--------------------------------------------------------------+

+----------------------------------+---------------------------+
|          LIGHTING HERO           |        ENVIRONMENT        |
| [ Living ] [ Kitchen ] [ Bed ]   |  [ Climate ]             |
| [ Spots  ] [ Ceiling ] [ Col ]   |  [ Weather ]             |
+----------------------------------+---------------------------+

+--------------------------------------------------------------+
|                    ROOMS / SPACES                            |
| [ Living Room ] [ Kitchen ] [ Dining ] [ Bedroom ]          |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|                         MEDIA MINI                           |
+--------------------------------------------------------------+
```

### Tablet intent

- Tablet still uses a top chips strip.
- Status should remain one intentional grid.
- Lighting and Environment may share a row on tablet.
- Rooms gets its own row because it remains a major navigation surface.
- Media may collapse below Rooms instead of competing with it horizontally.

## Phone Layout (Locked)

```text
+--------------------------------------+
|         MODE / ACTION CHIPS          |
+--------------------------------------+

+--------------------------------------+
|          HOME STATUS 2 x 4           |
| [ Adaptive ] [ Manual ]              |
| [ Boost    ] [ Mode   ]              |
| [ Weather  ] [ Humid. ]              |
| [ Config   ] [ Inside ]              |
+--------------------------------------+

+--------------------------------------+
|            LIGHTING HERO             |
+--------------------------------------+

+--------------------------------------+
|             ENVIRONMENT              |
+--------------------------------------+

+--------------------------------------+
|               ROOMS                  |
+--------------------------------------+

+--------------------------------------+
|               MEDIA                  |
+--------------------------------------+
```

### Phone intent

- Phone can stack vertically.
- The status grid should reflow, but still remain one surface.
- Lighting remains the hero.
- Rooms stays above Media because room entry is usually the more common overview jump.

## Storage Dashboard Translation Plan

This is the target section plan for `Dashboard/Tunet/tunet-suite-storage-config.yaml` Overview.

### Section 1 - Utility Band

- Content:
  - `custom:tunet-actions-card`
  - optionally V1-style chips if the V2 actions strip cannot carry the needed density and visual language
- Width:
  - full overview row
- Intent:
  - thin control strip
  - should not consume dominant visual height

### Section 2 - Status Band Left

- Content:
  - `custom:tunet-status-card`
- Width:
  - dominant left area on desktop
  - full width on tablet/phone
- Intent:
  - one coherent equal-width grid
  - no fragmentation

### Section 3 - Status Band Right / Environment Stack

- Content:
  - `custom:tunet-climate-card`
  - `custom:tunet-weather-card`
  - optional compact `custom:tunet-sensor-card` or compact environment summary if useful
- Width:
  - narrower companion area on desktop
  - paired with Lighting on tablet
  - stacked below Lighting on phone
- Intent:
  - support status and comfort context
  - not a dominant overview region

### Section 4 - Lighting Hero

- Content:
  - `custom:tunet-lighting-card`
- Width:
  - full-width hero on desktop
  - dominant half or full row on tablet
  - full width on phone
- Intent:
  - primary interaction surface
  - should feel like the overview's main control area

### Section 5 - Rooms Destination Surface

- Content:
  - `custom:tunet-rooms-card`
- Width:
  - wide on desktop, full width on tablet/phone
- Intent:
  - room entry point
  - popup affordance on overview
  - not overloaded with unrelated content

### Section 6 - Media Companion Surface

- Content:
  - compact media surface
  - likely `custom:tunet-media-card`
- Width:
  - companion width beside Rooms on desktop
  - full-width row on tablet/phone
- Intent:
  - compact now-playing and quick media access
  - should not dominate overview

## What This Means For The Current Storage Overview

The current storage Overview should be considered structurally wrong in these ways:

1. Too many sections use `column_span: 4` with a single card.
2. Climate, Weather, and Sensor surfaces are each given their own full-width row instead of being composed intentionally.
3. Lighting is not clearly established as the hero row.
4. Rooms and Media are not being used as a deliberate bottom-band pairing.
5. The top utility strip exists, but the rest of the overview still reads as a stack, not as a designed layout.

## Explicit Non-Goals For The Layout Pass

When translating this locked IA into the storage dashboard, do **not**:

- refactor card internals
- redesign `tunet-status-card`
- redesign `tunet-lighting-card`
- redesign `tunet-nav-card`
- solve all responsive card-core issues
- solve config-editor viability
- solve the entire nav strategy

The composition pass should stay at the dashboard-structure layer first.

## Recommended Next Tranche After T-001

`T-003` should be refined to:

- recompose the storage Overview to match this locked IA
- touch storage dashboard config first
- avoid card-core changes unless there is a real blocker
- treat desktop/tablet composition as the primary acceptance target

## Acceptance Standard For The Future Layout Tranche

The future overview-layout tranche should be accepted only if:

- desktop no longer reads as a long single-column scroll
- the top utility band is visibly distinct and thin
- Home Status reads as one equal-width surface
- Lighting reads as the overview hero
- Environment is compositionally subordinate to Lighting
- Rooms and Media read as destination surfaces, not random extra rows
- phone still degrades gracefully to a clean vertical flow

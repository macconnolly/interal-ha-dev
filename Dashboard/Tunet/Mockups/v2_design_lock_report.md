# Tunet V2 Design Lock Report

Date: 2026-02-20  
Scope: V2 card suite visual system hardening  
Branch: `trial`

## 1. Global Token Lock (Shared)

Primary source file: `Dashboard/Tunet/Cards/v2/tunet_base.js`

| Attribute | Locked value | Line | Where it applies |
|---|---:|---:|---|
| Tile radius (global) | `--r-tile: 16px` | 72 | All cards using tile radius token |
| Track radius (global) | `--r-track: 14px` | 74 | Non-hero tracks by default |
| Rest shadow (light) | `0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08)` | 26 | Shared card/tile surfaces |
| Lift shadow (light) | `0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)` | 27 | Shared hover/lift overlays |
| Section bg (light) | `rgba(255,255,255, 0.45)` | 141 | Section surface variant |
| Section gap | `--section-gap: 16px` | 142 | Section container rhythm |
| Gray ghost | `rgba(0, 0, 0, 0.03)` | 121 | Off/idle icon container backgrounds |
| Dark glass | `rgba(30,41,59, 0.72)` | 151 | Midnight dark baseline |
| Rest shadow (dark) | `0 4px 20px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.50)` | 154 | Dark separation and depth |
| Lift shadow (dark) | `0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40)` | 155 | Drag/hover depth in dark |
| Tile bg (dark) | `rgba(30,41,59, 0.92)` | 208 | Midnight tile surface |
| Dark ghost border | `rgba(255,255,255, 0.05)` | 210 | Off tile edge definition |

## 2. Shared Interaction / Accessibility Tokens (New)

All defined in `Dashboard/Tunet/Cards/v2/tunet_base.js`.

| Group | Value | Line |
|---|---:|---:|
| Motion fast | `--motion-fast: 0.12s` | 82 |
| Motion UI | `--motion-ui: 0.18s` | 83 |
| Motion surface | `--motion-surface: 0.28s` | 84 |
| Standard easing | `cubic-bezier(0.2, 0, 0, 1)` | 85 |
| Emphasized easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 86 |
| Press scale | `--press-scale: 0.97` | 87 |
| Strong press scale | `--press-scale-strong: 0.95` | 88 |
| Lift scale | `--lift-scale: 1.03` | 89 |
| Drag scale | `--drag-scale: 1.05` | 90 |
| Focus ring color | `--focus-ring-color: var(--blue)` | 93 |
| Focus ring width | `2px` (3px in high-contrast) | 94, 241 |
| Focus ring offset | `3px` | 95 |

### Global focus behavior (new)
- Added shared `:focus-visible` rule for `button`, `[role="button"]`, `[tabindex]`, `.focus-ring`  
- Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:225-230`

## 3. Shared Surface Robustness (New)

### Reduced transparency support
- `@media (prefers-reduced-transparency: reduce)` token overrides  
- Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:253-271`

### High contrast support
- `@media (prefers-contrast: more)` raises text/border contrast and focus width  
- Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:233-251`

### No-backdrop fallback
- `@supports not (backdrop-filter...)` opaque fallback tokens  
- Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:273-286`

## 4. Shared CSS Block Upgrades

All updated in `Dashboard/Tunet/Cards/v2/tunet_base.js`.

- `CARD_SURFACE` now uses blur token + motion tokens  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:379-391`
- `SECTION_SURFACE` now uses blur token + `--section-gap`  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:431-441`
- `TILE_SURFACE` now uses tokenized transitions, hover media-gating, drag class, tokenized active scale, focus ring  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:453-483`
- `CTRL_SURFACE` now uses tokenized transitions, hover media-gating, tokenized active scale, focus ring  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:536-562`
- `DROPDOWN_MENU` now uses blur token, motion tokenized open animation, tokenized option transitions, focus ring  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:574-624`
- `REDUCED_MOTION` now also enforces `scroll-behavior: auto`  
  Reference: `Dashboard/Tunet/Cards/v2/tunet_base.js:635-643`

## 5. Lighting Hero Lock (Intentional Exception)

Source: `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`

| Attribute | Locked value | Line |
|---|---:|---:|
| Tile radius (hero override) | `--r-tile: 22px` | 60 |
| Track radius (hero override) | `--r-track: 999px` | 59 |
| Rest shadow (light) | `--tile-shadow-rest` parity stack | 64 |
| Lift shadow (light) | `--tile-shadow-lift` parity stack | 65 |
| Rest shadow (dark) | strengthened dark stack | 85 |
| Lift shadow (dark) | strengthened dark stack | 86 |
| Dark ghost border usage | `border: 1px solid var(--border-ghost)` | 397 |
| Off icon ghost bg | `background: var(--gray-ghost)` | 431 |
| Floating pill font | `15px` | 485 |
| Floating pill padding | `6px 20px` | 488 |
| Progress track rest | `height: 4px` | 538 |
| Progress track drag | `height: 6px` | 497 |
| Manual dot size | `8px` | 557 |
| Manual dot glow | `0 0 12px rgba(255,82,82,0.6)` | 562 |
| Row height engine | compact `96`, standard `116`, large `136` | 1008 |
| Drag threshold | touch `5px`, mouse `10px` | 1151 |
| Drag gain | touch `1.12`, mouse `0.95` | 1153 |

## 6. Icon Container Coverage (Current)

| Card | Container pattern | Reference |
|---|---|---|
| Lighting | `.tile-icon-wrap` | `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js:503` |
| Sensor | `.sensor-icon` | `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js:146` |
| Rooms | `.room-tile-icon` | `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js:163` |
| Speaker Grid | `.tile-icon-wrap` | `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js:167` |
| Sonos | `.spk-icon-wrap` | `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js:303` |
| Status | Glyph-only icon slot (`.tile-icon`) | `Dashboard/Tunet/Cards/v2/tunet_status_card.js:110` |
| Actions | Inline icon in chip | `Dashboard/Tunet/Cards/v2/tunet_actions_card.js:202` |
| Weather | Forecast glyphs direct (`.forecast-icon`) | `Dashboard/Tunet/Cards/v2/tunet_weather_card.js:101` |

## 7. Glow Policy Coverage (Current)

| Glow type | Active usage | Reference |
|---|---|---|
| Manual override glow | Lighting manual dot | `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js:562` |
| Group glow | Speaker Grid grouped markers | `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js:287`, `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js:308` |
| Alarm attention state | Status alarm ringing class | `Dashboard/Tunet/Cards/v2/tunet_status_card.js:298` |

## 8. Decision Lock Status (1–9)

1. Canonical precedence: v8.3 + mockup overrides only for hero interaction clarity  
2. Tile radius policy: global `16px`, lighting hero `22px` override  
3. Dark shadow policy: stronger dark stack enabled in base + hero cards  
4. Proportion policy: fixed row heights retained in lighting  
5. Icon container policy: required in stateful tiles, optional in compact chips  
6. Glow policy: restricted to manual/group/alarm signaling  
7. Typography policy: card-local, token-ready motion/focus system now centralized  
8. Section wrapper policy: section surface standardized; mixed module architecture retained  
9. Scenes/environment policy: no standalone scenes in overview baseline; environment row preserved by architecture contract

## 9. What Is Still Card-Specific (Not Globalized by Design)

- Drag math and axis-lock physics  
- Media playback timelines and volume slider semantics  
- Alarm action button choreography  
- Rooms navigation behavior and room-level control logic

These remain card-local to avoid cross-card behavioral regressions.

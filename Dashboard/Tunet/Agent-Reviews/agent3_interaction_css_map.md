# Agent 3 — Interaction CSS Map
# Climate Card Measured Visual Reference + Cross-Card Audit
# Date: Apr 2, 2026

## CLIMATE CARD BASELINE (measured from tunet_climate_card.js)

### Hover States
| Element | CSS |
|---------|-----|
| .hdr-tile:hover | box-shadow: var(--shadow) |
| .fan-btn:hover | box-shadow: var(--shadow) |
| .mode-btn:hover | box-shadow: var(--shadow) |
| .mode-opt:hover | background: var(--track-bg) |
| .thumb:hover .thumb-disc | box-shadow: var(--thumb-sh-a) |

### Active/Pressed States
| Element | CSS |
|---------|-----|
| .hdr-tile:active | transform: scale(.98) |
| .fan-btn:active | transform: scale(.94) |
| .mode-btn:active | transform: scale(.97) |
| .mode-opt:active | transform: scale(.97) |
| .thumb:active | cursor: grabbing; transform: translate(-50%,-50%) scale(1.08) |

### Focus States
| Element | CSS |
|---------|-----|
| .thumb:focus-visible | outline: 2px solid var(--blue); outline-offset: 3px |
| Other controls | Global RESET: outline var(--focus-ring-width) solid var(--focus-ring-color); offset var(--focus-ring-offset) |

### Transitions
| Element | CSS |
|---------|-----|
| .hdr-tile, .fan-btn, .mode-btn | all .15s ease |
| .hdr-icon | all .2s ease |
| .fill-h, .fill-c | width 60ms ease |
| .thumb | transform .15s |
| .cur-marker | left .25s ease |

### Disabled States
| Selector | CSS |
|----------|-----|
| .card[data-mode="off"] | opacity: .55 |
| .card[data-mode="off"] .track | opacity: .35 |

### Shadow Values (from tunet_base.js)
| Token | Light | Dark |
|-------|-------|------|
| --shadow (rest) | 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08) | 0 4px 20px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.50) |
| --shadow-up (lift) | 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08) | 0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40) |
| --ctrl-sh (control) | 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04) | 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15) |

### Color Tokens
| Token | Light | Dark |
|-------|-------|------|
| --amber | #D4850A | #fbbf24 |
| --blue | #007AFF | #0A84FF |
| --glass | rgba(255,255,255,0.68) | rgba(30,41,59,0.72) |
| --text | #1C1C1E | #F8FAFC |

---

## 10 KEY DIVERGENCES ACROSS 13 CARDS

F1: Press scale fragmentation — 7 distinct values (.90-.99); only nav/l-tile use tokens
F2: Focus-visible three variants — offset 2px vs 3px; media/weather/sonos have ZERO
F3: Hover guard — only lighting l-tile and light_tile use @media (hover:hover)
F4: Shadow tokens — base vs local redefinitions; dark mode values diverge
F5: Undefined --spring in sonos/speaker_grid
F6: Undefined --accent in speaker_grid focus ring
F7: Transition shorthand — most use "all .15s ease"; scenes/nav/light_tile use correct named tokens
F8: speaker_grid translateY(-1px) on hover — unique, undocumented
F9: actions-chip has no transition — shadow instant
F10: status card em-based shadows — profile artifact

## FOCUS-VISIBLE COVERAGE

| Card | Has focus-visible | Notes |
|------|------------------|-------|
| climate | YES (thumb) | Others via global RESET |
| actions | YES | offset 2px (not 3px) |
| status | YES (.tile) | em units; tile-aux missing |
| lighting | YES | consistent |
| rooms | YES (.room-tile) | orbs/btns missing |
| media | **NO** | complete gap |
| scenes | YES | offset 2px |
| weather | **NO** | complete gap |
| sensor | YES (.sensor-row) | section-action missing |
| sonos | **NO** | complete gap |
| speaker_grid | YES | uses --accent (undefined) |
| nav | YES | correct tokens + border-radius:16px |
| light_tile | YES | correct tokens with fallbacks |

## TRANSITION PATTERNS

Best practice (scenes/nav/light_tile): explicit multi-property with named tokens
Anti-pattern (most cards): transition: all .15s ease

See full task output for complete per-card interaction matrix.

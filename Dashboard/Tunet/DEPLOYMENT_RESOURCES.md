# Tunet Dashboard Deployment Resources

**Date**: 2026-02-22
**Spec**: design_language.md v8.4
**Overview config**: tunet-overview-config.yaml

---

## Lovelace Resources (YAML)

Add to your HA Lovelace configuration (`/config/lovelace/resources` or via UI):

```yaml
resources:
  # ── Core overview cards (8) ─────────────────────────────
  - url: /local/tunet/tunet_actions_card.js?v=2.1.0
    type: module

  - url: /local/tunet/tunet_status_card.js?v=2.2.0
    type: module

  - url: /local/tunet/tunet_lighting_card.js?v=3.2.0
    type: module

  - url: /local/tunet/tunet_climate_card.js?v=1.0.0
    type: module

  - url: /local/tunet/tunet_weather_card.js?v=1.1.0
    type: module

  - url: /local/tunet/tunet_sensor_card.js?v=1.0.0
    type: module

  - url: /local/tunet/tunet_media_card.js?v=3.0.0
    type: module

  - url: /local/tunet/tunet_rooms_card.js?v=2.1.0
    type: module

  # ── Optional / standalone cards (2) ─────────────────────
  - url: /local/tunet/tunet_scenes_card.js?v=1.0.0
    type: module

  - url: /local/tunet/tunet_speaker_grid_card.js?v=1.0.0
    type: module
```

## File Inventory

| File | Version | Lines | Custom Element | In Overview | Status |
|------|---------|-------|----------------|-------------|--------|
| `tunet_actions_card.js` | 2.1.0 | 679 | `tunet-actions-card` | Yes (slot 1) | Ready |
| `tunet_status_card.js` | 2.2.0 | 1268 | `tunet-status-card` | Yes (slot 2) | Ready |
| `tunet_lighting_card.js` | 3.2.0 | 1929 | `tunet-lighting-card` | Yes (slot 3) | Ready |
| `tunet_climate_card.js` | 1.0.0 | 1640 | `tunet-climate-card` | Yes (slot 4a) | Ready |
| `tunet_weather_card.js` | 1.1.0 | 626 | `tunet-weather-card` | Yes (slot 4a) | Ready |
| `tunet_sensor_card.js` | 1.0.0 | 1099 | `tunet-sensor-card` | Yes (slot 4b) | Ready |
| `tunet_media_card.js` | 3.0.0 | 1592 | `tunet-media-card` | Yes (slot 5) | Ready |
| `tunet_rooms_card.js` | 2.1.0 | 1002 | `tunet-rooms-card` | Yes (slot 6) | Ready |
| `tunet_scenes_card.js` | 1.0.0 | 385 | `tunet-scenes-card` | No (standalone) | Ready |
| `tunet_speaker_grid_card.js` | 1.0.0 | 967 | `tunet-speaker-grid-card` | No (standalone) | Ready |

\* See AUDIT_GAP_REPORT.md for HIGH/MEDIUM severity gaps requiring fixes.

## Deployment File Path

Source: `Dashboard/Tunet/Cards/*.js`
Target: `/config/www/tunet/` on HA OS

Copy command:
```bash
# From repo root
cp Dashboard/Tunet/Cards/tunet_*.js /config/www/tunet/
```

## Registration Verification

All 10 cards use idempotent registration:
```javascript
if (!customElements.get('tag-name')) {
  customElements.define('tag-name', ClassName);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tag-name')) {
  window.customCards.push({ type: 'tag-name', name: '...', description: '...' });
}
```

No duplicate custom element names. Safe to load all 10 simultaneously.

## Overview Composition Order

Per design_language.md v8.4 and tunet-overview-config.yaml:

1. Quick Actions strip -- `custom:tunet-actions-card`
2. Home Status 4x2 grid -- `custom:tunet-status-card`
3. Lighting Hero 3x2 -- `custom:tunet-lighting-card`
4. Environment Row -- `grid` wrapping `custom:tunet-climate-card` + `custom:tunet-weather-card`
4b. Environment Sensors -- `custom:tunet-sensor-card`
5. Media -- `custom:tunet-media-card`
6. Rooms -- `custom:tunet-rooms-card`

## Pre-deployment Checklist

- [ ] Copy all 10 JS files to `/config/www/tunet/`
- [ ] Add resource entries to Lovelace configuration
- [ ] Clear browser cache (Ctrl+Shift+R) after deployment
- [ ] Verify dark mode toggle works on each card
- [ ] Verify all entity_ids in tunet-overview-config.yaml exist in your HA instance
- [ ] All HIGH-severity fixes from AUDIT_GAP_REPORT.md have been applied

## Known Gaps — ALL RESOLVED (2026-02-22)

All gaps from AUDIT_GAP_REPORT.md have been fixed:

1. ~~5 cards need icon font cleanup~~ — **DONE**: All 10 cards now use `Material Symbols Rounded` only, no `icon_names=` filtering
2. ~~Scenes card needs token alignment~~ — **DONE**: `--glass: 0.68`, `--shadow` matched to gold standard
3. ~~3 cards need focus-visible CSS~~ — **DONE**: Added to media, rooms, weather
4. ~~Icon variation base values~~ — **DONE**: All 10 cards use `wght 400, GRAD 0, opsz 24`
5. ~~Sensor card `--bg` token~~ — **DONE**: Removed prohibited page background token

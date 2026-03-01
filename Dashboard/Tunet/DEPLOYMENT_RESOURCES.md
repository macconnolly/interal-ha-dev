# Tunet Dashboard Deployment Resources (V2)

**Last updated**: 2026-03-01

This repo’s active Tunet card suite lives in:
- Source: `Dashboard/Tunet/Cards/v2/`
- Target on HA: `/config/www/tunet/v2/` (served as `/local/tunet/v2/`)

The new POC dashboard config lives in:
- Source: `Dashboard/Tunet/tunet-suite-config.yaml`

---

## V2 Lovelace Resources (UI or YAML)

Add these resources in Home Assistant (Settings → Dashboards → Resources) or YAML resources:

```yaml
resources:
  # Tunet V2 cards (ES modules)
  - url: /local/tunet/v2/tunet_actions_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_status_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_lighting_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_light_tile.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_climate_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_weather_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_sensor_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_media_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_speaker_grid_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_rooms_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_sonos_card.js?v=20260301_01
    type: module
  - url: /local/tunet/v2/tunet_nav_card.js?v=20260301_01
    type: module

  # Bubble Card (required for hash pop-ups in tunet-suite POC)
  - url: /hacsfiles/Bubble-Card/bubble-card.js
    type: module
```

Notes:
- All V2 cards import `./tunet_base.js` at runtime, so `tunet_base.js` must exist at `/local/tunet/v2/tunet_base.js` even though it is not a Lovelace resource.
- Bump the `?v=` query whenever deploying card changes to avoid frontend caching issues.

---

## Deploy Files To HA

Copy the full V2 directory to HA:

```bash
# From repo root on a HA host (or via scp/rsync)
mkdir -p /config/www/tunet/v2
cp Dashboard/Tunet/Cards/v2/tunet_*.js /config/www/tunet/v2/
```

---

## Register The POC Dashboard (`/tunet-suite`)

1. Copy the dashboard YAML to HA (recommended location):

```bash
mkdir -p /config/dashboards
cp Dashboard/Tunet/tunet-suite-config.yaml /config/dashboards/tunet-suite.yaml
```

2. Register the dashboard in `configuration.yaml`:

```yaml
lovelace:
  mode: storage
  dashboards:
    tunet-suite:
      mode: yaml
      filename: dashboards/tunet-suite.yaml
      title: Tunet Suite (POC)
      icon: mdi:view-dashboard
      show_in_sidebar: true
```

---

## Known Cache Pitfall (Config Editors)

If `getConfigForm()` editors do not appear in the UI:
- hard refresh (Ctrl+Shift+R)
- disable cache in DevTools (Network tab)
- bump the `?v=` on resources (see above)


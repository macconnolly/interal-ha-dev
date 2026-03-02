# Tunet Dashboard Deployment Resources (V2 Next Staging)

**Last updated**: 2026-03-01

This repo’s active Tunet staging suite lives in:
- Source: `Dashboard/Tunet/Cards/v2/`
- Active staging target on HA: `/config/www/tunet/v2_next/` (served as `/local/tunet/v2_next/`)

Optional stable rollback root:
- Optional stable target on HA: `/config/www/tunet/v2/` (served as `/local/tunet/v2/`)
- Use this only when you intentionally promote or roll back the suite.

The new POC dashboard config lives in:
- Source: `Dashboard/Tunet/tunet-suite-config.yaml`

---

## Active Lovelace Resources (UI or YAML)

Add these resources in Home Assistant (Settings -> Dashboards -> Resources) or YAML resources.
These examples reflect the active staging root, not the optional stable fallback root.

```yaml
resources:
  # Tunet V2 cards (ES modules)
  - url: /local/tunet/v2_next/tunet_actions_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_status_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_lighting_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_light_tile.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_climate_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_weather_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_sensor_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_media_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_speaker_grid_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_rooms_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_sonos_card.js?v=20260301_02
    type: module
  - url: /local/tunet/v2_next/tunet_nav_card.js?v=20260301_02
    type: module

  # Bubble Card (required for hash pop-ups in tunet-suite POC)
  - url: /hacsfiles/Bubble-Card/bubble-card.js
    type: module
```

Notes:
- All V2 cards import `./tunet_base.js` at runtime, so `tunet_base.js` must exist at `/local/tunet/v2_next/tunet_base.js` even though it is not a Lovelace resource.
- Bump the `?v=` query whenever deploying card changes to avoid frontend caching issues.
- If you intentionally promote staging to stable, update both the HA files and the Lovelace resource URLs together.

---

## Deploy Files To HA (Active Staging Root)

Copy the full V2 directory to HA:

```bash
# From repo root on a HA host (or via scp/rsync)
mkdir -p /config/www/tunet/v2_next
cp Dashboard/Tunet/Cards/v2/tunet_*.js /config/www/tunet/v2_next/
```

Important:
- `tunet_*.js` includes `tunet_base.js`, so the shared module is copied with the rest of the suite.
- Do not mix `v2` and `v2_next` resource URLs in the same active dashboard.

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

## Optional Stable Promotion / Rollback

Promote staging to stable only when explicitly approved:

```bash
mkdir -p /config/www/tunet/v2
cp /config/www/tunet/v2_next/tunet_*.js /config/www/tunet/v2/
```

Then repoint Lovelace resources from `/local/tunet/v2_next/...` to `/local/tunet/v2/...` and hard refresh.

If `v2_next` breaks:
- repoint resources back to `/local/tunet/v2/...`
- hard refresh with cache disabled
- confirm there are no stale `v2_next` module requests in DevTools Network

---

## Known Cache Pitfall (Config Editors)

If `getConfigForm()` editors do not appear in the UI:
- hard refresh (Ctrl+Shift+R)
- disable cache in DevTools (Network tab)
- bump the `?v=` on resources (see above)

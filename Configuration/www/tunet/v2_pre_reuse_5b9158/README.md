Pre-reuse V2 snapshot for Tunet cards.

Source:
- Commit: `5b9158a`
- Context: last working set before primitive/composer extraction (`tunet_light_tile`, `tunet_speaker_tile`, `tunet_runtime`, etc.).

Contained cards:
- `tunet_actions_card.js`
- `tunet_base.js`
- `tunet_climate_card.js`
- `tunet_lighting_card.js`
- `tunet_media_card.js`
- `tunet_rooms_card.js`
- `tunet_sensor_card.js`
- `tunet_speaker_grid_card.js`
- `tunet_status_card.js`
- `tunet_weather_card.js`

HA server path:
- `/config/www/tunet/v2_pre_reuse_5b9158/`

Notes:
- These files are uploaded for fallback/reference.
- They are not automatically active unless Lovelace resource URLs are switched to this path.
- Because custom element tags are identical, do not load both active V2 and this snapshot at the same time for the same card types.

#!/usr/bin/env node

/**
 * Single Tunet v3 card registry.
 *
 * Build, deploy, Lovelace resource sync, and visual-review tooling all consume
 * this list so a new card cannot silently ship through only part of the
 * release path.
 */

export const TUNET_CARD_SOURCE_ROOT = 'Dashboard/Tunet/Cards/v3';

export const TUNET_CARD_REGISTRY = Object.freeze([
  { file: 'tunet_inbox_card.js', tag: 'tunet-inbox-card', aliases: ['inbox'] },
  { file: 'tunet_actions_card.js', tag: 'tunet-actions-card', aliases: ['actions'] },
  { file: 'tunet_scenes_card.js', tag: 'tunet-scenes-card', aliases: ['scenes'] },
  { file: 'tunet_light_tile.js', tag: 'tunet-light-tile', aliases: ['light_tile', 'lighttile'] },
  { file: 'tunet_lighting_card.js', tag: 'tunet-lighting-card', aliases: ['lighting'] },
  { file: 'tunet_rooms_card.js', tag: 'tunet-rooms-card', aliases: ['rooms'] },
  { file: 'tunet_climate_card.js', tag: 'tunet-climate-card', aliases: ['climate'] },
  { file: 'tunet_sensor_card.js', tag: 'tunet-sensor-card', aliases: ['sensor'] },
  { file: 'tunet_weather_card.js', tag: 'tunet-weather-card', aliases: ['weather'] },
  { file: 'tunet_media_card.js', tag: 'tunet-media-card', aliases: ['media'] },
  { file: 'tunet_sonos_card.js', tag: 'tunet-sonos-card', aliases: ['sonos'] },
  {
    file: 'tunet_speaker_grid_card.js',
    tag: 'tunet-speaker-grid-card',
    aliases: ['speaker_grid', 'speakergrid'],
  },
  { file: 'tunet_nav_card.js', tag: 'tunet-nav-card', aliases: ['nav'] },
  { file: 'tunet_status_card.js', tag: 'tunet-status-card', aliases: ['status'] },
  { file: 'tunet_alarm_card.js', tag: 'tunet-alarm-card', aliases: ['alarm'] },
]);

export const TUNET_CARD_FILES = Object.freeze(TUNET_CARD_REGISTRY.map((entry) => entry.file));
export const TUNET_CARD_TAGS = Object.freeze(TUNET_CARD_REGISTRY.map((entry) => entry.tag));

export const TUNET_CARD_SOURCE_PATHS = Object.freeze(
  Object.fromEntries(
    TUNET_CARD_REGISTRY.map((entry) => [entry.tag, `${TUNET_CARD_SOURCE_ROOT}/${entry.file}`])
  )
);

export const TUNET_CARD_ALIASES = Object.freeze(
  Object.fromEntries(
    TUNET_CARD_REGISTRY.flatMap((entry) => [
      [entry.tag, entry.tag],
      [entry.file.replace(/\.js$/, ''), entry.tag],
      [entry.file.replace(/\.js$/, '').replace(/^tunet_/, '').replace(/_card$/, ''), entry.tag],
      ...entry.aliases.map((alias) => [alias, entry.tag]),
    ])
  )
);

function printList(values) {
  process.stdout.write(`${values.join('\n')}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || '--json';
  if (mode === '--files') {
    printList(TUNET_CARD_FILES);
  } else if (mode === '--source-files') {
    printList([...TUNET_CARD_FILES, 'tunet_base.js']);
  } else if (mode === '--tags') {
    printList(TUNET_CARD_TAGS);
  } else if (mode === '--json') {
    process.stdout.write(`${JSON.stringify(TUNET_CARD_REGISTRY, null, 2)}\n`);
  } else {
    console.error(`Unknown argument: ${mode}`);
    process.exit(1);
  }
}

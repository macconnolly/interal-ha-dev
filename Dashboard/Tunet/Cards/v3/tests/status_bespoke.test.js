/**
 * CD11 Status Bespoke Tests
 *
 * Focused coverage for the status-card structural fixes, mode framework,
 * implemented mode contracts, and custom backward compatibility.
 */

import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  extractCSSBlocks,
  readCardSource,
} from './helpers/css_contract_helpers.js';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
}

import '../tunet_status_card.js';

function readCardCSS() {
  return extractCSSBlocks(readCardSource('tunet_status_card.js')).join('\n');
}

function makeStatusHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    callService: vi.fn(() => Promise.resolve()),
    states: {
      'person.mac_connolly': {
        entity_id: 'person.mac_connolly',
        state: 'home',
        attributes: { friendly_name: 'Mac' },
      },
      'sensor.oal_system_status': {
        entity_id: 'sensor.oal_system_status',
        state: 'Adaptive',
        attributes: {
          friendly_name: 'OAL System Status',
          zones_adaptive: 3,
          active_zonal_overrides: 2,
          current_config: 'Adaptive',
        },
      },
      'sensor.dining_room_temperature': {
        entity_id: 'sensor.dining_room_temperature',
        state: '70',
        attributes: {
          friendly_name: 'Dining Room Temperature',
          unit_of_measurement: '°F',
        },
      },
      'sensor.kitchen_humidity': {
        entity_id: 'sensor.kitchen_humidity',
        state: '34',
        attributes: {
          friendly_name: 'Kitchen Humidity',
          unit_of_measurement: '%',
        },
      },
      'sensor.oal_global_brightness_offset': {
        entity_id: 'sensor.oal_global_brightness_offset',
        state: '15',
        attributes: {
          friendly_name: 'OAL Global Brightness Offset',
          total_offset: 15,
          current_config: 'Adaptive',
        },
      },
      'input_select.oal_active_configuration': {
        entity_id: 'input_select.oal_active_configuration',
        state: 'TV Mode',
        attributes: {
          options: ['Adaptive', 'TV Mode', 'Sleep Mode'],
          friendly_name: 'OAL Active Configuration',
        },
      },
      'sensor.sun_next_setting': {
        entity_id: 'sensor.sun_next_setting',
        state: '2026-04-06T19:27:00-06:00',
        attributes: { friendly_name: 'Next Sunset' },
      },
      'sensor.sun_next_rising': {
        entity_id: 'sensor.sun_next_rising',
        state: '2026-04-07T06:41:00-06:00',
        attributes: { friendly_name: 'Next Sunrise' },
      },
      'sun.sun': {
        entity_id: 'sun.sun',
        state: 'above_horizon',
        attributes: {},
      },
      'sensor.sonos_next_alarm': {
        entity_id: 'sensor.sonos_next_alarm',
        state: '7:05 AM',
        attributes: {},
      },
      'sensor.sonos_enabled_alarm_count': {
        entity_id: 'sensor.sonos_enabled_alarm_count',
        state: '3',
        attributes: { friendly_name: 'Enabled Alarms' },
      },
      'sensor.sonos_alarm_playing': {
        entity_id: 'sensor.sonos_alarm_playing',
        state: 'off',
        attributes: {},
      },
      'timer.oal_mode_timeout': {
        entity_id: 'timer.oal_mode_timeout',
        state: 'active',
        last_updated: '2026-04-06T18:55:00-06:00',
        attributes: {
          friendly_name: 'Mode Timeout',
          remaining: '00:29:30',
        },
      },
      'sensor.override_target': {
        entity_id: 'sensor.override_target',
        state: '72',
        attributes: {},
      },
      'climate.downstairs': {
        entity_id: 'climate.downstairs',
        state: 'cool',
        attributes: {},
      },
      ...overrides,
    },
  };
}

function createStatus(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-status-card');
  el.setConfig({
    name: 'Home Status',
    show_header: true,
    columns: 4,
    tile_size: 'standard',
    use_profiles: true,
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeStatusHass(hassOverrides);
  return el;
}

const RUNTIME_CONTRACT_KEYS = [
  'type',
  'recipe',
  'entity',
  'alt_entity',
  'sun_entity',
  'action_entity',
  'navigate_path',
  'icon',
  'label',
  'compact_label',
  'accent',
  'show_when',
  'tap_action',
  'aux_action',
  'aux_show_when',
  'unit',
  'format',
  'attribute',
  'secondary',
  'dot_rules',
  'playing_entity',
  'snooze_action',
  'dismiss_action',
  'primary_action',
];

function cloneForContract(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}

function normalizeRuntimeTile(tile) {
  return Object.fromEntries(
    RUNTIME_CONTRACT_KEYS.map((key) => [key, cloneForContract(tile[key])])
  );
}

function expectedRuntimeTile(overrides = {}) {
  return {
    type: 'value',
    recipe: '',
    entity: '',
    alt_entity: '',
    sun_entity: '',
    action_entity: '',
    navigate_path: '',
    icon: 'info',
    label: '',
    compact_label: '',
    accent: 'muted',
    show_when: null,
    tap_action: null,
    aux_action: null,
    aux_show_when: null,
    unit: '',
    format: 'state',
    attribute: '',
    secondary: null,
    dot_rules: null,
    playing_entity: '',
    snooze_action: null,
    dismiss_action: null,
    primary_action: { kind: 'none' },
    ...overrides,
  };
}

function synthesizedRuntimeTile(layoutVariant, tileConfig) {
  const el = document.createElement('tunet-status-card');
  el.setConfig({
    layout_variant: layoutVariant,
    tiles: [tileConfig],
  });
  expect(el._config.tiles).toHaveLength(1);
  return normalizeRuntimeTile(el._config.tiles[0]);
}

function normalizeRuntimeTiles(tiles) {
  return tiles.map((tile) => normalizeRuntimeTile(tile));
}

function valueTiles(count) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'value',
    entity: `sensor.status_grid_${index}`,
    label: `Tile ${index + 1}`,
  }));
}

const CD11_STATUS_VARIANTS = [
  'home_summary',
  'home_detail',
  'room_row',
  'info_only',
  'alarms',
  'custom',
];

const CD11_STATUS_RECIPES = [
  'home_presence',
  'adaptive_count',
  'manual_overrides',
  'mode_selector',
  'boost_offset',
  'inside_temperature',
  'inside_humidity',
  'next_sun_event',
  'system_state',
  'next_alarm',
  'enabled_alarms',
  'mode_ttl',
];

const CD11_STATUS_GRID_CONTRACT = {
  home_summary: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 4 },
  home_detail: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 12 },
  room_row: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1, max_rows: 2 },
  info_only: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 6 },
  alarms: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 8 },
  custom: { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 },
};

function readTunetText(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function getStatusReferenceSection() {
  const docs = readTunetText('../../../Docs/cards_reference.md');
  const start = docs.indexOf('## 9. tunet-status-card');
  const end = docs.indexOf('## 10. tunet-media-card');
  return docs.slice(start, end);
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Status: structural CSS contract', () => {
  it('uses minmax auto rows instead of a fixed row cap', () => {
    const css = readCardCSS();
    const match = css.match(/\.grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/grid-auto-rows\s*:\s*minmax\(var\(--tile-row-h\),\s*auto\)/);
  });

  it('keeps min-height on tiles without the old fixed height', () => {
    const css = readCardCSS();
    const match = css.match(/\.tile\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/min-height\s*:\s*var\(--tile-row-h\)/);
    expect(match[1]).not.toMatch(/(?<![a-z-])height\s*:\s*var\(--tile-row-h\)/);
  });
});

describe('Status: dropdown accessibility contract', () => {
  it('renders a listbox menu that toggles aria-hidden and role=option', () => {
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [{ recipe: 'mode_selector' }],
    });

    const tile = el.shadowRoot.querySelector('.tile');
    const menu = el.shadowRoot.querySelector('.tile-dd-menu');
    expect(menu?.getAttribute('role')).toBe('listbox');
    expect(menu?.getAttribute('aria-hidden')).toBe('true');

    const options = [...el.shadowRoot.querySelectorAll('.tile-dd-opt')];
    expect(options.length).toBe(3);
    for (const option of options) {
      expect(option.getAttribute('role')).toBe('option');
    }

    tile.click();
    expect(menu?.classList.contains('open')).toBe(true);
    expect(menu?.getAttribute('aria-hidden')).toBe('false');
    expect(tile.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Status: home_summary mode contract', () => {
  it('locks home_summary to 4 columns regardless of width hints', () => {
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_summary',
      columns: 2,
      column_breakpoints: [{ max_width: 480, columns: 2 }],
      tiles: [{ type: 'value', entity: 'sensor.dining_room_temperature', label: 'Temp' }],
    });
    expect(el._resolveResponsiveColumns(320)).toBe(4);
    expect(el._resolveResponsiveColumns(1440)).toBe(4);
  });

  it('uses compact_label and suppresses secondary content in home_summary', () => {
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          action_entity: 'climate.downstairs',
          label: 'Inside Temperature',
          compact_label: 'Inside',
          unit: '°F',
        },
        {
          recipe: 'inside_humidity',
          entity: 'sensor.kitchen_humidity',
        },
      ],
    });

    const labels = [...el.shadowRoot.querySelectorAll('.tile-label')].map((node) => node.textContent.trim());
    expect(labels).toEqual(['Inside', 'Humidity']);
    expect(el.shadowRoot.querySelector('.tile-secondary')).toBeNull();
  });

  it('centers summary dropdown text without the chevron affordance and keeps larger summary typography', () => {
    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s*\{[^}]*--tile-row-h:\s*5\.375em;[^}]*--_tunet-status-icon-box:\s*2em;[^}]*--_tunet-status-value-font:\s*1\.3125em;[^}]*--_tunet-status-label-font:\s*0\.875em;[^}]*--_tunet-status-dropdown-font:\s*1\.25em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile\s*\{[^}]*padding:\s*0\.6875em 0\.5625em 0\.5em;[^}]*gap:\s*0\.15625em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile-val\s*\{[^}]*font-size:\s*var\(--_tunet-status-value-font\);[^}]*line-height:\s*1\.02;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile-label\s*\{[^}]*font-size:\s*var\(--_tunet-status-label-font\);[^}]*line-height:\s*1\.04;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile-dd-val\s*\{[^}]*justify-content:\s*center;[^}]*text-align:\s*center;[^}]*gap:\s*0;[^}]*font-size:\s*var\(--_tunet-status-dropdown-font\);/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile-dd-val\s+\.dd-text\s*\{[^}]*text-align:\s*center;[^}]*width:\s*100%;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_summary"\]\)\s+\.tile-dd-val\s+\.chevron\s*\{[^}]*display:\s*none;/s);
  });

  it('rejects timer and alarm tiles in home_summary with a warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_summary',
      tiles: [
        { type: 'timer', entity: 'timer.oal_mode_timeout', label: 'Mode TTL' },
        { type: 'alarm', entity: 'sensor.sonos_next_alarm', label: 'Alarm' },
        { type: 'value', entity: 'sensor.dining_room_temperature', label: 'Temp' },
      ],
    });

    expect(el._config.tiles).toHaveLength(1);
    expect(el._config.tiles[0].type).toBe('value');
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('collapses hidden tiles instead of preserving blank slots', () => {
    const el = createStatus(
      {
        layout_variant: 'home_summary',
        tiles: [
          {
            recipe: 'manual_overrides',
            entity: 'sensor.oal_system_status',
          },
          {
            recipe: 'inside_temperature',
            entity: 'sensor.dining_room_temperature',
            action_entity: 'climate.downstairs',
            unit: '°F',
          },
        ],
      },
      {
        'sensor.oal_system_status': {
          entity_id: 'sensor.oal_system_status',
          state: 'Adaptive',
          attributes: {
            zones_adaptive: 3,
            active_zonal_overrides: 0,
            current_config: 'Adaptive',
          },
        },
      }
    );

    const [manualTile] = el.shadowRoot.querySelectorAll('.tile');
    expect(manualTile.classList.contains('tile-collapsed')).toBe(true);
    expect(manualTile.classList.contains('tile-hidden')).toBe(false);
  });
});

describe('Status: custom backward compatibility', () => {
  it('defaults to custom mode, preserves hidden-space behavior, and keeps secondary content', () => {
    const el = createStatus(
      {
        tiles: [
          {
            type: 'value',
            entity: 'sensor.oal_system_status',
            label: 'System',
            secondary: {
              entity: 'sensor.oal_system_status',
              attribute: 'current_config',
            },
            show_when: {
              entity: 'sensor.oal_system_status',
              attribute: 'active_zonal_overrides',
              operator: 'gt',
              state: 5,
            },
          },
          {
            type: 'alarm',
            entity: 'sensor.sonos_next_alarm',
            label: 'Alarm',
          },
        ],
      },
      {
        'sensor.oal_system_status': {
          entity_id: 'sensor.oal_system_status',
          state: 'Adaptive',
          attributes: {
            current_config: 'Adaptive',
            active_zonal_overrides: 0,
          },
        },
      }
    );

    const [hiddenTile] = el.shadowRoot.querySelectorAll('.tile');
    expect(el._config.layout_variant).toBe('custom');
    expect(el._config.resolved_layout_variant).toBe('custom');
    expect(hiddenTile.classList.contains('tile-hidden')).toBe(true);
    expect(hiddenTile.classList.contains('tile-collapsed')).toBe(false);
    expect(el.shadowRoot.querySelector('.tile-secondary')).not.toBeNull();
    expect(el._config.tiles.some((tile) => tile.type === 'alarm')).toBe(true);
  });
});

describe('Status: home_detail mode contract', () => {
  it('resolves home_detail without fallback and honors authored columns/breakpoints', () => {
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_detail',
      columns: 3,
      column_breakpoints: [{ max_width: 640, columns: 2 }, { min_width: 900, columns: 4 }],
      tiles: [{ recipe: 'inside_temperature', entity: 'sensor.dining_room_temperature', label: 'Inside Temperature' }],
    });

    expect(el._config.layout_variant).toBe('home_detail');
    expect(el._config.resolved_layout_variant).toBe('home_detail');
    expect(el._resolveResponsiveColumns(390)).toBe(2);
    expect(el._resolveResponsiveColumns(1440)).toBe(4);
  });

  it('keeps full labels, secondary values, and full aux pills in home_detail', () => {
    const el = createStatus({
      layout_variant: 'home_detail',
      tiles: [
        {
          recipe: 'manual_overrides',
          entity: 'sensor.oal_system_status',
        },
        {
          recipe: 'boost_offset',
          entity: 'sensor.oal_global_brightness_offset',
          secondary: {
            entity: 'sensor.oal_global_brightness_offset',
            attribute: 'current_config',
          },
          unit: '%',
        },
      ],
    });

    const aux = el.shadowRoot.querySelector('.tile-aux');
    const labels = [...el.shadowRoot.querySelectorAll('.tile-label')].map((node) => node.textContent.trim());
    const secondary = [...el.shadowRoot.querySelectorAll('.tile-secondary')]
      .find((node) => node.textContent.trim());

    expect(aux).not.toBeNull();
    expect(aux.classList.contains('summary-compact')).toBe(false);
    expect(aux.querySelector('.aux-label')?.textContent?.trim()).toBe('Reset');
    expect(labels).toEqual(['Manual', 'Boost']);
    expect(secondary?.textContent?.trim()).toBe('Adaptive');
  });

  it('raises home_detail icon and typography scale so tiles do not read undersized', () => {
    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s*\{[^}]*--tile-row-h:\s*5\.625em;[^}]*--_tunet-status-icon-box:\s*3em;[^}]*--_tunet-status-icon-glyph:\s*1\.625em;[^}]*--_tunet-status-value-font:\s*1\.5em;[^}]*--_tunet-status-label-font:\s*0\.9375em;[^}]*--_tunet-status-secondary-font:\s*0\.8125em;[^}]*--_tunet-status-dropdown-font:\s*1\.375em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s+\.tile\s*\{[^}]*padding:\s*0\.75em 0\.625em 0\.5625em;[^}]*gap:\s*0\.15625em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s+\.tile-label\s*\{[^}]*font-size:\s*var\(--_tunet-status-label-font\);[^}]*line-height:\s*1\.06;/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s+\.tile-secondary\s*\{[^}]*font-size:\s*var\(--_tunet-status-secondary-font\);[^}]*line-height:\s*1\.06;/s);
  });

  it('keeps detail and custom dropdown values centered at compact status scale', () => {
    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s+\.tile\[data-type="dropdown"\]\s+\.tile-dd-val,\s*:host\(\[layout-variant="custom"\]\)\s+\.tile\[data-type="dropdown"\]\s+\.tile-dd-val\s*\{[^}]*justify-content:\s*center;[^}]*text-align:\s*center;[^}]*font-size:\s*min\(var\(--_tunet-status-dropdown-font\),\s*1\.125em\);/s);
    expect(css).toMatch(/:host\(\[layout-variant="home_detail"\]\)\s+\.tile\[data-type="dropdown"\]\s+\.tile-dd-val\s+\.dd-text,\s*:host\(\[layout-variant="custom"\]\)\s+\.tile\[data-type="dropdown"\]\s+\.tile-dd-val\s+\.dd-text\s*\{[^}]*text-align:\s*center;/s);
  });

  it('collapses hidden tiles in home_detail', () => {
    const el = createStatus(
      {
        layout_variant: 'home_detail',
        tiles: [
          {
            recipe: 'manual_overrides',
            entity: 'sensor.oal_system_status',
            show_when: {
              entity: 'sensor.oal_system_status',
              attribute: 'active_zonal_overrides',
              operator: 'gt',
              state: 0,
            },
          },
          {
            recipe: 'inside_temperature',
            entity: 'sensor.average_home_temperature',
          },
        ],
      },
      {
        'sensor.oal_system_status': {
          entity_id: 'sensor.oal_system_status',
          state: 'Adaptive',
          attributes: {
            active_zonal_overrides: 0,
          },
        },
      }
    );

    const [hiddenTile] = el.shadowRoot.querySelectorAll('.tile');
    expect(hiddenTile.classList.contains('tile-collapsed')).toBe(true);
    expect(hiddenTile.classList.contains('tile-hidden')).toBe(false);
  });
});

describe('Status: room_row mode contract', () => {
  it('resolves room_row without fallback, rejects unsupported tile types, and uses horizontal row CSS', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'room_row',
      columns: 4,
      tiles: [
        { type: 'value', entity: 'sensor.dining_room_temperature', label: 'Temp' },
        { type: 'indicator', entity: 'sensor.oal_system_status', label: 'System' },
        { type: 'dropdown', entity: 'input_select.oal_active_configuration', label: 'Mode' },
        { type: 'timer', entity: 'timer.oal_mode_timeout', label: 'TTL' },
      ],
    });

    expect(el._config.layout_variant).toBe('room_row');
    expect(el._config.resolved_layout_variant).toBe('room_row');
    expect(el._config.tiles.map((tile) => tile.type)).toEqual(['value', 'indicator']);
    expect(el.getCardSize()).toBe(2);
    expect(warnSpy).toHaveBeenCalledTimes(2);

    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="room_row"\]\)\s+\.grid\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*nowrap;[^}]*overflow-x:\s*auto;[^}]*scrollbar-width:\s*none;/s);
    expect(css).toMatch(/:host\(\[layout-variant="room_row"\]\)\s*\{[^}]*--_tunet-header-title-font:\s*var\(--_tunet-status-row-header-font,\s*1em\);/s);
    expect(css).toMatch(/:host\(\[layout-variant="room_row"\]\)\s+\.tile\s*\{[^}]*flex:\s*0 0 10\.75em;[^}]*padding:\s*var\(--_tunet-row-pad-y,\s*0\.75em\)\s+max\(var\(--_tunet-row-pad-x,\s*0\.25em\),\s*0\.75em\)\s+var\(--_tunet-row-pad-y,\s*0\.75em\)\s+var\(--_tunet-row-pad-x,\s*0\.25em\);[^}]*flex-direction:\s*row;[^}]*align-items:\s*center;[^}]*justify-content:\s*flex-start;/s);
    expect(css).toMatch(/:host\(\[layout-variant="room_row"\]\)\s+\.tile-label\s*\{[^}]*text-transform:\s*none;[^}]*text-align:\s*left;/s);
    expect(css).toMatch(/:host\(\[layout-variant="room_row"\]\)\s+\.tile-val\s*\{[^}]*margin-left:\s*auto;[^}]*text-align:\s*right;/s);
    expect(css).toMatch(/@media \(max-width:\s*27\.5em\)\s*\{[\s\S]*:host\(\[layout-variant="room_row"\]\)\s+\.grid\s*\{[^}]*flex-wrap:\s*wrap;[^}]*overflow-x:\s*visible;[^}]*gap:\s*0\.5em;[^}]*\}[\s\S]*:host\(\[layout-variant="room_row"\]\)\s+\.tile\s*\{[^}]*flex:\s*1 1 calc\(\(100% - 0\.5em\) \/ 2\);[^}]*min-width:\s*calc\(\(100% - 0\.5em\) \/ 2\);[^}]*padding:\s*0\.625em 0\.6875em 0\.625em var\(--_tunet-row-pad-x,\s*0\.25em\);/s);
  });

  it('uses compact labels, suppresses secondary and aux content, keeps actions, and collapses hidden tiles', () => {
    const seen = [];
    const el = createStatus(
      {
        layout_variant: 'room_row',
        show_header: false,
        tiles: [
          {
            recipe: 'manual_overrides',
            entity: 'sensor.oal_system_status',
          },
          {
            type: 'value',
            entity: 'sensor.kitchen_humidity',
            label: 'Bedroom Humidity',
            compact_label: 'Dry Air',
            accent: 'blue',
            format: 'integer',
            unit: '%',
            secondary: {
              entity: 'sensor.oal_system_status',
              attribute: 'current_config',
            },
          },
          {
            recipe: 'inside_temperature',
            entity: 'sensor.dining_room_temperature',
            action_entity: 'climate.downstairs',
            label: 'Inside Temperature',
            compact_label: 'Inside',
            unit: '°F',
          },
        ],
      },
      {
        'sensor.oal_system_status': {
          entity_id: 'sensor.oal_system_status',
          state: 'Adaptive',
          attributes: {
            active_zonal_overrides: 0,
            current_config: 'Adaptive',
          },
        },
      }
    );

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });

    const labels = [...el.shadowRoot.querySelectorAll('.tile-label')].map((node) => node.textContent.trim());
    const [hiddenTile] = el.shadowRoot.querySelectorAll('.tile');

    expect(labels).toEqual(['Manual', 'Dry Air', 'Inside']);
    expect(el.shadowRoot.querySelector('.tile-secondary')).toBeNull();
    expect(el.shadowRoot.querySelector('.tile-aux')).toBeNull();
    expect(hiddenTile.classList.contains('tile-collapsed')).toBe(true);
    expect(hiddenTile.classList.contains('tile-hidden')).toBe(false);

    el._tileEls[2].el.click();
    expect(seen).toEqual(['climate.downstairs']);
  });

  it('falls back to entity unit_of_measurement for direct-state row values', () => {
    const el = createStatus({
      layout_variant: 'room_row',
      tiles: [
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          compact_label: 'Inside',
        },
      ],
    });

    expect(el.shadowRoot.querySelector('.tile-val')?.textContent?.trim()).toBe('70°F');
  });
});

describe('Status: info_only mode contract', () => {
  it('resolves info_only without fallback, rejects unsupported tile types, and uses the calmer info-only CSS contract', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'info_only',
      tiles: [
        { type: 'value', entity: 'sensor.dining_room_temperature', label: 'Temp' },
        { type: 'indicator', entity: 'sensor.oal_system_status', label: 'System' },
        { type: 'dropdown', entity: 'input_select.oal_active_configuration', label: 'Mode' },
        { type: 'alarm', entity: 'sensor.sonos_next_alarm', label: 'Alarm' },
      ],
    });

    expect(el._config.layout_variant).toBe('info_only');
    expect(el._config.resolved_layout_variant).toBe('info_only');
    expect(el._config.tiles.map((tile) => tile.type)).toEqual(['value', 'indicator']);
    expect(warnSpy).toHaveBeenCalledTimes(2);

    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="info_only"\]\)\s*\{[^}]*--tile-row-h:\s*6\.375em;[^}]*--_tunet-status-icon-glyph:\s*1\.75em;[^}]*--_tunet-status-value-font:\s*1\.4375em;[^}]*--_tunet-status-text-font:\s*1\.1875em;[^}]*--_tunet-status-long-font:\s*1\.0625em;[^}]*--_tunet-status-label-font:\s*0\.75em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="info_only"\]\)\s+\.tile\s*\{[^}]*padding:\s*0\.9375em 0\.75em 0\.8125em;[^}]*box-shadow:\s*0 0\.1875em 0\.5em rgba\(0,0,0,0\.035\), 0 0\.0625em 0\.125em rgba\(0,0,0,0\.05\);/s);
    expect(css).toMatch(/:host\(\[layout-variant="info_only"\]\)\s+\.tile-label\s*\{[^}]*font-weight:\s*500;[^}]*opacity:\s*0\.78;[^}]*text-transform:\s*none;/s);
    expect(css).toMatch(/:host\(\[layout-variant="info_only"\]\)\s+\.tile-secondary\s*\{[^}]*display:\s*none !important;/s);
  });

  it('is passive by default, allows only explicit actions, suppresses secondary and aux content, and collapses hidden tiles', () => {
    const seen = [];
    const el = createStatus(
      {
        layout_variant: 'info_only',
        tiles: [
          {
            recipe: 'inside_temperature',
            entity: 'sensor.dining_room_temperature',
            label: 'Inside Temperature',
            compact_label: 'Inside',
            unit: '°F',
          },
          {
            recipe: 'inside_temperature',
            entity: 'sensor.dining_room_temperature',
            action_entity: 'climate.downstairs',
            label: 'Hall Temperature',
            compact_label: 'Hall',
            unit: '°F',
          },
          {
            recipe: 'manual_overrides',
            entity: 'sensor.oal_system_status',
          },
          {
            type: 'value',
            entity: 'sensor.kitchen_humidity',
            label: 'Kitchen Humidity',
            compact_label: 'Humidity',
            accent: 'blue',
            format: 'integer',
            unit: '%',
            secondary: {
              entity: 'sensor.oal_system_status',
              attribute: 'current_config',
            },
          },
        ],
      },
      {
        'sensor.oal_system_status': {
          entity_id: 'sensor.oal_system_status',
          state: 'Adaptive',
          attributes: {
            active_zonal_overrides: 0,
            current_config: 'Adaptive',
          },
        },
      }
    );

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });

    const [passiveTile, activeTile, hiddenTile] = el.shadowRoot.querySelectorAll('.tile');
    const labels = [...el.shadowRoot.querySelectorAll('.tile-label')].map((node) => node.textContent.trim());

    expect(labels).toEqual(['Inside', 'Hall', 'Manual', 'Humidity']);
    expect(passiveTile.classList.contains('passive')).toBe(true);
    expect(passiveTile.getAttribute('role')).toBeNull();
    expect(activeTile.classList.contains('passive')).toBe(false);
    expect(el.shadowRoot.querySelector('.tile-secondary')).toBeNull();
    expect(el.shadowRoot.querySelector('.tile-aux')).toBeNull();
    expect(hiddenTile.classList.contains('tile-collapsed')).toBe(true);
    expect(hiddenTile.classList.contains('tile-hidden')).toBe(false);

    passiveTile.click();
    activeTile.click();
    expect(seen).toEqual(['climate.downstairs']);
  });
});

describe('Status: phone density contract', () => {
  it('aligns detail, custom, alarms, and info-only typography to compact phone status scale', () => {
    const css = readCardCSS();
    expect(css).toMatch(/@media \(max-width:\s*27\.5em\)\s*\{[\s\S]*:host\(\[layout-variant="home_detail"\]\),\s*:host\(\[layout-variant="custom"\]\),\s*:host\(\[layout-variant="alarms"\]\)\s*\{[^}]*--tile-row-h:\s*5\.125em;[^}]*--_tunet-status-icon-box:\s*1\.875em;[^}]*--_tunet-status-value-font:\s*1\.1875em;[^}]*--_tunet-status-label-font:\s*0\.75em;[^}]*--_tunet-status-secondary-font:\s*0\.6875em;[^}]*--_tunet-status-dropdown-font:\s*1\.0625em;/s);
    expect(css).toMatch(/@media \(max-width:\s*27\.5em\)\s*\{[\s\S]*:host\(\[layout-variant="info_only"\]\)\s*\{[^}]*--tile-row-h:\s*5\.375em;[^}]*--_tunet-status-icon-box:\s*2em;[^}]*--_tunet-status-value-font:\s*1\.3125em;[^}]*--_tunet-status-label-font:\s*0\.875em;/s);
    expect(css).toMatch(/@media \(max-width:\s*27\.5em\)\s*\{[\s\S]*:host\(\[layout-variant="home_detail"\]\)\s+\.tile-val,\s*:host\(\[layout-variant="custom"\]\)\s+\.tile-val,\s*:host\(\[layout-variant="alarms"\]\)\s+\.tile-val\s*\{[^}]*font-size:\s*var\(--_tunet-status-value-font\);/s);
    expect(css).toMatch(/@media \(max-width:\s*27\.5em\)\s*\{[\s\S]*:host\(\[layout-variant="home_detail"\]\)\s+\.tile-secondary\s*\{[^}]*display:\s*none !important;/s);
  });
});

describe('Status: alarms mode contract', () => {
  it('resolves alarms without fallback, promotes next_alarm to alarm, and rejects dropdown tiles', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'alarms',
      tiles: [
        {
          recipe: 'next_alarm',
          entity: 'sensor.sonos_next_alarm',
          playing_entity: 'sensor.sonos_alarm_playing',
          snooze_action: {
            action: 'call-service',
            service: 'script.turn_on',
            service_data: { entity_id: 'script.sonos_snooze_next_alarm' },
          },
          dismiss_action: {
            action: 'call-service',
            service: 'script.turn_on',
            service_data: { entity_id: 'script.sonos_dismiss_alarm' },
          },
        },
        {
          recipe: 'mode_ttl',
          entity: 'timer.oal_mode_timeout',
        },
        {
          recipe: 'enabled_alarms',
          entity: 'sensor.sonos_enabled_alarm_count',
        },
        {
          recipe: 'mode_selector',
        },
      ],
    });

    expect(el._config.layout_variant).toBe('alarms');
    expect(el._config.resolved_layout_variant).toBe('alarms');
    expect(el._config.tiles.map((tile) => tile.type)).toEqual(['alarm', 'timer', 'value']);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    document.body.appendChild(el);
    el.hass = makeStatusHass();
    expect(el.shadowRoot.querySelector('.tile[data-type="alarm"] .alarm-actions')).not.toBeNull();
    document.body.removeChild(el);
  });

  it('collapses hidden tiles in alarms mode', () => {
    const el = createStatus(
      {
        layout_variant: 'alarms',
        tiles: [
          {
            recipe: 'enabled_alarms',
            entity: 'sensor.sonos_enabled_alarm_count',
            show_when: {
              entity: 'sensor.sonos_enabled_alarm_count',
              operator: 'gt',
              state: 4,
            },
          },
          {
            recipe: 'mode_ttl',
            entity: 'timer.oal_mode_timeout',
          },
        ],
      },
      {
        'sensor.sonos_enabled_alarm_count': {
          entity_id: 'sensor.sonos_enabled_alarm_count',
          state: '1',
          attributes: {},
        },
      }
    );

    const [hiddenTile] = el.shadowRoot.querySelectorAll('.tile');
    expect(hiddenTile.classList.contains('tile-collapsed')).toBe(true);
    expect(hiddenTile.classList.contains('tile-hidden')).toBe(false);
  });

  it('raises alarms typography and timer emphasis to use the tile area more effectively', () => {
    const css = readCardCSS();
    expect(css).toMatch(/:host\(\[layout-variant="alarms"\]\)\s*\{[^}]*--tile-row-h:\s*5\.75em;[^}]*--_tunet-status-icon-box:\s*2\.875em;[^}]*--_tunet-status-value-font:\s*1\.375em;[^}]*--_tunet-status-label-font:\s*0\.90625em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="alarms"\]\)\s+\.tile\s*\{[^}]*padding:\s*0\.75em 0\.625em 0\.5625em;[^}]*gap:\s*0\.15625em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="alarms"\]\)\s+\.tile\[data-type="timer"\]\s+\.tile-val\s*\{[^}]*font-size:\s*1\.5em;/s);
    expect(css).toMatch(/:host\(\[layout-variant="alarms"\]\)\s+\.alarm-time-pill\s*\{[^}]*font-size:\s*1\.125em;/s);
  });
});

describe('Status: variant-aware Sections sizing contract', () => {
  it.each([
    [
      'home_summary',
      {
        layout_variant: 'home_summary',
        show_header: true,
        columns: 2,
        tiles: valueTiles(9),
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 4 },
      3,
    ],
    [
      'home_detail',
      {
        layout_variant: 'home_detail',
        show_header: true,
        columns: 3,
        tiles: valueTiles(7),
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 12 },
      4,
    ],
    [
      'room_row',
      {
        layout_variant: 'room_row',
        show_header: true,
        columns: 4,
        tiles: valueTiles(6),
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1, max_rows: 2 },
      2,
    ],
    [
      'info_only',
      {
        layout_variant: 'info_only',
        show_header: true,
        columns: 3,
        tiles: [
          ...valueTiles(4),
          { type: 'indicator', entity: 'sensor.status_grid_indicator', label: 'Indicator' },
        ],
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 6 },
      3,
    ],
    [
      'alarms',
      {
        layout_variant: 'alarms',
        show_header: true,
        columns: 2,
        tiles: [
          { type: 'alarm', entity: 'sensor.sonos_next_alarm', label: 'Alarm' },
          { type: 'timer', entity: 'timer.oal_mode_timeout', label: 'Mode TTL' },
          { type: 'value', entity: 'sensor.sonos_enabled_alarm_count', label: 'Enabled' },
          { type: 'indicator', entity: 'sensor.sonos_alarm_playing', label: 'Playing' },
        ],
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 8 },
      3,
    ],
    [
      'custom',
      {
        layout_variant: 'custom',
        show_header: true,
        columns: 3,
        tiles: [
          ...valueTiles(3),
          { type: 'timer', entity: 'timer.oal_mode_timeout', label: 'Mode TTL' },
          { type: 'dropdown', entity: 'input_select.oal_active_configuration', label: 'Mode' },
        ],
      },
      { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 },
      3,
    ],
  ])('%s returns variant-specific getGridOptions and getCardSize', (_variant, config, expectedGrid, expectedCardSize) => {
    const el = document.createElement('tunet-status-card');
    el.setConfig(config);

    expect(el.getGridOptions()).toEqual(expectedGrid);
    expect(el.getCardSize()).toBe(expectedCardSize);
  });

  it('room_row without a header stays a one-row Sections shape', () => {
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'room_row',
      show_header: false,
      tiles: valueTiles(4),
    });

    expect(el.getGridOptions()).toEqual({ columns: 12, min_columns: 6, rows: 'auto', min_rows: 1, max_rows: 2 });
    expect(el.getCardSize()).toBe(1);
  });
});

describe('Status: variant + recipe authoring contract', () => {
  it('getConfigForm exposes variant selection and recipe_tiles authoring', () => {
    const CardClass = customElements.get('tunet-status-card');
    const form = CardClass.getConfigForm();
    const layoutEntry = form.schema.find((entry) => entry.name === 'layout_variant');
    const recipeEntry = form.schema.find((entry) => entry.name === 'recipe_tiles');

    expect(layoutEntry?.selector?.select?.options.map((option) => option.value)).toEqual([
      'home_summary',
      'home_detail',
      'room_row',
      'info_only',
      'alarms',
      'custom',
    ]);
    expect(recipeEntry?.selector?.object?.multiple).toBe(true);
    expect(recipeEntry?.selector?.object?.label_field).toBe('recipe');
    expect(Object.keys(recipeEntry?.selector?.object?.fields || {})).toEqual([
      'recipe',
      'entity',
      'label',
      'compact_label',
      'action_entity',
      'navigate_path',
    ]);
  });

  it.each([
    'home_summary',
    'home_detail',
    'room_row',
    'info_only',
    'alarms',
    'custom',
  ])('%s stub config synthesizes a complete runtime tile set', (variant) => {
    const CardClass = customElements.get('tunet-status-card');
    const stub = CardClass.getStubConfigForVariant(variant);
    const el = document.createElement('tunet-status-card');

    expect(stub.layout_variant).toBe(variant);
    expect(() => el.setConfig(stub)).not.toThrow();
    expect(el._config.resolved_layout_variant).toBe(variant);
    expect(el._config.tiles.length).toBeGreaterThan(0);
    expect(el._config.tiles.every((tile) => el._isTileAllowedInVariant(tile, variant))).toBe(true);
    if (variant === 'custom') {
      expect(el._config.authoring_mode).toBe('tiles');
    } else {
      expect(el._config.authoring_mode).toBe('recipe_tiles');
      expect(stub.recipe_tiles.length).toBe(el._config.tiles.length);
    }
  });

  it.each([
    [
      'home_summary',
      [
        { recipe: 'home_presence', entity: 'person.mac_connolly' },
        { recipe: 'mode_selector' },
        { recipe: 'inside_temperature', entity: 'sensor.dining_room_temperature', action_entity: 'climate.downstairs' },
      ],
    ],
    [
      'home_detail',
      [
        { recipe: 'manual_overrides', entity: 'sensor.oal_system_status' },
        { recipe: 'boost_offset', entity: 'sensor.oal_global_brightness_offset' },
        { recipe: 'next_sun_event' },
      ],
    ],
    [
      'room_row',
      [
        { recipe: 'home_presence', entity: 'person.mac_connolly' },
        { recipe: 'system_state', entity: 'sensor.oal_system_status' },
      ],
    ],
    [
      'info_only',
      [
        { recipe: 'inside_temperature', entity: 'sensor.dining_room_temperature' },
        { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
      ],
    ],
    [
      'alarms',
      [
        { recipe: 'next_alarm', entity: 'sensor.sonos_next_alarm' },
        { recipe: 'enabled_alarms', entity: 'sensor.sonos_enabled_alarm_count' },
        { recipe: 'mode_ttl' },
      ],
    ],
  ])('%s recipe_tiles authoring synthesizes the same runtime as equivalent raw tiles', (variant, recipeTiles) => {
    const recipeAuthored = document.createElement('tunet-status-card');
    recipeAuthored.setConfig({
      layout_variant: variant,
      recipe_tiles: recipeTiles,
    });

    const rawAuthored = document.createElement('tunet-status-card');
    rawAuthored.setConfig({
      layout_variant: variant,
      tiles: recipeTiles,
    });

    expect(recipeAuthored._config.authoring_mode).toBe('recipe_tiles');
    expect(normalizeRuntimeTiles(recipeAuthored._config.tiles)).toEqual(normalizeRuntimeTiles(rawAuthored._config.tiles));
  });

  it('recipes alias synthesizes recipe tiles when recipe_tiles is absent', () => {
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_summary',
      recipes: ['mode_selector'],
    });

    expect(el._config.authoring_mode).toBe('recipes');
    expect(el._config.tiles).toHaveLength(1);
    expect(el._config.tiles[0].recipe).toBe('mode_selector');
    expect(el._config.tiles[0].type).toBe('dropdown');
  });

  it('recipe_tiles wins over recipes and raw tiles when multiple authoring layers are present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_summary',
      recipes: ['mode_selector'],
      recipe_tiles: [{ recipe: 'home_presence', entity: 'person.mac_connolly' }],
      tiles: [{ type: 'value', entity: 'sensor.oal_system_status', label: 'Raw' }],
    });

    expect(el._config.authoring_mode).toBe('recipe_tiles');
    expect(el._config.tiles).toHaveLength(1);
    expect(el._config.tiles[0].recipe).toBe('home_presence');
    expect(warnSpy).toHaveBeenCalledWith('[tunet-status-card] Both recipe_tiles and recipes were provided; using recipe_tiles.');
    expect(warnSpy).toHaveBeenCalledWith('[tunet-status-card] recipe_tiles authoring is active; ignoring raw tiles[] for runtime synthesis.');
  });
});

describe('Status: recipe and action precedence', () => {
  it.each([
    [
      'home_presence',
      'home_summary',
      { recipe: 'home_presence', entity: 'person.mac_connolly' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'home_presence',
        entity: 'person.mac_connolly',
        icon: 'home',
        label: 'Home',
        compact_label: 'Home',
        accent: 'green',
        format: 'state',
        dot_rules: [
          { match: 'home', dot: 'green' },
          { match: '*', dot: 'red' },
        ],
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'person.mac_connolly' },
        },
      }),
    ],
    [
      'adaptive_count',
      'home_summary',
      { recipe: 'adaptive_count', entity: 'sensor.oal_system_status' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'adaptive_count',
        entity: 'sensor.oal_system_status',
        icon: 'sunny',
        label: 'Adaptive',
        compact_label: 'Adaptive',
        accent: 'green',
        attribute: 'zones_adaptive',
        format: 'integer',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'sensor.oal_system_status' },
        },
      }),
    ],
    [
      'manual_overrides',
      'home_summary',
      { recipe: 'manual_overrides', entity: 'sensor.oal_system_status' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'manual_overrides',
        entity: 'sensor.oal_system_status',
        icon: 'front_hand',
        label: 'Manual',
        compact_label: 'Manual',
        accent: 'red',
        attribute: 'active_zonal_overrides',
        format: 'integer',
        show_when: {
          entity: 'sensor.oal_system_status',
          attribute: 'active_zonal_overrides',
          operator: 'gt',
          state: 0,
        },
        aux_action: {
          label: 'Reset',
          icon: 'restart_alt',
          action: 'call-service',
          service: 'script.turn_on',
          service_data: {
            entity_id: 'script.oal_reset_soft',
          },
        },
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'sensor.oal_system_status' },
        },
      }),
    ],
    [
      'mode_selector',
      'home_summary',
      { recipe: 'mode_selector' },
      expectedRuntimeTile({
        type: 'dropdown',
        recipe: 'mode_selector',
        entity: 'input_select.oal_active_configuration',
        icon: 'tune',
        label: 'Mode',
        compact_label: 'Mode',
        accent: 'muted',
        primary_action: { kind: 'dropdown' },
      }),
    ],
    [
      'boost_offset',
      'home_detail',
      { recipe: 'boost_offset', entity: 'sensor.oal_global_brightness_offset' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'boost_offset',
        entity: 'sensor.oal_global_brightness_offset',
        icon: 'bolt',
        label: 'Boost',
        compact_label: 'Boost',
        accent: 'amber',
        attribute: 'total_offset',
        format: 'integer',
        unit: '%',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'sensor.oal_global_brightness_offset' },
        },
      }),
    ],
    [
      'inside_temperature',
      'home_summary',
      {
        recipe: 'inside_temperature',
        entity: 'sensor.dining_room_temperature',
        action_entity: 'climate.downstairs',
      },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'inside_temperature',
        entity: 'sensor.dining_room_temperature',
        action_entity: 'climate.downstairs',
        icon: 'thermostat',
        label: 'Inside',
        compact_label: 'Inside',
        accent: 'amber',
        format: 'integer',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'climate.downstairs' },
        },
      }),
    ],
    [
      'inside_humidity',
      'info_only',
      { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'inside_humidity',
        entity: 'sensor.kitchen_humidity',
        icon: 'water_drop',
        label: 'Humidity',
        compact_label: 'Humidity',
        accent: 'blue',
        format: 'integer',
        unit: '%',
      }),
    ],
    [
      'next_sun_event',
      'home_summary',
      { recipe: 'next_sun_event' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'next_sun_event',
        entity: 'sensor.sun_next_setting',
        alt_entity: 'sensor.sun_next_rising',
        sun_entity: 'sun.sun',
        icon: 'wb_twilight',
        label: 'Sunset',
        compact_label: 'Sunset',
        accent: 'amber',
        format: 'time',
        primary_action: { kind: 'none' },
      }),
    ],
    [
      'system_state',
      'info_only',
      { recipe: 'system_state', entity: 'sensor.oal_system_status' },
      expectedRuntimeTile({
        type: 'indicator',
        recipe: 'system_state',
        entity: 'sensor.oal_system_status',
        icon: 'info',
        label: 'System',
        compact_label: 'System',
        accent: 'blue',
        format: 'state',
      }),
    ],
    [
      'next_alarm',
      'home_detail',
      { recipe: 'next_alarm', entity: 'sensor.sonos_next_alarm' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'next_alarm',
        entity: 'sensor.sonos_next_alarm',
        icon: 'alarm',
        label: 'Alarm',
        compact_label: 'Alarm',
        accent: 'blue',
        format: 'state',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'sensor.sonos_next_alarm' },
        },
      }),
    ],
    [
      'enabled_alarms',
      'alarms',
      { recipe: 'enabled_alarms', entity: 'sensor.sonos_enabled_alarm_count' },
      expectedRuntimeTile({
        type: 'value',
        recipe: 'enabled_alarms',
        entity: 'sensor.sonos_enabled_alarm_count',
        icon: 'alarm_on',
        label: 'Enabled',
        compact_label: 'Enabled',
        accent: 'blue',
        format: 'integer',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'sensor.sonos_enabled_alarm_count' },
        },
      }),
    ],
    [
      'mode_ttl',
      'alarms',
      { recipe: 'mode_ttl' },
      expectedRuntimeTile({
        type: 'timer',
        recipe: 'mode_ttl',
        entity: 'timer.oal_mode_timeout',
        icon: 'timer',
        label: 'Mode TTL',
        compact_label: 'TTL',
        accent: 'amber',
        primary_action: {
          kind: 'action',
          config: { action: 'more-info', entity: 'timer.oal_mode_timeout' },
        },
      }),
    ],
  ])('%s recipe shorthand synthesizes the canonical runtime tile', (_recipe, layoutVariant, tileConfig, expected) => {
    expect(synthesizedRuntimeTile(layoutVariant, tileConfig)).toEqual(expected);
  });

  it('warns when a user-bound recipe omits its required entity binding', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const el = document.createElement('tunet-status-card');
    el.setConfig({
      layout_variant: 'home_summary',
      tiles: [{ recipe: 'manual_overrides' }],
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[tunet-status-card] Recipe "manual_overrides" requires an entity; the tile will render as unavailable until one is provided.'
    );
  });

  it('home_presence dot rules use exact state matching so not_home does not inherit home styling', () => {
    const el = createStatus(
      {
        layout_variant: 'home_summary',
        tiles: [{ recipe: 'home_presence', entity: 'person.mac_connolly' }],
      },
      {
        'person.mac_connolly': {
          entity_id: 'person.mac_connolly',
          state: 'not_home',
          attributes: { friendly_name: 'Mac' },
        },
      }
    );

    const dot = el.shadowRoot.querySelector('.status-dot');
    expect(dot.classList.contains('green')).toBe(false);
    expect(dot.classList.contains('red')).toBe(true);
  });

  it('inside_temperature routes default more-info to action_entity', () => {
    const seen = [];
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          action_entity: 'climate.downstairs',
          unit: '°F',
        },
      ],
    });

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });
    el.shadowRoot.querySelector('.tile').click();
    expect(seen).toEqual(['climate.downstairs']);
  });

  it('next_sun_event switches icon and label based on sun state', () => {
    const daytime = createStatus({
      layout_variant: 'home_summary',
      tiles: [{ recipe: 'next_sun_event' }],
    });
    expect(daytime.shadowRoot.querySelector('.tile-label')?.textContent?.trim()).toBe('Sunset');
    expect(daytime.shadowRoot.querySelector('.tile-icon-glyph')?.textContent?.trim()).toBe('wb_twilight');

    document.body.removeChild(daytime);

    const nighttime = createStatus(
      {
        layout_variant: 'home_summary',
        tiles: [{ recipe: 'next_sun_event' }],
      },
      {
        'sun.sun': {
          entity_id: 'sun.sun',
          state: 'below_horizon',
          attributes: {},
        },
      }
    );
    expect(nighttime.shadowRoot.querySelector('.tile-label')?.textContent?.trim()).toBe('Sunrise');
    expect(nighttime.shadowRoot.querySelector('.tile-icon-glyph')?.textContent?.trim()).toBe('sunny_snowing');
  });

  it('explicit tap_action overrides recipe defaults', () => {
    const seen = [];
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          action_entity: 'climate.downstairs',
          tap_action: {
            action: 'more-info',
            entity: 'sensor.override_target',
          },
          unit: '°F',
        },
      ],
    });

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });
    el.shadowRoot.querySelector('.tile').click();
    expect(seen).toEqual(['sensor.override_target']);
  });

  it('recipe:none (next_sun_event) stays passive even with action_entity present', () => {
    const seen = [];
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [
        {
          recipe: 'next_sun_event',
          action_entity: 'climate.downstairs',
        },
      ],
    });

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });
    const tile = el.shadowRoot.querySelector('.tile');
    expect(tile.classList.contains('passive')).toBe(true);
    tile.click();
    expect(seen).toEqual([]);
  });

  it('navigate_path takes precedence over recipe defaults', () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const el = createStatus({
      layout_variant: 'home_summary',
      tiles: [
        {
          recipe: 'next_alarm',
          entity: 'sensor.sonos_next_alarm',
          navigate_path: '/tunet-card-rehab-yaml/alarms',
        },
      ],
    });

    el.shadowRoot.querySelector('.tile').click();
    expect(pushSpy).toHaveBeenCalledWith(null, '', '/tunet-card-rehab-yaml/alarms');
  });

  it('next_alarm falls back to action_entity more-info when no navigate_path is provided', () => {
    const seen = [];
    const el = createStatus({
      layout_variant: 'home_detail',
      tiles: [
        {
          recipe: 'next_alarm',
          entity: 'sensor.sonos_next_alarm',
          action_entity: 'sensor.override_target',
        },
      ],
    });

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });
    el.shadowRoot.querySelector('.tile').click();
    expect(seen).toEqual(['sensor.override_target']);
  });

  it('enabled_alarms prefers navigate_path when authored', () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const el = createStatus({
      layout_variant: 'alarms',
      tiles: [
        {
          recipe: 'enabled_alarms',
          entity: 'sensor.sonos_enabled_alarm_count',
          navigate_path: '/tunet-card-rehab-yaml/alarms',
        },
      ],
    });

    el.shadowRoot.querySelector('.tile').click();
    expect(pushSpy).toHaveBeenCalledWith(null, '', '/tunet-card-rehab-yaml/alarms');
  });

  it('mode_ttl falls back to timer more-info', () => {
    const seen = [];
    const el = createStatus({
      layout_variant: 'alarms',
      tiles: [{ recipe: 'mode_ttl', entity: 'timer.oal_mode_timeout' }],
    });

    el.addEventListener('hass-more-info', (event) => {
      seen.push(event.detail.entityId);
    });
    el.shadowRoot.querySelector('.tile').click();
    expect(seen).toEqual(['timer.oal_mode_timeout']);
  });
});

describe('Status: CD11 cross-contract coverage anchors', () => {
  it('cards_reference §9 documents every implemented variant, recipe, and authoring layer', () => {
    const section = getStatusReferenceSection();

    expect(section).toContain('**Version**: v3.4.0');
    expect(section).toContain('**Tier**: editor-lite (Level 2 narrow)');
    for (const variant of CD11_STATUS_VARIANTS) {
      expect(section).toContain(`\`${variant}\``);
    }
    for (const recipe of CD11_STATUS_RECIPES) {
      expect(section).toContain(`\`${recipe}\``);
    }
    expect(section).toContain('`recipe_tiles[]` is canonical');
    expect(section).toContain('`recipes[]` alias');
    expect(section).toContain('raw `tiles[]`');
    expect(section).toContain('`getStubConfigForVariant(variant)`');
    expect(section).toContain('Status: recipe and action precedence');
    expect(section).toContain('Status: variant-aware Sections sizing contract');
    expect(section).toContain('Status: variant + recipe authoring contract');
    expect(section).toContain('Status: CD11 cross-contract coverage anchors');
  });

  it('sections_layout_matrix mirrors the variant-aware grid options', () => {
    const matrix = readTunetText('../../../Docs/sections_layout_matrix.md');
    for (const [variant, options] of Object.entries(CD11_STATUS_GRID_CONTRACT)) {
      const row = new RegExp(
        `\\| \`${variant}\` \\| ${options.columns} \\| ${options.min_columns} \\| ${options.rows} \\| ${options.min_rows} \\| ${options.max_rows} \\|`
      );
      expect(matrix).toMatch(row);
    }
    expect(matrix).toContain('Status: variant-aware Sections sizing contract');
    expect(matrix).toContain('Status: CD11 cross-contract coverage anchors');
  });

  it('rehab lab fixture contains every CD11 variant and recipe shorthand', () => {
    const yaml = readTunetText('../../../tunet-card-rehab-lab.yaml');
    const statusBlocks = yaml.split(/\n\s*-\s+type:\s+custom:tunet-status-card/).slice(1);
    const variants = new Set(
      statusBlocks
        .map((block) => block.match(/layout_variant:\s+([a-z_]+)/)?.[1])
        .filter(Boolean)
    );

    for (const variant of CD11_STATUS_VARIANTS) {
      expect(variants.has(variant)).toBe(true);
    }
    for (const recipe of CD11_STATUS_RECIPES) {
      expect(yaml).toMatch(new RegExp(`recipe:\\s+${recipe}\\b`));
    }
    expect(yaml).toContain('Status: Conditional Signal Stress');
    for (const label of ['UV Right Now', 'Forecast Heads Up', 'Now Playing', 'Bedroom Dry']) {
      expect(yaml).toContain(`label: ${label}`);
    }
  });
});

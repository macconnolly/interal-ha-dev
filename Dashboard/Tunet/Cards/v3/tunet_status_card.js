/**
 * Tunet Status Card  v3.5.0 (CD11 polish Theme A — recipe content + OAL sensor consolidation)
 * Home status grid with typed tiles: indicator, timer, value, dropdown, alarm
 * Migrated to tunet_base.js shared module.
 */

import {
  TOKENS, RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  selectProfileSize, resolveSizeProfile, _setProfileVars,
  runCardAction,
  registerCard, logCardVersion,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '3.7.0';

const STATUS_ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'lamp',
  table_lamp: 'lamp',
  light_group: 'lightbulb',
  weather_sunset_down: 'wb_twilight',
  weather_sunset_up: 'sunny_snowing',
};

const STATUS_LAYOUT_VARIANTS = new Set([
  'home_summary',
  'home_detail',
  'room_row',
  'info_only',
  'alarms',
  'custom',
]);

const IMPLEMENTED_LAYOUT_VARIANTS = new Set([
  'home_summary',
  'home_detail',
  'room_row',
  'info_only',
  'alarms',
  'custom',
]);

const STATUS_LAYOUT_VARIANT_OPTIONS = [
  { value: 'home_summary', label: 'Home Summary' },
  { value: 'home_detail', label: 'Home Detail' },
  { value: 'room_row', label: 'Room Row' },
  { value: 'info_only', label: 'Info Only' },
  { value: 'alarms', label: 'Alarms' },
  { value: 'custom', label: 'Custom' },
];

const HOME_SUMMARY_ALLOWED_TYPES = new Set([
  'value',
  'indicator',
  'dropdown',
]);

const ALARMS_ALLOWED_TYPES = new Set([
  'alarm',
  'timer',
  'value',
  'indicator',
]);

const PASSIVE_STATUS_ALLOWED_TYPES = new Set([
  'value',
  'indicator',
]);

const HOME_SUMMARY_SLOT_LIMIT = 8;

const MODE_SELECTOR_SUMMARY_ALIASES = {
  Adaptive: 'Adaptive',
  'TV Mode': 'TV',
  'Sleep Mode': 'Sleep',
  Manual: 'Manual',
  Bright: 'Bright',
  Movie: 'Movie',
  Off: 'Off',
};

const STATUS_RECIPE_PRIORITY = {
  home_presence: 1,
  lights_on: 2,
  boost_offset: 3,
  manual_overrides: 4,
  inside_temperature: 5,
  outside_temperature: 6,
  next_alarm: 7,
  next_sun_event: 8,
  inside_humidity: 9,
  mode_selector: 12,
  mode_ttl: 15,
  enabled_alarms: 16,
};

const STATUS_RECIPE_ENTITY_BINDING = {
  home_presence: 'user',
  lights_on: 'fixed',
  manual_overrides: 'user',
  mode_selector: 'fixed',
  boost_offset: 'fixed',
  inside_temperature: 'user',
  outside_temperature: 'fixed',
  inside_humidity: 'user',
  next_sun_event: 'fixed',
  next_alarm: 'user',
  enabled_alarms: 'user',
  mode_ttl: 'fixed',
};

const STATUS_VARIANT_GRID_OPTIONS = {
  home_summary: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 2,
    max_rows: 4,
  },
  home_detail: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 3,
    max_rows: 12,
  },
  room_row: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 1,
    max_rows: 2,
  },
  info_only: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 2,
    max_rows: 6,
  },
  alarms: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 3,
    max_rows: 8,
  },
  custom: {
    columns: 12,
    min_columns: 6,
    rows: 'auto',
    min_rows: 2,
    max_rows: 12,
  },
};

const STATUS_RECIPES = {
  home_presence: {
    defaults: {
      type: 'value',
      icon: 'home',
      label: 'Presence',
      compact_label: 'Presence',
      accent: 'green',
      format: 'state',
      dot_rules: [
        { match: 'home', dot: 'green' },
        { match: '*', dot: 'red' },
      ],
    },
    defaultAction: 'entity',
  },
  lights_on: {
    defaults: {
      type: 'value',
      entity: 'sensor.oal_system_status',
      icon: 'lightbulb',
      label: 'Lights On',
      compact_label: 'Lights',
      accent: 'amber',
      attribute: 'lights_on_formatted',
      format: 'state',
      dot_rules: [
        { match: 'on', dot: 'amber' },
        { match: '*', dot: 'muted' },
      ],
    },
    defaultAction: 'entity',
  },
  manual_overrides: {
    defaults: {
      type: 'value',
      icon: 'front_hand',
      label: 'Manual',
      compact_label: 'Manual',
      accent: 'red',
      attribute: 'active_zonal_overrides',
      format: 'integer',
      show_when: {
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
    },
    defaultAction: 'entity',
  },
  mode_selector: {
    defaults: {
      type: 'dropdown',
      entity: 'input_select.oal_active_configuration',
      icon: 'tune',
      label: 'Mode',
      compact_label: 'Mode',
      accent: 'muted',
    },
    defaultAction: 'dropdown',
    summaryOptionAliases: MODE_SELECTOR_SUMMARY_ALIASES,
  },
  boost_offset: {
    defaults: {
      type: 'value',
      entity: 'sensor.oal_system_status',
      icon: 'bolt',
      label: 'Boost',
      compact_label: 'Boost',
      accent: 'amber',
      attribute: 'total_modification',
      format: 'signed_percent',
    },
    defaultAction: 'entity',
  },
  inside_temperature: {
    defaults: {
      type: 'value',
      icon: 'thermostat',
      label: 'Inside',
      compact_label: 'Inside',
      accent: 'amber',
      format: 'integer',
    },
    defaultAction: 'action_entity',
  },
  outside_temperature: {
    defaults: {
      type: 'value',
      entity: 'weather.home',
      icon: 'thermostat',
      label: 'Outside',
      compact_label: 'Outside',
      accent: 'blue',
      attribute: 'temperature',
      format: 'integer',
      unit: '°F',
    },
    defaultAction: 'entity',
  },
  inside_humidity: {
    defaults: {
      type: 'value',
      icon: 'water_drop',
      label: 'Humidity',
      compact_label: 'Humidity',
      accent: 'blue',
      format: 'integer',
      unit: '%',
    },
    defaultAction: 'entity',
  },
  next_sun_event: {
    defaults: {
      type: 'value',
      entity: 'sensor.sun_next_setting',
      alt_entity: 'sensor.sun_next_rising',
      sun_entity: 'sun.sun',
      icon: 'weather_sunset_down',
      label: 'Sunset',
      compact_label: 'Sunset',
      accent: 'amber',
      format: 'time',
    },
    defaultAction: 'none',
  },
  next_alarm: {
    defaults: {
      type: 'value',
      icon: 'alarm',
      label: 'Alarm',
      compact_label: 'Alarm',
      accent: 'blue',
      format: 'time_short',
    },
    defaultAction: 'action_entity',
  },
  enabled_alarms: {
    defaults: {
      type: 'value',
      icon: 'alarm_on',
      label: 'Enabled',
      compact_label: 'Enabled',
      accent: 'blue',
      format: 'integer',
    },
    defaultAction: 'action_entity',
  },
  mode_ttl: {
    defaults: {
      type: 'value',
      entity: 'sensor.oal_system_status',
      attribute: 'mode_timeout_remaining',
      icon: 'timer',
      label: 'Mode Timer',
      compact_label: 'Timer',
      accent: 'amber',
      format: 'state',
      show_when: {
        entity: 'sensor.oal_system_status',
        attribute: 'mode_timeout_state',
        operator: 'equals',
        state: 'active',
      },
    },
    defaultAction: 'entity',
  },
};

const STATUS_RECIPE_OPTIONS = Object.keys(STATUS_RECIPES).map((recipe) => ({
  value: recipe,
  label: recipe.replace(/_/g, ' '),
}));

function normalizeStatusIcon(icon) {
  if (!icon) return 'info';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = STATUS_ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'info';
  return resolved;
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function cloneActionConfig(action) {
  if (!action || typeof action !== 'object') return null;
  return {
    ...action,
    service_data: action.service_data && typeof action.service_data === 'object'
      ? { ...action.service_data }
      : action.service_data,
  };
}

function cloneShowWhen(condition) {
  if (!condition || typeof condition !== 'object') return null;
  return { ...condition };
}

function cloneDotRules(rules) {
  if (!Array.isArray(rules)) return null;
  return rules
    .filter((rule) => rule && typeof rule === 'object')
    .map((rule) => ({ ...rule }));
}

function cloneLabelMap(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [String(key), String(value)])
  );
}

function normalizeStatusLayoutVariant(value) {
  const candidate = String(value || 'custom').trim().toLowerCase();
  return STATUS_LAYOUT_VARIANTS.has(candidate) ? candidate : 'custom';
}

function normalizeColumnBreakpoints(raw) {
  const parsed = [];
  const pushRule = (rule) => {
    if (!rule || typeof rule !== 'object') return;
    const columns = clampInt(rule.columns, 2, 8, NaN);
    if (!Number.isFinite(columns)) return;
    const minWidth = Number.isFinite(Number(rule.min_width)) ? Math.max(0, Number(rule.min_width)) : null;
    const maxWidth = Number.isFinite(Number(rule.max_width)) ? Math.max(0, Number(rule.max_width)) : null;
    if (minWidth == null && maxWidth == null) return;
    parsed.push({ columns, minWidth, maxWidth });
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => pushRule(item));
  } else if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'default') continue;
      const maxWidth = Number(key);
      const columns = clampInt(value, 2, 8, NaN);
      if (!Number.isFinite(maxWidth) || !Number.isFinite(columns)) continue;
      parsed.push({ columns, minWidth: null, maxWidth });
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'default')) {
      const fallbackColumns = clampInt(raw.default, 2, 8, NaN);
      if (Number.isFinite(fallbackColumns)) {
        parsed.push({ columns: fallbackColumns, minWidth: null, maxWidth: null });
      }
    }
  }

  parsed.sort((a, b) => {
    const aMax = a.maxWidth == null ? Number.POSITIVE_INFINITY : a.maxWidth;
    const bMax = b.maxWidth == null ? Number.POSITIVE_INFINITY : b.maxWidth;
    return aMax - bMax;
  });
  return parsed;
}

function cloneStatusConfigValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneStatusConfigValue(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneStatusConfigValue(item)])
    );
  }
  return value;
}

function normalizeRecipeAuthoringTile(rawTile) {
  const raw = typeof rawTile === 'string'
    ? { recipe: rawTile }
    : (rawTile && typeof rawTile === 'object' ? cloneStatusConfigValue(rawTile) : null);
  if (!raw) return null;
  const recipe = String(raw.recipe || '').trim();
  if (!recipe) return null;
  if (!STATUS_RECIPES[recipe]) {
    console.warn(`[tunet-status-card] Unknown recipe "${recipe}" in recipe_tiles; skipping.`);
    return null;
  }
  return { ...raw, recipe };
}

function normalizeRecipeAuthoringList(rawList) {
  const list = Array.isArray(rawList)
    ? rawList
    : (rawList == null || rawList === '' ? [] : [rawList]);
  return list
    .map((item) => normalizeRecipeAuthoringTile(item))
    .filter(Boolean);
}

function buildStatusStubConfig(layoutVariant = 'home_summary') {
  const variant = normalizeStatusLayoutVariant(layoutVariant);
  const base = {
    name: 'Home Status',
    layout_variant: variant,
    show_header: true,
    tile_size: 'standard',
    use_profiles: true,
  };

  if (variant === 'home_detail') {
    return {
      ...base,
      name: 'Home Status Detail',
      columns: 3,
      recipe_tiles: [
        { recipe: 'home_presence', entity: 'person.mac_connolly' },
        { recipe: 'lights_on' },
        { recipe: 'manual_overrides', entity: 'sensor.oal_system_status' },
        { recipe: 'boost_offset' },
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          action_entity: 'climate.dining_room',
        },
        { recipe: 'outside_temperature' },
        { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
        { recipe: 'next_sun_event' },
        { recipe: 'mode_ttl' },
        {
          recipe: 'next_alarm',
          entity: 'sensor.sonos_next_alarm',
        },
      ],
    };
  }

  if (variant === 'room_row') {
    return {
      ...base,
      name: 'Room Status Row',
      columns: 4,
      recipe_tiles: [
        { recipe: 'lights_on' },
        { recipe: 'home_presence', entity: 'person.mac_connolly' },
        {
          recipe: 'inside_temperature',
          entity: 'sensor.dining_room_temperature',
          action_entity: 'climate.dining_room',
        },
        { recipe: 'outside_temperature' },
        { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
        { recipe: 'boost_offset' },
      ],
    };
  }

  if (variant === 'info_only') {
    return {
      ...base,
      name: 'Status Info',
      columns: 3,
      recipe_tiles: [
        { recipe: 'inside_temperature', entity: 'sensor.dining_room_temperature' },
        { recipe: 'outside_temperature' },
        { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
        { recipe: 'next_sun_event' },
        { recipe: 'boost_offset' },
      ],
    };
  }

  if (variant === 'alarms') {
    return {
      ...base,
      name: 'Alarm Status',
      columns: 2,
      recipe_tiles: [
        {
          recipe: 'next_alarm',
          entity: 'sensor.sonos_next_alarm',
          navigate_path: '/tunet-card-rehab-yaml/alarms',
        },
        {
          recipe: 'enabled_alarms',
          entity: 'sensor.sonos_enabled_alarm_count',
          navigate_path: '/tunet-card-rehab-yaml/alarms',
        },
        { recipe: 'mode_ttl' },
      ],
    };
  }

  if (variant === 'custom') {
    return {
      ...base,
      name: 'Custom Status',
      columns: 3,
      tiles: [
        {
          type: 'indicator',
          entity: 'sensor.oal_system_status',
          icon: 'info',
          label: 'System',
          accent: 'blue',
        },
        {
          type: 'dropdown',
          entity: 'input_select.oal_active_configuration',
          icon: 'tune',
          label: 'Mode',
          accent: 'muted',
        },
        {
          type: 'timer',
          entity: 'timer.oal_mode_timeout',
          icon: 'timer',
          label: 'Mode Timer',
          accent: 'amber',
          show_when: {
            entity: 'timer.oal_mode_timeout',
            operator: 'equals',
            state: 'active',
          },
        },
        {
          type: 'alarm',
          entity: 'sensor.sonos_next_alarm',
          icon: 'alarm',
          label: 'Alarm',
          accent: 'blue',
        },
      ],
    };
  }

  // Default: home_summary stub — 8 tiles fitting the 4×2 phone matrix limit
  return {
    ...base,
    columns: 4,
    recipe_tiles: [
      { recipe: 'home_presence', entity: 'person.mac_connolly' },
      { recipe: 'lights_on' },
      { recipe: 'mode_selector' },
      { recipe: 'manual_overrides', entity: 'sensor.oal_system_status' },
      {
        recipe: 'inside_temperature',
        entity: 'sensor.dining_room_temperature',
        action_entity: 'climate.dining_room',
      },
      { recipe: 'outside_temperature' },
      { recipe: 'inside_humidity', entity: 'sensor.kitchen_humidity' },
      {
        recipe: 'next_alarm',
        entity: 'sensor.sonos_next_alarm',
        compact_label: 'Bedroom',
        format: 'time_short',
      },
    ],
  };
}

function humanizeStateValue(value) {
  const text = String(value ?? '').trim();
  if (!text) return '—';

  const known = {
    partlycloudy: 'Partly Cloudy',
    clearnight: 'Clear Night',
    sunny: 'Sunny',
    cloudy: 'Cloudy',
    rainy: 'Rainy',
    pouring: 'Heavy Rain',
    lightning: 'Thunderstorm',
    lightningrainy: 'Storm + Rain',
    snowy: 'Snowy',
    snowy_rainy: 'Snow + Rain',
    fog: 'Fog',
    windy: 'Windy',
    windy_variant: 'Windy',
    home: 'Home',
    not_home: 'Away',
  };
  if (known[text]) return known[text];

  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ═══════════════════════════════════════════════════════════════
   CSS – Shared base + card-specific overrides
   ═══════════════════════════════════════════════════════════════ */

const TUNET_STATUS_STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* ── Status-specific token overrides ────────── */
  :host {
    --card-pad: var(--_tunet-card-pad, 1.25em);
    --r-tile: var(--_tunet-tile-radius, 0.875em);
    --_tunet-status-icon-box: 2.875em;
    --_tunet-status-icon-glyph: 1.5625em;
    --_tunet-status-value-font: 1.375em;
    --_tunet-status-text-font: 0.9375em;
    --_tunet-status-long-font: 0.875em;
    --_tunet-status-label-font: 0.9375em;
    --_tunet-status-secondary-font: 0.8125em;
    --_tunet-status-dropdown-font: 1.3125em;
    --_tunet-status-dot-size: 0.4375em;
    --type-label: var(--_tunet-status-label-font, var(--_tunet-name-font, 0.875em));
    --type-sub: var(--_tunet-status-secondary-font, var(--_tunet-sub-font, 0.75em));
    --type-value: var(--_tunet-status-value-font, var(--_tunet-value-font, 1.25em));
    --tile-row-h: var(--_tunet-tile-min-h, 5.75em);
    --tile-shadow-rest: 0 0.25em 0.75em rgba(0,0,0,0.04), 0 0.0625em 0.125em rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 0.75em 2em rgba(0,0,0,0.12), 0 0.25em 0.75em rgba(0,0,0,0.08);
    --dd-bg: rgba(255,255,255,0.92);
    --dd-border: rgba(255,255,255,0.60);
    position: relative;
    z-index: 1;
  }
  :host(.dd-open) {
    z-index: 9000;
  }
  :host(:not([use-profiles])[tile-size="compact"]) {
    --tile-row-h: 5.5em;
  }
  :host(:not([use-profiles])[tile-size="large"]) {
    --tile-row-h: 7.125em;
  }

  :host(.dark) {
    --dd-bg: rgba(58,58,60,0.92);
    --dd-border: rgba(255,255,255,0.08);
  }

  /* ── Card surface overrides ─────────────────── */
  .card {
    width: 100%;
    gap: var(--_tunet-section-gap, 0.75em);
    overflow: visible;
    isolation: isolate;
  }
  .wrap {
    overflow: visible;
  }
  .card.no-header {
    gap: calc(var(--_tunet-section-gap, 0.75em) * 0.8);
  }

  /* ── Header ──────────────────────────────────── */
  .hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.25em;
    min-height: var(--_tunet-header-height, 2.625em);
  }
  .hdr-title {
    font-size: var(--_tunet-status-title-font, 1.0625em);
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .hdr-title .icon { color: var(--blue); }

  /* ── Tile Grid ───────────────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(var(--tile-row-h), auto);
    align-items: stretch;
    gap: var(--_tunet-tile-gap, 0.375em);
    overflow: visible;
    isolation: isolate;
  }

  /* ── Tile Surface ────────────────────────────── */
  .tile {
    background: var(--tile-bg);
    border-radius: var(--_tunet-tile-radius, var(--r-tile));
    box-shadow: var(--tile-shadow-rest);
    padding:
      var(--_tunet-status-pad-top, 0.75em)
      var(--_tunet-status-pad-x, 0.625em)
      var(--_tunet-status-pad-bottom, 0.5625em);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--_tunet-status-tile-gap, 0.1875em);
    cursor: pointer;
    transition: all .15s ease;
    position: relative;
    overflow: visible;
    min-width: 0;
    min-height: var(--tile-row-h);
  }
  .tile[data-type="dropdown"] {
    z-index: 1;
  }
  .tile[data-type="dropdown"].dropdown-open {
    z-index: 2000;
  }
  .tile[data-type="dropdown"].dropdown-open .tile-dd-menu {
    z-index: 6100;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile {
    padding: 0.5625em 0.4375em 0.4375em;
    gap: 0.1875em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile {
    padding: 1.875em 0.75em 0.875em;
    gap: 0.4375em;
  }
  .tile:hover { box-shadow: var(--tile-shadow-lift); }
  .tile:active { transform: scale(.97); }
  .tile:focus-visible {
    outline: 0.125em solid var(--blue);
    outline-offset: 0.1875em;
  }
  .tile.passive {
    cursor: default;
  }
  .tile.passive:hover {
    box-shadow: var(--tile-shadow-rest);
  }
  .tile.passive:active {
    transform: none;
  }

  /* ── Tile Icon Accents ───────────────────────── */
  .tile-icon {
    width: var(--_tunet-status-icon-box, var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.625em)));
    height: var(--_tunet-status-icon-box, var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.625em)));
    display: grid;
    place-items: center;
    margin-bottom: 0;
  }
  .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-status-icon-glyph, var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.375em)));
    width: var(--_tunet-status-icon-glyph, var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.375em)));
    height: var(--_tunet-status-icon-glyph, var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.375em)));
    transform: none;
    /* Some Material Symbols ligatures (notably "home") render with an advance width
       wider than 1em, so the glyph paints beyond its CSS box. Three properties together
       keep the rendered glyph visually centered around the wrap centerline:
         min-width 0   lets the explicit width win over flex min-content sizing
                       (otherwise the box auto-expands to the glyph and shifts left)
         place-self    centers the box within the grid wrap
         text-align    centers the character within the inline-flex box so any
                       overflow paints equally on both sides */
    min-width: 0;
    place-self: center;
    text-align: center;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon {
    width: 1.3125em;
    height: 1.3125em;
    margin-bottom: 0.125em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon .tile-icon-glyph {
    font-size: 1.1875em;
    width: 1.1875em;
    height: 1.1875em;
    transform: none;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-icon {
    width: 1.875em; height: 1.875em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-icon .tile-icon-glyph {
    font-size: 1.625em;
    width: 1.625em;
    height: 1.625em;
  }
  .tile[data-accent="amber"] .tile-icon { color: var(--amber); }
  .tile[data-accent="amber"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="blue"] .tile-icon { color: var(--blue); }
  .tile[data-accent="blue"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="green"] .tile-icon { color: var(--green); }
  .tile[data-accent="green"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="muted"] .tile-icon { color: var(--text-muted); }

  /* ── Tile Values & Labels ────────────────────── */
  .tile-val {
    font-size: var(--_tunet-display-name-font, var(--type-value, 1.125em)); font-weight: 700; letter-spacing: -.0125em; line-height: 1.02;
    color: var(--text); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  :host([use-profiles]) .tile-val {
    line-height: 1.02;
    min-height: 1.08em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val { font-size: var(--type-value, 1.0625em); line-height: 1.08; }
  :host(:not([use-profiles])[tile-size="large"]) .tile-val { font-size: 1.25em; }
  .tile-val.is-text {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.06;
    text-align: center;
    font-size: var(--_tunet-status-text-font, var(--_tunet-name-font, 0.875em));
    max-height: 2.18em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-text {
    font-size: 0.8375em;
    max-height: 2.35em;
  }
  .tile-val.is-long {
    font-size: var(--_tunet-status-long-font, 0.8125em);
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-long {
    font-size: 0.8em;
  }
  .tile-label {
    font-size: var(--_tunet-display-value-font, var(--type-label, 0.8125em)); font-weight: 600; letter-spacing: .01em; text-transform: uppercase;
    color: var(--text-muted); line-height: 1.08; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .tile-label:empty {
    display: none;
  }
  :host([use-profiles]) .tile-label {
    text-transform: none;
    letter-spacing: 0.01em;
    line-height: 1.02;
    min-height: 1.08em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
    flex: 0 0 auto;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-label {
    font-size: var(--type-label, 0.8125em);
    letter-spacing: 0.00625em;
    text-transform: none;
    white-space: nowrap;
    display: block;
    line-height: 1.2;
    text-align: center;
    min-height: 1.2em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-label {
    font-size: 0.625em;
    letter-spacing: 0.034375em;
  }
  .tile-deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -0.0625em; }
  .tile-secondary {
    font-size: var(--_tunet-display-meta-font, var(--type-sub, 0.6875em)); font-weight: 500; color: var(--text-sub); line-height: 1.06;
    text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%; margin-top: -0.03125em;
  }
  :host([use-profiles]) .tile-secondary {
    line-height: 1.08;
    margin-top: 0;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-secondary {
    font-size: var(--type-sub, 0.71875em);
  }
  .tile-secondary:empty { display: none; }

  /* ── Status Dots ─────────────────────────────── */
  .status-dot {
    width: var(--_tunet-status-dot-size, 0.4375em); height: var(--_tunet-status-dot-size, 0.4375em); border-radius: 62.5em;
    position: absolute; top: 0.5625em; right: 0.5625em;
    display: none;
  }
  .status-dot.green { background: var(--green); display: block; }
  .status-dot.amber { background: var(--amber); display: block; }
  .status-dot.red { background: var(--red); display: block; }
  .status-dot.blue { background: var(--blue); display: block; }
  .status-dot.muted { background: var(--text-muted); opacity: 0.5; display: block; }

  /* ── Conditional Visibility ──────────────────── */
  .tile.tile-hidden {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .tile.tile-collapsed {
    display: none !important;
    pointer-events: none !important;
  }

  /* ── Aux Action Button ───────────────────────── */
  .tile-aux {
    position: absolute;
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    min-height: calc(var(--_tunet-ctrl-min-h, 2.625em) * 0.9);
    padding: 0 calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.82);
    border-radius: 62.5em;
    border: 0.0625em solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: max(calc(var(--_tunet-sub-font, 0.6875em) * 1.06), 0.75em);
    font-weight: 700;
    letter-spacing: 0.0125em;
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    cursor: pointer;
    z-index: 2;
  }
  .tile-aux[hidden] { display: none !important; }
  .tile.has-aux-visible {
    padding-top: calc(var(--_tunet-ctrl-min-h, 2.625em) + 0.5em);
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile.has-aux-visible {
    padding-top: 2.1875em;
  }
  .tile-aux .aux-icon {
    font-size: 0.95em;
    width: 0.95em;
    height: 0.95em;
  }
  .tile-aux:hover { box-shadow: var(--tile-shadow-rest); }
  .tile-aux:active { transform: scale(0.97); }
  .tile-aux.danger {
    color: var(--red);
    border-color: rgba(239,68,68,0.32);
    background: rgba(239,68,68,0.12);
  }
  .tile-aux.summary-compact {
    min-height: 2.25em;
    width: 2.25em;
    padding: 0;
    justify-content: center;
    border-radius: 62.5em;
  }
  .tile-aux.summary-compact .aux-label {
    display: none;
  }
  /* Phone (≤390px viewport, iPhone 12 Pro): collapse every aux pill to its
     compact-button form regardless of variant. The "Reset" text fits comfortably
     in tablet+ tile widths but overlaps the icon at phone scale because the pill's
     intrinsic width grows linearly with label length while the tile width does not. */
  @media (max-width: 390px) {
    .tile-aux .aux-label {
      display: none;
    }
    .tile-aux {
      min-height: 2.25em;
      width: 2.25em;
      padding: 0;
      justify-content: center;
    }
  }

  /* ── Timer Tile ──────────────────────────────── */
  .tile[data-type="timer"] .tile-val {
    font-size: var(--_tunet-timer-display-font, var(--_tunet-timer-font, 1.125em));
    letter-spacing: var(--_tunet-timer-ls, 0.02em);
  }

  /* ── Dropdown Tile ───────────────────────────── */
  .tile-dd-val {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.125em;
    font-size: var(--_tunet-status-dropdown-font, var(--_tunet-dropdown-value-font, var(--_tunet-value-font, 1.1875em)));
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    width: 100%;
    min-width: 0;
    padding: 0 0.125em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-dd-val {
    font-size: 0.925em;
    gap: 0.1875em;
  }
  .tile-dd-val .dd-text {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .tile-dd-val .chevron {
    font-size: var(--_tunet-ctrl-icon-size, 1.25em);
    width: var(--_tunet-ctrl-icon-size, 1.25em);
    height: var(--_tunet-ctrl-icon-size, 1.25em);
    color: var(--text-muted);
    transition: transform .2s ease;
    flex-shrink: 0;
  }
  .tile-dd-val[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }

  /* Dropdown menu */
  .tile-dd-menu {
    position: absolute;
    top: calc(100% + 0.25em);
    left: 50%;
    transform: translateX(-50%);
    min-width: 8.75em;
    max-width: 12.5em;
    max-height: var(--_tunet-dropdown-max-h, 15em);
    min-height: var(--_tunet-dropdown-min-h, 7.5em);
    overflow-y: auto;
    padding: 0.3125em;
    border-radius: var(--_tunet-dd-radius, 0.5em);
    background: var(--dd-bg);
    backdrop-filter: blur(1.5em); -webkit-backdrop-filter: blur(1.5em);
    border: 0.0625em solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 6100;
    display: none;
    flex-direction: column;
    gap: 0.0625em;
  }
  .tile-dd-menu.open {
    display: flex;
    animation: ddMenuIn .14s ease forwards;
  }
  @keyframes ddMenuIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-0.25em) scale(.97); }
    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .tile-dd-opt {
    padding: var(--_tunet-dd-option-pad-y, 0.5625em) var(--_tunet-dd-option-pad-x, 0.75em);
    border-radius: var(--_tunet-dd-radius, 0.5em);
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--_tunet-dd-option-font, 0.8125em);
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background .1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-dd-opt:hover { background: var(--track-bg); }
  .tile-dd-opt:active { transform: scale(.97); }
  .tile-dd-opt.active {
    font-weight: 700;
    background: var(--blue-fill);
    color: var(--blue);
  }

  :host([layout-variant="home_summary"]) {
    --tile-row-h: 5.375em;
    /* icon-box must accommodate the rendered glyph; some Material Symbols
       (notably "home") render with an advance width of ~1.56em at this glyph
       font-size, so the wrap needs ~2.5em to fully contain them and let
       place-items: center align the visible glyph with the tile centerline. */
    --_tunet-status-icon-box: 2.5em;
    --_tunet-status-icon-glyph: 1.5625em;
    --_tunet-status-value-font: 1.15625em;
    --_tunet-status-text-font: 1.0625em;
    --_tunet-status-long-font: 0.9375em;
    --_tunet-status-label-font: 0.8125em;
    --_tunet-status-dropdown-font: 1.0625em;
  }
  :host([layout-variant="home_summary"]) .grid {
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.85);
  }
  :host([layout-variant="home_summary"]) .tile {
    padding: 0.6875em 0.5625em 0.5em;
    gap: 0.15625em;
  }
  :host([layout-variant="home_summary"]) .tile-icon {
    width: var(--_tunet-status-icon-box);
    height: var(--_tunet-status-icon-box);
    margin-bottom: 0;
  }
  :host([layout-variant="home_summary"]) .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-status-icon-glyph);
    width: var(--_tunet-status-icon-glyph);
    height: var(--_tunet-status-icon-glyph);
  }
  :host([layout-variant="home_summary"]) .tile-val {
    font-size: var(--_tunet-status-value-font);
    line-height: 1.02;
  }
  :host([layout-variant="home_summary"]) .tile-val.is-text {
    font-size: var(--_tunet-status-text-font);
    max-height: 1.16em;
    -webkit-line-clamp: 1;
  }
  :host([layout-variant="home_summary"]) .tile-val.is-long {
    font-size: var(--_tunet-status-long-font);
  }
  :host([layout-variant="home_summary"]) .tile-label {
    font-size: var(--_tunet-status-label-font);
    letter-spacing: 0.008em;
    text-transform: none;
    line-height: 1.04;
  }
  :host([layout-variant="home_summary"]) .tile-secondary {
    display: none !important;
  }
  :host([layout-variant="home_summary"]) .tile-dd-val {
    justify-content: center;
    padding: 0;
    text-align: center;
    gap: 0;
    font-size: var(--_tunet-status-dropdown-font);
  }
  :host([layout-variant="home_summary"]) .tile-dd-val .dd-text {
    text-align: center;
    width: 100%;
  }
  :host([layout-variant="home_summary"]) .tile-dd-val .chevron {
    display: none;
  }

  :host([layout-variant="home_detail"]) {
    --tile-row-h: 5.625em;
    --_tunet-status-icon-box: 3em;
    --_tunet-status-icon-glyph: 1.625em;
    --_tunet-status-value-font: 1.5em;
    --_tunet-status-text-font: 1em;
    --_tunet-status-long-font: 0.9375em;
    --_tunet-status-label-font: 0.9375em;
    --_tunet-status-secondary-font: 0.8125em;
    --_tunet-status-dropdown-font: 1.375em;
  }
  :host([layout-variant="home_detail"]) .tile {
    padding: 0.75em 0.625em 0.5625em;
    gap: 0.15625em;
  }
  :host([layout-variant="home_detail"]) .tile-label {
    font-size: var(--_tunet-status-label-font);
    text-transform: none;
    letter-spacing: 0.01em;
    line-height: 1.06;
  }
  :host([layout-variant="home_detail"]) .tile-secondary {
    font-size: var(--_tunet-status-secondary-font);
    line-height: 1.06;
  }
  :host([layout-variant="home_detail"]) .tile[data-type="dropdown"] .tile-dd-val,
  :host([layout-variant="custom"]) .tile[data-type="dropdown"] .tile-dd-val {
    justify-content: center;
    text-align: center;
    font-size: min(var(--_tunet-status-dropdown-font), 1.125em);
  }
  :host([layout-variant="home_detail"]) .tile[data-type="dropdown"] .tile-dd-val .dd-text,
  :host([layout-variant="custom"]) .tile[data-type="dropdown"] .tile-dd-val .dd-text {
    text-align: center;
  }

  :host([layout-variant="alarms"]) {
    --tile-row-h: 5.75em;
    --_tunet-status-icon-box: 2.875em;
    --_tunet-status-icon-glyph: 1.5625em;
    --_tunet-status-value-font: 1.375em;
    --_tunet-status-label-font: 0.90625em;
    --_tunet-status-secondary-font: 0.8125em;
  }
  :host([layout-variant="alarms"]) .grid {
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.95);
  }
  :host([layout-variant="alarms"]) .tile {
    padding: 0.75em 0.625em 0.5625em;
    gap: 0.15625em;
  }
  :host([layout-variant="alarms"]) .tile-label {
    font-size: var(--_tunet-status-label-font);
    text-transform: none;
    letter-spacing: 0.01em;
  }
  :host([layout-variant="alarms"]) .tile[data-type="timer"] .tile-val {
    font-size: 1.5em;
  }
  :host([layout-variant="alarms"]) .alarm-time-pill {
    font-size: 1.125em;
  }

  :host([layout-variant="room_row"]) {
    --tile-row-h: var(--_tunet-row-min-h, 3.5em);
  }
  :host([layout-variant="room_row"]) .grid {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: var(--_tunet-row-gap, 0.75em);
    overflow-x: auto;
    overflow-y: visible;
    padding-bottom: 0.125em;
    scrollbar-width: none;
  }
  :host([layout-variant="room_row"]) .grid::-webkit-scrollbar {
    display: none;
  }
  :host([layout-variant="room_row"]) .tile {
    flex: 0 0 10.75em;
    min-width: 10.75em;
    min-height: var(--_tunet-row-min-h, 3.5em);
    padding:
      var(--_tunet-row-pad-y, 0.75em)
      max(var(--_tunet-row-pad-x, 0.25em), 1.125em)
      var(--_tunet-row-pad-y, 0.75em)
      var(--_tunet-row-pad-x, 0.25em);
    gap: var(--_tunet-row-gap, 0.75em);
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    border-radius: calc(var(--r-tile) * 0.88);
  }
  :host([layout-variant="room_row"]) .tile-icon {
    order: 1;
    width: var(--_tunet-row-lead-icon-box, 2.25em);
    height: var(--_tunet-row-lead-icon-box, 2.25em);
    margin-bottom: 0;
    flex: 0 0 auto;
  }
  :host([layout-variant="room_row"]) .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-row-lead-icon-glyph, 1.25em);
    width: var(--_tunet-row-lead-icon-glyph, 1.25em);
    height: var(--_tunet-row-lead-icon-glyph, 1.25em);
  }
  :host([layout-variant="room_row"]) .tile-label {
    order: 2;
    font-size: var(--_tunet-row-display-name-font, 0.95em);
    line-height: 1.08;
    color: var(--text-sub);
    text-transform: none;
    text-align: left;
    min-width: 0;
    flex: 1 1 auto;
  }
  :host([layout-variant="room_row"]) .tile-val {
    order: 3;
    font-size: var(--_tunet-row-display-status-font, 1.05em);
    line-height: 1;
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
    flex: 0 0 auto;
  }
  :host([layout-variant="room_row"]) .status-dot {
    top: 0.5em;
    right: 0.5em;
  }

  :host([layout-variant="info_only"]) {
    --tile-row-h: 6.375em;
    --_tunet-status-icon-box: 2.75em;
    --_tunet-status-icon-glyph: 1.75em;
    --_tunet-status-value-font: 1.25em;
    --_tunet-status-text-font: 1.0625em;
    --_tunet-status-long-font: 0.96875em;
    --_tunet-status-label-font: 0.8125em;
    --_tunet-status-dropdown-font: 1.375em;
  }
  :host([layout-variant="info_only"]) .grid {
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 1.05);
  }
  :host([layout-variant="info_only"]) .tile {
    padding: 0.9375em 0.75em 0.8125em;
    gap: 0.25em;
    box-shadow: 0 0.1875em 0.5em rgba(0,0,0,0.035), 0 0.0625em 0.125em rgba(0,0,0,0.05);
  }
  :host([layout-variant="info_only"]) .tile:hover {
    box-shadow: 0 0.1875em 0.5em rgba(0,0,0,0.035), 0 0.0625em 0.125em rgba(0,0,0,0.05);
  }
  :host([layout-variant="info_only"]) .tile-icon {
    width: var(--_tunet-status-icon-box);
    height: var(--_tunet-status-icon-box);
  }
  :host([layout-variant="info_only"]) .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-status-icon-glyph);
    width: var(--_tunet-status-icon-glyph);
    height: var(--_tunet-status-icon-glyph);
  }
  :host([layout-variant="info_only"]) .tile-val {
    font-size: var(--_tunet-status-value-font);
    line-height: 1;
  }
  :host([layout-variant="info_only"]) .tile-val.is-text {
    font-size: var(--_tunet-status-text-font);
    max-height: 2.15em;
    line-height: 1.04;
  }
  :host([layout-variant="info_only"]) .tile-label {
    font-size: var(--_tunet-status-label-font);
    font-weight: 500;
    color: var(--text-sub);
    opacity: 0.78;
    text-transform: none;
    letter-spacing: 0.015em;
    line-height: 1.08;
  }
  :host([layout-variant="info_only"]) .tile-secondary {
    display: none !important;
  }

  /* ── Alarm Tile ─────────────────────────────── */
  .tile[data-type="alarm"] {
    overflow: hidden;
  }

  /* Time pill badge */
  .alarm-time-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.15em 0.5em;
    border-radius: var(--r-pill);
    font-size: var(--_tunet-alarm-pill-font, 0.9375em);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01875em;
    line-height: 1.3;
    background: var(--blue-fill);
    color: var(--blue);
    transition: all 0.2s ease;
  }
  .tile[data-type="alarm"].alarm-off .alarm-time-pill {
    background: var(--track-bg);
    color: var(--text-muted);
    opacity: 0.6;
  }

  .tile[data-type="alarm"].alarm-set .tile-icon {
    color: var(--blue);
  }
  .tile[data-type="alarm"].alarm-set .tile-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .tile[data-type="alarm"].alarm-off .tile-icon {
    color: var(--text-muted);
    opacity: 0.5;
  }

  /* Ringing state */
  .tile[data-type="alarm"].alarm-ringing {
    background: var(--blue-fill);
    box-shadow: 0 0 0 0.0625em var(--blue), var(--tile-shadow-rest);
  }
  .tile[data-type="alarm"].alarm-ringing .tile-icon {
    color: var(--blue);
    animation: alarmBell 0.6s ease-in-out infinite alternate;
  }
  .tile[data-type="alarm"].alarm-ringing .tile-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }
  .tile[data-type="alarm"].alarm-ringing .alarm-time-pill {
    background: var(--blue);
    color: #fff;
  }
  @keyframes alarmBell {
    0% { transform: rotate(-8deg) scale(1); }
    50% { transform: rotate(8deg) scale(1.08); }
    100% { transform: rotate(-8deg) scale(1); }
  }

  /* Alarm action buttons (snooze / dismiss) */
  .alarm-actions {
    display: none;
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.375em;
    gap: 0.25em;
    justify-content: center;
    background: linear-gradient(to top, var(--tile-bg) 60%, transparent);
    z-index: 3;
  }
  .tile[data-type="alarm"].alarm-ringing .alarm-actions {
    display: flex;
    animation: alarmActionsIn 0.2s ease forwards;
  }
  @keyframes alarmActionsIn {
    from { opacity: 0; transform: translateY(0.25em); }
    to { opacity: 1; transform: translateY(0); }
  }
  .alarm-btn {
    border: none;
    border-radius: var(--r-pill);
    min-height: var(--_tunet-alarm-btn-h, 1.25em);
    padding: 0.25em 0.625em;
    font-family: inherit;
    font-size: var(--_tunet-alarm-btn-font, 0.5625em);
    font-weight: 700;
    letter-spacing: 0.01875em;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    transition: all 0.12s ease;
  }
  .alarm-btn .icon {
    font-size: var(--_tunet-alarm-icon-size, 0.6875em);
    width: var(--_tunet-alarm-icon-size, 0.6875em);
    height: var(--_tunet-alarm-icon-size, 0.6875em);
  }
  .alarm-btn:active { transform: scale(0.95); }
  .alarm-btn.snooze {
    background: var(--blue);
    color: #fff;
  }
  .alarm-btn.snooze:hover { opacity: 0.85; }
  .alarm-btn.dismiss {
    background: var(--ctrl-bg);
    border: 0.0625em solid var(--ctrl-border);
    color: var(--text-sub);
  }
  .alarm-btn.dismiss:hover { box-shadow: var(--tile-shadow-rest); }

  /* When ringing, push tile content up to make room for buttons */
  .tile[data-type="alarm"].alarm-ringing {
    padding-bottom: calc(var(--_tunet-alarm-btn-h, 1.25em) + 0.875em);
  }

  /* ── Responsive ──────────────────────────────── */
  @media (max-width: 27.5em) {
    :host(:not([use-profiles])) .card { padding: var(--card-pad, 0.875em); }
    .tile { min-height: var(--tile-row-h); }
    :host([layout-variant="home_detail"]),
    :host([layout-variant="custom"]),
    :host([layout-variant="alarms"]) {
      --tile-row-h: 5.125em;
      --_tunet-status-icon-box: 1.875em;
      --_tunet-status-icon-glyph: 1.375em;
      --_tunet-status-value-font: 1.1875em;
      --_tunet-status-text-font: 0.9375em;
      --_tunet-status-long-font: 0.8125em;
      --_tunet-status-label-font: 0.75em;
      --_tunet-status-secondary-font: 0.6875em;
      --_tunet-status-dropdown-font: 1.0625em;
    }
    :host([layout-variant="info_only"]) {
      --tile-row-h: 5.375em;
      --_tunet-status-icon-box: 2em;
      --_tunet-status-icon-glyph: 1.5625em;
      --_tunet-status-value-font: 1.3125em;
      --_tunet-status-text-font: 1em;
      --_tunet-status-long-font: 0.875em;
      --_tunet-status-label-font: 0.875em;
    }
    :host([layout-variant="home_detail"]) .tile,
    :host([layout-variant="custom"]) .tile,
    :host([layout-variant="alarms"]) .tile,
    :host([layout-variant="info_only"]) .tile {
      padding: 0.6875em 0.5625em 0.5em;
      gap: 0.15625em;
    }
    :host([layout-variant="home_detail"]) .tile-icon,
    :host([layout-variant="custom"]) .tile-icon,
    :host([layout-variant="alarms"]) .tile-icon,
    :host([layout-variant="info_only"]) .tile-icon {
      width: var(--_tunet-status-icon-box);
      height: var(--_tunet-status-icon-box);
    }
    :host([layout-variant="home_detail"]) .tile-icon .tile-icon-glyph,
    :host([layout-variant="custom"]) .tile-icon .tile-icon-glyph,
    :host([layout-variant="alarms"]) .tile-icon .tile-icon-glyph,
    :host([layout-variant="info_only"]) .tile-icon .tile-icon-glyph {
      font-size: var(--_tunet-status-icon-glyph);
      width: var(--_tunet-status-icon-glyph);
      height: var(--_tunet-status-icon-glyph);
    }
    :host([layout-variant="home_detail"]) .tile-val,
    :host([layout-variant="custom"]) .tile-val,
    :host([layout-variant="alarms"]) .tile-val {
      font-size: var(--_tunet-status-value-font);
      line-height: 1.02;
    }
    :host([layout-variant="home_detail"]) .tile-val.is-text,
    :host([layout-variant="custom"]) .tile-val.is-text,
    :host([layout-variant="alarms"]) .tile-val.is-text,
    :host([layout-variant="info_only"]) .tile-val.is-text {
      font-size: var(--_tunet-status-text-font);
      line-height: 1.04;
      max-height: 2.12em;
    }
    :host([layout-variant="home_detail"]) .tile-val.is-long,
    :host([layout-variant="custom"]) .tile-val.is-long,
    :host([layout-variant="alarms"]) .tile-val.is-long,
    :host([layout-variant="info_only"]) .tile-val.is-long {
      font-size: var(--_tunet-status-long-font);
    }
    :host([layout-variant="home_detail"]) .tile-label,
    :host([layout-variant="custom"]) .tile-label,
    :host([layout-variant="alarms"]) .tile-label,
    :host([layout-variant="info_only"]) .tile-label {
      font-size: var(--_tunet-status-label-font);
      line-height: 1.04;
    }
    :host([layout-variant="home_detail"]) .tile-secondary,
    :host([layout-variant="custom"]) .tile-secondary,
    :host([layout-variant="alarms"]) .tile-secondary {
      font-size: var(--_tunet-status-secondary-font);
      line-height: 1.04;
    }
    :host([layout-variant="home_detail"]) .tile-secondary {
      display: none !important;
    }
    :host([layout-variant="room_row"]) .grid {
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 0.5em;
    }
    :host([layout-variant="room_row"]) .tile {
      flex: 0 0 10em;
      min-width: 10em;
      min-height: 3.125em;
      padding: 0.625em 1em 0.625em var(--_tunet-row-pad-x, 0.25em);
      gap: 0.5em;
    }
    :host([layout-variant="room_row"]) .tile-icon {
      width: 1.875em;
      height: 1.875em;
    }
    :host([layout-variant="room_row"]) .tile-icon .tile-icon-glyph {
      font-size: 1.1875em;
      width: 1.1875em;
      height: 1.1875em;
    }
    :host([layout-variant="room_row"]) .tile-label {
      font-size: 0.875em;
    }
    :host([layout-variant="room_row"]) .tile-val {
      font-size: 0.9375em;
    }
    :host(:not([use-profiles])[tile-size="compact"]) .tile {
      padding: 0.5625em 0.4375em 0.4375em;
      gap: 0.1875em;
    }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-val { font-size: 1.0625em; }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-label { font-size: 0.7em; }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-secondary { font-size: 0.6375em; }
  }

${REDUCED_MOTION}
`;

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetStatusCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._timerIntervals = [];
    this._openDropdown = null;
    this._activeColumns = 4;
    this._haCardEl = null;
    this._haCardPrevPosition = null;
    this._haCardPrevZIndex = null;
    this._elevatedNodes = [];
    this._onDocClick = this._onDocClick.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._profileSelection = null;
    injectFonts();
  }

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
    this._setupResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      this._usingWindowResizeFallback = true;
      window.addEventListener('resize', this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener('resize', this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
    this._clearAllTimers();
    this._resetHostCardElevation();
  }

  _resolveResponsiveColumns(widthHint = null) {
    if (this._getResolvedLayoutVariant() === 'home_summary') return 4;
    const baseColumns = this._config.columns || 4;
    const width = Number.isFinite(Number(widthHint))
      ? Number(widthHint)
      : (this._cardEl?.getBoundingClientRect?.().width
        || this.getBoundingClientRect?.().width
        || 1024);
    const rules = Array.isArray(this._config.column_breakpoints) ? this._config.column_breakpoints : [];
    for (const rule of rules) {
      const minWidth = rule.minWidth == null ? Number.NEGATIVE_INFINITY : rule.minWidth;
      const maxWidth = rule.maxWidth == null ? Number.POSITIVE_INFINITY : rule.maxWidth;
      if (width >= minWidth && width <= maxWidth) return rule.columns;
    }
    return baseColumns;
  }

  _getRequestedLayoutVariant() {
    return this._config.layout_variant || 'custom';
  }

  _getResolvedLayoutVariant() {
    return this._config.resolved_layout_variant || 'custom';
  }

  _isHomeSummary() {
    return this._getResolvedLayoutVariant() === 'home_summary';
  }

  _isHomeDetail() {
    return this._getResolvedLayoutVariant() === 'home_detail';
  }

  _isAlarms() {
    return this._getResolvedLayoutVariant() === 'alarms';
  }

  _isRoomRow() {
    return this._getResolvedLayoutVariant() === 'room_row';
  }

  _isInfoOnly() {
    return this._getResolvedLayoutVariant() === 'info_only';
  }

  _usesCollapsedVisibility() {
    return this._isHomeSummary() || this._isHomeDetail() || this._isRoomRow() || this._isInfoOnly() || this._isAlarms();
  }

  _usesCompactLabels() {
    return this._isHomeSummary() || this._isRoomRow() || this._isInfoOnly();
  }

  _allowsSecondaryContent() {
    return !(this._isHomeSummary() || this._isRoomRow() || this._isInfoOnly());
  }

  _allowsAuxAction() {
    return !(this._isRoomRow() || this._isInfoOnly());
  }

  _applyLayoutVariantState() {
    const variant = this._getResolvedLayoutVariant();
    this.setAttribute('layout-variant', variant);
  }

  _normalizeTileConfig(rawTile, index, variant = this._getResolvedLayoutVariant()) {
    const raw = rawTile && typeof rawTile === 'object' ? rawTile : {};
    const recipeName = String(raw.recipe || '').trim();
    const recipe = STATUS_RECIPES[recipeName] || null;
    const explicitType = String(raw.type || '').trim().toLowerCase();
    const recipeDefaults = recipe?.defaults || {};
    const type = ['value', 'indicator', 'timer', 'dropdown', 'alarm'].includes(explicitType)
      ? explicitType
      : (recipeDefaults.type || 'value');
    const rawDotRules = raw.status_dot && !raw.dot_rules
      ? [{ match: '*', dot: raw.status_dot }]
      : raw.dot_rules;

    const tile = {
      _authorIndex: index,
      _recipePriority: STATUS_RECIPE_PRIORITY[recipeName] ?? Number.MAX_SAFE_INTEGER,
      _recipeDefaultAction: recipe?.defaultAction || '',
      _summaryOptionAliases: recipe?.summaryOptionAliases
        ? { ...recipe.summaryOptionAliases }
        : null,
      _authoredType: Boolean(explicitType),
      _authoredIcon: Boolean(raw.icon),
      _authoredLabel: Boolean(raw.label),
      _authoredCompactLabel: Boolean(raw.compact_label),
      _authoredTapAction: Boolean(raw.tap_action),
      _authoredNavigatePath: Boolean(raw.navigate_path),
      _authoredActionEntity: Boolean(raw.action_entity),
      type,
      recipe: recipeName,
      entity: raw.entity || recipeDefaults.entity || '',
      alt_entity: raw.alt_entity || recipeDefaults.alt_entity || '',
      sun_entity: raw.sun_entity || recipeDefaults.sun_entity || '',
      action_entity: raw.action_entity || recipeDefaults.action_entity || '',
      navigate_path: raw.navigate_path || '',
      icon: normalizeStatusIcon(raw.icon || recipeDefaults.icon || 'info'),
      label: raw.label || recipeDefaults.label || '',
      compact_label: raw.compact_label || recipeDefaults.compact_label || '',
      label_entity: raw.label_entity || recipeDefaults.label_entity || '',
      label_attribute: raw.label_attribute || recipeDefaults.label_attribute || '',
      label_format: raw.label_format || recipeDefaults.label_format || 'state',
      label_map: cloneLabelMap(raw.label_map || recipeDefaults.label_map || null),
      hide_label: raw.hide_label != null
        ? Boolean(raw.hide_label)
        : Boolean(recipeDefaults.hide_label),
      accent: raw.accent || recipeDefaults.accent || 'muted',
      show_when: cloneShowWhen(raw.show_when || recipeDefaults.show_when || null),
      tap_action: cloneActionConfig(raw.tap_action || recipeDefaults.tap_action),
      aux_action: cloneActionConfig(raw.aux_action || recipeDefaults.aux_action),
      aux_show_when: cloneShowWhen(raw.aux_show_when || recipeDefaults.aux_show_when || null),
      unit: raw.unit || recipeDefaults.unit || '',
      format: raw.format || recipeDefaults.format || 'state',
      attribute: raw.attribute || recipeDefaults.attribute || '',
      secondary: raw.secondary
        ? {
            entity: raw.secondary.entity || raw.entity || recipeDefaults.entity || '',
            attribute: raw.secondary.attribute || '',
            format: raw.secondary.format || 'state',
            value_map: cloneLabelMap(raw.secondary.value_map || raw.secondary.map || null),
          }
        : (recipeDefaults.secondary
          ? {
              entity: recipeDefaults.secondary.entity || recipeDefaults.entity || '',
              attribute: recipeDefaults.secondary.attribute || '',
              format: recipeDefaults.secondary.format || 'state',
              value_map: cloneLabelMap(recipeDefaults.secondary.value_map || recipeDefaults.secondary.map || null),
            }
          : null),
      dot_rules: cloneDotRules(rawDotRules || recipeDefaults.dot_rules || null),
      playing_entity: raw.playing_entity || recipeDefaults.playing_entity || '',
      snooze_action: cloneActionConfig(raw.snooze_action || recipeDefaults.snooze_action),
      dismiss_action: cloneActionConfig(raw.dismiss_action || recipeDefaults.dismiss_action),
    };

    this._applyVariantRecipeDefaults(tile, variant);
    if (recipeName && STATUS_RECIPE_ENTITY_BINDING[recipeName] === 'user' && !tile.entity) {
      console.warn(
        `[tunet-status-card] Recipe "${recipeName}" requires an entity; the tile will render as unavailable until one is provided.`
      );
    }
    if (tile.show_when && !tile.show_when.entity) tile.show_when.entity = tile.entity;
    if (tile.aux_show_when && !tile.aux_show_when.entity) tile.aux_show_when.entity = tile.entity;
    tile.primary_action = this._resolveTilePrimaryAction(tile, variant);
    return tile;
  }

  _applyVariantRecipeDefaults(tile, variant) {
    if (tile.recipe === 'next_alarm' && variant === 'alarms' && !tile._authoredType) {
      tile.type = 'alarm';
    }
    // CD11 Theme A: in home_summary, next_alarm shows HH:MM (no seconds) and prefers
    // an authored compact_label (e.g. room name) so the tile reads "05:35 / Bedroom"
    // rather than "05:35 · Bedroom / Alarm".
    if (tile.recipe === 'next_alarm' && variant === 'home_summary') {
      tile.format = tile.format === 'time_short' ? 'time_short_hm' : tile.format;
    }
    // 'Presence' fits the 172px summary tile but clips in the 151px room_row.
    // Downgrade to 'Status' only there when the user hasn't authored an override.
    if (tile.recipe === 'home_presence' && variant === 'room_row' && !tile._authoredCompactLabel) {
      tile.compact_label = 'Status';
    }
  }

  _resolveTilePrimaryAction(tile, variant = this._getResolvedLayoutVariant()) {
    if (variant === 'info_only') {
      if (tile._authoredTapAction && tile.tap_action) {
        return { kind: 'action', config: tile.tap_action };
      }
      if (tile._authoredNavigatePath && tile.navigate_path) {
        return {
          kind: 'action',
          config: {
            action: 'navigate',
            navigation_path: tile.navigate_path,
          },
        };
      }
      if (tile._authoredActionEntity && tile.action_entity) {
        return {
          kind: 'action',
          config: {
            action: 'more-info',
            entity: tile.action_entity,
          },
        };
      }
      return { kind: 'none' };
    }
    if (tile.tap_action) {
      return { kind: 'action', config: tile.tap_action };
    }
    if (tile.navigate_path) {
      return {
        kind: 'action',
        config: {
          action: 'navigate',
          navigation_path: tile.navigate_path,
        },
      };
    }
    if (tile.type === 'dropdown' || tile._recipeDefaultAction === 'dropdown') {
      return { kind: 'dropdown' };
    }
    // Recipe-specific tap defaults — these encode "the most likely user intent
    // when tapping this tile" rather than the generic more-info fallback. Authored
    // tap_action / navigate_path / action_entity above always win; this only fires
    // when none were set. See cards_reference.md §9 Tap Contract for the full table.
    const recipeAction = this._recipeSpecificAction(tile);
    if (recipeAction) return recipeAction;
    if (tile._recipeDefaultAction === 'action_entity' && tile.action_entity) {
      return {
        kind: 'action',
        config: {
          action: 'more-info',
          entity: tile.action_entity,
        },
      };
    }
    if (tile._recipeDefaultAction === 'entity' && tile.entity) {
      return {
        kind: 'action',
        config: {
          action: 'more-info',
          entity: tile.entity,
        },
      };
    }
    if (tile._recipeDefaultAction === 'none') {
      return { kind: 'none' };
    }
    if (tile.action_entity) {
      return {
        kind: 'action',
        config: {
          action: 'more-info',
          entity: tile.action_entity,
        },
      };
    }
    if (tile.entity) {
      return {
        kind: 'action',
        config: {
          action: 'more-info',
          entity: tile.entity,
        },
      };
    }
    return { kind: 'none' };
  }

  // Per-recipe tap intent. The architectural goal: tap should advance to the
  // most-likely user action given what the tile just told them, not to a generic
  // entity inspector. Returns null when the recipe has no specific intent or when
  // the runtime data needed to construct the action is not yet available.
  _recipeSpecificAction(tile) {
    if (!tile.recipe) return null;
    switch (tile.recipe) {
      // lights_on shows the count; tap toggles all adaptive lights. The display
      // sensor (sensor.oal_system_status) and the control target are intentionally
      // decoupled — authored action_entity overrides the default group.
      case 'lights_on': {
        const target = tile.action_entity || 'light.all_adaptive_lights';
        return {
          kind: 'action',
          config: {
            action: 'call-service',
            service: 'light.toggle',
            service_data: { entity_id: target },
          },
        };
      }
      // Sunset/sunrise time — tap takes the user to the broader weather context.
      case 'next_sun_event': {
        const target = tile.action_entity || 'weather.home';
        return {
          kind: 'action',
          config: { action: 'more-info', entity: target },
        };
      }
      // Next alarm — stopgap until SA3 retargets to Bubble Card 3.2 Adaptive popup.
      // Reads the alarm switch entity from the sensor's `next_alarm_entity` attribute
      // and passes it into the existing script that loads the editor buffers. If hass
      // isn't yet available at resolution time, return null so the caller falls back
      // to entity more-info; the action gets re-resolved on the next render.
      case 'next_alarm': {
        if (!tile.entity || !this._hass) return null;
        const sensor = this._hass.states[tile.entity];
        const alarmEntity = sensor?.attributes?.next_alarm_entity;
        if (!alarmEntity) return null;
        return {
          kind: 'action',
          config: {
            action: 'call-service',
            service: 'script.sonos_load_alarm_for_edit',
            service_data: { alarm_entity: alarmEntity },
          },
        };
      }
      default:
        return null;
    }
  }

  _isTileAllowedInVariant(tile, variant) {
    if (variant === 'home_summary') {
      return HOME_SUMMARY_ALLOWED_TYPES.has(tile.type);
    }
    if (variant === 'room_row' || variant === 'info_only') {
      return PASSIVE_STATUS_ALLOWED_TYPES.has(tile.type);
    }
    if (variant === 'alarms') {
      return ALARMS_ALLOWED_TYPES.has(tile.type);
    }
    return true;
  }

  _setupResizeObserver() {
    if (this._resizeObserver || typeof ResizeObserver === 'undefined') return;
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries?.[0]?.contentRect?.width;
      this._onHostResize(width);
    });
    this._resizeObserver.observe(this);
  }

  _teardownResizeObserver() {
    if (!this._resizeObserver) return;
    this._resizeObserver.disconnect();
    this._resizeObserver = null;
  }

  _onHostResize(widthHint) {
    if (!this._rendered) return;
    this._applyProfile(widthHint);
    const nextColumns = this._resolveResponsiveColumns(widthHint);
    if (nextColumns === this._activeColumns) return;
    this._activeColumns = nextColumns;
    this._applyGridColumns();
  }

  _applyGridColumns() {
    if (!this._gridEl) return;
    if (this._isRoomRow()) {
      this._gridEl.style.gridTemplateColumns = '';
      return;
    }
    const cols = this._activeColumns || this._config.columns || 4;
    this._gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  }

  _onWindowResize() {
    this._onHostResize(this._cardEl?.getBoundingClientRect?.().width);
  }

  /* ═══════════════════════════════════════════════════
     CONFIG
     ═══════════════════════════════════════════════════ */

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'layout_variant', selector: { select: { options: STATUS_LAYOUT_VARIANT_OPTIONS } } },
        {
          name: 'recipe_tiles',
          selector: {
            object: {
              multiple: true,
              label_field: 'recipe',
              fields: {
                recipe: {
                  label: 'Recipe',
                  selector: { select: { options: STATUS_RECIPE_OPTIONS } },
                  required: true,
                },
                entity: {
                  label: 'Entity',
                  selector: { entity: {} },
                },
                label: {
                  label: 'Label Override',
                  selector: { text: {} },
                },
                compact_label: {
                  label: 'Compact Label',
                  selector: { text: {} },
                },
                action_entity: {
                  label: 'Action Entity',
                  selector: { entity: {} },
                },
                navigate_path: {
                  label: 'Navigate Path',
                  selector: { text: {} },
                },
              },
            },
          },
        },
        { name: 'show_header', selector: { boolean: {} } },
        { name: 'columns', selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
        { name: 'column_breakpoints', selector: { object: {} } },
        { name: 'tile_size', selector: { select: { options: ['compact', 'standard', 'large'] } } },
        { name: 'use_profiles', selector: { boolean: {} } },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || '';
        return ({
          name: 'Card Title',
          layout_variant: 'Layout Variant',
          recipe_tiles: 'Recipe Tiles',
          show_header: 'Show Header',
          columns: 'Columns',
          column_breakpoints: 'Responsive Column Breakpoints',
          tile_size: 'Tile Size',
          use_profiles: 'Use Profile Sizing',
          custom_css: 'Custom CSS (injected into shadow DOM)',
        }[s.name] || s.name);
      },
      computeHelper: (s) => ({
        layout_variant: 'Choose the page role for this status surface.',
        recipe_tiles: 'High-level recipe authoring. Use tiles[] in YAML for raw custom tile definitions.',
        column_breakpoints: 'Example: [{max_width: 600, columns: 4}, {max_width: 1024, columns: 6}, {columns: 8}]',
        use_profiles: 'When enabled, geometry is sourced from the indicator-tile profile family.',
        custom_css: 'CSS rules injected into shadow DOM. Use .grid, .tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig(layoutVariant = 'home_summary') {
    return buildStatusStubConfig(layoutVariant);
  }

  static getStubConfigForVariant(layoutVariant = 'home_summary') {
    return buildStatusStubConfig(layoutVariant);
  }

  setConfig(config = {}) {
    const rawConfig = config && typeof config === 'object' ? config : {};
    const tileSizeRaw = String(rawConfig.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'regular'
      ? 'standard'
      : (tileSizeRaw === 'compact' || tileSizeRaw === 'large' ? tileSizeRaw : 'standard');
    const useProfiles = rawConfig.use_profiles !== false;
    const columns = clampInt(rawConfig.columns, 2, 8, 4);
    const columnBreakpoints = normalizeColumnBreakpoints(rawConfig.column_breakpoints);
    const requestedLayoutVariant = normalizeStatusLayoutVariant(rawConfig.layout_variant);
    const resolvedLayoutVariant = IMPLEMENTED_LAYOUT_VARIANTS.has(requestedLayoutVariant)
      ? requestedLayoutVariant
      : 'custom';
    if (requestedLayoutVariant !== resolvedLayoutVariant) {
      console.warn(
        `[tunet-status-card] layout_variant "${requestedLayoutVariant}" is reserved for a later CD11 phase; falling back to custom for now.`
      );
    }
    const recipeTiles = normalizeRecipeAuthoringList(rawConfig.recipe_tiles);
    const recipeAliasTiles = normalizeRecipeAuthoringList(rawConfig.recipes);
    const rawTiles = Array.isArray(rawConfig.tiles) ? rawConfig.tiles : [];
    let authoredTiles = rawTiles;
    let authoringMode = 'tiles';
    if (recipeTiles.length) {
      authoredTiles = recipeTiles;
      authoringMode = 'recipe_tiles';
      if (recipeAliasTiles.length) {
        console.warn('[tunet-status-card] Both recipe_tiles and recipes were provided; using recipe_tiles.');
      }
      if (rawTiles.length) {
        console.warn('[tunet-status-card] recipe_tiles authoring is active; ignoring raw tiles[] for runtime synthesis.');
      }
    } else if (recipeAliasTiles.length) {
      authoredTiles = recipeAliasTiles;
      authoringMode = 'recipes';
      if (rawTiles.length) {
        console.warn('[tunet-status-card] recipes authoring is active; ignoring raw tiles[] for runtime synthesis.');
      }
    }

    const tiles = [];
    for (const [index, rawTile] of authoredTiles.entries()) {
      const tile = this._normalizeTileConfig(rawTile, index, resolvedLayoutVariant);
      if (!this._isTileAllowedInVariant(tile, resolvedLayoutVariant)) {
        const allowedTypes = resolvedLayoutVariant === 'home_summary'
          ? 'value, indicator, and dropdown'
          : resolvedLayoutVariant === 'room_row' || resolvedLayoutVariant === 'info_only'
            ? 'value and indicator'
          : resolvedLayoutVariant === 'alarms'
            ? 'alarm, timer, value, and indicator'
            : 'all current tile types';
        console.warn(
          `[tunet-status-card] Skipping tile type "${tile.type}" in ${resolvedLayoutVariant}; allowed tile types are ${allowedTypes}.`
        );
        continue;
      }
      tiles.push(tile);
    }
    this._config = {
      name: rawConfig.name || 'Home Status',
      show_header: rawConfig.show_header !== false,
      columns,
      column_breakpoints: columnBreakpoints,
      layout_variant: requestedLayoutVariant,
      resolved_layout_variant: resolvedLayoutVariant,
      tile_size: tileSize,
      use_profiles: useProfiles,
      custom_css: rawConfig.custom_css || '',
      recipe_tiles: recipeTiles,
      recipes: recipeAliasTiles,
      authoring_mode: authoringMode,
      tiles,
    };
    if (useProfiles) this.setAttribute('use-profiles', '');
    else this.removeAttribute('use-profiles');
    this._applyLayoutVariantState();
    this._applyProfile(this._getHostWidth());
    this._activeColumns = this._resolveResponsiveColumns();
    if (this._rendered) this._buildGrid();
  }

  /* ═══════════════════════════════════════════════════
     HA STATE
     ═══════════════════════════════════════════════════ */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Collect all entities that matter (tile entities + show_when + alarm playing)
    const relevantEntities = new Set();
    for (const t of this._config.tiles) {
      if (t.entity) relevantEntities.add(t.entity);
      if (t.alt_entity) relevantEntities.add(t.alt_entity);
      if (t.sun_entity) relevantEntities.add(t.sun_entity);
      if (t.show_when && t.show_when.entity) relevantEntities.add(t.show_when.entity);
      if (t.aux_show_when && t.aux_show_when.entity) relevantEntities.add(t.aux_show_when.entity);
      if (t.secondary && t.secondary.entity) relevantEntities.add(t.secondary.entity);
      if (t.playing_entity) relevantEntities.add(t.playing_entity);
    }

    const changed = [...relevantEntities].some(eid =>
      !oldHass || oldHass.states[eid] !== hass.states[eid]
    );

    // Some recipe tap intents (notably next_alarm) read attributes from hass-resolved
    // entities to construct their action config. Those tiles were resolved at
    // setConfig time before hass arrived, so re-resolve them now that hass is available
    // and again whenever the resolved entity changes (e.g. the next alarm rotates).
    if ((changed || !oldHass) && this._config?.tiles) {
      const variant = this._getResolvedLayoutVariant();
      for (const t of this._config.tiles) {
        if (t.recipe === 'next_alarm' && !t.tap_action && !t.navigate_path) {
          t.primary_action = this._resolveTilePrimaryAction(t, variant);
        }
      }
    }

    if (changed || !oldHass) {
      this._evaluateVisibility();
      this._updateValues();
      this._syncTimers();
    }
  }

  getCardSize() {
    const variant = this._getResolvedLayoutVariant();
    const grid = STATUS_VARIANT_GRID_OPTIONS[variant] || STATUS_VARIANT_GRID_OPTIONS.custom;
    const headerRows = this._config.show_header !== false ? 1 : 0;
    if (variant === 'room_row') return Math.min(grid.max_rows, Math.max(grid.min_rows, headerRows + 1));

    const cols = this._activeColumns || this._config.columns || 4;
    const tileCount = variant === 'home_summary'
      ? Math.min(this._config.tiles.length, HOME_SUMMARY_SLOT_LIMIT)
      : this._config.tiles.length;
    const tileRows = Math.max(1, Math.ceil(tileCount / Math.max(1, cols)));
    const estimatedRows = tileRows + headerRows;
    return Math.min(grid.max_rows, Math.max(grid.min_rows, estimatedRows));
  }

  getGridOptions() {
    const variant = this._getResolvedLayoutVariant();
    return { ...(STATUS_VARIANT_GRID_OPTIONS[variant] || STATUS_VARIANT_GRID_OPTIONS.custom) };
  }

  _getHostWidth(widthHint = null) {
    const parsed = Number(widthHint);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const cardWidth = Number(this._cardEl?.getBoundingClientRect?.().width);
    if (Number.isFinite(cardWidth) && cardWidth > 0) return cardWidth;
    const hostWidth = Number(this.getBoundingClientRect?.().width);
    if (Number.isFinite(hostWidth) && hostWidth > 0) return hostWidth;
    return 1024;
  }

  _setLegacyTileSizeAttr(size) {
    if (size === 'compact' || size === 'large') this.setAttribute('tile-size', size);
    else this.removeAttribute('tile-size');
  }

  _applyProfile(widthHint = null) {
    const useProfiles = this._config.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute('profile-family');
      this.removeAttribute('profile-size');
      this._setLegacyTileSizeAttr(this._config.tile_size || 'standard');
      return;
    }

    const width = this._getHostWidth(widthHint);
    const variant = this._getResolvedLayoutVariant();
    const selection = selectProfileSize({
      preset: variant === 'room_row' ? 'environment' : 'status',
      layout: variant === 'room_row' ? 'row' : 'grid',
      widthHint: width,
      userSize: this._config.tile_size,
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute('profile-family', selection.family);
    this.setAttribute('profile-size', selection.size);
    this._setLegacyTileSizeAttr(selection.size);
  }

  _isSunAboveHorizon(tile) {
    const sunEntityId = tile.sun_entity || 'sun.sun';
    return this._hass?.states?.[sunEntityId]?.state === 'above_horizon';
  }

  _getResolvedTileEntityId(tile) {
    if (tile.recipe === 'next_sun_event') {
      const usePrimary = this._isSunAboveHorizon(tile);
      return usePrimary ? (tile.entity || 'sensor.sun_next_setting') : (tile.alt_entity || tile.entity);
    }
    return tile.entity;
  }

  _getDisplayLabel(tile) {
    if (tile.hide_label) return '';

    const dynamicLabel = this._resolveDynamicLabel(tile);
    if (dynamicLabel) return dynamicLabel;

    const baseLabel = this._usesCompactLabels()
      ? (tile.compact_label || tile.label)
      : tile.label;
    if (tile.recipe !== 'next_sun_event') return baseLabel;

    const hasExplicitLabel = this._usesCompactLabels()
      ? Boolean(tile._authoredCompactLabel || tile._authoredLabel)
      : Boolean(tile._authoredLabel);
    if (hasExplicitLabel) return baseLabel;
    return this._isSunAboveHorizon(tile) ? 'Sunset' : 'Sunrise';
  }

  _resolveDynamicLabel(tile) {
    // Resolution order (most-specific authoring wins):
    //   1. User-authored `label_entity` (explicit dynamic source)
    //   2. Recipe-level dynamic resolvers (boost_offset cause, etc.)
    //   3. Static recipe defaults / authored label (handled by caller)
    if (tile.label_entity && this._hass) {
      const entity = this._hass.states[tile.label_entity];
      if (entity) {
        let value = tile.label_attribute
          ? entity.attributes?.[tile.label_attribute]
          : entity.state;
        if (Array.isArray(value)) value = value[0];
        if (value != null) {
          const mapped = tile.label_map?.[String(value)] ?? value;
          const formatted = this._formatLabelValue(mapped, tile.label_format);
          if (formatted && !['unknown', 'unavailable', 'none'].includes(String(formatted).toLowerCase())) {
            return formatted;
          }
        }
      }
    }
    // boost_offset composite: value = signed magnitude, label = dominant cause from
    // sensor.oal_system_status attributes. Collapses the previously-separate boost +
    // weather + system tiles into one source-of-truth tile that always answers
    // "how much is OAL deviating from baseline, and why?"
    if (
      tile.recipe === 'boost_offset' &&
      !tile._authoredLabel &&
      !tile._authoredCompactLabel &&
      this._hass
    ) {
      const cause = this._resolveBoostCause(tile);
      if (cause) return cause;
    }
    return '';
  }

  // Cause resolution mirrors what produces total_modification (= cfg + env + sun).
  // Active zonal overrides and other orthogonal state flags do NOT contribute to that
  // magnitude — they have their own tiles (manual_overrides) and don't belong here.
  // Priority:
  //   1. system_paused      — system isn't computing offsets at all
  //   2. tv_mode_active     — TV bridge supersedes normal calc
  //   3. mode_timeout_state — preset is timer-bound; show preset + countdown
  //   4. active_modifiers   — the actual sources of magnitude (weather + sunset offsets)
  //   5. current_preset     — when no modifiers active, the configured preset is the cause
  //   6. fallback           — "Adaptive"
  _resolveBoostCause(tile) {
    const entityId = tile.entity || 'sensor.oal_system_status';
    const entity = this._hass.states[entityId];
    if (!entity) return '';
    const a = entity.attributes || {};
    if (a.system_paused === true) return 'Paused';
    if (a.tv_mode_active === true) return 'Movie';
    const timeoutState = a.mode_timeout_state;
    if (timeoutState && timeoutState !== 'idle') {
      const remaining = a.soonest_reset_formatted;
      const preset = a.current_preset || 'Mode';
      return remaining ? `${preset} ${remaining}` : preset;
    }
    const modifiers = Array.isArray(a.active_modifiers) ? a.active_modifiers : [];
    if (modifiers.length === 1) {
      const name = modifiers[0]?.name;
      if (name) return String(name);
    }
    if (modifiers.length > 1) return 'Mixed';
    if (a.current_preset && a.current_preset !== 'Adaptive') return String(a.current_preset);
    return 'Adaptive';
  }

  _getDisplayIcon(tile) {
    if (tile.recipe === 'next_sun_event' && !tile._authoredIcon) {
      return this._isSunAboveHorizon(tile)
        ? normalizeStatusIcon('weather_sunset_down')
        : normalizeStatusIcon('weather_sunset_up');
    }
    return tile.icon;
  }

  _getDropdownDisplayValue(tile, rawValue) {
    const value = String(rawValue ?? '');
    if (!this._isHomeSummary()) return value;
    if (tile.recipe === 'mode_selector' && tile._summaryOptionAliases?.[value]) {
      return tile._summaryOptionAliases[value];
    }
    return value;
  }

  _selectHomeSummaryVisibleTileIndexes(visibleTiles) {
    if (visibleTiles.length <= HOME_SUMMARY_SLOT_LIMIT) {
      return new Set(visibleTiles.map((tile) => tile.index));
    }
    const selected = [...visibleTiles]
      .sort((a, b) => {
        const priorityDelta = (a.config._recipePriority || Number.MAX_SAFE_INTEGER)
          - (b.config._recipePriority || Number.MAX_SAFE_INTEGER);
        if (priorityDelta !== 0) return priorityDelta;
        return (a.config._authorIndex || 0) - (b.config._authorIndex || 0);
      })
      .slice(0, HOME_SUMMARY_SLOT_LIMIT)
      .map((tile) => tile.index);
    return new Set(selected);
  }

  _activateTile(tile, index, event) {
    const activation = tile.primary_action || { kind: 'none' };
    if (activation.kind === 'none') return;
    if (activation.kind === 'dropdown') {
      event?.stopPropagation?.();
      this._toggleDropdown(index);
      return;
    }
    this._handleTapAction(activation.config, this._getResolvedTileEntityId(tile));
  }

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_STATUS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card">
          <div class="hdr">
            <div class="hdr-title">
              <span class="icon filled">home</span>
              <span id="title"></span>
            </div>
          </div>
          <div class="grid" id="grid"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._titleEl = this.shadowRoot.getElementById('title');
    this._hdrEl = this.shadowRoot.querySelector('.hdr');
    this._cardEl = this.shadowRoot.querySelector('.card');
    this._gridEl = this.shadowRoot.getElementById('grid');
    this._applyLayoutVariantState();
    this._applyProfile(this._getHostWidth());
    this._activeColumns = this._resolveResponsiveColumns();
    this._applyGridColumns();
    this._applyHeaderVisibility();

    this._buildGrid();
  }

  _applyHeaderVisibility() {
    const showHeader = this._config.show_header !== false;
    if (this._hdrEl) this._hdrEl.hidden = !showHeader;
    if (this._cardEl) this._cardEl.classList.toggle('no-header', !showHeader);
  }

  _buildGrid() {
    if (!this._gridEl) return;
    this._gridEl.innerHTML = '';
    this._titleEl.textContent = this._config.name;
    this._applyHeaderVisibility();
    this._applyGridColumns();
    this._applyLayoutVariantState();
    // Refresh custom CSS on rebuild (covers config editor changes)
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';
    this._tileEls = [];
    this._clearAllTimers();
    const summaryMode = this._isHomeSummary();
    const allowSecondary = this._allowsSecondaryContent();
    const allowAuxAction = this._allowsAuxAction();

    this._config.tiles.forEach((tile, i) => {
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.accent = tile.accent;
      el.dataset.type = tile.type;
      const labelText = this._getDisplayLabel(tile);
      const iconText = this._getDisplayIcon(tile);

      switch (tile.type) {
        case 'alarm': {
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph" id="icon-${i}">${iconText || 'alarm'}</span></div>
            <span class="alarm-time-pill" id="val-${i}">--:--</span>
            <span class="tile-label" id="label-${i}">${labelText}</span>
            <div class="alarm-actions" id="alarm-actions-${i}">
              ${tile.snooze_action ? `<button type="button" class="alarm-btn snooze" id="alarm-snooze-${i}"><span class="icon">snooze</span>Snooze</button>` : ''}
              ${tile.dismiss_action ? `<button type="button" class="alarm-btn dismiss" id="alarm-dismiss-${i}"><span class="icon">alarm_off</span>Stop</button>` : ''}
            </div>
          `;
          // Snooze button handler
          if (tile.snooze_action) {
            const snoozeBtn = el.querySelector(`#alarm-snooze-${i}`);
            if (snoozeBtn) {
              snoozeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._handleTapAction(tile.snooze_action, tile.entity);
              });
            }
          }
          // Dismiss button handler
          if (tile.dismiss_action) {
            const dismissBtn = el.querySelector(`#alarm-dismiss-${i}`);
            if (dismissBtn) {
              dismissBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._handleTapAction(tile.dismiss_action, tile.entity);
              });
            }
          }
          break;
        }

        case 'indicator':
          el.innerHTML = `
            <div class="status-dot" id="dot-${i}"></div>
            <div class="tile-icon"><span class="icon tile-icon-glyph" id="icon-${i}">${iconText}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label" id="label-${i}">${labelText}</span>
          `;
          break;

        case 'timer':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph" id="icon-${i}">${iconText}</span></div>
            <span class="tile-val" id="val-${i}">--:--</span>
            <span class="tile-label" id="label-${i}">${labelText}</span>
          `;
          break;

        case 'dropdown':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph" id="icon-${i}">${iconText}</span></div>
            <div class="tile-dd-val" id="ddval-${i}" aria-expanded="false">
              <span class="dd-text" id="val-${i}">--</span>
              <span class="icon chevron">expand_more</span>
            </div>
            <span class="tile-label" id="label-${i}">${labelText}</span>
            <div class="tile-dd-menu" id="ddmenu-${i}" role="listbox" aria-hidden="true"></div>
          `;
          el.setAttribute('aria-haspopup', 'listbox');
          el.setAttribute('aria-expanded', 'false');
          el.setAttribute('aria-labelledby', `val-${i} label-${i}`);
          break;

        case 'value':
        default: {
          let dotHTML = '';
          if (tile.dot_rules && tile.dot_rules.length > 0) {
            dotHTML = `<div class="status-dot" id="dot-${i}"></div>`;
          }
          el.innerHTML = `
            ${dotHTML}
            <div class="tile-icon"><span class="icon tile-icon-glyph" id="icon-${i}">${iconText}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            ${allowSecondary ? `<span class="tile-secondary" id="sec-${i}"></span>` : ''}
            <span class="tile-label" id="label-${i}">${labelText}</span>
          `;
          break;
        }
      }

      let auxEl = null;
      if (tile.aux_action && allowAuxAction) {
        el.classList.add('has-aux');
        const auxBtn = document.createElement('button');
        auxBtn.type = 'button';
        auxBtn.className = 'tile-aux';
        const auxIcon = tile.aux_action.icon ? normalizeStatusIcon(tile.aux_action.icon) : '';
        const auxLabel = tile.aux_action.label || 'Action';
        const looksDanger = String(auxLabel).toLowerCase().includes('reset');
        if (looksDanger) auxBtn.classList.add('danger');
        if (summaryMode) {
          auxBtn.classList.add('summary-compact');
          auxBtn.setAttribute('aria-label', auxLabel);
          auxBtn.title = auxLabel;
        }
        auxBtn.innerHTML = auxIcon
          ? `<span class="icon aux-icon">${auxIcon}</span><span class="aux-label">${auxLabel}</span>`
          : `<span class="aux-label">${auxLabel}</span>`;
        auxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._handleTapAction(tile.aux_action, tile.entity);
        });
        el.appendChild(auxBtn);
        auxEl = auxBtn;
      }

      if (tile.primary_action?.kind === 'none') {
        el.classList.add('passive');
      } else {
        this._bindTileAction(el, (event) => this._activateTile(tile, i, event));
      }

      this._gridEl.appendChild(el);
      this._tileEls.push({
        el,
        config: tile,
        index: i,
        auxEl,
        iconEl: el.querySelector(`#icon-${i}`),
        labelEl: el.querySelector(`#label-${i}`),
        valEl: el.querySelector(`#val-${i}`),
        dotEl: el.querySelector(`#dot-${i}`),
        secEl: el.querySelector(`#sec-${i}`),
        ddMenuEl: tile.type === 'dropdown' ? el.querySelector(`#ddmenu-${i}`) : null,
        ddValEl: tile.type === 'dropdown' ? el.querySelector(`#ddval-${i}`) : null,
      });
    });

    this._evaluateVisibility();
    this._updateValues();
    this._syncTimers();
  }

  _fireMoreInfo(entityId) {
    if (!entityId || !this._hass) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId },
    }));
  }

  _bindTileAction(el, handler) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const activate = (e) => {
      handler(e);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      activate(e);
    });
  }

  // ── Conditional Visibility ──

  _evaluateVisibility() {
    if (!this._hass || !this._tileEls) return;

    const collapseHidden = this._usesCollapsedVisibility();
    const baseVisibility = this._tileEls.map((tile) => {
      const { config } = tile;
      const visible = !config.show_when
        ? true
        : this._matchesShowWhen(this._hass.states[config.show_when.entity], config.show_when);
      return { tile, visible };
    });
    const summaryVisibleIndexes = this._isHomeSummary()
      ? this._selectHomeSummaryVisibleTileIndexes(
          baseVisibility.filter((entry) => entry.visible).map((entry) => entry.tile)
        )
      : null;

    for (const tile of this._tileEls) {
      const { config, el, auxEl } = tile;
      const baseVisible = !config.show_when
        ? true
        : this._matchesShowWhen(this._hass.states[config.show_when.entity], config.show_when);
      const tileVisible = baseVisible && (!summaryVisibleIndexes || summaryVisibleIndexes.has(tile.index));
      el.classList.toggle('tile-hidden', !tileVisible && !collapseHidden);
      el.classList.toggle('tile-collapsed', !tileVisible && collapseHidden);

      if (auxEl) {
        const auxVisible = !config.aux_show_when
          ? true
          : this._matchesShowWhen(this._hass.states[config.aux_show_when.entity], config.aux_show_when);
        auxEl.hidden = !(tileVisible && auxVisible);
        el.classList.toggle('has-aux-visible', tileVisible && auxVisible);
      }
    }

    if (this._openDropdown != null && !summaryVisibleIndexes?.has(this._openDropdown) && collapseHidden) {
      this._closeAllDropdowns();
    }
  }

  _matchesShowWhen(entity, condition) {
    if (!condition) return true;
    if (!entity) return false;

    const operator = condition.operator || 'equals';
    const expected = condition.state;
    const sourceValue = condition.attribute
      ? entity.attributes?.[condition.attribute]
      : entity.state;
    const actual = String(sourceValue ?? '');
    const target = String(expected ?? '');
    const actualNum = Number(actual);
    const targetNum = Number(target);
    const bothNumeric = Number.isFinite(actualNum) && Number.isFinite(targetNum);

    switch (operator) {
      case 'contains':
        return actual.includes(target);
      case 'not_contains':
        return !actual.includes(target);
      case 'not_equals':
        return bothNumeric ? actualNum !== targetNum : actual !== target;
      case 'gt':
        return bothNumeric ? actualNum > targetNum : Number(actual) > Number(target);
      case 'lt':
        return bothNumeric ? actualNum < targetNum : Number(actual) < Number(target);
      case 'equals':
      default:
        return bothNumeric ? actualNum === targetNum : actual === target;
    }
  }

  _handleTapAction(tapAction, defaultEntityId) {
    runCardAction({
      element: this,
      hass: this._hass,
      actionConfig: tapAction,
      defaultEntityId,
    });
  }

  // ── Value Updates ──

  _updateValues() {
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      const { config, valEl, dotEl, secEl, ddMenuEl, ddValEl, labelEl, iconEl, index } = tile;
      if (labelEl) labelEl.textContent = this._getDisplayLabel(config);
      if (iconEl) iconEl.textContent = this._getDisplayIcon(config);
      const entityId = this._getResolvedTileEntityId(config);
      if (!entityId) { if (valEl) valEl.textContent = '--'; continue; }

      const entity = this._hass.states[entityId];
      if (!entity) { if (valEl) valEl.textContent = '?'; continue; }

      switch (config.type) {
        case 'alarm':
          this._updateAlarmTile(tile);
          break;
        case 'indicator':
          this._updateIndicatorTile(valEl, dotEl, entity, config);
          break;
        case 'timer':
          this._updateTimerTile(valEl, entity);
          break;
        case 'dropdown':
          this._updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index);
          break;
        case 'value':
        default:
          this._updateValueTile(valEl, dotEl, secEl, entity, config);
          break;
      }
    }
  }

  _updateValueTile(valEl, dotEl, secEl, entity, config) {
    let val = config.attribute
      ? (entity.attributes[config.attribute] != null ? entity.attributes[config.attribute] : '?')
      : entity.state;
    const unit = config.unit || (!config.attribute ? entity.attributes?.unit_of_measurement || '' : '');

    val = this._formatStatusValue(val, config.format, entity.state);

    this._renderValWithUnit(valEl, val, unit);

    if (dotEl && config.dot_rules) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules);
    }

    if (secEl && config.secondary) {
      const secEntity = this._hass.states[config.secondary.entity];
      if (secEntity) {
        let secVal = config.secondary.attribute
          ? secEntity.attributes[config.secondary.attribute]
          : secEntity.state;
        if (Array.isArray(secVal)) {
          secVal = secVal.map((m) => (m && m.name) || String(m)).join(', ');
        }
        const mapped = config.secondary.value_map?.[String(secVal)] ?? secVal;
        secEl.textContent = mapped != null
          ? this._formatStatusValue(mapped, config.secondary.format || 'state', mapped)
          : '';
      } else {
        secEl.textContent = '';
      }
    } else if (secEl) {
      secEl.textContent = '';
    }
  }

  _updateIndicatorTile(valEl, dotEl, entity, config) {
    let val = entity.state;
    if (config.format === 'integer') val = Math.round(Number(val));
    else if (config.format === 'float1') val = Number(val).toFixed(1);
    else if (config.format === 'state') val = humanizeStateValue(val);

    this._renderValWithUnit(valEl, val, config.unit);

    if (dotEl) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules || []);
    }
  }

  _updateAlarmTile(tileData) {
    const { el, config, valEl } = tileData;
    if (!this._hass) return;

    const entity = this._hass.states[config.entity];
    const alarmTime = entity ? entity.state : '--:--';

    // Check if alarm is set (anything other than "--:--" or "unknown" or empty)
    const isSet = entity && alarmTime && alarmTime !== '--:--' && alarmTime !== 'unknown' && alarmTime !== 'unavailable';

    // Check if alarm is currently ringing
    const playingEntity = config.playing_entity ? this._hass.states[config.playing_entity] : null;
    const isRinging = playingEntity && (playingEntity.state === 'True' || playingEntity.state === 'true' || playingEntity.state === 'on');

    // Update display value
    if (valEl) {
      valEl.textContent = isSet ? this._formatShortTime(alarmTime) : '--:--';
    }

    // Toggle CSS state classes
    el.classList.toggle('alarm-set', isSet && !isRinging);
    el.classList.toggle('alarm-off', !isSet && !isRinging);
    el.classList.toggle('alarm-ringing', isRinging);

    // Dynamic accent: blue when set/ringing, muted when off
    el.dataset.accent = (isSet || isRinging) ? 'blue' : 'muted';
  }

  _renderValWithUnit(valEl, val, unit) {
    const textValue = String(val ?? '');
    const isNumericText = /^-?\d+(\.\d+)?$/.test(textValue.trim());
    const isTimeText = /^\d{1,2}:\d{2}(?::\d{2})?(\s*[AP]M)?$/i.test(textValue.trim());
    valEl.classList.toggle('is-text', !unit && !isNumericText && !isTimeText);
    valEl.classList.toggle('is-long', textValue.length > 10);

    if (unit === '°F' || unit === '°C' || unit === '°') {
      valEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${unit === '°F' ? 'F' : unit === '°C' ? 'C' : ''}`;
    } else if (unit) {
      valEl.innerHTML = `${val}<span class="tile-deg">${unit}</span>`;
    } else {
      valEl.textContent = val;
    }
  }

  _formatStatusValue(value, format = 'state', fallbackValue = value) {
    if (format === 'integer') {
      const numStr = String(value).replace(/%/g, '').trim();
      const rounded = Math.round(Number(numStr));
      return Number.isFinite(rounded)
        ? rounded
        : (String(fallbackValue).replace(/%/g, '').trim() || '—');
    }
    if (format === 'float1') {
      const numStr = String(value).replace(/%/g, '').trim();
      const fixed = Number(numStr).toFixed(1);
      return fixed === 'NaN' ? '—' : fixed;
    }
    if (format === 'time') return this._formatLocalTime(value);
    if (format === 'time_short') return this._formatShortTime(value);
    if (format === 'time_short_hm') return this._formatShortTime(value).replace(/\s*[AP]M$/i, '');
    if (format === 'alarm_room') return this._extractAlarmRoom(value);
    if (format === 'state') return humanizeStateValue(value);
    if (format === 'signed_percent') {
      // Self-contained format: an offset value rendered with explicit sign.
      // 21 -> "+21%", -10 -> "−10%" (Unicode minus U+2212), 0 -> "0%", non-finite -> "—".
      const numStr = String(value).replace(/%/g, '').trim();
      const num = Number(numStr);
      if (!Number.isFinite(num)) return '—';
      const rounded = Math.round(num);
      if (rounded === 0) return '0%';
      const sign = rounded > 0 ? '+' : '−';
      return `${sign}${Math.abs(rounded)}%`;
    }
    return value == null || value === '' ? '—' : String(value);
  }

  _formatLabelValue(value, format = 'state') {
    const formatted = this._formatStatusValue(value, format, value);
    return String(formatted ?? '').trim();
  }

  _formatShortTime(rawValue) {
    if (rawValue == null || rawValue === '') return '—';
    const text = String(rawValue).trim();
    const match = text.match(/\b(\d{1,2}:\d{2})(?::\d{2})?(\s*[AP]M)?\b/i);
    if (match) return `${match[1]}${match[2] ? match[2].toUpperCase().replace(/\s+/, ' ') : ''}`;

    const local = this._formatLocalTime(rawValue);
    return local === String(rawValue) ? text : local;
  }

  _extractAlarmRoom(rawValue) {
    const text = String(rawValue ?? '').trim();
    if (!text) return '';
    const parts = text.split(/\s*[·|-]\s*/).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) return parts[parts.length - 1];
    return text.replace(/\b\d{1,2}:\d{2}(?::\d{2})?(\s*[AP]M)?\b/i, '').trim();
  }

  _formatLocalTime(rawValue) {
    if (rawValue == null || rawValue === '') return '—';

    let date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) {
      const numeric = Number(rawValue);
      if (Number.isFinite(numeric)) {
        date = new Date(numeric > 1e12 ? numeric : numeric * 1000);
      }
    }
    if (Number.isNaN(date.getTime())) return String(rawValue);

    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch (_) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  _applyDotRules(dotEl, state, rules) {
    const stateStr = String(state ?? '').trim();
    const normalizedState = stateStr.toLowerCase();
    let dotColor = '';

    for (const rule of rules) {
      const rawMatch = String(rule?.match ?? '').trim();
      if (!rawMatch) continue;
      if (rawMatch === '*') {
        dotColor = rule.dot;
        break;
      }
      if (normalizedState === rawMatch.toLowerCase()) {
        dotColor = rule.dot;
        break;
      }
    }

    dotEl.className = dotColor ? `status-dot ${dotColor}` : 'status-dot';
  }

  _updateTimerTile(valEl, entity) {
    if (entity.state !== 'active') {
      valEl.textContent = '--:--';
      return;
    }

    const remaining = entity.attributes.remaining;
    if (!remaining) { valEl.textContent = '--:--'; return; }

    // Compute real remaining from snapshot + elapsed
    const parts = String(remaining).split(':').map(Number);
    let snapshotSeconds;
    if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
    else { valEl.textContent = '--:--'; return; }

    const elapsed = Math.floor((Date.now() - new Date(entity.last_updated).getTime()) / 1000);
    const currentSeconds = Math.max(0, snapshotSeconds - elapsed);
    valEl.textContent = this._formatFromSeconds(currentSeconds);
  }

  _updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index) {
    const displayValue = this._getDropdownDisplayValue(config, entity.state);
    valEl.textContent = displayValue;
    valEl.title = entity.state;

    const options = entity.attributes.options || [];
    const current = entity.state;

    ddMenuEl.innerHTML = '';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'tile-dd-opt';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', opt === current ? 'true' : 'false');
      if (opt === current) btn.classList.add('active');
      btn.textContent = opt;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._selectDropdownOption(config.entity, opt, index);
      });
      ddMenuEl.appendChild(btn);
    }
  }

  // ── Timer Interval Management ──

  _syncTimers() {
    this._clearAllTimers();
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      if (tile.config.type !== 'timer') continue;
      const entity = this._hass.states[tile.config.entity];
      if (!entity || entity.state !== 'active') continue;

      const remaining = entity.attributes.remaining;
      if (!remaining) continue;

      const parts = String(remaining).split(':').map(Number);
      let snapshotSeconds;
      if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
      else continue;

      const snapshotTime = new Date(entity.last_updated).getTime();
      const elapsed = Math.floor((Date.now() - snapshotTime) / 1000);
      let currentSeconds = Math.max(0, snapshotSeconds - elapsed);

      tile.valEl.textContent = this._formatFromSeconds(currentSeconds);

      const intervalId = setInterval(() => {
        currentSeconds = Math.max(0, currentSeconds - 1);
        tile.valEl.textContent = this._formatFromSeconds(currentSeconds);
        if (currentSeconds <= 0) clearInterval(intervalId);
      }, 1000);

      this._timerIntervals.push(intervalId);
    }
  }

  _clearAllTimers() {
    if (this._timerIntervals) {
      for (const id of this._timerIntervals) clearInterval(id);
    }
    this._timerIntervals = [];
  }

  _formatFromSeconds(totalSeconds) {
    if (totalSeconds <= 0) return '0:00';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ── Dropdown ──

  _toggleDropdown(index) {
    const tile = this._tileEls[index];
    if (!tile || !tile.ddMenuEl) return;

    const isOpen = tile.ddMenuEl.classList.contains('open');
    this._closeAllDropdowns();

    if (!isOpen) {
      this._elevateHostCard();
      this.classList.add('dd-open');
      tile.ddMenuEl.classList.add('open');
      tile.ddMenuEl.setAttribute('aria-hidden', 'false');
      tile.ddValEl.setAttribute('aria-expanded', 'true');
      tile.el.setAttribute('aria-expanded', 'true');
      tile.el.classList.add('dropdown-open');
      this._openDropdown = index;

      // Viewport-aware positioning: prefer below, flip above only if more space
      requestAnimationFrame(() => {
        const menuEl = tile.ddMenuEl;
        const tileRect = tile.el.getBoundingClientRect();
        const menuRect = menuEl.getBoundingClientRect();
        const viewH = window.innerHeight;
        const spaceBelow = viewH - tileRect.bottom - 8;
        const spaceAbove = tileRect.top - 8;
        const menuH = menuRect.height;

        if (menuH > spaceBelow && spaceAbove > spaceBelow) {
          // Flip above the tile
          menuEl.style.top = 'auto';
          menuEl.style.bottom = 'calc(100% + 0.25em)';
          // Cap height if even above space is tight
          if (menuH > spaceAbove) {
            menuEl.style.maxHeight = `${Math.max(120, spaceAbove - 8)}px`;
          }
        } else if (menuH > spaceBelow) {
          // Not enough space either way; cap height below
          menuEl.style.maxHeight = `${Math.max(120, spaceBelow - 8)}px`;
        }
      });
    }
  }

  _closeAllDropdowns() {
    if (!this._tileEls) return;
    this.classList.remove('dd-open');
    this._resetHostCardElevation();
    for (const tile of this._tileEls) {
      tile.el.classList.remove('dropdown-open');
      if (tile.ddMenuEl) {
        tile.ddMenuEl.classList.remove('open');
        tile.ddMenuEl.setAttribute('aria-hidden', 'true');
        tile.ddMenuEl.style.top = '';
        tile.ddMenuEl.style.bottom = '';
        tile.ddMenuEl.style.maxHeight = '';
      }
      if (tile.ddValEl) {
        tile.ddValEl.setAttribute('aria-expanded', 'false');
      }
      tile.el.setAttribute('aria-expanded', 'false');
    }
    this._openDropdown = null;
  }

  async _selectDropdownOption(entityId, option, tileIndex) {
    if (!this._hass) return;
    const tile = this._tileEls[tileIndex];
    if (tile?.ddValEl) {
      const labelEl = tile.ddValEl.querySelector('.dd-text');
      if (labelEl) labelEl.textContent = option;
    }
    this._closeAllDropdowns();

    const rawEntity = String(entityId || '').trim();
    const domainFromEntity = rawEntity.split('.')[0] || '';
    const domainOrder = domainFromEntity === 'input_select'
      ? ['input_select', 'select']
      : (domainFromEntity === 'select' ? ['select', 'input_select'] : ['input_select', 'select']);

    for (const domain of domainOrder) {
      try {
        await Promise.resolve(this._hass.callService(domain, 'select_option', {
          entity_id: rawEntity,
          option: String(option),
        }));
        return;
      } catch (_) {
        // Try the next supported domain
      }
    }
    // Preserve optimistic UI text; state reconciliation will occur on next HA update.
  }

  _onDocClick(e) {
    if (this._openDropdown === null) return;
    const path = e.composedPath();
    const tile = this._tileEls[this._openDropdown];
    if (tile && !path.includes(tile.el)) {
      this._closeAllDropdowns();
    }
  }

  _elevateHostCard() {
    this._resetHostCardElevation();
    const candidates = [
      this.closest('ha-card'),
      this.closest('hui-card'),
      this.closest('hui-section'),
    ].filter(Boolean);
    this._elevatedNodes = candidates.map((node) => ({
      node,
      position: node.style.position,
      zIndex: node.style.zIndex,
      overflow: node.style.overflow,
    }));
    for (const entry of this._elevatedNodes) {
      const node = entry.node;
      if (!node.style.position) node.style.position = 'relative';
      node.style.zIndex = '9100';
      node.style.overflow = 'visible';
    }
    this._haCardEl = this._elevatedNodes[0]?.node || null;
    this._haCardPrevPosition = this._elevatedNodes[0]?.position || null;
    this._haCardPrevZIndex = this._elevatedNodes[0]?.zIndex || null;
  }

  _resetHostCardElevation() {
    for (const entry of (this._elevatedNodes || [])) {
      entry.node.style.position = entry.position || '';
      entry.node.style.zIndex = entry.zIndex || '';
      entry.node.style.overflow = entry.overflow || '';
    }
    this._elevatedNodes = [];
    this._haCardEl = null;
    this._haCardPrevPosition = null;
    this._haCardPrevZIndex = null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-status-card', TunetStatusCard, {
  name: 'Tunet Status Card',
  description: 'Home status grid with typed tiles and glassmorphism design',
});

logCardVersion('TUNET-STATUS', CARD_VERSION, '#007AFF');

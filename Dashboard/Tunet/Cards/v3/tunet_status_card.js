/**
 * Tunet Status Card  v2.6.6 (v2 migration)
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

const CARD_VERSION = '3.0.0';

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
    --type-label: var(--_tunet-name-font, 0.8125em);
    --type-sub: var(--_tunet-sub-font, 0.6875em);
    --type-value: var(--_tunet-value-font, 1.125em);
    --tile-row-h: var(--_tunet-tile-min-h, 5.875em);
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
    font-size: var(--_tunet-header-title-font, var(--_tunet-header-font, 1em));
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
    grid-auto-rows: var(--tile-row-h);
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
      var(--_tunet-status-pad-top, var(--_tunet-tile-pad, 0.875em))
      calc(var(--_tunet-tile-pad, 0.875em) * 0.57)
      var(--_tunet-status-pad-bottom, calc(var(--_tunet-tile-pad, 0.875em) * 0.57));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--_tunet-status-tile-gap, calc(var(--_tunet-tile-gap, 0.375em) * 0.85));
    cursor: pointer;
    transition: all .15s ease;
    position: relative;
    overflow: visible;
    min-width: 0;
    min-height: var(--tile-row-h);
    height: var(--tile-row-h);
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

  /* ── Tile Icon Accents ───────────────────────── */
  .tile-icon {
    width: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.375em));
    height: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.375em));
    display: grid;
    place-items: center;
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.3);
  }
  .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    width: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    height: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    transform: none;
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
    font-size: var(--_tunet-display-name-font, var(--type-value, 1.125em)); font-weight: 700; letter-spacing: -.0125em; line-height: 1.06;
    color: var(--text); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  :host([use-profiles]) .tile-val {
    line-height: 1.04;
    min-height: 1.14em;
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
    line-height: 1.1;
    text-align: center;
    font-size: var(--_tunet-name-font, 0.8125em);
    max-height: 2.3em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-text {
    font-size: 0.8375em;
    max-height: 2.35em;
  }
  .tile-val.is-long {
    font-size: 0.75em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-long {
    font-size: 0.8em;
  }
  .tile-label {
    font-size: var(--_tunet-display-value-font, var(--type-label, 0.8125em)); font-weight: 600; letter-spacing: .0125em; text-transform: uppercase;
    color: var(--text-muted); line-height: 1.12; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  :host([use-profiles]) .tile-label {
    text-transform: none;
    letter-spacing: 0.01em;
    line-height: 1.04;
    min-height: 1.14em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.02em;
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
    font-size: var(--_tunet-display-meta-font, var(--type-sub, 0.6875em)); font-weight: 500; color: var(--text-sub); line-height: 1.12;
    text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%; margin-top: -0.0625em;
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
    width: 0.375em; height: 0.375em; border-radius: 62.5em;
    position: absolute; top: 0.625em; right: 0.625em;
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

  /* ── Aux Action Button ───────────────────────── */
  .tile-aux {
    position: absolute;
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    min-height: calc(var(--_tunet-ctrl-min-h, 2.625em) * 0.7);
    padding: 0 calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.66);
    border-radius: 62.5em;
    border: 0.0625em solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: calc(var(--_tunet-sub-font, 0.6875em) * 0.95);
    font-weight: 700;
    letter-spacing: 0.0125em;
    display: inline-flex;
    align-items: center;
    gap: 0.1875em;
    cursor: pointer;
    z-index: 2;
  }
  .tile-aux[hidden] { display: none !important; }
  .tile.has-aux-visible {
    padding-top: calc(var(--_tunet-ctrl-min-h, 2.625em) + 0.5em);
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile.has-aux-visible {
    padding-top: 1.875em;
  }
  .tile-aux:hover { box-shadow: var(--tile-shadow-rest); }
  .tile-aux:active { transform: scale(0.97); }
  .tile-aux.danger {
    color: var(--red);
    border-color: rgba(239,68,68,0.32);
    background: rgba(239,68,68,0.12);
  }

  /* ── Timer Tile ──────────────────────────────── */
  .tile[data-type="timer"] .tile-val {
    font-size: var(--_tunet-timer-display-font, var(--_tunet-timer-font, 1.125em));
    letter-spacing: var(--_tunet-timer-ls, 0.03125em);
  }

  /* ── Dropdown Tile ───────────────────────────── */
  .tile-dd-val {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.125em;
    font-size: var(--_tunet-dropdown-value-font, var(--_tunet-value-font, 1.125em));
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
          show_header: 'Show Header',
          columns: 'Columns',
          column_breakpoints: 'Responsive Column Breakpoints',
          tile_size: 'Tile Size',
          use_profiles: 'Use Profile Sizing',
          custom_css: 'Custom CSS (injected into shadow DOM)',
        }[s.name] || s.name);
      },
      computeHelper: (s) => ({
        column_breakpoints: 'Example: [{max_width: 600, columns: 4}, {max_width: 1024, columns: 6}, {columns: 8}]',
        use_profiles: 'When enabled, geometry is sourced from the indicator-tile profile family.',
        custom_css: 'CSS rules injected into shadow DOM. Use .grid, .tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { name: 'Home Status', tile_size: 'standard', use_profiles: true, tiles: [] };
  }

  setConfig(config) {
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'regular'
      ? 'standard'
      : (tileSizeRaw === 'compact' || tileSizeRaw === 'large' ? tileSizeRaw : 'standard');
    const useProfiles = config.use_profiles !== false;
    const columns = clampInt(config.columns, 2, 8, 4);
    const columnBreakpoints = normalizeColumnBreakpoints(config.column_breakpoints);
    this._config = {
      name: config.name || 'Home Status',
      show_header: config.show_header !== false,
      columns,
      column_breakpoints: columnBreakpoints,
      tile_size: tileSize,
      use_profiles: useProfiles,
      custom_css: config.custom_css || '',
      tiles: (config.tiles || []).map(t => {
        const type = t.type || 'value';
        const base = {
          type,
          entity: t.entity || '',
          icon: normalizeStatusIcon(t.icon || 'info'),
          label: t.label || '',
          accent: t.accent || 'muted',
          show_when: t.show_when || null,
          tap_action: t.tap_action || null,
          aux_action: t.aux_action || null,
          aux_show_when: t.aux_show_when || null,
        };

        if (type === 'alarm') {
          base.playing_entity = t.playing_entity || '';
          base.snooze_action = t.snooze_action || null;
          base.dismiss_action = t.dismiss_action || null;
        } else if (type === 'indicator') {
          base.format = t.format || 'state';
          base.unit = t.unit || '';
          base.dot_rules = t.dot_rules || [];
        } else if (type === 'timer') {
          // No extra config
        } else if (type === 'dropdown') {
          // No extra config
        } else {
          // value (default)
          base.unit = t.unit || '';
          base.format = t.format || 'state';
          base.attribute = t.attribute || '';
          base.secondary = t.secondary ? {
            entity: t.secondary.entity || t.entity,
            attribute: t.secondary.attribute || '',
          } : null;
          // Backward compat: convert old status_dot string to dot_rules
          if (t.status_dot && !t.dot_rules) {
            base.dot_rules = [{ match: '*', dot: t.status_dot }];
          } else {
            base.dot_rules = t.dot_rules || null;
          }
        }

        return base;
      }),
    };
    if (useProfiles) this.setAttribute('use-profiles', '');
    else this.removeAttribute('use-profiles');
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
      if (t.show_when && t.show_when.entity) relevantEntities.add(t.show_when.entity);
      if (t.aux_show_when && t.aux_show_when.entity) relevantEntities.add(t.aux_show_when.entity);
      if (t.secondary && t.secondary.entity) relevantEntities.add(t.secondary.entity);
      if (t.playing_entity) relevantEntities.add(t.playing_entity);
    }

    const changed = [...relevantEntities].some(eid =>
      !oldHass || oldHass.states[eid] !== hass.states[eid]
    );

    if (changed || !oldHass) {
      this._evaluateVisibility();
      this._updateValues();
      this._syncTimers();
    }
  }

  getCardSize() {
    const cols = this._activeColumns || this._config.columns || 4;
    const rows = Math.ceil(this._config.tiles.length / cols);
    return Math.max(2, rows + 1);
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 2,
      max_rows: 12,
    };
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
    const selection = selectProfileSize({
      preset: 'status',
      layout: 'grid',
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
    // Refresh custom CSS on rebuild (covers config editor changes)
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';
    this._tileEls = [];
    this._clearAllTimers();

    this._config.tiles.forEach((tile, i) => {
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.accent = tile.accent;
      el.dataset.type = tile.type;

      switch (tile.type) {
        case 'alarm': {
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon || 'alarm'}</span></div>
            <span class="alarm-time-pill" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
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
          // Tap on tile itself opens more-info or fires tap_action
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        }

        case 'indicator':
          el.innerHTML = `
            <div class="status-dot" id="dot-${i}"></div>
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;

        case 'timer':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;

        case 'dropdown':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <div class="tile-dd-val" id="ddval-${i}" aria-expanded="false">
              <span class="dd-text" id="val-${i}">--</span>
              <span class="icon chevron">expand_more</span>
            </div>
            <span class="tile-label">${tile.label}</span>
            <div class="tile-dd-menu" id="ddmenu-${i}"></div>
          `;
          this._bindTileAction(el, (e) => {
            e.stopPropagation();
            this._toggleDropdown(i);
          }, tile);
          el.setAttribute('aria-haspopup', 'listbox');
          el.setAttribute('aria-expanded', 'false');
          break;

        case 'value':
        default: {
          let dotHTML = '';
          if (tile.dot_rules && tile.dot_rules.length > 0) {
            dotHTML = `<div class="status-dot" id="dot-${i}"></div>`;
          }
          el.innerHTML = `
            ${dotHTML}
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-secondary" id="sec-${i}"></span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        }
      }

      let auxEl = null;
      if (tile.aux_action) {
        el.classList.add('has-aux');
        const auxBtn = document.createElement('button');
        auxBtn.type = 'button';
        auxBtn.className = 'tile-aux';
        const auxIcon = tile.aux_action.icon ? normalizeStatusIcon(tile.aux_action.icon) : '';
        const auxLabel = tile.aux_action.label || 'Action';
        const looksDanger = String(auxLabel).toLowerCase().includes('reset');
        if (looksDanger) auxBtn.classList.add('danger');
        auxBtn.innerHTML = auxIcon
          ? `<span class="icon" style="font-size:0.75em;width:0.75em;height:0.75em">${auxIcon}</span><span>${auxLabel}</span>`
          : `<span>${auxLabel}</span>`;
        auxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._handleTapAction(tile.aux_action, tile.entity);
        });
        el.appendChild(auxBtn);
        auxEl = auxBtn;
      }

      this._gridEl.appendChild(el);
      this._tileEls.push({
        el,
        config: tile,
        index: i,
        auxEl,
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

  _bindTileAction(el, handler, tileConfig) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const activate = (e) => {
      if (tileConfig && tileConfig.tap_action) {
        this._handleTapAction(tileConfig.tap_action, tileConfig.entity);
        return;
      }
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

    for (const tile of this._tileEls) {
      const { config, el, auxEl } = tile;

      const tileVisible = !config.show_when
        ? true
        : this._matchesShowWhen(this._hass.states[config.show_when.entity], config.show_when);
      el.classList.toggle('tile-hidden', !tileVisible);

      if (auxEl) {
        const auxVisible = !config.aux_show_when
          ? true
          : this._matchesShowWhen(this._hass.states[config.aux_show_when.entity], config.aux_show_when);
        auxEl.hidden = !(tileVisible && auxVisible);
        el.classList.toggle('has-aux-visible', tileVisible && auxVisible);
      }
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
      const { config, valEl, dotEl, secEl, ddMenuEl, ddValEl, index } = tile;
      if (!config.entity) { if (valEl) valEl.textContent = '--'; continue; }

      const entity = this._hass.states[config.entity];
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
    const unit = config.unit;

    if (config.format === 'integer') {
      const numStr = String(val).replace(/%/g, '').trim();
      val = Math.round(Number(numStr));
      if (isNaN(val)) val = String(entity.state).replace(/%/g, '').trim() || '—';
    } else if (config.format === 'float1') {
      const numStr = String(val).replace(/%/g, '').trim();
      val = Number(numStr).toFixed(1);
      if (val === 'NaN') val = '—';
    } else if (config.format === 'time') {
      val = this._formatLocalTime(val);
    } else if (config.format === 'state') {
      val = humanizeStateValue(val);
    }

    this._renderValWithUnit(valEl, val, unit);

    if (dotEl && config.dot_rules) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules);
    }

    if (secEl && config.secondary) {
      const secEntity = this._hass.states[config.secondary.entity];
      if (secEntity && config.secondary.attribute) {
        let secVal = secEntity.attributes[config.secondary.attribute];
        if (Array.isArray(secVal)) {
          secVal = secVal.map((m) => (m && m.name) || String(m)).join(', ');
        }
        secEl.textContent = secVal != null ? String(secVal) : '';
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
      valEl.textContent = isSet ? alarmTime : '--:--';
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
    valEl.classList.toggle('is-text', !unit && !isNumericText);
    valEl.classList.toggle('is-long', textValue.length > 10);

    if (unit === '°F' || unit === '°C' || unit === '°') {
      valEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${unit === '°F' ? 'F' : unit === '°C' ? 'C' : ''}`;
    } else if (unit) {
      valEl.innerHTML = `${val}<span class="tile-deg">${unit}</span>`;
    } else {
      valEl.textContent = val;
    }
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
    const stateStr = String(state);
    let dotColor = '';

    for (const rule of rules) {
      if (rule.match === '*' || stateStr === rule.match || stateStr.includes(rule.match)) {
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
    valEl.textContent = entity.state;

    const options = entity.attributes.options || [];
    const current = entity.state;

    ddMenuEl.innerHTML = '';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'tile-dd-opt';
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

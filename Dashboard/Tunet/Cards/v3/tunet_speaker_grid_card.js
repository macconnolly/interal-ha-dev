/**
 * Tunet Speaker Grid Card (v2 – ES Module)
 * Sonos speaker grid with per-speaker volume control and group management
 * Auto-detects speakers from binary_sensor.sonos_*_in_active_group entities
 *
 * Horizontal tile layout: icon | name + song | vol% | vol-bar (bottom)
 *
 * Interactions:
 *   Tap        = toggle group membership
 *   Drag L/R   = volume control (200px = full range)
 *   Hold 500ms = open more-info dialog
 *
 * Version 3.1.3
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CARD_SURFACE,
  CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  selectProfileSize,
  resolveSizeProfile,
  _setProfileVars,
  createAxisLockedDrag,
  registerCard,
  logCardVersion,
  renderConfigPlaceholder,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '3.2.0';

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    /* Steel Blue accent */
    --accent: #4682B4;
    --accent-fill: rgba(70,130,180,0.10);
    --accent-border: rgba(70,130,180,0.22);
    --accent-glow: rgba(70,130,180,0.45);
    --accent-vol-bar: rgba(70,130,180,0.80);

    /* Card-specific tile tokens */
    --tile-bg-off: rgba(28,28,30,0.04);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --divider: rgba(28,28,30,0.07);
    --r-pill: 999px;
    /* --spring removed: identical to --ease-emphasized */

    display: block;
  }
  :host(.dark) {
    --accent: #6BA3C7;
    --accent-fill: rgba(107,163,199,0.14);
    --accent-border: rgba(107,163,199,0.28);
    --accent-glow: rgba(107,163,199,0.50);
    --accent-vol-bar: rgba(107,163,199,0.85);

    --tile-bg-off: rgba(255,255,255,0.04);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.16);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
    --divider: rgba(255,255,255,0.06);
  }

  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    padding: var(--_tunet-card-pad, var(--card-pad, 20px));
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Icon size helpers */
  .icon-20 { font-size: 20px; --ms-opsz: 20; }
  .icon-18 { font-size: 18px; --ms-opsz: 20; }

  /* ── Header ─────────────────────────────────────── */
  .grid-hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--_tunet-section-gap, 12px);
    min-height: var(--_tunet-header-height, 0px);
  }

  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px var(--_tunet-ctrl-pad-x, 10px) 6px 6px;
    min-height: var(--_tunet-ctrl-min-h, var(--ctrl-min-h, 42px));
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard);
    min-width: 0;
  }
  @media (hover: hover) {
    .info-tile:hover { box-shadow: var(--shadow); }
  }
  .info-tile:active { transform: scale(var(--press-scale)); }
  .info-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: color var(--motion-ui) ease; color: var(--text-muted);
  }

  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title {
    font-weight: 700; font-size: var(--_tunet-header-title-font, var(--_tunet-header-font, 13px)); color: var(--text-sub);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: var(--_tunet-header-sub-font, var(--_tunet-sub-font, 11.5px)); font-weight: 600; color: var(--text-muted);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-spacer { flex: 1; }

  /* ── Speaker Grid ───────────────────────────────── */
  .spk-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
    gap: var(--_tunet-tile-gap, 10px);
    width: 100%; min-width: 0;
  }

  /* ═══════════════════════════════════════════════════
     HORIZONTAL SPEAKER TILE
     ═══════════════════════════════════════════════════ */
  .spk-tile {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--_tunet-tile-gap, 10px);
    padding:
      var(--_tunet-tile-pad, 8px)
      var(--_tunet-tile-pad, 10px)
      calc(var(--_tunet-tile-pad, 8px) + var(--_tunet-progress-h, 3px) + 1px)
      var(--_tunet-tile-pad, 8px);
    border-radius: var(--_tunet-tile-radius, var(--r-tile));
    background: var(--tile-bg);
    border: 1px solid transparent;
    box-shadow: var(--tile-shadow-rest);
    cursor: pointer; user-select: none;
    touch-action: pan-y;
    min-height: var(--_tunet-tile-min-h, 58px);
    min-width: 0;
    overflow: visible;
    container-type: inline-size;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-ui) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      background-color var(--motion-surface) var(--ease-standard);
  }

  /* Size presets via host attribute */
  :host(:not([use-profiles])[tile-size="compact"]) .spk-tile { padding: 7px 9px 10px 7px; min-height: 52px; gap: 6px; }
  :host(:not([use-profiles])[tile-size="large"]) .spk-tile { padding: 12px 14px 16px 12px; min-height: 68px; }

  /* Tile-width breakpoint: switch to stacked layout when each tile gets narrow */
  @container (max-width: 128px) {
    .spk-tile {
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 6px;
      padding: 8px 6px 11px;
      min-height: 84px;
    }
    :host(:not([use-profiles])[tile-size="compact"]) .spk-tile {
      gap: 4px;
      padding: 7px 6px 10px;
      min-height: 72px;
    }
    /* Tiny tiles: hide icon block so text stack never collides. */
    .tile-icon-wrap { display: none; }
    .spk-text {
      width: 100%;
      align-items: center;
      text-align: center;
      gap: 1px;
    }
    .spk-name,
    .spk-meta {
      text-align: center;
    }
    .spk-vol {
      width: 100%;
      min-width: 0;
      text-align: center;
      font-size: 13px;
      margin-top: -1px;
    }
    .vol-track {
      left: 8px;
      right: 8px;
      bottom: 6px;
    }
    .group-dot {
      top: 6px;
      right: 6px;
    }
  }

  @media (hover: hover) {
    .spk-tile:hover {
      box-shadow: var(--tile-shadow-lift);
    }
  }
  .spk-tile:active { transform: scale(var(--press-scale)); }
  .spk-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* ── Icon circle (left) ──────────────────────── */
  .tile-icon-wrap {
    width: var(--_tunet-icon-box, 40px); height: var(--_tunet-icon-box, 40px);
    border-radius: 12px;
    display: grid; place-items: center;
    flex-shrink: 0;
    transition:
      color var(--motion-ui) ease,
      background var(--motion-ui) ease,
      border-color var(--motion-ui) ease;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
  :host(:not([use-profiles])[tile-size="large"]) .tile-icon-wrap { width: 44px; height: 44px; }

  .tile-icon-wrap .icon {
    font-size: var(--_tunet-icon-glyph, 20px);
    color: inherit;
    transition: color .15s ease;
  }

  /* ── Text stack (center) ─────────────────────── */
  .spk-text {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .spk-name {
    font-size: var(--_tunet-display-name-font, var(--_tunet-name-font, 13px)); font-weight: 600; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .15s ease;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .spk-name { font-size: 13px; }

  .spk-meta {
    font-size: var(--_tunet-display-meta-font, var(--_tunet-sub-font, 11.5px)); font-weight: 500; line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color .15s ease;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .spk-meta { font-size: 11.25px; }

  /* ── Volume % (right) ────────────────────────── */
  .spk-vol {
    font-size: var(--_tunet-display-value-font, var(--_tunet-value-font, 14px)); font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1px;
    flex-shrink: 0;
    min-width: 36px; text-align: right;
    transition: color .15s ease;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .spk-vol { font-size: 13px; }

  /* ── Volume bar (bottom inset) ───────────────── */
  .vol-track {
    position: absolute;
    bottom: calc(var(--_tunet-tile-pad, 8px) * 0.75);
    left: var(--_tunet-tile-pad, 10px);
    right: var(--_tunet-tile-pad, 10px);
    height: var(--_tunet-progress-h, 3px);
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
  }
  .vol-fill {
    height: 100%;
    border-radius: var(--r-track);
    transition: width .15s ease-out;
  }

  /* ── Group dot (top-right corner) ────────────── */
  .group-dot {
    position: absolute;
    top: 8px; right: 8px;
    width: 8px; height: 8px;
    border-radius: 50%;
    display: none;
  }

  /* ── Floating Volume Pill (during drag) ──────── */
  .vol-pill {
    position: absolute; top: -4px; left: 50%;
    transform: translate(-50%, -100%);
    padding: 5px 14px; border-radius: var(--r-pill);
    background: var(--tile-bg);
    border: 1px solid var(--accent-border);
    box-shadow: var(--tile-shadow-lift);
    font-size: 14px; font-weight: 700; color: var(--accent);
    font-variant-numeric: tabular-nums;
    pointer-events: none; z-index: 101;
    opacity: 0; transition: opacity .12s ease;
    backdrop-filter: blur(12px);
  }

  /* ════════════════════════════════════════
     STATE: IDLE (not in group)
     ════════════════════════════════════════ */
  .spk-tile.idle .tile-icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
  }
  .spk-tile.idle .spk-name { color: var(--text-sub); }
  .spk-tile.idle .spk-meta { color: var(--text-muted); }
  .spk-tile.idle .spk-vol  { color: var(--text-muted); }
  .spk-tile.idle .vol-fill { background: var(--text-muted); opacity: 0.25; }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PLAYING
     ════════════════════════════════════════ */
  .spk-tile.in-group {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .spk-tile.in-group .spk-name { color: var(--text); }
  .spk-tile.in-group .spk-meta { color: var(--text-sub); }
  .spk-tile.in-group .spk-vol  { color: var(--accent); }
  .spk-tile.in-group .vol-fill { background: var(--accent-vol-bar); }
  .spk-tile.in-group .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
  }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PAUSED
     ════════════════════════════════════════ */
  .spk-tile.in-group.paused {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group.paused .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
    opacity: 0.55;
  }
  .spk-tile.in-group.paused .spk-meta { color: var(--text-muted); font-style: italic; }
  .spk-tile.in-group.paused .spk-vol  { color: var(--text-muted); }
  .spk-tile.in-group.paused .vol-fill { background: var(--accent-vol-bar); opacity: 0.30; }
  .spk-tile.in-group.paused .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
    opacity: 0.5;
  }

  /* ════════════════════════════════════════
     STATE: DRAGGING (volume adjust)
     ════════════════════════════════════════ */
  .spk-tile.dragging {
    transform: scale(1.03);
    box-shadow: var(--tile-shadow-lift);
    z-index: 100;
    border-color: var(--accent);
  }
  .spk-tile.dragging .vol-pill { opacity: 1; }

  /* ── Action Buttons ────────────────────────────── */
  .grid-actions {
    display: flex; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid var(--divider);
    flex-wrap: wrap;
  }
  .action-btn {
    display: flex; align-items: center; gap: 6px;
    padding: calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.78) calc(var(--_tunet-ctrl-pad-x, 0.75em) * 1.04);
    border-radius: 11px;
    border: none; background: transparent; font-family: inherit;
    font-size: var(--_tunet-display-action-font, 13px); font-weight: 600; color: var(--text-sub);
    cursor: pointer; transition: background .1s;
    user-select: none;
  }
  @media (hover: hover) {
    .action-btn:hover { background: var(--track-bg); color: var(--text); }
  }
  .action-btn:active { transform: scale(var(--press-scale)); }
  .action-btn .icon { color: var(--accent); }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 440px) {
    :host(:not([use-profiles])) .card { padding: var(--card-pad, 14px); --r-card: 20px; }
    :host(:not([use-profiles])) .spk-grid {
      grid-template-columns: repeat(var(--cols-sm, 2), minmax(0, 1fr));
      gap: 8px;
    }
    :host(:not([use-profiles])) .spk-tile {
      min-height: 68px;
      padding: 7px 6px 10px;
      gap: 4px;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    :host(:not([use-profiles])) .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
    :host(:not([use-profiles])) .spk-text { width: 100%; align-items: center; text-align: center; gap: 1px; }
    :host(:not([use-profiles])) .spk-name { font-size: 13px; text-align: center; }
    :host(:not([use-profiles])) .spk-meta { font-size: 11.5px; text-align: center; }
    :host(:not([use-profiles])) .spk-vol { font-size: 13px; width: 100%; min-width: 0; text-align: center; }
    :host(:not([use-profiles])) .vol-track { left: 8px; right: 8px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_SPEAKER_GRID_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════════════════════

const TUNET_SPEAKER_GRID_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card">

      <!-- Header -->
      <div class="grid-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon icon-18">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">Loading...</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
      </div>

      <!-- Speaker Grid -->
      <div class="spk-grid" id="spkGrid"></div>

      <!-- Group Actions -->
      <div class="grid-actions" id="gridActions" style="display:none">
        <button class="action-btn" id="groupAllBtn" aria-label="Group all speakers">
          <span class="icon icon-18">link</span> Group All
        </button>
        <button class="action-btn" id="ungroupBtn" aria-label="Ungroup all speakers">
          <span class="icon icon-18">link_off</span> Ungroup All
        </button>
      </div>

    </div>
  </div>
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetSpeakerGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._cachedSpeakers = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._tileRefs = new Map();
    this._tileDragControllers = [];
    this._volDebounce = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._profileSelection = null;

    injectFonts();
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
  }

  /* ── Config ─────────────────────────────────────── */

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'media_player' }] } } },
        { name: 'name', selector: { text: {} } },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns',     selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
            { name: 'tile_size',   selector: { select: { options: ['standard', 'compact', 'large'] } } },
          ],
        },
        { name: 'show_group_actions', selector: { boolean: {} } },
        {
          name: 'speakers',
          selector: {
            object: {
              multiple: true,
              label_field: 'name',
              description_field: 'entity',
              fields: {
                entity: { label: 'Speaker', required: true, selector: { entity: { filter: [{ domain: 'media_player' }] } } },
                name: { label: 'Name', selector: { text: {} } },
                icon: { label: 'Icon', selector: { text: {} } },
              },
            },
          },
        },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:tune',
          schema: [
            { name: 'coordinator_sensor', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
            { name: 'use_profiles', selector: { boolean: {} } },
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || '';
        return ({
          entity:             'Media Player',
          name:               'Card Name',
          columns:            'Grid Columns',
          tile_size:          'Tile Size',
          show_group_actions: 'Show Group/Ungroup Buttons',
          speakers:           'Speakers',
          coordinator_sensor: 'Coordinator Sensor',
          use_profiles:       'Use Profile Sizing',
          custom_css:         'Custom CSS',
        }[s.name] || s.name);
      },
      computeHelper: (s) => ({
        speakers: 'Optional explicit speaker list. If empty, speakers are auto-discovered from Sonos binary sensors.',
        coordinator_sensor: 'Default: sensor.sonos_smart_coordinator',
        custom_css: 'CSS rules injected into shadow DOM. Use .spk-grid, .spk-tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Speakers',
      columns: 4,
      tile_size: 'standard',
      show_group_actions: true,
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Select a media player entity', 'Speakers');
      return;
    }

    const asFinite = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };
    const columns = Math.max(2, Math.min(8, Math.round(asFinite(config.columns, 4))));
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const useProfiles = config.use_profiles !== false;

    this._config = {
      entity: config.entity,
      name: config.name || 'Speakers',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      columns,
      tile_size: tileSize,
      use_profiles: useProfiles,
      show_group_actions: config.show_group_actions !== false,
      custom_css: config.custom_css || '',
    };

    if (useProfiles) this.setAttribute('use-profiles', '');
    else this.removeAttribute('use-profiles');
    this._applyProfile(this._getHostWidth());

    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._applyProfile(this._getHostWidth());
      this._setupListeners();
      this._rendered = true;
      this._buildGrid();
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildGrid();
    }

    let changed = !oldHass;
    if (!changed) {
      const watchList = [this._config.entity, this._config.coordinator_sensor];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity));
      }
      for (const eid of watchList) {
        if (eid && oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    const speakers = this._cachedSpeakers || this._config.speakers || [];
    const cols = this._config.columns || 4;
    const rows = Math.max(1, Math.ceil(speakers.length / cols));
    return 1 + rows;
  }

  // Sections view (12-column grid) sizing hints
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
    const cardWidth = Number(this.$?.card?.getBoundingClientRect?.().width);
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
      preset: 'speakers',
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

  _onHostResize(widthHint = null) {
    if (!this._rendered) return;
    const prevSize = this._profileSelection?.size || '';
    this._applyProfile(widthHint);
    const nextSize = this._profileSelection?.size || '';
    if (prevSize !== nextSize) this._buildGrid();
  }

  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    this._setupResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      this._usingWindowResizeFallback = true;
      window.addEventListener('resize', this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }

  disconnectedCallback() {
    for (const ctrl of this._tileDragControllers) {
      ctrl.destroy();
    }
    this._tileDragControllers = [];
    clearTimeout(this._volDebounce);
    clearTimeout(this._cooldownTimer);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener('resize', this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
  }

  /* ── Helpers ────────────────────────────────────── */

  _binarySensorFor(entityId) {
    const room = entityId.replace('media_player.', '');
    return `binary_sensor.sonos_${room}_in_active_group`;
  }

  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService('script', name, data);
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_active_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
            icon: 'speaker',
          });
        }
      }
    }
    return speakers;
  }

  /* ── Rendering ──────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SPEAKER_GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SPEAKER_GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {};
    const ids = ['card', 'infoTile', 'cardTitle', 'hdrSub', 'spkGrid', 'gridActions', 'groupAllBtn', 'ungroupBtn'];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  _setupListeners() {
    const $ = this.$;

    $.infoTile.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });

    $.groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_group_all_to_playing');
    });

    $.ungroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_ungroup_all');
    });
  }

  /* ── Build Speaker Grid ──────────────────────────── */

  _buildGrid() {
    const grid = this.$.spkGrid;
    if (!grid) return;
    for (const ctrl of this._tileDragControllers) {
      ctrl.destroy();
    }
    this._tileDragControllers = [];
    grid.innerHTML = '';
    this._tileRefs.clear();

    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    const speakers = this._cachedSpeakers || [];
    const cols = this._config.columns;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cols-sm', 1);

    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'spk-tile idle';
      tile.tabIndex = 0;
      tile.setAttribute('role', 'slider');
      tile.setAttribute('aria-label', spk.name || spk.entity);
      tile.setAttribute('aria-valuemin', '0');
      tile.setAttribute('aria-valuemax', '100');
      tile.setAttribute('aria-valuenow', '0');
      tile.dataset.entity = spk.entity;

      const dotEl = document.createElement('div');
      dotEl.className = 'group-dot';
      tile.appendChild(dotEl);

      const iconWrap = document.createElement('div');
      iconWrap.className = 'tile-icon-wrap';
      const icon = document.createElement('span');
      icon.className = 'icon icon-20';
      icon.textContent = spk.icon || 'speaker';
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);

      const textWrap = document.createElement('div');
      textWrap.className = 'spk-text';

      const nameEl = document.createElement('div');
      nameEl.className = 'spk-name';
      nameEl.textContent = spk.name || spk.entity;
      textWrap.appendChild(nameEl);

      const metaEl = document.createElement('div');
      metaEl.className = 'spk-meta';
      metaEl.textContent = 'Not grouped';
      textWrap.appendChild(metaEl);

      tile.appendChild(textWrap);

      const volEl = document.createElement('div');
      volEl.className = 'spk-vol';
      volEl.textContent = '--';
      tile.appendChild(volEl);

      const volTrack = document.createElement('div');
      volTrack.className = 'vol-track';
      const volFill = document.createElement('div');
      volFill.className = 'vol-fill';
      volFill.style.width = '0%';
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);

      const pill = document.createElement('div');
      pill.className = 'vol-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);
      tile.addEventListener('contextmenu', (event) => event.preventDefault());

      const dragController = createAxisLockedDrag({
        element: tile,
        deadzone: 8,
        axisBias: 1.3,
        longPressMs: 500,
        pointerCapture: false,
        getContext: () => {
          const playerState = this._hass && this._hass.states[spk.entity];
          const startVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;
          return {
            entity: spk.entity,
            tile,
            startVol,
            lastPct: startVol,
          };
        },
        onDragStart: () => {
          tile.classList.add('dragging');
          document.body.style.cursor = 'grabbing';
        },
        onDragMove: (event, payload) => {
          const ctx = payload && payload.context;
          if (!ctx) return;
          const pct = Math.max(0, Math.min(100, ctx.startVol + Math.round(payload.dx / 2)));
          ctx.lastPct = pct;

          const refs = this._tileRefs.get(ctx.entity);
          if (refs) {
            refs.volEl.textContent = `${pct}%`;
            refs.pill.textContent = `${pct}%`;
            refs.volFill.style.width = `${pct}%`;
            refs.tile.setAttribute('aria-valuenow', String(pct));
          }
          if (event.cancelable) event.preventDefault();

          clearTimeout(this._volDebounce);
          this._volDebounce = setTimeout(() => {
            this._callService('media_player', 'volume_set', {
              entity_id: ctx.entity,
              volume_level: pct / 100,
            });
            this._serviceCooldown = true;
            clearTimeout(this._cooldownTimer);
            this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
          }, 200);
        },
        onDragEnd: (_event, payload) => {
          const ctx = payload && payload.context;
          if (!ctx) return;
          clearTimeout(this._volDebounce);
          tile.classList.remove('dragging');
          document.body.style.cursor = '';

          if (!payload.committed) return;
          this._callService('media_player', 'volume_set', {
            entity_id: ctx.entity,
            volume_level: Math.max(0, Math.min(100, ctx.lastPct)) / 100,
          });
          this._serviceCooldown = true;
          clearTimeout(this._cooldownTimer);
          this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
        },
        onTap: () => {
          this._callScript('sonos_toggle_group_membership', {
            target_speaker: spk.entity,
          });
        },
        onLongPress: () => {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: spk.entity },
          }));
        },
      });
      this._tileDragControllers.push(dragController);

      grid.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, iconWrap, nameEl, metaEl, volEl, volFill, dotEl, pill });
    }

    if (this.$.gridActions) {
      this.$.gridActions.style.display =
        (this._config.show_group_actions && speakers.length > 1) ? '' : 'none';
    }
  }

  /* ── Full Update ────────────────────────────────── */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._serviceCooldown) return;

    const speakers = this._cachedSpeakers || [];
    $.cardTitle.textContent = this._config.name;

    let groupedCount = 0;
    for (const spk of speakers) {
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      if (bs && bs.state === 'on') groupedCount++;
    }

    $.hdrSub.textContent = `${speakers.length} speakers \u00b7 ${groupedCount} grouped`;

    const coordSensor = this._hass.states[this._config.coordinator_sensor];
    const mainEntity = this._hass.states[this._config.entity];
    const isPlaying = (mainEntity && mainEntity.state === 'playing') ||
                      (coordSensor && coordSensor.state && coordSensor.state !== 'idle' && coordSensor.state !== 'unknown');

    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      const inGroup = bs && bs.state === 'on';
      const playerState = this._hass.states[spk.entity];
      const speakerState = playerState ? playerState.state : 'idle';
      const isPaused = speakerState === 'paused';

      refs.tile.className = 'spk-tile';
      if (inGroup) {
        refs.tile.classList.add('in-group');
        if (isPaused) refs.tile.classList.add('paused');
      } else {
        refs.tile.classList.add('idle');
      }

      if (inGroup && playerState) {
        if (isPaused) {
          refs.metaEl.textContent = 'Paused';
        } else {
          const title = playerState.attributes.media_title || '';
          const artist = playerState.attributes.media_artist || '';
          if (title) {
            refs.metaEl.textContent = artist ? `${title} \u2013 ${artist}` : title;
          } else {
            refs.metaEl.textContent = speakerState === 'playing' ? 'Playing' : 'Idle';
          }
        }
      } else {
        refs.metaEl.textContent = 'Not grouped';
      }

      const isDraggingTile = refs.tile.classList.contains('dragging');
      if (playerState && !isDraggingTile) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + '%';
        refs.volFill.style.width = vol + '%';
        refs.tile.setAttribute('aria-valuenow', String(vol));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-speaker-grid-card', TunetSpeakerGridCard, {
  name: 'Tunet Speaker Grid Card',
  description: 'Sonos speaker grid with horizontal tiles, volume control, and group management',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-speaker-grid-card',
});

logCardVersion('TUNET-SPEAKER-GRID', CARD_VERSION, '#4682B4');

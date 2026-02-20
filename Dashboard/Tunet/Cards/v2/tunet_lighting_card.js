/**
 * Tunet Lighting Card  v3.3.0 (v2 migration)
 * ──────────────────────────────────────────────────────────────
 * Complete rewrite aligned to Tunet Design Language v8.0 by Mac
 * Migrated to tunet_base.js shared module.
 *
 * Architecture:
 *   Shadow DOM custom element · Full token system (light + dark)
 *   Design-language header (info tile + toggle + selector)
 *   Flexible layout: grid | scroll with full config
 *   Three entity patterns: rich YAML, group expansion, named zones
 *   Drag-to-dim · Floating pill · Manual-control dots
 *   Adaptive-lighting toggle · Per-entity cooldown
 *
 * Config options:
 *   entities:         [string[]]   Light entity IDs (groups auto-expand)
 *   zones:            [object[]]   Rich per-entity: {entity, name, icon}
 *   name:             string       Card title (default: "Lighting")
 *   subtitle:         string       Optional static subtitle override
 *   primary_entity:   string       Entity for info-tile tap (hass-more-info)
 *   adaptive_entity:  string       Adaptive Lighting switch entity
 *   layout:           'grid'|'scroll'   Layout mode (default: grid)
 *   columns:          2-5          Grid columns (default: 3)
 *   rows:             'auto'|2-6   Max visible rows in grid (default: auto)
 *   scroll_rows:      1-3          Rows in scroll mode (default: 2)
 *   tile_size:        'compact'|'standard'|'large'  Tile density preset (default: standard)
 *   surface:          'card'|'section'  Surface architecture (default: card)
 *   expand_groups:    boolean      Expand group entities into member lights (default: true)
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, TOKENS_MIDNIGHT,
  RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';
import './tunet_info_tile.js';
import './tunet_control_button.js';

const CARD_VERSION = '3.3.0';

/* ═══════════════════════════════════════════════════════════════
   CSS – Shared base + card-specific overrides
   ═══════════════════════════════════════════════════════════════ */

const LIGHTING_STYLES = `
${TOKENS}
${TOKENS_MIDNIGHT}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* ── Lighting-specific token overrides ──────── */
  :host {
    /* Mockup parity geometry */
    --r-track: 999px;
    --r-tile: 22px;
  }

  :host(.dark) {
    /* Warmer amber accent (overrides TOKENS_MIDNIGHT 0.12/0.25) */
    --amber-fill: rgba(251,191,36, 0.18);
    --amber-border: rgba(251,191,36, 0.32);

    /* Slightly brighter muted text (overrides TOKENS_MIDNIGHT 0.40) */
    --text-muted: rgba(248,250,252, 0.45);
  }

  /* ── Card surface overrides ─────────────────── */
  .card {
    width: 100%;
    max-width: 100%;
    overflow: visible;
  }

  /* ── Card state tint (Design Language §3.3) ─── */
  .card[data-any-on="true"] {
    border-color: rgba(212,133,10, 0.14);
  }
  :host(.dark) .card[data-any-on="true"] {
    border-color: rgba(251,191,36, 0.22);
  }

  /* ═══════════════════════════════════════════════════
     SECTION SURFACE (alternative container mode)
     surface: 'section' config option
     ═══════════════════════════════════════════════════ */
  :host([surface="section"]) .card {
    --r-card: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host(.dark[surface="section"]) .card {
    background: var(--section-bg);
    border-color: var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host([surface="section"]) .card::before {
    border-radius: var(--r-section);
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.40),
      rgba(255,255,255, 0.06) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.14));
  }
  :host(.dark[surface="section"]) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.10),
      rgba(255,255,255, 0.02) 40%,
      rgba(255,255,255, 0.005) 60%,
      rgba(255,255,255, 0.06));
  }

  /* ═══════════════════════════════════════════════════
     HEADER (Design Language §5)
     Info tile + spacer + toggles + selector
     ═══════════════════════════════════════════════════ */
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .hdr tunet-info-tile {
    flex: 0 1 auto;
    min-width: 0;
  }

  /* Spacer (§5.5) */
  .hdr-spacer { flex: 1; }

  /* ── Pagination Dots (scroll mode) ───────────────── */
  .header-dots {
    display: none;
    gap: 5px;
    padding: 6px 10px;
    background: var(--track-bg);
    border-radius: var(--r-pill);
    align-items: center;
  }
  :host([layout="scroll"]) .header-dots { display: flex; }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    opacity: 0.3;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dot.active {
    width: 14px;
    border-radius: var(--r-pill);
    opacity: 1;
    background: var(--amber);
  }

  /* ── Toggle Button (§5.6) – Adaptive lighting ────── */
  .toggle-wrap {
    position: relative;
    display: inline-flex;
  }
  .toggle-wrap[hidden] { display: none !important; }
  #adaptiveBtn {
    width: 42px;
  }

  /* Manual count badge on adaptive toggle */
  .manual-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--red);
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: var(--r-pill);
    text-align: center;
    line-height: 18px;
    padding: 0 4px;
    display: none;
    letter-spacing: 0.3px;
  }
  .toggle-wrap.has-manual .manual-badge { display: inline-flex; }

  /* ── Selector Button (§5.7) – All Off ────────────── */
  #allOffBtn { flex: 0 0 auto; }

  /* ═══════════════════════════════════════════════════
     TILE GRID (Design Language §3.5)
     ═══════════════════════════════════════════════════ */

  /* Standard grid layout */
  .light-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    grid-auto-rows: var(--grid-row, 124px);
    gap: 10px;
    width: 100%;
    min-width: 0;
    overflow-y: visible;
  }

  /* Max rows constraint (grid mode) */
  :host([data-max-rows]) .light-grid {
    max-height: calc(var(--max-rows) * var(--grid-row, 124px) + (var(--max-rows) - 1) * 10px);
    overflow: hidden;
  }

  /* Scroll layout overrides */
  :host([layout="scroll"]) .light-grid {
    grid-template-columns: unset;
    grid-template-rows: repeat(var(--scroll-rows, 2), 1fr);
    grid-auto-flow: column;
    grid-auto-columns: calc(32% - 10px);
    overflow-x: auto;
    overflow-y: visible;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 4px;
    row-gap: 14px;
    padding-bottom: 8px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  :host([layout="scroll"]) .light-grid::-webkit-scrollbar { display: none; }

  /* ═══════════════════════════════════════════════════
     LIGHT TILE (Design Language §3.5 Tile Surface)
     ═══════════════════════════════════════════════════ */
  .l-tile {
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    border: 1px solid var(--border-ghost);
    overflow: visible;
    min-height: 0;
    height: 100%;
    transition:
      transform var(--motion-ui) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      background-color var(--motion-surface) var(--ease-standard);
  }

  /* Compact tile variant */
  :host([tile-size="compact"]) .l-tile {
    padding: 8px 6px 16px;
  }
  :host([tile-size="large"]) .l-tile {
    padding: 12px 10px 18px;
  }

  /* Scroll layout tile additions */
  :host([layout="scroll"]) .l-tile {
    scroll-snap-align: start;
    touch-action: pan-y;
  }

  /* Focus visible on tiles */
  .l-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* ── Off State ───────────────────────────────────── */
  .l-tile.off { opacity: 1; }
  .l-tile.off .tile-icon-wrap {
    background: var(--gray-ghost);
    color: var(--text-muted);
    border: 1px solid transparent;
  }
  .l-tile.off .zone-name { color: var(--text-sub); }
  .l-tile.off .zone-val { color: var(--text-sub); opacity: 0.5; }
  .l-tile.off .progress-fill { opacity: 0; }

  /* ── Unavailable State ───────────────────────────── */
  .l-tile.unavailable {
    opacity: 0.38;
    filter: saturate(0.45);
  }
  .l-tile.unavailable .tile-icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
    border: 1px solid transparent;
  }
  .l-tile.unavailable .zone-val {
    color: var(--text-muted);
    opacity: 0.9;
  }

  /* ── On State ────────────────────────────────────── */
  .l-tile.on { border-color: var(--amber-border); }
  .l-tile.on .tile-icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border: 1px solid var(--amber-border);
  }
  .l-tile.on .zone-val { color: var(--amber); }
  .l-tile.on .progress-fill { background: rgba(212,133,10, 0.90); }
  :host(.dark) .l-tile.on .progress-fill { background: rgba(251,191,36, 0.90); }
  .l-tile.on .tile-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* ── Sliding State (drag active) ─────────────────── */
  .l-tile.sliding {
    transform: scale(var(--drag-scale));
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--amber) !important;
    transition: none;
  }

  /* Floating pill – .zone-val repositions during slide */
  .l-tile.sliding .zone-val {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--amber);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.2px;
    background: var(--tile-bg);
    padding: 6px 20px;
    border-radius: var(--r-pill);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 101;
    border: 1px solid rgba(255,255,255,0.1);
    opacity: 1;
    white-space: nowrap;
  }

  .l-tile.sliding .progress-track { height: 6px; }

  /* ── Tile Content ────────────────────────────────── */
  .tile-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: var(--r-tile);
    display: grid;
    place-items: center;
    margin-bottom: 6px;
    transition: all .2s ease;
  }

  .zone-name {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
    color: var(--text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
    line-height: 1.15;
    margin-bottom: 1px;
  }

  .zone-val {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1px;
    transition: color .2s;
    font-variant-numeric: tabular-nums;
  }

  /* ── Progress Track (bottom inset) ───────────────── */
  .progress-track {
    position: absolute;
    bottom: 10px;
    left: 14px;
    right: 14px;
    height: 4px;
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
    transition: height .2s ease;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    background: var(--text-sub);
    transition: width .1s ease-out;
    border-radius: var(--r-track);
  }

  /* ── Manual Override Dot ──────────────────────────── */
  .manual-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: var(--red);
    border-radius: 50%;
    display: none;
    box-shadow: var(--glow-manual);
  }
  .l-tile[data-manual="true"] .manual-dot { display: block; }

  /* ═══════════════════════════════════════════════════
     ACCESSIBILITY (Design Language §11)
     ═══════════════════════════════════════════════════ */
${REDUCED_MOTION}

  /* ═══════════════════════════════════════════════════
     RESPONSIVE (Design Language §4.6)
     ═══════════════════════════════════════════════════ */
  @media (max-width: 440px) {
    .card {
      padding: 16px;
      --r-track: 999px;
    }
    .light-grid { gap: 8px; }
    .l-tile { min-height: 88px; }

    :host([layout="scroll"]) .light-grid {
      grid-auto-columns: calc(44% - 6px);
      scroll-padding-left: 0;
    }

    :host([surface="section"]) .card {
      --r-card: 28px;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const LIGHTING_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card">

      <!-- Header (Design Language §5) -->
      <div class="hdr">

        <!-- Info Tile (§5.2) -->
        <tunet-info-tile id="infoTile"></tunet-info-tile>

        <!-- Spacer -->
        <div class="hdr-spacer"></div>

        <!-- Pagination dots (scroll mode only) -->
        <div class="header-dots" id="headerDots"></div>

        <!-- Adaptive Lighting Toggle (§5.6) -->
        <div class="toggle-wrap" id="adaptiveWrap">
          <tunet-control-button id="adaptiveBtn"></tunet-control-button>
          <span class="manual-badge" id="manualBadge">0</span>
        </div>

        <!-- All Off Button (§5.7) -->
        <tunet-control-button id="allOffBtn"></tunet-control-button>

      </div>

      <!-- Tile Grid -->
      <div class="light-grid" id="lightGrid"></div>

    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetLightingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._resolvedZones = [];  // [{entity, name, icon}, ...]
    this._tiles = {};
    this._dragState = null;
    this._serviceCooldown = {};
    this._cooldownTimers = {};

    injectFonts();

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);
    this._onPointerCancel = this._onPointerCancel.bind(this);
  }

  /* ═══════════════════════════════════════════════════
     CONFIG – Declarative schema (Design Language §13)
     ═══════════════════════════════════════════════════ */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entities',
          selector: { entity: { multiple: true, filter: [{ domain: 'light' }] } },
        },
        { name: 'name',            selector: { text: {} } },
        { name: 'primary_entity',  selector: { entity: { filter: [{ domain: 'light' }] } } },
        { name: 'adaptive_entity', selector: { entity: { filter: [{ domain: 'switch' }, { domain: 'automation' }, { domain: 'input_boolean' }] } } },
        { name: 'surface',         selector: { select: { options: ['card', 'section'] } } },
        { name: 'layout',          selector: { select: { options: ['grid', 'scroll'] } } },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns',     selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
            { name: 'scroll_rows', selector: { number: { min: 1, max: 3, step: 1, mode: 'box' } } },
          ],
        },
        {
          name: '', type: 'grid', schema: [
            { name: 'rows',        selector: { text: {} } },
            { name: 'tile_size',   selector: { select: { options: ['standard', 'compact', 'large'] } } },
            { name: 'expand_groups', selector: { boolean: {} } },
          ],
        },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => ({
        entities:        'Light Entities (groups auto-expand)',
        name:            'Card Title',
        primary_entity:  'Primary Entity (info tile tap)',
        adaptive_entity: 'Adaptive Lighting Switch',
        surface:         'Surface Style',
        layout:          'Layout Mode',
        columns:         'Grid Columns',
        rows:            'Max Rows (auto or number)',
        scroll_rows:     'Scroll Rows',
        tile_size:       'Tile Size',
        expand_groups:   'Expand Group Entities',
        custom_css:      'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .light-grid, .l-tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { entities: [], name: 'Lighting' };
  }

  setConfig(config) {
    const legacyEntities = [];
    if ((!Array.isArray(config.entities) || config.entities.length === 0) && config.light_group) {
      legacyEntities.push(config.light_group);
    }
    const legacyZones = [];
    if ((!Array.isArray(config.zones) || config.zones.length === 0) && config.light_overrides) {
      for (const [entity, override] of Object.entries(config.light_overrides)) {
        legacyZones.push({
          entity,
          name: override && override.name ? override.name : null,
          icon: override && override.icon ? override.icon : null,
        });
      }
    }

    const normalizedEntities = Array.isArray(config.entities)
      ? config.entities.filter(Boolean)
      : legacyEntities;
    const normalizedZones = Array.isArray(config.zones)
      ? config.zones.filter(Boolean)
      : legacyZones;

    // Support three entity patterns:
    // 1. zones: [{entity, name, icon}, ...]  (rich per-entity)
    // 2. entities: [string, ...]  (simple list + group expansion)
    // 3. Both can be mixed
    const hasZones = normalizedZones.length > 0;
    const hasEntities = normalizedEntities.length > 0;

    if (!hasZones && !hasEntities) {
      throw new Error('Define at least one entity via "entities"/"zones" or legacy "light_group"/"light_overrides"');
    }

    const asFinite = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };
    const columns = Math.max(2, Math.min(5, Math.round(asFinite(config.columns, 3))));
    const scrollRows = Math.max(1, Math.min(3, Math.round(asFinite(config.scroll_rows, 2))));
    const layout = config.layout === 'scroll' ? 'scroll' : 'grid';
    const surface = config.surface === 'section' ? 'section' : 'card';
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const expandGroups = config.expand_groups !== false;
    const rows = config.rows === 'auto' || config.rows == null
      ? null
      : (() => {
          const parsed = asFinite(config.rows, 0);
          if (parsed <= 0) return null;
          return Math.max(1, Math.min(6, Math.round(parsed)));
        })();

    this._config = {
      entities:        hasEntities ? normalizedEntities : [],
      zones:           hasZones ? normalizedZones : [],
      name:            config.name || 'Lighting',
      subtitle:        config.subtitle || '',
      primary_entity:  config.primary_entity || '',
      adaptive_entity: config.adaptive_entity || '',
      columns,
      layout,
      scroll_rows:     scrollRows,
      surface,
      tile_size:       tileSize,
      expand_groups:   expandGroups,
      rows,
      custom_css:      config.custom_css || '',
    };

    // Host attributes for CSS layout switching
    if (layout === 'scroll') {
      this.setAttribute('layout', 'scroll');
    } else {
      this.removeAttribute('layout');
    }

    if (surface === 'section') {
      this.setAttribute('surface', 'section');
    } else {
      this.removeAttribute('surface');
    }

    if (tileSize === 'compact' || tileSize === 'large') this.setAttribute('tile-size', tileSize);
    else this.removeAttribute('tile-size');

    if (rows) {
      this.setAttribute('data-max-rows', rows);
      this.style.setProperty('--max-rows', rows);
    } else {
      this.removeAttribute('data-max-rows');
    }

    if (this._rendered && this._hass) {
      this._resolveZones();
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ═══════════════════════════════════════════════════
     HA STATE
     ═══════════════════════════════════════════════════ */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._resolveZones();
      this._buildGrid();
      this._setupListeners();
      this._rendered = true;
    }

    // Dark mode detection (Design Language §12.1)
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateAll();
    }
  }

  _entitiesChanged(oldH, newH) {
    for (const zone of this._resolvedZones) {
      if (oldH.states[zone.entity] !== newH.states[zone.entity]) return true;
    }
    const ae = this._config.adaptive_entity;
    if (ae && oldH.states[ae] !== newH.states[ae]) return true;
    return false;
  }

  getCardSize() {
    if (this._config.layout === 'scroll') {
      return Math.max(2, 1 + (this._config.scroll_rows || 2) * 2);
    }
    const computedRows = Math.ceil(this._resolvedZones.length / (this._config.columns || 3));
    const visibleRows = this._config.rows || computedRows;
    return Math.max(2, 2 + visibleRows * 2);
  }

  /* ═══════════════════════════════════════════════════
     ZONE RESOLUTION – Three entity patterns
     ═══════════════════════════════════════════════════ */

  _resolveZones() {
    const zones = [];
    const seen = new Set();

    const addZone = (entity, name, icon) => {
      if (seen.has(entity)) return;
      seen.add(entity);
      zones.push({ entity, name: name || null, icon: icon || null });
    };

    // Pattern 1: Rich per-entity YAML zones
    for (const z of this._config.zones) {
      if (typeof z === 'string') {
        // Simple string in zones array
        this._expandEntity(z, zones, seen);
      } else if (z && z.entity) {
        // Rich zone object – check if it's a group
        const entity = this._hass ? this._hass.states[z.entity] : null;
        if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id &&
            Array.isArray(entity.attributes.entity_id)) {
          // Group – expand with optional name/icon overrides
          for (const memberId of entity.attributes.entity_id) {
            addZone(memberId, null, null);
          }
        } else {
          addZone(z.entity, z.name || null, z.icon || null);
        }
      }
    }

    // Pattern 2: Entity list with group expansion
    for (const id of this._config.entities) {
      this._expandEntity(id, zones, seen);
    }

    this._resolvedZones = zones;
  }

  _expandEntity(id, zones, seen) {
    if (seen.has(id)) return;
    const entity = this._hass ? this._hass.states[id] : null;
    if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id &&
        Array.isArray(entity.attributes.entity_id)) {
      // It's a group – expand to individual members
      for (const memberId of entity.attributes.entity_id) {
        if (!seen.has(memberId)) {
          seen.add(memberId);
          zones.push({ entity: memberId, name: null, icon: null });
        }
      }
    } else {
      seen.add(id);
      zones.push({ entity: id, name: null, icon: null });
    }
  }

  /* ═══════════════════════════════════════════════════
     LIFECYCLE
     ═══════════════════════════════════════════════════ */

  connectedCallback() {
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup',   this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerCancel);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup',   this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerCancel);
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
  }

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  _render() {
    const style = document.createElement('style');
    style.textContent = LIGHTING_STYLES;
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = LIGHTING_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      card:        this.shadowRoot.querySelector('.card'),
      infoTile:    this.shadowRoot.getElementById('infoTile'),
      headerDots:  this.shadowRoot.getElementById('headerDots'),
      adaptiveWrap:this.shadowRoot.getElementById('adaptiveWrap'),
      adaptiveBtn: this.shadowRoot.getElementById('adaptiveBtn'),
      manualBadge: this.shadowRoot.getElementById('manualBadge'),
      allOffBtn:   this.shadowRoot.getElementById('allOffBtn'),
      lightGrid:   this.shadowRoot.getElementById('lightGrid'),
    };
  }

  _buildGrid() {
    const grid = this.$.lightGrid;
    if (!grid) return;
    grid.innerHTML = '';

    // Refresh custom CSS on rebuild (covers config editor changes)
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    // Set CSS custom properties
    grid.style.setProperty('--cols', this._config.columns);
    grid.style.setProperty('--scroll-rows', this._config.scroll_rows);
    const rowHeight = this._config.tile_size === 'compact'
      ? '96px'
      : (this._config.tile_size === 'large' ? '136px' : '116px');
    grid.style.setProperty('--grid-row', rowHeight);

    for (const zone of this._resolvedZones) {
      const tile = document.createElement('div');
      tile.className = 'l-tile off';
      tile.dataset.entity = zone.entity;
      tile.dataset.brightness = '0';
      tile.setAttribute('role', 'slider');
      tile.setAttribute('aria-label', this._zoneName(zone));
      tile.setAttribute('aria-valuemin', '0');
      tile.setAttribute('aria-valuemax', '100');
      tile.setAttribute('aria-valuenow', '0');
      tile.setAttribute('tabindex', '0');

      tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="tile-icon-wrap">
          <span class="icon icon-20">${this._zoneIcon(zone)}</span>
        </div>
        <div class="zone-name">${this._zoneName(zone)}</div>
        <div class="zone-val">Off</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:0%"></div>
        </div>
      `;

      grid.appendChild(tile);
    }

    // Cache tile refs for fast updates
    this._tiles = {};
    grid.querySelectorAll('.l-tile').forEach(tile => {
      this._tiles[tile.dataset.entity] = {
        el:     tile,
        icon:   tile.querySelector('.tile-icon-wrap .icon'),
        iconW:  tile.querySelector('.tile-icon-wrap'),
        name:   tile.querySelector('.zone-name'),
        val:    tile.querySelector('.zone-val'),
        fill:   tile.querySelector('.progress-fill'),
      };
    });

    // Build pagination dots for scroll mode
    this._buildDots();
  }

  _buildDots() {
    const dots = this.$.headerDots;
    dots.innerHTML = '';
    if (this._config.layout !== 'scroll') return;

    const totalTiles = this._resolvedZones.length;
    const rows = this._config.scroll_rows;
    const tilesPerPage = rows * 3;
    const pages = Math.max(1, Math.ceil(totalTiles / tilesPerPage));

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dots.appendChild(dot);
    }
  }

  /* ═══════════════════════════════════════════════════
     LISTENERS
     ═══════════════════════════════════════════════════ */

  _setupListeners() {
    // Header primitives are event-only emitters; composer handles dispatch.
    this.$.infoTile.addEventListener('tunet:action', (e) => {
      const action = e.detail?.action || {};
      const entityId = action.entity || this._getInfoEntityId();
      if (entityId) this._openMoreInfo(entityId);
    });

    this.$.allOffBtn.addEventListener('tunet:action', (e) => {
      if (e.detail?.trigger === 'tap') this._allOff();
    });

    this.$.adaptiveBtn.addEventListener('tunet:action', (e) => {
      const trigger = e.detail?.trigger || 'tap';
      if (trigger === 'hold') {
        const entityId = e.detail?.action?.entity || this._config.adaptive_entity || '';
        if (entityId) this._openMoreInfo(entityId);
        return;
      }
      if (trigger === 'tap') this._toggleAdaptive();
    });

    // Tile pointer down (delegated)
    this.$.lightGrid.addEventListener('pointerdown', (e) => {
      const tile = e.target.closest('.l-tile');
      if (!tile) return;
      if (!e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try {
        tile.setPointerCapture(e.pointerId);
      } catch (_) {
        // Some WebViews/Safari contexts can reject capture; fall back to document listeners.
      }

      const pointerType = e.pointerType || 'mouse';
      const isTouch = pointerType === 'touch';

      this._dragState = {
        entity:      tile.dataset.entity,
        startX:      e.clientX,
        startY:      e.clientY,
        startBright: parseInt(tile.dataset.brightness) || 0,
        tileEl:      tile,
        pointerType,
        dragThreshold: isTouch ? 5 : 10,
        axisBias: isTouch ? 2 : 5,
        dragGain: isTouch ? 1.12 : 0.95,
        axisLocked:  false,
        ignoreTap:   false,
        moved:       false,
        pointerId:   e.pointerId,
      };
    });

    // Keyboard on tiles (Design Language §11.3)
    this.$.lightGrid.addEventListener('keydown', (e) => {
      const tile = e.target.closest('.l-tile');
      if (!tile) return;
      const entity = tile.dataset.entity;
      const step = e.shiftKey ? 10 : 5;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        this._setBrightness(entity, Math.min(100, this._getBrightness(entity) + step));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        this._setBrightness(entity, Math.max(0, this._getBrightness(entity) - step));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._toggleLight(entity);
      }
    });

    // Scroll sync for pagination dots
    if (this._config.layout === 'scroll') {
      this.$.lightGrid.addEventListener('scroll', () => {
        const grid = this.$.lightGrid;
        const dots = this.$.headerDots.querySelectorAll('.dot');
        if (!dots.length) return;
        const scrollMax = grid.scrollWidth - grid.clientWidth;
        if (scrollMax <= 0) return;
        const pct = grid.scrollLeft / scrollMax;
        const idx = Math.round(pct * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     POINTER HANDLERS – Horizontal drag-to-dim
     Threshold + axis lock to avoid accidental toggles on touch/desktop
     ═══════════════════════════════════════════════════ */

  _onPointerMove(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    if (ds.pointerId !== e.pointerId) return;

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!ds.axisLocked) {
      if (absDx < ds.dragThreshold && absDy < ds.dragThreshold) return;

      // Vertical intent: don't treat as tap/toggle fallback.
      if (absDy > absDx + ds.axisBias) {
        ds.ignoreTap = true;
        this._dragState = null;
        return;
      }

      ds.axisLocked = true;
    }

    if (!ds.moved && absDx < ds.dragThreshold) return;

    if (!ds.moved) {
      ds.moved = true;
      ds.tileEl.classList.add('sliding');
      document.body.style.cursor = 'grabbing';
      if (this._config.layout === 'scroll') this.$.lightGrid.style.scrollSnapType = 'none';
    }

    // Map horizontal movement to brightness change
    if (e.cancelable) e.preventDefault();
    const width = Math.max(ds.tileEl.offsetWidth, 1);
    const dragRange = ds.pointerType === 'touch'
      ? Math.max(width * 0.82, 110)
      : Math.max(width * 1.20, 185);
    const change = (dx / dragRange) * 100 * ds.dragGain;
    const newBrt = Math.round(Math.max(0, Math.min(100, ds.startBright + change)));
    if (newBrt === ds.currentBright) return;

    // Optimistic UI update (no transition during drag)
    const refs = this._tiles[ds.entity];
    if (!refs) return;

    refs.fill.style.transition = 'none';
    refs.fill.style.width = newBrt + '%';
    refs.val.textContent = newBrt > 0 ? newBrt + '%' : 'Off';

    if (newBrt > 0) {
      refs.el.classList.remove('off');
      refs.el.classList.add('on');
    } else {
      refs.el.classList.remove('on');
      refs.el.classList.add('off');
    }

    refs.el.dataset.brightness = newBrt;
    refs.el.setAttribute('aria-valuenow', newBrt);
    refs.el.setAttribute('aria-valuetext', newBrt > 0 ? newBrt + ' percent' : 'Off');
    ds.currentBright = newBrt;
  }

  _onPointerUp(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    if (ds.pointerId !== e.pointerId) return;
    this._finishDrag(ds, {
      commit: ds.moved && ds.currentBright !== undefined,
      toggleTap: !ds.moved && !ds.ignoreTap,
    });
  }

  _onPointerCancel(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    if (ds.pointerId !== e.pointerId) return;
    this._finishDrag(ds, { commit: false, toggleTap: false });
  }

  _finishDrag(ds, { commit, toggleTap }) {
    const refs = this._tiles[ds.entity];

    if (refs) {
      refs.el.classList.remove('sliding');
      refs.fill.style.transition = '';
      try {
        refs.el.releasePointerCapture(ds.pointerId);
      } catch (_) {
        // Ignore release failures on environments without active capture.
      }
    }

    // Reset cursor
    document.body.style.cursor = '';

    // Restore scroll snapping in scroll mode
    if (this._config.layout === 'scroll') this.$.lightGrid.style.scrollSnapType = 'x mandatory';

    if (commit) {
      // Drag completed – set brightness
      this._setBrightness(ds.entity, ds.currentBright);
    } else if (toggleTap) {
      // Tap – toggle on/off
      this._toggleLight(ds.entity);
    }

    this._dragState = null;
  }

  /* ═══════════════════════════════════════════════════
     STATE HELPERS
     ═══════════════════════════════════════════════════ */

  _getEntity(id) { return this._hass ? this._hass.states[id] : null; }

  _getInfoEntityId() {
    return this._config.primary_entity ||
      (this._config.entities.length > 0 ? this._config.entities[0] : '') ||
      (this._resolvedZones.length > 0 ? this._resolvedZones[0].entity : '');
  }

  _openMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }

  _getBrightness(id) {
    const e = this._getEntity(id);
    if (!e || e.state !== 'on') return 0;
    const b = e.attributes.brightness;
    return b != null ? Math.round((b / 255) * 100) : 100;
  }

  _friendlyName(id) {
    const e = this._getEntity(id);
    if (e && e.attributes.friendly_name) return e.attributes.friendly_name;
    const raw = id.split('.').pop().replace(/_/g, ' ');
    return raw.replace(/\b\w/g, c => c.toUpperCase());
  }

  _zoneName(zone) {
    if (zone.name) return zone.name;
    return this._friendlyName(zone.entity);
  }

  _normalizeIcon(icon) {
    if (!icon) return 'lightbulb';
    const raw = String(icon).replace(/^mdi:/, '').trim();
    const map = {
      light_group: 'lightbulb',
      shelf_auto: 'shelves',
      countertops: 'kitchen',
      desk_lamp: 'desk',
      table_lamp: 'lamp',
      floor_lamp: 'lamp',
    };
    const resolved = map[raw] || raw;
    if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
    return resolved;
  }

  _zoneIcon(zone) {
    if (zone.icon) return this._normalizeIcon(zone.icon);
    return this._normalizeIcon(this._entityIcon(zone.entity));
  }

  _entityIcon(id) {
    const e = this._getEntity(id);
    if (e && e.attributes.icon) {
      const map = {
        'mdi:ceiling-light':       'light',
        'mdi:lamp':                'lamp',
        'mdi:floor-lamp':          'lamp',
        'mdi:floor-lamp-outline':  'lamp',
        'mdi:desk-lamp':           'desk',
        'mdi:lightbulb':           'lightbulb',
        'mdi:lightbulb-group':     'lightbulb',
        'mdi:led-strip':           'highlight',
        'mdi:light-recessed':      'fluorescent',
        'mdi:wall-sconce':         'wall_lamp',
        'mdi:wall-sconce-round-variant': 'wall_lamp',
        'mdi:chandelier':          'lightbulb',
        'mdi:track-light':         'highlight',
        'mdi:outdoor-lamp':        'deck',
        'mdi:heat-wave':           'highlight',
      };
      if (map[e.attributes.icon]) return map[e.attributes.icon];
    }
    return 'lightbulb';
  }

  /* ── Manual Control Detection ───────────────────── */

  _getManuallyControlled() {
    const ae = this._config.adaptive_entity;
    if (!ae) return [];
    const entity = this._getEntity(ae);
    if (!entity || !entity.attributes) return [];
    return entity.attributes.manual_control || [];
  }

  /* ═══════════════════════════════════════════════════
     SERVICE CALLS
     ═══════════════════════════════════════════════════ */

  _callService(domain, service, data) {
    if (!this._hass) return Promise.resolve();
    try {
      const result = this._hass.callService(domain, service, data);
      if (result && typeof result.then === 'function') return result;
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  _setCooldown(id) {
    this._serviceCooldown[id] = true;
    clearTimeout(this._cooldownTimers[id]);
    this._cooldownTimers[id] = setTimeout(() => {
      this._serviceCooldown[id] = false;
    }, 1500);
  }

  _toggleLight(id) {
    const next = this._getBrightness(id) > 0 ? 0 : 100;
    this._setBrightness(id, next);
  }

  _setBrightness(id, pct) {
    this._setCooldown(id);
    const refs = this._tiles[id];
    if (refs) this._updateTileUI(refs, pct);

    const request = pct === 0
      ? this._callService('light', 'turn_off', { entity_id: id })
      : this._callService('light', 'turn_on', { entity_id: id, brightness_pct: pct });

    request.catch(() => this._updateAll());
  }

  _allOff() {
    const entityIds = this._resolvedZones.map(zone => zone.entity).filter(Boolean);
    if (!entityIds.length) return;

    for (const entityId of entityIds) {
      this._setCooldown(entityId);
      const refs = this._tiles[entityId];
      if (refs) this._updateTileUI(refs, 0);
    }

    this._callService('light', 'turn_off', { entity_id: entityIds })
      .catch(() => this._updateAll());
  }

  _toggleAdaptive() {
    const ae = this._config.adaptive_entity;
    if (!ae) return;
    const entity = this._getEntity(ae);
    if (!entity) return;
    const domain = ae.split('.')[0];
    if (domain === 'switch' || domain === 'input_boolean') {
      this._callService('homeassistant', 'toggle', { entity_id: ae });
    } else if (domain === 'automation') {
      this._callService('automation', 'toggle', { entity_id: ae });
    }
  }

  /* ═══════════════════════════════════════════════════
     TILE UI HELPER
     ═══════════════════════════════════════════════════ */

  _updateTileUI(refs, brt) {
    refs.el.dataset.brightness = brt;
    refs.fill.style.width = brt + '%';
    refs.val.textContent = brt > 0 ? brt + '%' : 'Off';
    refs.el.classList.toggle('on',  brt > 0);
    refs.el.classList.toggle('off', brt <= 0);
    refs.el.setAttribute('aria-valuenow', brt);
    refs.el.setAttribute('aria-valuetext', brt > 0 ? brt + ' percent' : 'Off');
  }

  /* ═══════════════════════════════════════════════════
     FULL STATE UPDATE
     ═══════════════════════════════════════════════════ */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    const manualList = this._getManuallyControlled();
    let onCount = 0;
    let totalCount = 0;
    let totalBrightness = 0;

    for (const zone of this._resolvedZones) {
      const entity = this._getEntity(zone.entity);
      const refs   = this._tiles[zone.entity];
      if (!refs) continue;

      const isUnavailable = !entity || entity.state === 'unavailable';
      const isOn  = entity && entity.state === 'on';
      const bright = this._getBrightness(zone.entity);

      if (!isUnavailable) {
        totalCount++;
        if (isOn) {
          onCount++;
          totalBrightness += bright;
        }
      }

      if (this._serviceCooldown[zone.entity]) continue;

      if (isUnavailable) {
        refs.el.classList.add('unavailable');
        this._updateTileUI(refs, 0);
        refs.val.textContent = 'Unavailable';
        refs.el.setAttribute('aria-valuetext', 'Unavailable');
        refs.name.textContent = this._zoneName(zone);
        refs.el.dataset.manual = 'false';
        continue;
      }

      refs.el.classList.remove('unavailable');
      this._updateTileUI(refs, isOn ? bright : 0);

      // Update name from zone config or entity
      refs.name.textContent = this._zoneName(zone);

      // Manual dot
      const isManual = manualList.includes(zone.entity);
      refs.el.dataset.manual = isManual ? 'true' : 'false';

    }

    // ── Card-level state attributes ──
    const anyOn = onCount > 0;
    this.$.card.dataset.anyOn = anyOn ? 'true' : 'false';
    this.$.card.dataset.allOff = (onCount === 0 && totalCount > 0) ? 'true' : 'false';

    // ── Subtitle (Design Language §5.4) ──
    const ae = this._config.adaptive_entity;
    const aeEntity = ae ? this._getEntity(ae) : null;
    const aeOn = Boolean(aeEntity && aeEntity.state === 'on');
    const manualCount = manualList.length;
    let subtitleText = this._config.subtitle || '';

    if (this._config.subtitle) {
      subtitleText = this._config.subtitle;
    } else {
      const avgBrt = onCount > 0 ? Math.round(totalBrightness / onCount) : 0;
      const parts = [];

      if (onCount === 0) {
        parts.push('All off');
      } else if (onCount === totalCount) {
        parts.push(`All on \u00b7 ${avgBrt}%`);
      } else {
        parts.push(`${onCount} on \u00b7 ${avgBrt}%`);
      }

      if (aeOn && manualCount > 0) {
        parts.push(`Adaptive \u00b7 ${manualCount} manual`);
      } else if (aeOn) {
        parts.push('Adaptive');
      }

      subtitleText = parts.join(' \u00b7 ');
    }

    const infoEntity = this._getInfoEntityId();

    this.$.infoTile.hass = this._hass;
    this.$.infoTile.setConfig({
      composer_managed: true,
      entity: infoEntity,
      title: this._config.name,
      subtitle: subtitleText,
      icon: 'lightbulb',
      accent: 'amber',
      active: anyOn,
      disabled: !infoEntity,
      tap_action: infoEntity ? { action: 'more-info', entity: infoEntity } : { action: 'none' },
      hold_action: { action: 'none' },
      double_tap_action: { action: 'none' },
    });

    this.$.allOffBtn.hass = this._hass;
    this.$.allOffBtn.setConfig({
      composer_managed: true,
      icon: 'power_settings_new',
      label: 'All Off',
      accent: 'amber',
      active: anyOn,
      disabled: totalCount === 0,
      tap_action: { action: 'all-off' },
      hold_action: { action: 'none' },
      double_tap_action: { action: 'none' },
    });

    // ── Adaptive toggle ──
    if (ae) {
      this.$.adaptiveWrap.hidden = false;
      this.$.adaptiveWrap.classList.toggle('has-manual', manualCount > 0);
      this.$.manualBadge.textContent = String(manualCount);
      this.$.adaptiveBtn.hass = this._hass;
      this.$.adaptiveBtn.setConfig({
        composer_managed: true,
        entity: ae,
        icon: 'auto_awesome',
        label: '',
        accent: 'amber',
        active: aeOn,
        disabled: !aeEntity,
        tap_action: { action: 'adaptive-toggle', entity: ae },
        hold_action: { action: 'more-info', entity: ae },
        double_tap_action: { action: 'none' },
      });
    } else {
      this.$.adaptiveWrap.hidden = true;
      this.$.adaptiveWrap.classList.remove('has-manual');
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-lighting-card', TunetLightingCard, {
  name:             'Tunet Lighting Card',
  description:      'Glassmorphism lighting controller - drag-to-dim, floating pill, adaptive toggle, grid/scroll layout, rich zone config',
  documentationURL: 'https://github.com/tunet/tunet-lighting-card',
});

logCardVersion('TUNET-LIGHTING', CARD_VERSION, '#D4850A');

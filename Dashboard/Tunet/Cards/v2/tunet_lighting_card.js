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
  INFO_TILE_PATTERN, ICON_BUTTON_PATTERN, LABEL_BUTTON_PATTERN,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_light_tile.js';

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
${INFO_TILE_PATTERN}
${ICON_BUTTON_PATTERN}
${LABEL_BUTTON_PATTERN}

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
  /* Info tile active state (any light on) */
  .card[data-any-on="true"] .info-tile {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }

  .card[data-any-on="true"] .entity-icon {
    color: var(--amber);
  }
  .card[data-any-on="true"] .hdr-title {
    color: var(--text);
  }

  /* Title & Subtitle (§5.4) */
  .hdr-sub .amber-ic    { color: var(--amber); }
  .hdr-sub .adaptive-ic { color: var(--text-muted); }
  .card[data-any-on="true"] .hdr-sub .adaptive-ic { color: var(--text); }
  .hdr-sub .red-ic      { color: var(--red); }

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
  .toggle-btn.on {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .toggle-btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .toggle-btn.hidden { display: none; }

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
  .toggle-btn.has-manual .manual-badge { display: inline-flex; }
  .toggle-wrap { position: relative; }

  /* ── Selector Button (§5.7) – All Off ────────────── */
  .selector-btn.active {
    border-color: var(--amber-border);
    color: var(--amber);
    background: var(--amber-fill);
    font-weight: 700;
  }

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
     LIGHT TILE PRIMITIVE HOSTING
     ═══════════════════════════════════════════════════ */
  .light-grid tunet-light-tile {
    display: block;
    height: 100%;
    min-height: 0;
    min-width: 0;
    --lt-height: 100%;
    --lt-aspect-ratio: auto;
    --lt-aspect-ratio-mobile: auto;
  }

  :host([layout="scroll"]) .light-grid tunet-light-tile {
    scroll-snap-align: start;
    touch-action: pan-y;
  }

  :host([tile-size="compact"]) .light-grid tunet-light-tile {
    --icon-size: 40px;
  }

  :host([tile-size="large"]) .light-grid tunet-light-tile {
    --icon-size: 46px;
  }

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
        <div class="info-tile" id="infoTile" tabindex="0"
             role="button" aria-label="Show lighting details">
          <div class="entity-icon" id="entityIcon">
            <span class="icon icon-18" id="entityGlyph">lightbulb</span>
          </div>
          <div class="hdr-text">
            <div class="hdr-title" id="hdrTitle">Lighting</div>
            <div class="hdr-sub" id="hdrSub">All off</div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="hdr-spacer"></div>

        <!-- Pagination dots (scroll mode only) -->
        <div class="header-dots" id="headerDots"></div>

        <!-- Adaptive Lighting Toggle (§5.6) -->
        <div class="toggle-wrap" id="adaptiveWrap">
          <button class="toggle-btn hidden" id="adaptiveBtn"
                  aria-label="Toggle adaptive lighting">
            <span class="icon icon-18">auto_awesome</span>
          </button>
          <span class="manual-badge" id="manualBadge">0</span>
        </div>

        <!-- All Off Button (§5.7) -->
        <button class="selector-btn" id="allOffBtn"
                aria-label="Turn all lights off">
          <span class="icon icon-16">power_settings_new</span>
          <span>All Off</span>
        </button>

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
    this._serviceCooldown = {};
    this._cooldownTimers = {};
    this._adaptivePressTimer = null;
    this._adaptiveLongPress = false;

    injectFonts();
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
            { name: 'tile_variant', selector: { select: { options: ['vertical', 'horizontal'] } } },
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
        tile_variant:    'Tile Orientation',
        expand_groups:   'Expand Group Entities',
        custom_css:      'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .light-grid and tunet-light-tile selectors.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { entities: [], name: 'Lighting' };
  }

  setConfig(config) {
    const normalizedTiles = Array.isArray(config.tiles)
      ? config.tiles.filter(tile => tile && tile.entity)
      : [];

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

    // Support four entity patterns:
    // 0. tiles: [{entity, ...tile options}] (rich primitive config)
    // 1. zones: [{entity, name, icon}, ...]  (rich per-entity)
    // 2. entities: [string, ...]  (simple list + group expansion)
    // 3. Both can be mixed
    const hasTiles = normalizedTiles.length > 0;
    const hasZones = normalizedZones.length > 0;
    const hasEntities = normalizedEntities.length > 0;

    if (!hasTiles && !hasZones && !hasEntities) {
      throw new Error('Define at least one entity via "tiles"/"entities"/"zones" or legacy "light_group"/"light_overrides"');
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
    const tileVariant = config.tile_variant === 'horizontal' ? 'horizontal' : 'vertical';
    const expandGroups = config.expand_groups !== false;
    const rows = config.rows === 'auto' || config.rows == null
      ? null
      : (() => {
          const parsed = asFinite(config.rows, 0);
          if (parsed <= 0) return null;
          return Math.max(1, Math.min(6, Math.round(parsed)));
        })();

    this._config = {
      tiles:           hasTiles ? normalizedTiles : [],
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
      tile_variant:    tileVariant,
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
    const tracked = new Set();
    for (const zone of this._resolvedZones) {
      tracked.add(zone.entity);

      const opts = zone.options || {};
      if (opts.brightness_entity) tracked.add(opts.brightness_entity);
      if (opts.manual_entity) tracked.add(opts.manual_entity);

      this._collectConditionEntities(opts.show_when, tracked, zone.entity);
      this._collectConditionEntities(opts.sub_button?.show_when, tracked, zone.entity);
    }

    if (this._config.adaptive_entity) tracked.add(this._config.adaptive_entity);

    for (const entityId of tracked) {
      if (oldH.states[entityId] !== newH.states[entityId]) return true;
    }

    return false;
  }

  _collectConditionEntities(condition, sink, fallbackEntity = '') {
    if (!condition) return;
    if (typeof condition === 'string') {
      if (fallbackEntity) sink.add(fallbackEntity);
      return;
    }
    if (Array.isArray(condition)) {
      for (const child of condition) this._collectConditionEntities(child, sink, fallbackEntity);
      return;
    }
    if (typeof condition !== 'object') return;
    if (condition.entity) sink.add(condition.entity);
    if (Array.isArray(condition.and)) {
      for (const child of condition.and) this._collectConditionEntities(child, sink, fallbackEntity);
    }
    if (Array.isArray(condition.or)) {
      for (const child of condition.or) this._collectConditionEntities(child, sink, fallbackEntity);
    }
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
     ZONE RESOLUTION – tiles + zones + entities
     ═══════════════════════════════════════════════════ */

  _resolveZones() {
    const zones = [];
    const seen = new Set();

    const addZone = (entity, name, icon, options = {}) => {
      if (!entity || seen.has(entity)) return;
      seen.add(entity);
      zones.push({
        entity,
        name: name || null,
        icon: icon || null,
        options: options || {},
      });
    };

    // Pattern 0: Primitive tile configs
    for (const tileCfg of this._config.tiles || []) {
      if (!tileCfg || !tileCfg.entity) continue;
      const entityState = this._hass ? this._hass.states[tileCfg.entity] : null;
      const expands = this._config.expand_groups && tileCfg.expand_groups !== false;
      const options = { ...tileCfg };
      delete options.entity;
      delete options.name;
      delete options.icon;
      delete options.expand_groups;

      if (expands && entityState?.attributes?.entity_id && Array.isArray(entityState.attributes.entity_id)) {
        for (const memberId of entityState.attributes.entity_id) {
          addZone(memberId, null, null, options);
        }
      } else {
        addZone(tileCfg.entity, tileCfg.name || null, tileCfg.icon || null, options);
      }
    }

    // Pattern 1: Rich per-entity zones
    for (const zoneCfg of this._config.zones || []) {
      if (typeof zoneCfg === 'string') {
        this._expandEntity(zoneCfg, zones, seen);
        continue;
      }
      if (!zoneCfg || !zoneCfg.entity) continue;
      const entity = this._hass ? this._hass.states[zoneCfg.entity] : null;
      const options = { ...zoneCfg };
      delete options.entity;
      delete options.name;
      delete options.icon;

      if (this._config.expand_groups && entity?.attributes?.entity_id && Array.isArray(entity.attributes.entity_id)) {
        for (const memberId of entity.attributes.entity_id) {
          addZone(memberId, null, null, options);
        }
      } else {
        addZone(zoneCfg.entity, zoneCfg.name || null, zoneCfg.icon || null, options);
      }
    }

    // Pattern 2: Entity list with group expansion
    for (const id of this._config.entities || []) {
      this._expandEntity(id, zones, seen);
    }

    this._resolvedZones = zones;
  }

  _expandEntity(id, zones, seen, options = {}) {
    if (seen.has(id)) return;
    const entity = this._hass ? this._hass.states[id] : null;
    if (this._config.expand_groups && entity?.attributes?.entity_id && Array.isArray(entity.attributes.entity_id)) {
      for (const memberId of entity.attributes.entity_id) {
        if (!seen.has(memberId)) {
          seen.add(memberId);
          zones.push({ entity: memberId, name: null, icon: null, options: { ...options } });
        }
      }
    } else {
      seen.add(id);
      zones.push({ entity: id, name: null, icon: null, options: { ...options } });
    }
  }

  /* ═══════════════════════════════════════════════════
     LIFECYCLE
     ═══════════════════════════════════════════════════ */

  connectedCallback() {}

  disconnectedCallback() {
    clearTimeout(this._adaptivePressTimer);
    this._adaptivePressTimer = null;
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
      entityIcon:  this.shadowRoot.getElementById('entityIcon'),
      entityGlyph: this.shadowRoot.getElementById('entityGlyph'),
      hdrTitle:    this.shadowRoot.getElementById('hdrTitle'),
      hdrSub:      this.shadowRoot.getElementById('hdrSub'),
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

    this._tiles = {};

    for (const zone of this._resolvedZones) {
      const tile = document.createElement('tunet-light-tile');
      tile.className = 'l-tile';
      tile.dataset.entity = zone.entity;
      tile.setConfig(this._tileConfigForZone(zone, false));
      tile.hass = this._hass;
      grid.appendChild(tile);
      this._tiles[zone.entity] = { el: tile, zone };
    }

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
    // Info tile – fires hass-more-info (Design Language §11.2)
    this.$.infoTile.addEventListener('click', () => {
      const entityId = this._config.primary_entity ||
                       (this._config.tiles.length > 0 ? this._config.tiles[0].entity : '') ||
                       (this._config.entities.length > 0 ? this._config.entities[0] : '') ||
                       (this._resolvedZones.length > 0 ? this._resolvedZones[0].entity : '');
      if (!entityId) return;
      this._openMoreInfo(entityId);
    });

    // All Off button
    this.$.allOffBtn.addEventListener('click', () => this._allOff());

    // Adaptive toggle + long-press more-info
    this.$.adaptiveBtn.addEventListener('pointerdown', () => {
      clearTimeout(this._adaptivePressTimer);
      this._adaptiveLongPress = false;
      this._adaptivePressTimer = setTimeout(() => {
        clearTimeout(this._adaptivePressTimer);
        this._adaptivePressTimer = null;
        const entityId = this._config.adaptive_entity;
        if (!entityId) return;
        this._adaptiveLongPress = true;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId },
        }));
      }, 500);
    });
    const clearAdaptivePress = () => {
      clearTimeout(this._adaptivePressTimer);
      this._adaptivePressTimer = null;
    };
    this.$.adaptiveBtn.addEventListener('pointerup', clearAdaptivePress);
    this.$.adaptiveBtn.addEventListener('pointercancel', clearAdaptivePress);
    this.$.adaptiveBtn.addEventListener('pointerleave', clearAdaptivePress);
    this.$.adaptiveBtn.addEventListener('click', (e) => {
      if (this._adaptiveLongPress) {
        e.preventDefault();
        e.stopPropagation();
        this._adaptiveLongPress = false;
        return;
      }
      this._toggleAdaptive();
    });

    this.$.lightGrid.addEventListener('tunet:value-commit', (e) => {
      const entityId = e.detail?.entity_id;
      const value = Number(e.detail?.value);
      if (!entityId || !Number.isFinite(value)) return;
      this._setBrightness(entityId, Math.max(0, Math.min(100, Math.round(value))));
    });

    this.$.lightGrid.addEventListener('tunet:action', (e) => {
      const action = e.detail?.action || null;
      const entityId = e.detail?.entity_id || action?.entity_id || '';
      if (!action) return;

      const type = action.action || 'more-info';
      if (type === 'toggle') {
        if (entityId) this._toggleLight(entityId);
        return;
      }

      if (type === 'more-info') {
        if (entityId) this._openMoreInfo(entityId);
        return;
      }

      dispatchAction(this._hass, this, action, entityId).catch(() => this._updateAll());
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
     STATE HELPERS
     ═══════════════════════════════════════════════════ */

  _getEntity(id) { return this._hass ? this._hass.states[id] : null; }

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

  _openMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }

  _isTruthyState(entityId) {
    const entity = this._getEntity(entityId);
    if (!entity) return false;
    const value = String(entity.state || '').toLowerCase();
    return value === 'on' || value === 'true' || value === 'active' || value === 'home' || value === 'open';
  }

  _isManualForZone(zone, adaptiveManualSet) {
    const opts = zone.options || {};
    if (typeof opts.manual_active === 'boolean') return opts.manual_active;
    if (opts.manual_entity) return this._isTruthyState(opts.manual_entity);
    return adaptiveManualSet.has(zone.entity);
  }

  _tileConfigForZone(zone, manualActive) {
    const opts = zone.options || {};
    return {
      composer_managed: true,
      entity: zone.entity,
      name: opts.name || this._zoneName(zone),
      icon: opts.icon || this._zoneIcon(zone),
      variant: opts.variant === 'horizontal' ? 'horizontal' : this._config.tile_variant,
      accent: opts.accent || 'amber',
      icon_container: opts.icon_container,
      show_progress: opts.show_progress !== false,
      show_value: opts.show_value !== false,
      show_when: opts.show_when || null,
      brightness_entity: opts.brightness_entity || '',
      manual_entity: opts.manual_entity || '',
      manual_active: typeof manualActive === 'boolean' ? manualActive : null,
      show_manual: opts.show_manual !== false,
      tap_action: opts.tap_action || { action: 'toggle', entity_id: zone.entity },
      hold_action: opts.hold_action || { action: 'more-info', entity_id: zone.entity },
      double_tap_action: opts.double_tap_action || null,
      sub_button: opts.sub_button || null,
    };
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
    const next = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    this._setCooldown(id);

    const request = next === 0
      ? this._callService('light', 'turn_off', { entity_id: id })
      : this._callService('light', 'turn_on', { entity_id: id, brightness_pct: next });

    request.catch(() => {
      this._serviceCooldown[id] = false;
      this._updateAll();
    });
  }

  _allOff() {
    const entityIds = this._resolvedZones.map(zone => zone.entity).filter(Boolean);
    if (!entityIds.length) return;

    for (const entityId of entityIds) {
      this._setCooldown(entityId);
    }

    this._callService('light', 'turn_off', { entity_id: entityIds })
      .catch(() => {
        for (const entityId of entityIds) this._serviceCooldown[entityId] = false;
        this._updateAll();
      });
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
     FULL STATE UPDATE
     ═══════════════════════════════════════════════════ */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    const manualSet = new Set(this._getManuallyControlled());
    let manualCount = 0;
    let onCount = 0;
    let totalCount = 0;
    let totalBrightness = 0;

    for (const zone of this._resolvedZones) {
      const entity = this._getEntity(zone.entity);
      const tileRef = this._tiles[zone.entity];
      const tileEl = tileRef ? tileRef.el : null;
      if (!tileEl) continue;

      const isUnavailable = !entity || entity.state === 'unavailable';
      const isOn  = entity && entity.state === 'on';
      const bright = this._getBrightness(zone.entity);
      const isManual = this._isManualForZone(zone, manualSet);

      if (!isUnavailable) {
        totalCount++;
        if (isOn) {
          onCount++;
          totalBrightness += bright;
        }
      }
      if (isManual) {
        manualCount++;
      }

      if (this._serviceCooldown[zone.entity]) continue;

      const tileConfig = this._tileConfigForZone(zone, isManual);
      tileEl.setConfig(tileConfig);
      tileEl.hass = this._hass;
    }

    // ── Card-level state attributes ──
    const anyOn = onCount > 0;
    this.$.card.dataset.anyOn = anyOn ? 'true' : 'false';
    this.$.card.dataset.allOff = (onCount === 0 && totalCount > 0) ? 'true' : 'false';
    this.$.allOffBtn.classList.toggle('active', anyOn);

    // ── Header icon state (Principle #7: outlined off, filled on) ──
    if (anyOn) {
      this.$.entityGlyph.classList.add('filled');
      this.$.entityIcon.style.color = '';
    } else {
      this.$.entityGlyph.classList.remove('filled');
      this.$.entityIcon.style.color = '';
    }

    // ── Title ──
    this.$.hdrTitle.textContent = this._config.name;

    // ── Subtitle (Design Language §5.4) ──
    if (this._config.subtitle) {
      this.$.hdrSub.innerHTML = this._config.subtitle;
    } else {
      const avgBrt = onCount > 0 ? Math.round(totalBrightness / onCount) : 0;
      const ae = this._config.adaptive_entity;
      const aeEntity = ae ? this._getEntity(ae) : null;
      const aeOn = aeEntity && aeEntity.state === 'on';

      let parts = [];

      if (onCount === 0) {
        parts.push('All off');
      } else if (onCount === totalCount) {
        parts.push(`<span class="amber-ic">All on</span> \u00b7 ${avgBrt}%`);
      } else {
        parts.push(`<span class="amber-ic">${onCount} on</span> \u00b7 ${avgBrt}%`);
      }

      if (aeOn && manualCount > 0) {
        parts.push(`<span class="adaptive-ic">Adaptive</span> \u00b7 <span class="red-ic">${manualCount} manual</span>`);
      } else if (aeOn) {
        parts.push('<span class="adaptive-ic">Adaptive</span>');
      }

      this.$.hdrSub.innerHTML = parts.join(' \u00b7 ');
    }

    // ── Adaptive toggle ──
    const ae = this._config.adaptive_entity;
    if (ae) {
      this.$.adaptiveBtn.classList.remove('hidden');
      const aeEntity = this._getEntity(ae);
      const aeOn = aeEntity && aeEntity.state === 'on';
      this.$.adaptiveBtn.classList.toggle('on', aeOn);
      this.$.adaptiveBtn.setAttribute('aria-pressed', aeOn ? 'true' : 'false');

      // Manual count badge
      this.$.adaptiveBtn.classList.toggle('has-manual', manualCount > 0);
      this.$.manualBadge.textContent = manualCount;
    } else {
      this.$.adaptiveBtn.classList.add('hidden');
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

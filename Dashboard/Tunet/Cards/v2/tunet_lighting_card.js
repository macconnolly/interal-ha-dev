/**
 * Tunet Lighting Card v2 — Thin Composer
 * ──────────────────────────────────────────────────────────────
 * Composes tunet-light-tile primitives into a grid or scroll
 * layout. Owns:
 *   - Entity resolution (tiles[], zones[], entities[], legacy)
 *   - Group expansion + dedup
 *   - Layout engine (grid/scroll, columns, rows, pagination)
 *   - Header (info tile, adaptive toggle, all-off button)
 *   - HA service routing (listens for tile events)
 *   - Per-entity cooldown
 *   - Manual override detection via adaptive_entity
 *
 * DOES NOT own tile rendering — that's tunet-light-tile's job.
 *
 * Config (v2 — backward compatible with v1):
 *   tiles:            [{entity, name, icon, ...}]  (v2 preferred)
 *   entities:         [string]      (v1 simple list)
 *   zones:            [{entity, name, icon}]  (v1 rich list)
 *   light_group:      string        (legacy)
 *   light_overrides:  {entity: {name, icon}}  (legacy)
 *   name:             string
 *   subtitle:         string
 *   primary_entity:   string
 *   adaptive_entity:  string
 *   layout:           'grid' | 'scroll'
 *   columns:          2-5
 *   rows:             'auto' | 2-6
 *   scroll_rows:      1-3
 *   tile_size:        'compact' | 'standard' | 'large'
 *   surface:          'card' | 'section'
 *   expand_groups:    boolean
 *   show_adaptive_toggle: boolean
 *   custom_css:       string
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, RESET_CSS, TYPOGRAPHY_BASE, ICON_BASE,
  CARD_SURFACE, SECTION_SURFACE,
  HEADER_CSS, RESPONSIVE_BASE, FONT_LINKS_HTML,
  injectFonts, asFinite,
  detectDarkMode, applyDarkClass,
  callServiceSafe,
  registerCard, logCardVersion,
} from './tunet_base.js';

import {
  readBrightnessPercent, expandGroup,
  dispatchAction,
} from './tunet_runtime.js';

// Ensure primitives are loaded
import './tunet_light_tile.js';
import './tunet_control_button.js';
import './tunet_info_tile.js';

const CARD_VERSION = '2.0.0';

/* ═══════════════════════════════════════════════════════════════
   COMPOSER-SPECIFIC CSS
   ═══════════════════════════════════════════════════════════════ */

const COMPOSER_STYLES = `
  ${TOKENS}
  ${RESET_CSS}
  ${TYPOGRAPHY_BASE}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${SECTION_SURFACE}
  ${HEADER_CSS}
  ${RESPONSIVE_BASE}

  /* Card-level active tint (§3.3) */
  .card[data-any-on="true"] {
    border-color: rgba(212,133,10, 0.14);
  }
  :host(.dark) .card[data-any-on="true"] {
    border-color: rgba(251,191,36, 0.22);
  }

  /* Pagination dots (scroll mode) */
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

  /* ── Grid layout ─────────────────────────────────── */
  .light-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    grid-auto-rows: var(--grid-row, 124px);
    gap: 10px;
    width: 100%;
    min-width: 0;
    overflow-y: visible;
  }
  :host([data-max-rows]) .light-grid {
    max-height: calc(var(--max-rows) * var(--grid-row, 124px) + (var(--max-rows) - 1) * 10px);
    overflow: hidden;
  }

  /* ── Scroll layout ───────────────────────────────── */
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
  :host([layout="scroll"]) tunet-light-tile {
    scroll-snap-align: start;
  }

  /* ── Responsive ──────────────────────────────────── */
  @media (max-width: 440px) {
    .light-grid { gap: 8px; }
    :host([layout="scroll"]) .light-grid {
      grid-auto-columns: calc(44% - 6px);
      scroll-padding-left: 0;
    }
    :host([surface="section"]) .card { --r-card: 28px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   COMPOSER CLASS
   ═══════════════════════════════════════════════════════════════ */

class TunetLightingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._resolvedTiles = []; // [{entity, name, icon, tileConfig}, ...]
    this._tileEls = {};       // entityId → tunet-light-tile element
    this._serviceCooldown = {};
    this._cooldownTimers = {};
    this._headerEls = {}; // info tile + control buttons

    injectFonts();
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    this.addEventListener('tunet:value-commit', (e) => this._onValueCommit(e));
    this.addEventListener('tunet:action', (e) => this._onAction(e));
  }

  disconnectedCallback() {
    for (const timer of Object.values(this._cooldownTimers)) clearTimeout(timer);
    this._cooldownTimers = {};
    this._serviceCooldown = {};
  }

  /* ═══════════════════════════════════════════════════
     CONFIG — Normalize + backward-compatible adapter
     ═══════════════════════════════════════════════════ */

  static getConfigForm() {
    return {
      schema: [
        { name: 'entities', selector: { entity: { domain: 'light', multiple: true } } },
        { name: 'name', selector: { text: {} } },
        { name: 'primary_entity', selector: { entity: { domain: 'light' } } },
        { name: 'adaptive_entity', selector: { entity: { domain: ['switch', 'automation', 'input_boolean'] } } },
        { name: 'surface', selector: { select: { options: ['card', 'section'] } } },
        { name: 'layout', selector: { select: { options: ['grid', 'scroll'] } } },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns', selector: { number: { min: 2, max: 5, step: 1, mode: 'box' } } },
            { name: 'scroll_rows', selector: { number: { min: 1, max: 3, step: 1, mode: 'box' } } },
          ],
        },
        {
          name: '', type: 'grid', schema: [
            { name: 'rows', selector: { text: {} } },
            { name: 'tile_size', selector: { select: { options: ['standard', 'compact', 'large'] } } },
            { name: 'expand_groups', selector: { boolean: {} } },
            { name: 'show_adaptive_toggle', selector: { boolean: {} } },
          ],
        },
        { name: 'custom_css', label: 'Custom CSS', selector: { text: { multiline: true } } },
      ],
      computeLabel: (s) => ({
        entities: 'Light Entities (groups auto-expand)',
        name: 'Card Title',
        primary_entity: 'Primary Entity (info tile tap)',
        adaptive_entity: 'Adaptive Lighting Switch',
        surface: 'Surface Style',
        layout: 'Layout Mode',
        columns: 'Grid Columns',
        rows: 'Max Rows (auto or number)',
        scroll_rows: 'Scroll Rows',
        tile_size: 'Tile Size',
        expand_groups: 'Expand Group Entities',
        show_adaptive_toggle: 'Show Adaptive Toggle',
        custom_css: 'Custom CSS',
      }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return { entities: [], name: 'Lighting' };
  }

  setConfig(config) {
    const columns = Math.max(2, Math.min(5, Math.round(asFinite(config.columns, 3))));
    const scrollRows = Math.max(1, Math.min(3, Math.round(asFinite(config.scroll_rows, 2))));
    const layout = config.layout === 'scroll' ? 'scroll' : 'grid';
    const surface = config.surface === 'section' ? 'section' : 'card';
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const expandGroups = config.expand_groups !== false;
    const showAdaptiveToggle = config.show_adaptive_toggle === true;
    const rows = config.rows === 'auto' || config.rows == null
      ? null
      : (() => {
          const parsed = asFinite(config.rows, 0);
          return parsed > 0 ? Math.max(1, Math.min(6, Math.round(parsed))) : null;
        })();

    this._config = {
      tiles: Array.isArray(config.tiles) && config.tiles.length > 0 ? config.tiles : null,
      entities: Array.isArray(config.entities) ? config.entities.filter(Boolean) : [],
      zones: Array.isArray(config.zones) ? config.zones.filter(Boolean) : [],
      light_group: config.light_group || '',
      light_overrides: config.light_overrides || null,
      name: config.name || 'Lighting',
      subtitle: config.subtitle || '',
      primary_entity: config.primary_entity || '',
      adaptive_entity: config.adaptive_entity || '',
      columns,
      layout,
      scroll_rows: scrollRows,
      surface,
      tile_size: tileSize,
      expand_groups: expandGroups,
      show_adaptive_toggle: showAdaptiveToggle,
      rows,
      custom_css: config.custom_css || '',
    };

    // Host attributes for CSS selectors
    if (layout === 'scroll') this.setAttribute('layout', 'scroll');
    else this.removeAttribute('layout');

    if (surface === 'section') this.setAttribute('surface', 'section');
    else this.removeAttribute('surface');

    if (tileSize === 'compact' || tileSize === 'large') this.setAttribute('tile-size', tileSize);
    else this.removeAttribute('tile-size');

    if (rows) {
      this.setAttribute('data-max-rows', rows);
      this.style.setProperty('--max-rows', rows);
    } else {
      this.removeAttribute('data-max-rows');
    }

    if (this._rendered && this._hass) {
      this._resolveTiles();
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ═══════════════════════════════════════════════════
     TILE RESOLUTION — Priority: tiles > zones > entities > legacy
     ═══════════════════════════════════════════════════ */

  _resolveTiles() {
    // Priority 1: v2 tiles[] config
    if (this._config.tiles) {
      this._resolvedTiles = this._config.tiles.map(t => ({
        entity: t.entity,
        tileConfig: t,
      }));
      return;
    }

    // Priority 2-4: Legacy adapters
    const rawSources = this._collectLegacySources();
    const resolved = [];
    const seen = new Set();

    for (const src of rawSources) {
      if (typeof src === 'string') {
        this._expandAndAdd(src, null, null, resolved, seen);
      } else if (src && src.entity) {
        const shouldExpand = src.expand !== undefined
          ? src.expand !== false
          : this._config.expand_groups;
        if (shouldExpand) {
          const members = expandGroup(this._hass, src.entity);
          if (members.length > 1 || members[0] !== src.entity) {
            for (const mid of members) {
              if (!seen.has(mid)) {
                seen.add(mid);
                resolved.push({ entity: mid, tileConfig: { entity: mid } });
              }
            }
            continue;
          }
        }
        if (!seen.has(src.entity)) {
          seen.add(src.entity);
          resolved.push({
            entity: src.entity,
            tileConfig: {
              entity: src.entity,
              name: src.name || undefined,
              icon: src.icon || undefined,
            },
          });
        }
      }
    }

    this._resolvedTiles = resolved;
  }

  _collectLegacySources() {
    const sources = [];

    // zones (rich per-entity)
    for (const z of this._config.zones) {
      sources.push(typeof z === 'string' ? z : z);
    }

    // entities (simple list)
    for (const id of this._config.entities) {
      sources.push(id);
    }

    // Legacy: light_group
    if (sources.length === 0 && this._config.light_group) {
      sources.push(this._config.light_group);
    }

    // Legacy: light_overrides
    if (sources.length === 0 && this._config.light_overrides) {
      for (const [entity, override] of Object.entries(this._config.light_overrides)) {
        sources.push({
          entity,
          name: override && override.name ? override.name : null,
          icon: override && override.icon ? override.icon : null,
        });
      }
    }

    return sources;
  }

  _expandAndAdd(entityId, name, icon, resolved, seen) {
    if (seen.has(entityId)) return;

    if (this._config.expand_groups) {
      const members = expandGroup(this._hass, entityId);
      if (members.length > 1 || members[0] !== entityId) {
        for (const mid of members) {
          if (!seen.has(mid)) {
            seen.add(mid);
            resolved.push({ entity: mid, tileConfig: { entity: mid } });
          }
        }
        return;
      }
    }

    seen.add(entityId);
    resolved.push({
      entity: entityId,
      tileConfig: { entity: entityId, name: name || undefined, icon: icon || undefined },
    });
  }

  /* ═══════════════════════════════════════════════════
     HA STATE
     ═══════════════════════════════════════════════════ */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._resolveTiles();
      this._buildGrid();
      this._rendered = true;
    }

    applyDarkClass(this, detectDarkMode(hass));

    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateAll();
    }

    // Pass hass to all child primitives
    for (const [, tileEl] of Object.entries(this._tileEls)) {
      tileEl.hass = hass;
    }
    for (const [, headerEl] of Object.entries(this._headerEls)) {
      headerEl.hass = hass;
    }
  }

  _entitiesChanged(oldH, newH) {
    for (const rt of this._resolvedTiles) {
      if (oldH.states[rt.entity] !== newH.states[rt.entity]) return true;
    }
    const ae = this._config.adaptive_entity;
    if (ae && oldH.states[ae] !== newH.states[ae]) return true;
    return false;
  }

  getCardSize() {
    if (this._config.layout === 'scroll') {
      return Math.max(2, 1 + (this._config.scroll_rows || 2) * 2);
    }
    const computedRows = Math.ceil(this._resolvedTiles.length / (this._config.columns || 3));
    const visibleRows = this._config.rows || computedRows;
    return Math.max(2, 2 + visibleRows * 2);
  }

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  _render() {
    const style = document.createElement('style');
    style.textContent = COMPOSER_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS_HTML + `
      <div class="card-wrap">
        <div class="card" id="card">
          <div class="hdr" id="hdr"></div>
          <div class="light-grid" id="lightGrid"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Custom CSS injection
    if (this._config.custom_css) {
      const customStyle = document.createElement('style');
      customStyle.id = 'tunet-custom-css';
      customStyle.textContent = this._config.custom_css;
      this.shadowRoot.querySelector('style').after(customStyle);
    }

    this.$ = {
      card: this.shadowRoot.getElementById('card'),
      hdr: this.shadowRoot.getElementById('hdr'),
      lightGrid: this.shadowRoot.getElementById('lightGrid'),
    };

    this._buildHeader();
  }

  _buildHeader() {
    const hdr = this.$.hdr;
    hdr.innerHTML = '';
    this._headerEls = {};

    const primaryEntity = this._config.primary_entity ||
      (this._config.entities.length > 0 ? this._config.entities[0] : '') ||
      '';

    // Info tile primitive
    const infoTile = document.createElement('tunet-info-tile');
    infoTile.setConfig({
      entity: primaryEntity,
      icon: 'lightbulb',
      title: this._config.name,
      subtitle: 'All off',
      tap_action: { action: 'more-info', entity: primaryEntity },
      hold_action: { action: 'more-info', entity: primaryEntity },
    });
    hdr.appendChild(infoTile);
    this._headerEls.infoTile = infoTile;

    // Spacer
    const spacer = document.createElement('div');
    spacer.className = 'hdr-spacer';
    hdr.appendChild(spacer);

    // Pagination dots container
    const dots = document.createElement('div');
    dots.className = 'header-dots';
    dots.id = 'headerDots';
    hdr.appendChild(dots);
    this.$.headerDots = dots;

    // Adaptive toggle (control button primitive)
    const ae = this._config.adaptive_entity;
    if (ae && this._config.show_adaptive_toggle) {
      const adaptiveBtn = document.createElement('tunet-control-button');
      adaptiveBtn.setConfig({
        entity: ae,
        icon: 'auto_awesome',
        variant: 'toggle',
        tap_action: { action: 'toggle', entity: ae },
        hold_action: { action: 'more-info', entity: ae },
        badge: { entity: ae, attribute: 'manual_control' },
        aria_label: 'Toggle adaptive lighting',
      });
      hdr.appendChild(adaptiveBtn);
      this._headerEls.adaptiveBtn = adaptiveBtn;
    }

    // All Off button (control button primitive)
    const allOffBtn = document.createElement('tunet-control-button');
    allOffBtn.setConfig({
      icon: 'power_settings_new',
      label: 'All Off',
      variant: 'selector',
      tap_action: { action: 'none' },
      aria_label: 'Turn all lights off',
    });
    // Direct click handler — all-off is a composer-level action
    allOffBtn.addEventListener('click', () => this._allOff());
    hdr.appendChild(allOffBtn);
    this._headerEls.allOffBtn = allOffBtn;

    this._setupScrollListener();
  }

  _buildGrid() {
    const grid = this.$.lightGrid;
    if (!grid) return;
    grid.innerHTML = '';
    this._tileEls = {};

    // CSS vars
    grid.style.setProperty('--cols', this._config.columns);
    grid.style.setProperty('--scroll-rows', this._config.scroll_rows);
    const rowHeight = this._config.tile_size === 'compact'
      ? '106px'
      : (this._config.tile_size === 'large' ? '142px' : '124px');
    grid.style.setProperty('--grid-row', rowHeight);

    // Create tile elements
    for (const rt of this._resolvedTiles) {
      const tileEl = document.createElement('tunet-light-tile');

      // Build tile config from resolved data
      const tileConfig = {
        entity: rt.entity,
        ...rt.tileConfig,
        // Inherit manual mode from card's adaptive_entity
        manual: rt.tileConfig.manual || {
          mode: this._config.adaptive_entity ? 'auto' : 'off',
        },
      };

      tileEl.setConfig(tileConfig);
      if (this._hass) tileEl.hass = this._hass;

      grid.appendChild(tileEl);
      this._tileEls[rt.entity] = tileEl;
    }

    // Pagination dots
    this._buildDots();
  }

  _buildDots() {
    const dots = this.$.headerDots;
    dots.innerHTML = '';
    if (this._config.layout !== 'scroll') return;

    const totalTiles = this._resolvedTiles.length;
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
     SCROLL LISTENER — Pagination dot sync
     ═══════════════════════════════════════════════════ */

  _setupScrollListener() {
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
     EVENT HANDLERS — Route tile events to HA services
     ═══════════════════════════════════════════════════ */

  _onValueCommit(e) {
    e.stopPropagation();
    const { entity, value, mode, source } = e.detail;
    if (!entity || !this._hass) return;

    this._setCooldown(entity);

    // Optimistic UI
    const tileEl = this._tileEls[entity];
    if (tileEl) tileEl.setOptimisticBrightness(value);

    if (mode === 'helper') {
      // Write to input_number helper
      callServiceSafe(this._hass, 'input_number', 'set_value', {
        entity_id: entity,
        value,
      }, { onError: () => this._updateAll() });
    } else {
      // Default: light-service mode
      if (value <= 0) {
        callServiceSafe(this._hass, 'light', 'turn_off', {
          entity_id: entity,
        }, { onError: () => this._updateAll() });
      } else {
        callServiceSafe(this._hass, 'light', 'turn_on', {
          entity_id: entity,
          brightness_pct: value,
        }, { onError: () => this._updateAll() });
      }
    }
  }

  _onAction(e) {
    e.stopPropagation();
    const { action, entity } = e.detail;
    if (!action || !this._hass) return;
    dispatchAction(this._hass, this, action, entity);
  }

  /* ═══════════════════════════════════════════════════
     SERVICE CALLS (header-level)
     ═══════════════════════════════════════════════════ */

  _allOff() {
    const entityIds = this._resolvedTiles.map(rt => rt.entity).filter(Boolean);
    if (!entityIds.length) return;

    for (const id of entityIds) {
      this._setCooldown(id);
      const tileEl = this._tileEls[id];
      if (tileEl) tileEl.setOptimisticBrightness(0);
    }

    callServiceSafe(this._hass, 'light', 'turn_off', { entity_id: entityIds }, {
      onError: () => this._updateAll(),
    });
  }

  _setCooldown(id) {
    this._serviceCooldown[id] = true;
    clearTimeout(this._cooldownTimers[id]);
    this._cooldownTimers[id] = setTimeout(() => {
      this._serviceCooldown[id] = false;
    }, 1500);
  }

  /* ═══════════════════════════════════════════════════
     FULL STATE UPDATE
     ═══════════════════════════════════════════════════ */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    // Manual control detection via adaptive_entity
    const manualList = this._getManuallyControlled();
    const manualSet = new Set(manualList);

    let onCount = 0;
    let totalCount = 0;
    let totalBrightness = 0;

    for (const rt of this._resolvedTiles) {
      const entity = this._hass.states[rt.entity];
      const isUnavailable = !entity || entity.state === 'unavailable';
      const isOn = entity && entity.state === 'on';
      const bright = readBrightnessPercent(this._hass, rt.entity);

      if (!isUnavailable) {
        totalCount++;
        if (isOn) {
          onCount++;
          totalBrightness += bright;
        }
      }

      // Set manual dot on tiles using 'auto' mode
      const tileEl = this._tileEls[rt.entity];
      if (tileEl && this._config.adaptive_entity) {
        const isManual = this._isZoneManual(rt.entity, manualSet);
        tileEl.setManual(isManual);
      }
    }

    // Card-level state
    const anyOn = onCount > 0;
    this.$.card.dataset.anyOn = anyOn ? 'true' : 'false';

    // Update info tile via public API
    const infoTile = this._headerEls.infoTile;
    if (infoTile) {
      infoTile.setActive(anyOn);

      let subtitle;
      if (this._config.subtitle) {
        subtitle = this._config.subtitle;
      } else {
        const avgBrt = onCount > 0 ? Math.round(totalBrightness / onCount) : 0;
        const ae = this._config.adaptive_entity;
        const aeEntity = ae ? this._hass.states[ae] : null;
        const aeOn = aeEntity && aeEntity.state === 'on';
        const manualCount = manualList.length;

        let parts = [];
        if (onCount === 0) parts.push('All off');
        else if (onCount === totalCount) parts.push(`All on \u00b7 ${avgBrt}%`);
        else parts.push(`${onCount} on \u00b7 ${avgBrt}%`);

        if (aeOn && manualCount > 0) parts.push(`Adaptive \u00b7 ${manualCount} manual`);
        else if (aeOn) parts.push('Adaptive');

        subtitle = parts.join(' \u00b7 ');
      }
      infoTile.setSubtitle(subtitle);
    }

    // Update all-off button active state
    const allOffBtn = this._headerEls.allOffBtn;
    if (allOffBtn) allOffBtn.setActive(anyOn);

    // Adaptive toggle badge (manual count) — hass pass handles active state
    const adaptiveBtn = this._headerEls.adaptiveBtn;
    if (adaptiveBtn) {
      adaptiveBtn.setBadge(manualList.length || null);
    }
  }

  /* ── Manual control detection ───────────────────── */

  _getManuallyControlled() {
    const ae = this._config.adaptive_entity;
    if (!ae) return [];
    const entity = this._hass ? this._hass.states[ae] : null;
    if (!entity || !entity.attributes) return [];
    return entity.attributes.manual_control || [];
  }

  _isZoneManual(zoneEntity, manualSet) {
    if (manualSet.has(zoneEntity)) return true;
    const entity = this._hass ? this._hass.states[zoneEntity] : null;
    const members = entity && entity.attributes ? entity.attributes.entity_id : null;
    if (Array.isArray(members)) return members.some(m => manualSet.has(m));
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-lighting-card', TunetLightingCard, {
  name: 'Tunet Lighting Card',
  description: 'Glassmorphism lighting controller — drag-to-dim light tiles, adaptive toggle, grid/scroll layout',
});

logCardVersion('TUNET-LIGHTING', CARD_VERSION);

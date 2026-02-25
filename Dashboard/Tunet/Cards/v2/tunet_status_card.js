/**
 * Tunet Status Card  v2.3.0 (v2 migration)
 * Home status grid with typed tiles: indicator, timer, value, dropdown
 * Migrated to tunet_base.js shared module.
 */

import {
  TOKENS, RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';

const CARD_VERSION = '2.3.0';

const STATUS_ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'lamp',
  table_lamp: 'lamp',
  light_group: 'lightbulb',
};

function normalizeStatusIcon(icon) {
  if (!icon) return 'info';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = STATUS_ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'info';
  return resolved;
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
    /* Tile physics (not in base tokens) */
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --tile-row-h: auto;
    /* Dropdown menu tokens */
    --dd-bg: rgba(255,255,255,0.92);
    --dd-border: rgba(255,255,255,0.60);
  }

  :host(.dark) {
    --dd-bg: rgba(58,58,60,0.92);
    --dd-border: rgba(255,255,255,0.08);
  }

  /* ── Card surface overrides ─────────────────── */
  .card {
    width: 100%;
    gap: 16px;
  }

  /* ── Header ──────────────────────────────────── */
  .hdr {
    display: flex; align-items: center; justify-content: space-between; padding: 0 4px;
  }
  .hdr-title {
    font-size: 16px; font-weight: 700; color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .hdr-title .icon { color: var(--blue); }

  /* ── Tile Grid ───────────────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: auto;
    align-items: stretch;
    gap: 10px;
  }

  /* ── Tile Surface ────────────────────────────── */
  .tile {
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--tile-shadow-rest);
    padding: 14px 8px 10px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all .15s ease;
    position: relative;
    overflow: visible;
    min-height: 0;
    height: 100%;
  }
  .tile:hover { box-shadow: var(--tile-shadow-lift); }
  .tile:active { transform: scale(.97); }
  .tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  /* ── Tile Icon Accents ───────────────────────── */
  .tile-icon {
    width: 28px; height: 28px;
    display: grid; place-items: center;
    margin-bottom: 2px;
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
    font-size: 18px; font-weight: 700; letter-spacing: -.2px; line-height: 1;
    color: var(--text); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap;
  }
  .tile-label {
    font-size: 9px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
    color: var(--text-muted); line-height: 1; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .tile-deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }

  /* ── Status Dots ─────────────────────────────── */
  .status-dot {
    width: 6px; height: 6px; border-radius: 999px;
    position: absolute; top: 10px; right: 10px;
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
    top: 8px;
    right: 8px;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    z-index: 2;
  }
  .tile-aux:hover { box-shadow: var(--tile-shadow-rest); }
  .tile-aux:active { transform: scale(0.97); }
  .tile.has-aux { padding-top: 26px; }

  /* ── Timer Tile ──────────────────────────────── */
  .tile[data-type="timer"] .tile-val {
    letter-spacing: 0.5px;
  }

  /* ── Dropdown Tile ───────────────────────────── */
  .tile-dd-val {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .tile-dd-val .chevron {
    font-size: 14px; width: 14px; height: 14px;
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
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 140px;
    max-width: 200px;
    max-height: 240px;
    overflow-y: auto;
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 20;
    display: none;
    flex-direction: column;
    gap: 1px;
  }
  .tile-dd-menu.open {
    display: flex;
    animation: ddMenuIn .14s ease forwards;
  }
  @keyframes ddMenuIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .tile-dd-opt {
    padding: 8px 10px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
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

  /* ── Responsive ──────────────────────────────── */
  @media (max-width: 440px) {
    .card { padding: 16px; }
    .grid { grid-template-columns: repeat(2, 1fr); }
    .tile { min-height: 0; }
    .tile-val { font-size: 16px; }
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
    this._onDocClick = this._onDocClick.bind(this);
    injectFonts();
  }

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    this._clearAllTimers();
  }

  /* ═══════════════════════════════════════════════════
     CONFIG
     ═══════════════════════════════════════════════════ */

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'columns', selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
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
        name: 'Card Title',
        columns: 'Columns',
        custom_css: 'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .grid, .tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { name: 'Home Status', tiles: [] };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Home Status',
      columns: config.columns || 4,
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
        };

        if (type === 'indicator') {
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

    // Collect all entities that matter (tile entities + show_when entities)
    const relevantEntities = new Set();
    for (const t of this._config.tiles) {
      if (t.entity) relevantEntities.add(t.entity);
      if (t.show_when && t.show_when.entity) relevantEntities.add(t.show_when.entity);
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
    const rows = Math.ceil(this._config.tiles.length / (this._config.columns || 4));
    return Math.max(2, rows + 1);
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
    this._gridEl = this.shadowRoot.getElementById('grid');
    this._gridEl.style.gridTemplateColumns = `repeat(${this._config.columns || 4}, 1fr)`;

    this._buildGrid();
  }

  _buildGrid() {
    if (!this._gridEl) return;
    this._gridEl.innerHTML = '';
    this._titleEl.textContent = this._config.name;
    this._gridEl.style.gridTemplateColumns = `repeat(${this._config.columns || 4}, 1fr)`;
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
        case 'indicator':
          el.innerHTML = `
            <div class="status-dot" id="dot-${i}"></div>
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;

        case 'timer':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;

        case 'dropdown':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
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
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        }
      }

      if (tile.aux_action) {
        const auxBtn = document.createElement('button');
        auxBtn.type = 'button';
        auxBtn.className = 'tile-aux';
        const auxIcon = tile.aux_action.icon ? normalizeStatusIcon(tile.aux_action.icon) : '';
        const auxLabel = tile.aux_action.label || 'Action';
        auxBtn.innerHTML = auxIcon
          ? `<span class="icon" style="font-size:12px;width:12px;height:12px">${auxIcon}</span><span>${auxLabel}</span>`
          : `<span>${auxLabel}</span>`;
        auxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._handleTapAction(tile.aux_action, tile.entity);
        });
        el.appendChild(auxBtn);
        el.classList.add('has-aux');
      }

      this._gridEl.appendChild(el);
      this._tileEls.push({
        el,
        config: tile,
        index: i,
        valEl: el.querySelector(`#val-${i}`),
        dotEl: el.querySelector(`#dot-${i}`),
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
      const { config, el } = tile;
      if (!config.show_when) {
        el.classList.remove('tile-hidden');
        continue;
      }
      const watchEntity = this._hass.states[config.show_when.entity];
      const visible = this._matchesShowWhen(watchEntity, config.show_when);
      el.classList.toggle('tile-hidden', !visible);
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

    switch (operator) {
      case 'contains':
        return actual.includes(target);
      case 'not_contains':
        return !actual.includes(target);
      case 'not_equals':
        return actual !== target;
      case 'gt':
        return Number(actual) > Number(target);
      case 'lt':
        return Number(actual) < Number(target);
      case 'equals':
      default:
        return actual === target;
    }
  }

  _handleTapAction(tapAction, defaultEntityId) {
    if (!tapAction || !this._hass) return;
    const action = tapAction.action || 'more-info';

    if (action === 'none') return;

    if (action === 'more-info') {
      this._fireMoreInfo(tapAction.entity || defaultEntityId);
      return;
    }

    if (action === 'navigate') {
      const path = tapAction.navigation_path;
      if (!path) return;
      window.history.pushState(null, '', path);
      window.dispatchEvent(new Event('location-changed'));
      return;
    }

    if (action === 'url') {
      if (!tapAction.url_path) return;
      window.open(tapAction.url_path, tapAction.new_tab ? '_blank' : '_self');
      return;
    }

    if (action === 'call-service') {
      const service = tapAction.service || '';
      const [domain, serviceName] = service.split('.');
      if (!domain || !serviceName) return;
      this._hass.callService(domain, serviceName, tapAction.service_data || {});
      return;
    }

    // Fallback to more-info for unknown action type.
    this._fireMoreInfo(tapAction.entity || defaultEntityId);
  }

  // ── Value Updates ──

  _updateValues() {
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      const { config, valEl, dotEl, ddMenuEl, ddValEl, index } = tile;
      if (!config.entity) { if (valEl) valEl.textContent = '--'; continue; }

      const entity = this._hass.states[config.entity];
      if (!entity) { if (valEl) valEl.textContent = '?'; continue; }

      switch (config.type) {
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
          this._updateValueTile(valEl, dotEl, entity, config);
          break;
      }
    }
  }

  _updateValueTile(valEl, dotEl, entity, config) {
    let val = config.attribute
      ? (entity.attributes[config.attribute] != null ? entity.attributes[config.attribute] : '?')
      : entity.state;
    const unit = config.unit;

    if (config.format === 'integer') val = Math.round(Number(val));
    else if (config.format === 'float1') val = Number(val).toFixed(1);

    this._renderValWithUnit(valEl, val, unit);

    if (dotEl && config.dot_rules) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules);
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

  _renderValWithUnit(valEl, val, unit) {
    if (unit === '°F' || unit === '°C' || unit === '°') {
      valEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${unit === '°F' ? 'F' : unit === '°C' ? 'C' : ''}`;
    } else if (unit) {
      valEl.innerHTML = `${val}<span class="tile-deg">${unit}</span>`;
    } else {
      valEl.textContent = val;
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
      tile.ddMenuEl.classList.add('open');
      tile.ddValEl.setAttribute('aria-expanded', 'true');
      tile.el.setAttribute('aria-expanded', 'true');
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
          menuEl.style.bottom = 'calc(100% + 4px)';
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
    for (const tile of this._tileEls) {
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

  _selectDropdownOption(entityId, option, tileIndex) {
    if (!this._hass) return;
    this._hass.callService('input_select', 'select_option', {
      entity_id: entityId,
      option: option,
    });
    this._closeAllDropdowns();
  }

  _onDocClick(e) {
    if (this._openDropdown === null) return;
    const path = e.composedPath();
    const tile = this._tileEls[this._openDropdown];
    if (tile && !path.includes(tile.el)) {
      this._closeAllDropdowns();
    }
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

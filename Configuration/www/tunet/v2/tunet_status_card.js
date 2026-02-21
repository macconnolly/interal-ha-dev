/**
 * Tunet Status Card  v2.5.0 (composer migration)
 * Thin composer over tunet-status-tile primitive.
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
  registerCard,
  logCardVersion,
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_status_tile.js';

const CARD_VERSION = '2.5.0';

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

const TUNET_STATUS_STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}
${REDUCED_MOTION}

:host {
  display: block;
}

.card {
  width: 100%;
  gap: 16px;
}

.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.hdr-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.hdr-title .icon {
  color: var(--blue);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: auto;
  align-items: stretch;
  gap: 10px;
}

.grid tunet-status-tile {
  display: block;
  min-height: 0;
  height: 100%;
}

@media (max-width: 440px) {
  .card {
    padding: 16px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;

class TunetStatusCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._tileEls = [];
    this._onTileAction = this._onTileAction.bind(this);
    injectFonts();
  }

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
        custom_css: 'CSS rules injected into shadow DOM. Use .grid and tunet-status-tile selectors.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { name: 'Home Status', tiles: [] };
  }

  setConfig(config) {
    const asInt = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) ? Math.round(n) : fallback;
    };

    const columns = Math.max(2, Math.min(8, asInt(config.columns, 4)));

    this._config = {
      name: config.name || 'Home Status',
      columns,
      custom_css: config.custom_css || '',
      tiles: (config.tiles || []).map((t) => {
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

        if (type === 'alarm') {
          base.playing_entity = t.playing_entity || '';
          base.snooze_action = t.snooze_action || null;
          base.dismiss_action = t.dismiss_action || null;
          return base;
        }

        if (type === 'indicator') {
          base.format = t.format || 'state';
          base.unit = t.unit || '';
          base.dot_rules = t.dot_rules || [];
          return base;
        }

        if (type === 'value') {
          base.unit = t.unit || '';
          base.format = t.format || 'state';
          base.attribute = t.attribute || '';
          if (t.status_dot && !t.dot_rules) {
            base.dot_rules = [{ match: '*', dot: t.status_dot }];
          } else {
            base.dot_rules = t.dot_rules || null;
          }
          return base;
        }

        // timer + dropdown retain base shape.
        return base;
      }),
    };

    if (this._rendered) {
      this._buildGrid();
      this._updateTiles();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    applyDarkClass(this, detectDarkMode(hass));

    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateTiles();
    }
  }

  getCardSize() {
    const rows = Math.ceil((this._config.tiles || []).length / (this._config.columns || 4));
    return Math.max(2, rows + 1);
  }

  _entitiesChanged(oldHass, newHass) {
    const relevant = new Set();

    for (const tile of this._config.tiles || []) {
      if (tile.entity) relevant.add(tile.entity);
      if (tile.playing_entity) relevant.add(tile.playing_entity);
      this._collectConditionEntities(tile.show_when, relevant, tile.entity);
      this._collectConditionEntities(tile.aux_action?.show_when, relevant, tile.entity);
    }

    for (const entityId of relevant) {
      if (oldHass.states[entityId] !== newHass.states[entityId]) return true;
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

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_STATUS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = `${FONT_LINKS}
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
      </div>`;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._titleEl = this.shadowRoot.getElementById('title');
    this._gridEl = this.shadowRoot.getElementById('grid');

    this._gridEl.addEventListener('tunet:action', this._onTileAction);

    this._buildGrid();
  }

  _buildGrid() {
    if (!this._gridEl) return;

    this._gridEl.innerHTML = '';
    this._tileEls = [];

    this._titleEl.textContent = this._config.name;
    this._gridEl.style.gridTemplateColumns = `repeat(${this._config.columns || 4}, 1fr)`;

    if (this._customStyleEl) {
      this._customStyleEl.textContent = this._config.custom_css || '';
    }

    for (const tileConfig of this._config.tiles || []) {
      const tileEl = document.createElement('tunet-status-tile');
      tileEl.setConfig(tileConfig);
      if (this._hass) tileEl.hass = this._hass;
      this._gridEl.appendChild(tileEl);
      this._tileEls.push(tileEl);
    }
  }

  _updateTiles() {
    if (!this._hass || !this._tileEls) return;
    for (const tileEl of this._tileEls) {
      tileEl.hass = this._hass;
    }
  }

  _onTileAction(event) {
    const action = event.detail?.action;
    const entityId = event.detail?.entity_id || action?.entity_id || '';
    if (!action) return;

    dispatchAction(this._hass, this, action, entityId)
      .catch(() => this._updateTiles());
  }
}

registerCard('tunet-status-card', TunetStatusCard, {
  name: 'Tunet Status Card',
  description: 'Home status grid composed from tunet-status-tile primitives',
});

logCardVersion('TUNET-STATUS', CARD_VERSION, '#007AFF');

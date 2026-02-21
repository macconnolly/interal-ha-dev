/**
 * Tunet Info Tile (primitive)
 * Header tile with icon/title/subtitle and event-only actions.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  INFO_TILE_PATTERN,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';
import { normalizeAction, normalizeTunetIcon } from './tunet_runtime.js';

const TAG = 'tunet-info-tile';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${INFO_TILE_PATTERN}
${REDUCED_MOTION}

:host {
  display: inline-flex;
  min-width: 0;
}

.info-tile {
  width: 100%;
}

.info-tile[data-accent='amber'] {
  background: var(--amber-fill);
  border-color: var(--amber-border);
}

.info-tile[data-accent='blue'] {
  background: var(--blue-fill);
  border-color: var(--blue-border);
}

.info-tile[data-accent='green'] {
  background: var(--green-fill);
  border-color: var(--green-border);
}

.info-tile[data-accent='purple'] {
  background: var(--purple-fill);
  border-color: var(--purple-border);
}

.info-tile[data-accent='none'] {
  background: var(--ctrl-bg);
  border-color: var(--ctrl-border);
}

.info-tile[data-accent='amber'] .entity-icon { color: var(--amber); }
.info-tile[data-accent='blue'] .entity-icon { color: var(--blue); }
.info-tile[data-accent='green'] .entity-icon { color: var(--green); }
.info-tile[data-accent='purple'] .entity-icon { color: var(--purple); }
`;

const TEMPLATE = `
${FONT_LINKS}
<div id="tile" class="info-tile" tabindex="0" role="button" aria-label="Info tile">
  <div class="entity-icon" id="iconWrap">
    <span class="icon icon-18" id="icon">info</span>
  </div>
  <div class="hdr-text">
    <div class="hdr-title" id="title">Info</div>
    <div class="hdr-sub" id="subtitle">--</div>
  </div>
</div>
`;

class TunetInfoTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._holdTimer = null;
    this._held = false;
  }

  setConfig(config) {
    this._config = {
      entity: config?.entity || '',
      title: config?.title || '',
      subtitle: config?.subtitle || '',
      icon: normalizeTunetIcon(config?.icon || 'info', 'info'),
      accent: config?.accent || 'none',
      hold_ms: Number.isFinite(Number(config?.hold_ms)) ? Number(config.hold_ms) : 500,
      tap_action: normalizeAction(config?.tap_action || { action: 'more-info', entity_id: config?.entity || '' }, config?.entity || ''),
      hold_action: config?.hold_action ? normalizeAction(config.hold_action, config?.entity || '') : null,
    };

    if (this._els) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));

    if (this._config && this._els) {
      const entity = this._config.entity ? hass?.states?.[this._config.entity] : null;
      if (!this._config.title && entity?.attributes?.friendly_name) {
        this._els.title.textContent = entity.attributes.friendly_name;
      }
      if (!this._config.subtitle && entity) {
        this._els.subtitle.textContent = entity.state;
      }
    }
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (!this._config) this.setConfig({});
    this._render();
  }

  disconnectedCallback() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._removeListeners();
  }

  _renderShell() {
    this.shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = CSS;
    this.shadowRoot.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._els = {
      tile: this.shadowRoot.getElementById('tile'),
      icon: this.shadowRoot.getElementById('icon'),
      title: this.shadowRoot.getElementById('title'),
      subtitle: this.shadowRoot.getElementById('subtitle'),
    };

    this._bindListeners();
  }

  _bindListeners() {
    this._onClick = this._handleClick.bind(this);
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onPointerCancel = this._handlePointerCancel.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);

    this._els.tile.addEventListener('click', this._onClick);
    this._els.tile.addEventListener('pointerdown', this._onPointerDown);
    this._els.tile.addEventListener('pointerup', this._onPointerUp);
    this._els.tile.addEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.addEventListener('keydown', this._onKeyDown);
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.tile.removeEventListener('click', this._onClick);
    this._els.tile.removeEventListener('pointerdown', this._onPointerDown);
    this._els.tile.removeEventListener('pointerup', this._onPointerUp);
    this._els.tile.removeEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.removeEventListener('keydown', this._onKeyDown);
  }

  _render() {
    const cfg = this._config || {};
    const { tile, icon, title, subtitle } = this._els;

    tile.dataset.accent = cfg.accent || 'none';
    icon.textContent = cfg.icon || 'info';
    title.textContent = cfg.title || 'Info';
    subtitle.textContent = cfg.subtitle || '--';
  }

  _handlePointerDown() {
    this._held = false;
    clearTimeout(this._holdTimer);
    if (!this._config?.hold_action) return;

    this._holdTimer = setTimeout(() => {
      this._held = true;
      this._emitAction(this._config.hold_action, 'hold');
    }, this._config.hold_ms || 500);
  }

  _handlePointerUp() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
  }

  _handlePointerCancel() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._held = false;
  }

  _handleClick(e) {
    if (this._held) {
      e.preventDefault();
      e.stopPropagation();
      this._held = false;
      return;
    }
    this._emitAction(this._config?.tap_action, 'tap');
  }

  _handleKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this._emitAction(this._config?.tap_action, 'keyboard');
  }

  _emitAction(action, source) {
    const normalized = normalizeAction(action || { action: 'none' }, this._config?.entity || '');

    this.dispatchEvent(new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      detail: {
        action: normalized,
        entity_id: normalized.entity_id || this._config?.entity || '',
        source: 'info-tile',
        trigger: source,
      },
    }));

    if ((normalized.action || '') === 'more-info') {
      this.dispatchEvent(new CustomEvent('tunet:request-more-info', {
        bubbles: true,
        composed: true,
        detail: {
          entity_id: normalized.entity_id || this._config?.entity || '',
          source: 'info-tile',
          trigger: source,
        },
      }));
    }
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetInfoTile);
}

console.info(`%cTUNET-INFO-TILE ${VERSION}`, 'color:#007AFF;font-weight:700;');

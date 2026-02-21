/**
 * Tunet Speaker Tile (primitive)
 * Horizontal speaker tile with volume drag, group marker, and event-only actions.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';
import {
  normalizeAction,
  normalizeTunetIcon,
} from './tunet_runtime.js';

const TAG = 'tunet-speaker-tile';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${REDUCED_MOTION}

:host {
  display: block;
  min-width: 0;
}

.spk-tile {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 14px 10px;
  border-radius: var(--r-tile);
  border: 1px solid transparent;
  background: var(--tile-bg);
  box-shadow: var(--shadow);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
  min-height: 62px;
  transition:
    transform var(--motion-fast) var(--ease-emphasized),
    box-shadow var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    background var(--motion-fast) var(--ease-standard);
}

@media (hover: hover) {
  .spk-tile:hover {
    box-shadow: var(--shadow-up);
  }
}

.spk-tile:active {
  transform: scale(0.98);
}

.spk-tile:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.spk-tile.selected {
  border-color: var(--amber-border);
}

.spk-tile.in-group {
  border-color: var(--green-border);
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--text-muted);
  background: var(--gray-ghost);
  border: 1px solid transparent;
  transition: all var(--motion-fast) var(--ease-standard);
}

.spk-tile.in-group .icon-wrap {
  color: var(--green);
  background: var(--green-fill);
  border-color: var(--green-border);
}

.spk-tile.in-group .icon-wrap .icon,
.spk-tile.selected .icon-wrap .icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sub);
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spk-tile.in-group .name {
  color: var(--text);
}

.volume {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 38px;
  text-align: right;
}

.spk-tile.in-group .volume,
.spk-tile.selected .volume {
  color: var(--green);
}

.track {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 6px;
  height: 3px;
  background: var(--track-bg);
  border-radius: var(--r-track);
  overflow: hidden;
}

.fill {
  height: 100%;
  width: 0;
  border-radius: var(--r-track);
  background: rgba(52,199,89,0.65);
  transition: width 60ms ease;
}

:host(.dark) .fill {
  background: rgba(48,209,88,0.75);
}

.group-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: none;
}

.spk-tile.in-group .group-dot {
  display: block;
  background: var(--green);
  box-shadow: 0 0 10px rgba(52,199,89,0.45);
}

.group-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1.5px solid var(--text-muted);
  background: transparent;
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
}

.group-btn.show {
  display: inline-flex;
}

.group-btn .icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
  opacity: 0;
}

.group-btn.in-group {
  background: var(--green);
  border-color: var(--green);
}

.group-btn.in-group .icon {
  opacity: 1;
}

.spk-tile.dragging {
  transform: scale(1.03);
  box-shadow: var(--shadow-up);
  border-color: var(--green);
  z-index: 10;
}

.spk-tile.dragging .fill {
  transition: none;
}

.vol-pill {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--tile-bg);
  border: 1px solid var(--green-border);
  box-shadow: var(--shadow-up);
  color: var(--green);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  display: none;
  z-index: 11;
}

.spk-tile.dragging .vol-pill {
  display: block;
}

.hide-volume .volume,
.hide-volume .track,
.hide-volume .vol-pill {
  display: none;
}

@media (max-width: 440px) {
  .spk-tile {
    min-height: 56px;
    padding: 8px 10px 12px 8px;
    gap: 8px;
  }

  .icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .name {
    font-size: 12px;
  }

  .meta {
    font-size: 10px;
  }

  .volume {
    font-size: 13px;
  }
}
`;

const TEMPLATE = `
${FONT_LINKS}
<div id="tile" class="spk-tile" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <div id="groupDot" class="group-dot"></div>
  <button id="groupBtn" class="group-btn" type="button" aria-label="Toggle group membership">
    <span class="icon">check</span>
  </button>
  <div id="iconWrap" class="icon-wrap"><span id="icon" class="icon">speaker</span></div>
  <div class="content">
    <div id="name" class="name">Speaker</div>
    <div id="meta" class="meta">Idle</div>
  </div>
  <div id="volume" class="volume">0%</div>
  <div class="track"><div id="fill" class="fill"></div></div>
  <div id="pill" class="vol-pill">0%</div>
</div>
`;

class TunetSpeakerTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._gesture = null;
    this._longPressTimer = null;
  }

  setConfig(config) {
    const entityId = config?.entity || '';
    this._config = {
      entity: entityId,
      name: config?.name || '',
      icon: normalizeTunetIcon(config?.icon || 'speaker', 'speaker'),
      meta: config?.meta || '',
      state: config?.state || 'idle',
      in_group: config?.in_group === true,
      selected: config?.selected === true,
      volume: this._clampVolume(config?.volume),
      show_volume: config?.show_volume !== false,
      show_group_dot: config?.show_group_dot !== false,
      allow_group_toggle: config?.allow_group_toggle === true,
      hold_ms: Number.isFinite(Number(config?.hold_ms)) ? Number(config.hold_ms) : 500,
      tap_action: normalizeAction(config?.tap_action || { action: 'select-speaker', entity_id: entityId }, entityId),
      hold_action: normalizeAction(config?.hold_action || { action: 'more-info', entity_id: entityId }, entityId),
    };

    if (this._els) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (!this._config) this.setConfig({});
    this._render();
  }

  disconnectedCallback() {
    clearTimeout(this._longPressTimer);
    this._longPressTimer = null;
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
      groupDot: this.shadowRoot.getElementById('groupDot'),
      groupBtn: this.shadowRoot.getElementById('groupBtn'),
      icon: this.shadowRoot.getElementById('icon'),
      name: this.shadowRoot.getElementById('name'),
      meta: this.shadowRoot.getElementById('meta'),
      volume: this.shadowRoot.getElementById('volume'),
      fill: this.shadowRoot.getElementById('fill'),
      pill: this.shadowRoot.getElementById('pill'),
    };

    this._bindListeners();
  }

  _bindListeners() {
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onPointerCancel = this._handlePointerCancel.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onGroupClick = this._handleGroupClick.bind(this);

    this._els.tile.addEventListener('pointerdown', this._onPointerDown);
    this._els.tile.addEventListener('pointermove', this._onPointerMove);
    this._els.tile.addEventListener('pointerup', this._onPointerUp);
    this._els.tile.addEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.addEventListener('keydown', this._onKeyDown);
    this._els.groupBtn.addEventListener('click', this._onGroupClick);
    this._els.groupBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.tile.removeEventListener('pointerdown', this._onPointerDown);
    this._els.tile.removeEventListener('pointermove', this._onPointerMove);
    this._els.tile.removeEventListener('pointerup', this._onPointerUp);
    this._els.tile.removeEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.removeEventListener('keydown', this._onKeyDown);
    this._els.groupBtn.removeEventListener('click', this._onGroupClick);
  }

  _render() {
    const cfg = this._config;
    const { tile, groupDot, groupBtn, icon, name, meta, volume, fill, pill } = this._els;

    tile.classList.toggle('in-group', cfg.in_group);
    tile.classList.toggle('selected', cfg.selected);
    tile.classList.toggle('hide-volume', !cfg.show_volume);
    tile.dataset.state = cfg.state;

    groupDot.style.display = cfg.show_group_dot && cfg.in_group ? 'block' : 'none';
    groupBtn.classList.toggle('show', cfg.allow_group_toggle);
    groupBtn.classList.toggle('in-group', cfg.in_group);

    icon.textContent = cfg.icon;
    name.textContent = cfg.name || cfg.entity || 'Speaker';
    meta.textContent = cfg.meta || cfg.state || 'Idle';

    const pct = this._clampVolume(cfg.volume);
    volume.textContent = `${pct}%`;
    fill.style.width = `${pct}%`;
    pill.textContent = `${pct}%`;
    tile.setAttribute('aria-valuenow', String(pct));
    tile.setAttribute('aria-valuetext', `${pct} percent`);
  }

  _handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const startVolume = this._clampVolume(this._config.volume);
    this._gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startVolume,
      currentVolume: startVolume,
      moved: false,
      holdFired: false,
      dragThreshold: 6,
    };

    clearTimeout(this._longPressTimer);
    this._longPressTimer = setTimeout(() => {
      if (!this._gesture) return;
      this._gesture.holdFired = true;
      this._emitAction(this._config.hold_action, 'hold');
    }, this._config.hold_ms);

    try {
      this._els.tile.setPointerCapture(event.pointerId);
    } catch (_) {
      // no-op
    }
  }

  _handlePointerMove(event) {
    const g = this._gesture;
    if (!g || g.pointerId !== event.pointerId || g.holdFired || !this._config.show_volume) return;

    const dx = event.clientX - g.startX;
    if (!g.moved && Math.abs(dx) < g.dragThreshold) return;

    if (!g.moved) {
      g.moved = true;
      this._els.tile.classList.add('dragging');
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }

    const width = Math.max(this._els.tile.offsetWidth, 1);
    const dragRange = Math.max(width * 0.95, 160);
    const delta = (dx / dragRange) * 100;
    const next = this._clampVolume(Math.round(g.startVolume + delta));

    if (next === g.currentVolume) return;
    g.currentVolume = next;
    this._applyVolume(next);

    this._emit('tunet:value-preview', {
      entity_id: this._config.entity,
      value: next,
      source: 'speaker-drag',
    });
  }

  _handlePointerUp(event) {
    const g = this._gesture;
    if (!g || g.pointerId !== event.pointerId) return;

    clearTimeout(this._longPressTimer);
    this._longPressTimer = null;

    if (g.holdFired) {
      this._cancelGesture();
      return;
    }

    if (g.moved) {
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: g.currentVolume,
        source: 'speaker-drag',
      });
    } else {
      this._emitAction(this._config.tap_action, 'tap');
    }

    this._cancelGesture();
  }

  _handlePointerCancel(event) {
    const g = this._gesture;
    if (!g || g.pointerId !== event.pointerId) return;
    this._cancelGesture();
  }

  _cancelGesture() {
    clearTimeout(this._longPressTimer);
    this._longPressTimer = null;

    if (this._gesture) {
      try {
        this._els.tile.releasePointerCapture(this._gesture.pointerId);
      } catch (_) {
        // no-op
      }
    }

    this._els.tile.classList.remove('dragging');
    this._gesture = null;
  }

  _handleKeyDown(event) {
    const step = event.shiftKey ? 10 : 5;
    const current = this._clampVolume(this._config.volume);

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = this._clampVolume(current + step);
      this._applyVolume(next);
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: next,
        source: 'speaker-keyboard',
      });
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = this._clampVolume(current - step);
      this._applyVolume(next);
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: next,
        source: 'speaker-keyboard',
      });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._emitAction(this._config.tap_action, 'keyboard');
    }
  }

  _handleGroupClick(event) {
    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(new CustomEvent('tunet:group-toggle', {
      bubbles: true,
      composed: true,
      detail: {
        entity_id: this._config.entity,
        in_group: this._config.in_group,
        source: 'speaker-tile',
      },
    }));
  }

  _applyVolume(next) {
    const pct = this._clampVolume(next);
    this._config.volume = pct;
    this._els.volume.textContent = `${pct}%`;
    this._els.fill.style.width = `${pct}%`;
    this._els.pill.textContent = `${pct}%`;
    this._els.tile.setAttribute('aria-valuenow', String(pct));
    this._els.tile.setAttribute('aria-valuetext', `${pct} percent`);
  }

  _emitAction(action, trigger) {
    const normalized = normalizeAction(action || { action: 'none' }, this._config.entity || '');
    this._emit('tunet:action', {
      entity_id: normalized.entity_id || this._config.entity || '',
      action: normalized,
      source: 'speaker-tile',
      trigger,
    });
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail,
    }));
  }

  _clampVolume(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetSpeakerTile);
}

console.info(`%cTUNET-SPEAKER-TILE ${VERSION}`, 'color:#34C759;font-weight:700;');

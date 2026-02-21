/**
 * Tunet Status Tile (primitive)
 * Event-only status tile supporting indicator, value, timer, dropdown, and alarm.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  GLASS_MENU_PATTERN,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';
import {
  evaluateShowWhen,
  formatValueWithUnit,
  normalizeAction,
  normalizeTunetIcon,
} from './tunet_runtime.js';

const TAG = 'tunet-status-tile';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${GLASS_MENU_PATTERN}
${REDUCED_MOTION}

:host {
  display: block;
  min-width: 0;
}

.tile {
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-ghost);
  padding: 14px 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition:
    transform var(--motion-fast) var(--ease-emphasized),
    box-shadow var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    background var(--motion-fast) var(--ease-standard);
  position: relative;
  overflow: visible;
  min-height: 0;
  height: 100%;
}

@media (hover: hover) {
  .tile:hover {
    box-shadow: var(--shadow-up);
  }
}

.tile:active {
  transform: scale(0.97);
}

.tile:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.tile-hidden {
  visibility: hidden !important;
  pointer-events: none !important;
}

.tile-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin-bottom: 2px;
  color: var(--text-muted);
}

.tile[data-accent='amber'] .tile-icon { color: var(--amber); }
.tile[data-accent='blue'] .tile-icon { color: var(--blue); }
.tile[data-accent='green'] .tile-icon { color: var(--green); }
.tile[data-accent='red'] .tile-icon { color: var(--red); }
.tile[data-accent='muted'] .tile-icon { color: var(--text-muted); }

.tile[data-accent='amber'] .tile-icon .icon,
.tile[data-accent='blue'] .tile-icon .icon,
.tile[data-accent='green'] .tile-icon .icon,
.tile[data-accent='red'] .tile-icon .icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.tile-val {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}

.tile-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-muted);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tile-deg {
  font-size: 0.6em;
  vertical-align: baseline;
  position: relative;
  top: -0.18em;
  margin-left: -1px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
}

.status-dot.green,
.status-dot.amber,
.status-dot.red,
.status-dot.blue,
.status-dot.muted {
  display: block;
}

.status-dot.green { background: var(--green); }
.status-dot.amber { background: var(--amber); }
.status-dot.red { background: var(--red); }
.status-dot.blue { background: var(--blue); }
.status-dot.muted { background: var(--text-muted); opacity: 0.5; }

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
  display: none;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  z-index: 2;
}

.tile-aux.show {
  display: inline-flex;
}

.tile.has-aux {
  padding-top: 26px;
}

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
  font-size: 14px;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  transition: transform var(--motion-fast) var(--ease-standard);
  flex-shrink: 0;
}

.tile-dd-val[aria-expanded='true'] .chevron {
  transform: rotate(180deg);
}

.tile-dd-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 140px;
  max-width: 200px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 20;
  display: none;
}

.tile-dd-menu.open {
  display: flex;
}

.tile-dd-opt.active {
  font-weight: 700;
  background: var(--blue-fill);
  color: var(--blue);
}

.tile[data-type='alarm'] .tile-val {
  display: inline-flex;
  align-items: center;
  padding: 0.15em 0.5em;
  border-radius: var(--r-pill);
  background: var(--blue-fill);
  color: var(--blue);
}

.tile[data-type='alarm'].alarm-off .tile-val {
  background: var(--track-bg);
  color: var(--text-muted);
  opacity: 0.6;
}

.tile[data-type='alarm'].alarm-ringing {
  background: var(--blue-fill);
  box-shadow: 0 0 0 1px var(--blue), var(--shadow);
}

.alarm-actions {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 6px;
  gap: 4px;
  justify-content: center;
  z-index: 3;
}

.tile[data-type='alarm'].alarm-ringing .alarm-actions {
  display: flex;
}

.alarm-btn {
  border: 1px solid transparent;
  border-radius: var(--r-pill);
  padding: 0.25em 0.625em;
  font-family: inherit;
  font-size: 0.5625em;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  cursor: pointer;
}

.alarm-btn.snooze {
  background: var(--blue);
  color: #fff;
}

.alarm-btn.dismiss {
  background: var(--ctrl-bg);
  border-color: var(--ctrl-border);
  color: var(--text-sub);
}
`;

const TEMPLATE = `
${FONT_LINKS}
<div id="tile" class="tile" tabindex="0" role="button">
  <div id="dot" class="status-dot"></div>
  <button id="auxBtn" class="tile-aux" type="button" aria-label="Aux action">
    <span id="auxIcon" class="icon icon-14"></span>
    <span id="auxLabel"></span>
  </button>
  <div id="iconWrap" class="tile-icon"><span id="icon" class="icon icon-28">info</span></div>
  <div id="value" class="tile-val">--</div>
  <div id="dropdownValue" class="tile-dd-val" aria-expanded="false" hidden>
    <span id="dropdownText">--</span>
    <span class="icon chevron">expand_more</span>
  </div>
  <div id="label" class="tile-label">Status</div>
  <div id="menu" class="tile-dd-menu"></div>
  <div id="alarmActions" class="alarm-actions">
    <button id="snoozeBtn" class="alarm-btn snooze" type="button">Snooze</button>
    <button id="dismissBtn" class="alarm-btn dismiss" type="button">Stop</button>
  </div>
</div>
`;

class TunetStatusTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._timerInterval = null;
    this._menuOpen = false;
    this._onDocClick = this._handleDocClick.bind(this);
  }

  setConfig(config) {
    this._config = {
      type: config?.type || 'indicator',
      entity: config?.entity || '',
      icon: normalizeTunetIcon(config?.icon || 'info', 'info'),
      label: config?.label || 'Status',
      accent: config?.accent || 'muted',
      unit: config?.unit || '',
      format: config?.format || 'state',
      attribute: config?.attribute || '',
      dot_rules: Array.isArray(config?.dot_rules) ? config.dot_rules : [],
      show_when: config?.show_when || null,
      tap_action: normalizeAction(config?.tap_action || { action: 'more-info', entity_id: config?.entity || '' }, config?.entity || ''),
      aux_action: config?.aux_action ? normalizeAction(config.aux_action, config?.entity || '') : null,
      playing_entity: config?.playing_entity || '',
      snooze_action: config?.snooze_action ? normalizeAction(config.snooze_action, config?.entity || '') : null,
      dismiss_action: config?.dismiss_action ? normalizeAction(config.dismiss_action, config?.entity || '') : null,
    };

    if (this._els) {
      this._renderStatic();
      this._update();
    }
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));
    if (this._els) this._update();
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (!this._config) this.setConfig({});
    this._update();
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    this._clearTimer();
    this._removeListeners();
    document.removeEventListener('click', this._onDocClick);
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
      dot: this.shadowRoot.getElementById('dot'),
      auxBtn: this.shadowRoot.getElementById('auxBtn'),
      auxIcon: this.shadowRoot.getElementById('auxIcon'),
      auxLabel: this.shadowRoot.getElementById('auxLabel'),
      icon: this.shadowRoot.getElementById('icon'),
      value: this.shadowRoot.getElementById('value'),
      dropdownValue: this.shadowRoot.getElementById('dropdownValue'),
      dropdownText: this.shadowRoot.getElementById('dropdownText'),
      label: this.shadowRoot.getElementById('label'),
      menu: this.shadowRoot.getElementById('menu'),
      alarmActions: this.shadowRoot.getElementById('alarmActions'),
      snoozeBtn: this.shadowRoot.getElementById('snoozeBtn'),
      dismissBtn: this.shadowRoot.getElementById('dismissBtn'),
    };

    this._bindListeners();
    this._renderStatic();
  }

  _bindListeners() {
    this._onTap = this._handleTap.bind(this);
    this._onAux = this._handleAux.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onSnooze = this._handleSnooze.bind(this);
    this._onDismiss = this._handleDismiss.bind(this);

    this._els.tile.addEventListener('click', this._onTap);
    this._els.tile.addEventListener('keydown', this._onKeyDown);
    this._els.auxBtn.addEventListener('click', this._onAux);
    this._els.snoozeBtn.addEventListener('click', this._onSnooze);
    this._els.dismissBtn.addEventListener('click', this._onDismiss);
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.tile.removeEventListener('click', this._onTap);
    this._els.tile.removeEventListener('keydown', this._onKeyDown);
    this._els.auxBtn.removeEventListener('click', this._onAux);
    this._els.snoozeBtn.removeEventListener('click', this._onSnooze);
    this._els.dismissBtn.removeEventListener('click', this._onDismiss);
  }

  _renderStatic() {
    const cfg = this._config || {};
    const { tile, icon, label, auxBtn, auxIcon, auxLabel, menu, snoozeBtn, dismissBtn } = this._els;

    tile.dataset.type = cfg.type;
    tile.dataset.accent = cfg.accent;
    icon.textContent = cfg.icon || 'info';
    label.textContent = cfg.label || 'Status';

    if (cfg.aux_action) {
      const text = cfg.aux_action.label || cfg.aux_action.name || '';
      auxIcon.textContent = normalizeTunetIcon(cfg.aux_action.icon || 'more_horiz', 'more_horiz');
      auxLabel.textContent = text;
      auxLabel.style.display = text ? '' : 'none';
      auxBtn.classList.add('show');
      tile.classList.add('has-aux');
    } else {
      auxBtn.classList.remove('show');
      tile.classList.remove('has-aux');
    }

    const isDropdown = cfg.type === 'dropdown';
    this._els.dropdownValue.hidden = !isDropdown;
    this._els.value.hidden = isDropdown;

    menu.innerHTML = '';
    if (isDropdown && cfg.entity && this._hass?.states?.[cfg.entity]?.attributes?.options) {
      const options = this._hass.states[cfg.entity].attributes.options || [];
      for (const opt of options) {
        const btn = document.createElement('button');
        btn.className = 'tile-dd-opt';
        btn.type = 'button';
        btn.textContent = String(opt);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._emitAction({
            action: 'call-service',
            service: 'input_select.select_option',
            data: { entity_id: cfg.entity, option: opt },
            entity_id: cfg.entity,
          }, 'dropdown_option');
          this._setMenuOpen(false);
        });
        menu.appendChild(btn);
      }
    }

    snoozeBtn.style.display = cfg.snooze_action ? '' : 'none';
    dismissBtn.style.display = cfg.dismiss_action ? '' : 'none';
  }

  _update() {
    if (!this._config || !this._hass || !this._els) return;

    const show = evaluateShowWhen(this._hass, this._config.show_when, this._config.entity);
    this.classList.toggle('tile-hidden', !show);
    this._els.tile.classList.toggle('tile-hidden', !show);
    if (!show) {
      this._setMenuOpen(false);
      this._clearTimer();
      return;
    }

    const entity = this._hass.states?.[this._config.entity];
    if (!entity) {
      this._setValue('?');
      this._setMenuOpen(false);
      this._clearTimer();
      return;
    }

    if (this._config.type === 'timer') {
      this._updateTimer(entity);
      return;
    }

    this._clearTimer();

    if (this._config.type === 'alarm') {
      this._updateAlarm(entity);
      return;
    }

    let val = this._config.attribute
      ? entity.attributes?.[this._config.attribute]
      : entity.state;

    if (val === null || val === undefined || val === '') val = '?';

    if (this._config.type === 'dropdown') {
      this._els.dropdownText.textContent = String(val);
      const options = this._hass.states?.[this._config.entity]?.attributes?.options || [];
      const buttons = this._els.menu.querySelectorAll('.tile-dd-opt');
      buttons.forEach((btn, index) => {
        btn.classList.toggle('active', String(options[index]) === String(val));
      });
    } else {
      this._setValue(formatValueWithUnit(val, this._config.format, this._config.unit));
    }

    this._applyDotRules(String(val));
  }

  _setValue(val) {
    const valueEl = this._els.value;
    if (this._config.unit === '°F' || this._config.unit === '°C' || this._config.unit === '°') {
      const suffix = this._config.unit === '°F' ? 'F' : this._config.unit === '°C' ? 'C' : '';
      valueEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${suffix}`;
      return;
    }
    valueEl.textContent = String(val);
  }

  _applyDotRules(stateStr) {
    const dot = this._els.dot;
    dot.className = 'status-dot';

    const rules = this._config.dot_rules || [];
    for (const rule of rules) {
      if (!rule || !rule.match || !rule.dot) continue;
      if (rule.match === '*' || stateStr === rule.match || stateStr.includes(rule.match)) {
        dot.classList.add(rule.dot);
        break;
      }
    }
  }

  _updateTimer(entity) {
    const remainingRaw = String(entity.attributes?.remaining || '');
    const active = entity.state === 'active';

    if (!active || !remainingRaw) {
      this._setValue('--:--');
      this._clearTimer();
      return;
    }

    const parts = remainingRaw.split(':').map((n) => Number(n));
    const snapshot = parts.length === 3
      ? (parts[0] * 3600 + parts[1] * 60 + parts[2])
      : (parts.length === 2 ? (parts[0] * 60 + parts[1]) : 0);

    const updated = new Date(entity.last_updated || Date.now()).getTime();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - updated) / 1000);
      const current = Math.max(0, snapshot - elapsed);
      this._setValue(this._formatFromSeconds(current));
      if (current <= 0) this._clearTimer();
    };

    tick();

    if (!this._timerInterval) {
      this._timerInterval = setInterval(tick, 1000);
    }
  }

  _updateAlarm(entity) {
    const alarmState = String(entity.state || '--:--');
    const isSet = alarmState && alarmState !== '--:--' && alarmState !== 'unknown' && alarmState !== 'unavailable';
    const playing = this._config.playing_entity ? this._hass.states?.[this._config.playing_entity] : null;
    const isRinging = ['true', 'on', 'True'].includes(String(playing?.state || ''));

    this._setValue(isSet ? alarmState : '--:--');

    const tile = this._els.tile;
    tile.classList.toggle('alarm-set', isSet && !isRinging);
    tile.classList.toggle('alarm-off', !isSet && !isRinging);
    tile.classList.toggle('alarm-ringing', isRinging);
    tile.dataset.accent = isSet || isRinging ? 'blue' : 'muted';
  }

  _formatFromSeconds(total) {
    if (total <= 0) return '0:00';
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _clearTimer() {
    if (!this._timerInterval) return;
    clearInterval(this._timerInterval);
    this._timerInterval = null;
  }

  _handleTap(e) {
    if (this._config.type === 'dropdown') {
      e.stopPropagation();
      this._setMenuOpen(!this._menuOpen);
      return;
    }

    this._emitAction(this._config.tap_action, 'tap');
  }

  _handleAux(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this._config.aux_action) return;
    this._emitAction(this._config.aux_action, 'aux');
  }

  _handleKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (this._config.type === 'dropdown') {
      this._setMenuOpen(!this._menuOpen);
      return;
    }
    this._emitAction(this._config.tap_action, 'keyboard');
  }

  _handleSnooze(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this._config.snooze_action) this._emitAction(this._config.snooze_action, 'alarm_snooze');
  }

  _handleDismiss(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this._config.dismiss_action) this._emitAction(this._config.dismiss_action, 'alarm_dismiss');
  }

  _emitAction(action, trigger) {
    const normalized = normalizeAction(action || { action: 'none' }, this._config.entity || '');
    this.dispatchEvent(new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      detail: {
        action: normalized,
        entity_id: normalized.entity_id || this._config.entity || '',
        source: 'status-tile',
        trigger,
      },
    }));
  }

  _setMenuOpen(open) {
    if (this._config.type !== 'dropdown') return;
    this._menuOpen = !!open;
    this._els.menu.classList.toggle('open', this._menuOpen);
    this._els.dropdownValue.setAttribute('aria-expanded', this._menuOpen ? 'true' : 'false');
    this._els.tile.setAttribute('aria-expanded', this._menuOpen ? 'true' : 'false');

    if (this._menuOpen) {
      requestAnimationFrame(() => this._positionDropdownMenu());
    } else {
      this._els.menu.style.top = '';
      this._els.menu.style.bottom = '';
      this._els.menu.style.maxHeight = '';
    }
  }

  _positionDropdownMenu() {
    const tileRect = this._els.tile.getBoundingClientRect();
    const menuRect = this._els.menu.getBoundingClientRect();
    const viewH = window.innerHeight;
    const spaceBelow = viewH - tileRect.bottom - 8;
    const spaceAbove = tileRect.top - 8;
    const menuH = menuRect.height;

    this._els.menu.style.top = 'calc(100% + 4px)';
    this._els.menu.style.bottom = 'auto';
    this._els.menu.style.maxHeight = '240px';

    if (menuH > spaceBelow && spaceAbove > spaceBelow) {
      this._els.menu.style.top = 'auto';
      this._els.menu.style.bottom = 'calc(100% + 4px)';
      if (menuH > spaceAbove) {
        this._els.menu.style.maxHeight = `${Math.max(120, spaceAbove - 8)}px`;
      }
      return;
    }

    if (menuH > spaceBelow) {
      this._els.menu.style.maxHeight = `${Math.max(120, spaceBelow - 8)}px`;
    }
  }

  _handleDocClick(event) {
    if (!this._menuOpen || this._config.type !== 'dropdown') return;
    const path = event.composedPath();
    if (!path.includes(this._els.tile)) {
      this._setMenuOpen(false);
    }
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetStatusTile);
}

console.info(`%cTUNET-STATUS-TILE ${VERSION}`, 'color:#007AFF;font-weight:700;');

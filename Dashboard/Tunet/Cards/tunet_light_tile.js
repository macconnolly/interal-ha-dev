/**
 * Tunet Light Tile (event-only primitive)
 * Version 2.0.1
 *
 * Event contract:
 * - tunet:value-preview { entity_id, value, source }
 * - tunet:value-commit  { entity_id, value, source }
 * - tunet:action        { entity_id, action, source }
 * - tunet:request-more-info { entity_id, source }
 */

import {
  RESET,
  BASE_FONT,
  ICON_BASE,
  LIGHT_TILE_PATTERN,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
  clamp,
} from './tunet_base.js';

import {
  evaluateShowWhen,
  normalizeAction,
  normalizeTunetIcon,
  readBrightnessPercent,
  entityStateEquals,
} from './tunet_runtime.js';

const TAG = 'tunet-light-tile';
const VERSION = '2.0.1';

const CSS = `
${RESET}
${BASE_FONT}
${ICON_BASE}
${LIGHT_TILE_PATTERN}
${REDUCED_MOTION}
`;

const TEMPLATE = `
${FONT_LINKS}
<div class="lt vertical off" id="tile" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <div class="manual-dot" id="manualDot"></div>
  <button class="sub-btn" id="subBtn" type="button" aria-label="Tile action">
    <span class="icon" id="subIcon">more_horiz</span>
  </button>
  <div class="icon-wrap" id="iconWrap">
    <span class="icon tile-icon" id="icon">lightbulb</span>
  </div>
  <div class="content" id="content">
    <div class="name" id="name">Light</div>
    <div class="val" id="val">Off</div>
  </div>
  <div class="progress-track" id="track">
    <div class="progress-fill" id="fill"></div>
  </div>
</div>
`;

class TunetLightTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._state = {
      unavailable: true,
      isOn: false,
      brightness: 0,
      name: '',
      icon: 'lightbulb',
      manual: false,
    };
    this._gesture = null;
    this._tapTimer = null;
    this._longPressTimer = null;
    this._standaloneWarned = false;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error(`${TAG}: 'entity' is required`);
    }

    const variant = config.variant === 'horizontal' ? 'horizontal' : 'vertical';
    const iconContainer = ['auto', 'on', 'off'].includes(config.icon_container)
      ? config.icon_container
      : 'auto';

    this._config = {
      entity: config.entity,
      composer_managed: config.composer_managed === true,
      name: config.name || '',
      icon: config.icon || '',
      accent: config.accent || 'amber',
      variant,
      icon_container: iconContainer,
      show_progress: config.show_progress !== false,
      show_value: config.show_value !== false,
      show_when: config.show_when || null,
      brightness_entity: config.brightness_entity || '',
      manual_entity: config.manual_entity || '',
      manual_active: typeof config.manual_active === 'boolean' ? config.manual_active : null,
      show_manual: config.show_manual !== false,
      tap_action: normalizeAction(config.tap_action || { action: 'toggle' }, config.entity),
      hold_action: config.hold_action ? normalizeAction(config.hold_action, config.entity) : null,
      double_tap_action: config.double_tap_action
        ? normalizeAction(config.double_tap_action, config.entity)
        : null,
      sub_button: config.sub_button || null,
      hold_ms: Number.isFinite(Number(config.hold_ms)) ? Number(config.hold_ms) : 500,
    };

    if (!this._config.composer_managed && !this._standaloneWarned) {
      this._standaloneWarned = true;
      console.warn('tunet-light-tile: standalone usage is deprecated. Use through a composer card.');
    }

    if (this._els) this._render();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    applyDarkClass(this, detectDarkMode(hass));

    if (!this._config || !this._els) return;

    const entityId = this._config.entity;
    const oldEntity = oldHass?.states?.[entityId];
    const newEntity = hass?.states?.[entityId];

    const oldBrtEntity = this._config.brightness_entity
      ? oldHass?.states?.[this._config.brightness_entity]
      : null;
    const newBrtEntity = this._config.brightness_entity
      ? hass?.states?.[this._config.brightness_entity]
      : null;

    const oldManualEntity = this._config.manual_entity
      ? oldHass?.states?.[this._config.manual_entity]
      : null;
    const newManualEntity = this._config.manual_entity
      ? hass?.states?.[this._config.manual_entity]
      : null;

    if (
      !oldEntity ||
      oldEntity !== newEntity ||
      oldBrtEntity !== newBrtEntity ||
      oldManualEntity !== newManualEntity
    ) {
      this._render();
    }
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (this._config && this._hass) this._render();
  }

  disconnectedCallback() {
    this._clearTimers();
    this._removeListeners();
  }

  getCardSize() {
    return this._config?.variant === 'horizontal' ? 1 : 2;
  }

  _renderShell() {
    this.shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = CSS;
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._els = {
      tile: this.shadowRoot.getElementById('tile'),
      iconWrap: this.shadowRoot.getElementById('iconWrap'),
      icon: this.shadowRoot.getElementById('icon'),
      content: this.shadowRoot.getElementById('content'),
      name: this.shadowRoot.getElementById('name'),
      val: this.shadowRoot.getElementById('val'),
      track: this.shadowRoot.getElementById('track'),
      fill: this.shadowRoot.getElementById('fill'),
      manualDot: this.shadowRoot.getElementById('manualDot'),
      subBtn: this.shadowRoot.getElementById('subBtn'),
      subIcon: this.shadowRoot.getElementById('subIcon'),
    };

    this._bindListeners();
  }

  _bindListeners() {
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onPointerCancel = this._handlePointerCancel.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onSubClick = this._handleSubClick.bind(this);

    this._els.tile.addEventListener('pointerdown', this._onPointerDown);
    this._els.tile.addEventListener('pointermove', this._onPointerMove);
    this._els.tile.addEventListener('pointerup', this._onPointerUp);
    this._els.tile.addEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.addEventListener('keydown', this._onKeyDown);
    this._els.subBtn.addEventListener('click', this._onSubClick);
    this._els.subBtn.addEventListener('pointerdown', e => e.stopPropagation());
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.tile.removeEventListener('pointerdown', this._onPointerDown);
    this._els.tile.removeEventListener('pointermove', this._onPointerMove);
    this._els.tile.removeEventListener('pointerup', this._onPointerUp);
    this._els.tile.removeEventListener('pointercancel', this._onPointerCancel);
    this._els.tile.removeEventListener('keydown', this._onKeyDown);
    this._els.subBtn.removeEventListener('click', this._onSubClick);
  }

  _clearTimers() {
    clearTimeout(this._tapTimer);
    clearTimeout(this._longPressTimer);
    this._tapTimer = null;
    this._longPressTimer = null;
  }

  _render() {
    if (!this._config || !this._hass || !this._els) return;

    const shouldShow = evaluateShowWhen(this._hass, this._config.show_when, this._config.entity);
    this.style.display = shouldShow ? '' : 'none';
    if (!shouldShow) return;

    const entity = this._hass.states?.[this._config.entity];
    const unavailable = !entity || entity.state === 'unavailable';
    const brightness = this._readBrightness(entity);
    const isOn = !unavailable && (entity?.state === 'on' || brightness > 0);
    const name = this._config.name || entity?.attributes?.friendly_name || this._config.entity;
    const iconName = normalizeTunetIcon(this._config.icon || this._entityIcon(entity), 'lightbulb');
    const manual = this._resolveManual(entity);

    this._state = {
      unavailable,
      isOn,
      brightness,
      name,
      icon: iconName,
      manual,
    };

    const { tile, icon: iconEl, name: nameEl, val, fill, track } = this._els;

    tile.classList.remove('vertical', 'horizontal', 'on', 'off', 'unavailable', 'no-icon-wrap', 'has-sub');
    tile.classList.add(this._config.variant);
    tile.classList.add(unavailable ? 'unavailable' : (isOn ? 'on' : 'off'));

    if (this._config.icon_container === 'off') {
      tile.classList.add('no-icon-wrap');
    }

    nameEl.textContent = name;
    iconEl.textContent = iconName;

    if (this._config.show_value) {
      val.classList.remove('hide');
      val.textContent = unavailable ? 'Unavailable' : (brightness > 0 ? `${brightness}%` : 'Off');
    } else {
      val.classList.add('hide');
    }

    if (this._config.show_progress) {
      track.classList.remove('hide');
      fill.style.width = `${brightness}%`;
    } else {
      track.classList.add('hide');
    }

    if (manual && this._config.show_manual) {
      tile.dataset.manual = 'true';
    } else {
      tile.dataset.manual = 'false';
    }

    tile.dataset.brightness = String(brightness);
    tile.setAttribute('aria-label', `${name}, ${unavailable ? 'Unavailable' : (brightness > 0 ? `${brightness}%` : 'Off')}`);
    tile.setAttribute('aria-valuenow', String(brightness));
    tile.setAttribute('aria-valuetext', unavailable ? 'Unavailable' : (brightness > 0 ? `${brightness} percent` : 'Off'));

    this._renderSubButton();
  }

  _renderSubButton() {
    const { subBtn, subIcon, tile } = this._els;
    const sub = this._config.sub_button;
    if (!sub) {
      subBtn.classList.remove('show');
      tile.classList.remove('has-sub');
      return;
    }

    const show = evaluateShowWhen(this._hass, sub.show_when || null, this._config.entity);
    if (!show) {
      subBtn.classList.remove('show');
      tile.classList.remove('has-sub');
      return;
    }

    subIcon.textContent = normalizeTunetIcon(sub.icon || 'more_horiz', 'more_horiz');
    subBtn.classList.add('show');
    tile.classList.add('has-sub');
  }

  _entityIcon(entity) {
    const mdi = entity?.attributes?.icon || '';
    const map = {
      'mdi:ceiling-light': 'light',
      'mdi:lamp': 'table_lamp',
      'mdi:floor-lamp': 'floor_lamp',
      'mdi:desk-lamp': 'table_lamp',
      'mdi:lightbulb': 'lightbulb',
      'mdi:lightbulb-group': 'lightbulb',
      'mdi:led-strip': 'highlight',
      'mdi:light-recessed': 'fluorescent',
      'mdi:wall-sconce': 'wall_lamp',
      'mdi:outdoor-lamp': 'deck',
      'mdi:track-light': 'highlight',
    };
    return map[mdi] || 'lightbulb';
  }

  _readBrightness(entity) {
    if (this._config.brightness_entity) {
      const brtEntity = this._hass?.states?.[this._config.brightness_entity];
      const n = Number(brtEntity?.state);
      if (Number.isFinite(n)) return clamp(Math.round(n), 0, 100);
    }

    return readBrightnessPercent(this._hass, this._config.entity) || 0;
  }

  _resolveManual(entity) {
    if (!this._config.show_manual) return false;

    if (typeof this._config.manual_active === 'boolean') {
      return this._config.manual_active;
    }

    if (this._config.manual_entity) {
      return (
        entityStateEquals(this._hass, this._config.manual_entity, 'on') ||
        entityStateEquals(this._hass, this._config.manual_entity, 'true') ||
        entityStateEquals(this._hass, this._config.manual_entity, 'active')
      );
    }

    return entity?.attributes?.manual_override === true;
  }

  _handleSubClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const sub = this._config.sub_button;
    if (!sub) return;
    this._emitAction(normalizeAction(sub.tap_action || { action: 'more-info' }, this._config.entity), 'sub_button');
  }

  _handlePointerDown(e) {
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this._state.unavailable) return;

    this._clearTimers();

    const pointerType = e.pointerType || 'mouse';
    const isTouch = pointerType === 'touch';

    this._gesture = {
      pointerId: e.pointerId,
      pointerType,
      startX: e.clientX,
      startY: e.clientY,
      startBrightness: this._state.brightness,
      currentBrightness: this._state.brightness,
      dragThreshold: isTouch ? 5 : 10,
      axisBias: isTouch ? 2 : 5,
      dragGain: isTouch ? 1.12 : 0.95,
      axisLocked: false,
      moved: false,
      ignoreTap: false,
      holdFired: false,
    };

    try {
      this._els.tile.setPointerCapture(e.pointerId);
    } catch (_) {
      // no-op
    }

    if (this._config.hold_action) {
      this._longPressTimer = setTimeout(() => {
        if (!this._gesture) return;
        this._gesture.holdFired = true;
        this._emitAction(this._config.hold_action, 'hold');
      }, this._config.hold_ms);
    }
  }

  _handlePointerMove(e) {
    const g = this._gesture;
    if (!g || g.pointerId !== e.pointerId || g.holdFired) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!g.axisLocked) {
      if (absDx < g.dragThreshold && absDy < g.dragThreshold) return;

      if (absDy > absDx + g.axisBias) {
        g.ignoreTap = true;
        this._cancelGesture();
        return;
      }

      g.axisLocked = true;
    }

    if (!g.moved && absDx < g.dragThreshold) return;

    if (!g.moved) {
      g.moved = true;
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
      this._els.tile.classList.add('sliding');
    }

    if (e.cancelable) e.preventDefault();

    const width = Math.max(this._els.tile.offsetWidth, 1);
    const dragRange = g.pointerType === 'touch'
      ? Math.max(width * 0.82, 110)
      : Math.max(width * 1.20, 185);
    const delta = (dx / dragRange) * 100 * g.dragGain;
    const next = clamp(Math.round(g.startBrightness + delta), 0, 100);

    if (next === g.currentBrightness) return;

    g.currentBrightness = next;
    this._applyOptimisticBrightness(next);
    this._emit('tunet:value-preview', {
      entity_id: this._config.entity,
      value: next,
      source: 'drag',
    });
  }

  _handlePointerUp(e) {
    const g = this._gesture;
    if (!g || g.pointerId !== e.pointerId) return;

    clearTimeout(this._longPressTimer);
    this._longPressTimer = null;

    if (g.holdFired) {
      this._cancelGesture();
      return;
    }

    if (g.moved) {
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: g.currentBrightness,
        source: 'drag',
      });
    } else if (!g.ignoreTap) {
      this._triggerTapAction();
    }

    this._cancelGesture();
  }

  _handlePointerCancel(e) {
    const g = this._gesture;
    if (!g || g.pointerId !== e.pointerId) return;
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

    this._els.tile.classList.remove('sliding');
    this._gesture = null;
  }

  _triggerTapAction() {
    const doubleAction = this._config.double_tap_action;

    if (doubleAction) {
      if (this._tapTimer) {
        clearTimeout(this._tapTimer);
        this._tapTimer = null;
        this._emitAction(doubleAction, 'double_tap');
        return;
      }

      this._tapTimer = setTimeout(() => {
        this._tapTimer = null;
        this._fireSingleTap();
      }, 240);
      return;
    }

    this._fireSingleTap();
  }

  _fireSingleTap() {
    const action = this._config.tap_action || normalizeAction({ action: 'toggle' }, this._config.entity);

    if ((action.action || 'toggle') === 'toggle') {
      const next = this._state.brightness > 0 ? 0 : 100;
      this._applyOptimisticBrightness(next);
    }

    this._emitAction(action, 'tap');
  }

  _handleKeyDown(e) {
    if (this._state.unavailable) return;

    const step = e.shiftKey ? 10 : 5;
    const current = this._state.brightness;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = clamp(current + step, 0, 100);
      this._applyOptimisticBrightness(next);
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: next,
        source: 'keyboard',
      });
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = clamp(current - step, 0, 100);
      this._applyOptimisticBrightness(next);
      this._emit('tunet:value-commit', {
        entity_id: this._config.entity,
        value: next,
        source: 'keyboard',
      });
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._triggerTapAction();
    }
  }

  _applyOptimisticBrightness(next) {
    const brightness = clamp(Number(next) || 0, 0, 100);
    this._state.brightness = brightness;
    this._state.isOn = brightness > 0;

    const { tile, fill, val } = this._els;
    tile.classList.toggle('on', brightness > 0);
    tile.classList.toggle('off', brightness <= 0);
    tile.dataset.brightness = String(brightness);
    tile.setAttribute('aria-valuenow', String(brightness));
    tile.setAttribute('aria-valuetext', brightness > 0 ? `${brightness} percent` : 'Off');

    if (this._config.show_progress) {
      fill.style.width = `${brightness}%`;
    }

    if (this._config.show_value) {
      val.textContent = brightness > 0 ? `${brightness}%` : 'Off';
    }
  }

  _emitAction(action, source) {
    const normalized = normalizeAction(action, this._config.entity);
    const entityId = normalized.entity_id || this._config.entity;

    this._emit('tunet:action', {
      entity_id: entityId,
      action: normalized,
      source,
    });

    if ((normalized.action || 'more-info') === 'more-info') {
      this._emit('tunet:request-more-info', {
        entity_id: entityId,
        source,
      });
    }
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail,
    }));
  }
}

registerCard(TAG, TunetLightTile, {
  type: TAG,
  name: 'Tunet Light Tile (Primitive)',
  description: 'Event-only light tile primitive intended for composer cards',
});

logCardVersion('TUNET-LIGHT-TILE', VERSION, '#D4850A');

/**
 * tunet-light-tile — Reusable Light Control Primitive
 * ──────────────────────────────────────────────────────────────
 * A self-contained custom element that renders a single light
 * entity tile with drag-to-dim, tap-to-toggle, keyboard control,
 * manual override indicator, and floating brightness pill.
 *
 * DOES NOT call HA services directly. Emits events:
 *   tunet:value-commit   — final brightness after drag/keyboard
 *   tunet:value-preview  — optimistic brightness during drag
 *   tunet:action          — tap/hold/double-tap action requests
 *   tunet:request-more-info — long-press info request
 *
 * The parent composer (tunet-lighting-card) listens for these
 * events and routes them to HA service calls.
 *
 * Schema (v1.0):
 *   entity:          string (required)
 *   name:            string
 *   icon:            string
 *   variant:         'vertical' | 'horizontal'
 *   accent:          'amber' | 'blue' | 'green' | 'purple'
 *   icon_container:  'auto' | 'on' | 'off'
 *   show_progress:   boolean (default true)
 *   show_value:      boolean (default true)
 *   brightness:      { read_entity, write: { mode, entity } }
 *   manual:          { mode: 'auto'|'entity'|'off', entity }
 *   sub_button:      { icon, tap_action, show_when }
 *   tap_action:      action config (default: toggle)
 *   hold_action:     action config (default: more-info)
 *   double_tap_action: action config (default: none)
 *   show_when:       { entity, operator, state, attribute }
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, RESET_CSS, ICON_BASE,
  escapeHtml, injectFonts, FONT_LINKS_HTML,
} from './tunet_base.js';

import {
  normalizeLightIcon, resolveEntityIcon,
  evaluateShowWhen, normalizeAction, dispatchAction,
  readBrightnessPercent, friendlyName,
} from './tunet_runtime.js';

const TILE_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   TILE CSS
   ═══════════════════════════════════════════════════════════════ */

const TILE_STYLES = `
  ${TOKENS}
  ${RESET_CSS}
  ${ICON_BASE}

  :host {
    display: block;
    contain: layout style;
  }
  :host([hidden]) { display: none !important; }

  /* ── Vertical tile (default) ─────────────────────── */
  .tile {
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--tile-shadow-rest);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    border: 1px solid transparent;
    overflow: visible;
    height: 100%;
    min-height: 0;
    padding: 10px 8px 16px;
    transition:
      transform .2s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow .2s ease,
      border-color .2s ease,
      background-color .3s ease;
  }
  .tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  /* ── Horizontal variant ──────────────────────────── */
  :host([variant="horizontal"]) .tile {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 10px 14px;
    min-height: 62px;
    height: auto;
  }
  :host([variant="horizontal"]) .tile-body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }
  :host([variant="horizontal"]) .zone-name {
    text-align: left;
    max-width: 100%;
  }
  :host([variant="horizontal"]) .zone-val {
    text-align: left;
    font-size: 12px;
  }
  :host([variant="horizontal"]) .icon-wrap {
    margin-bottom: 0;
  }
  :host([variant="horizontal"]) .progress-track {
    left: 14px;
    right: 14px;
  }

  /* ── Off state ───────────────────────────────────── */
  .tile.off { opacity: 1; }
  .tile.off .icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
    border-color: transparent;
  }
  .tile.off .zone-name { color: var(--text-sub); }
  .tile.off .zone-val { color: var(--text-sub); opacity: 0.5; }
  .tile.off .progress-fill { opacity: 0; }

  /* ── On state ────────────────────────────────────── */
  .tile.on { border-color: var(--amber-border); }
  .tile.on .icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .tile.on .icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .tile.on .zone-val { color: var(--amber); }
  .tile.on .progress-fill { background: rgba(212,133,10, 0.90); }
  :host(.dark) .tile.on .progress-fill { background: rgba(251,191,36, 0.90); }

  /* ── Accent variants ─────────────────────────────── */
  :host([accent="blue"]) .tile.on { border-color: var(--blue-border); }
  :host([accent="blue"]) .tile.on .icon-wrap {
    background: var(--blue-fill); color: var(--blue); border-color: var(--blue-border);
  }
  :host([accent="blue"]) .tile.on .zone-val { color: var(--blue); }
  :host([accent="blue"]) .tile.on .progress-fill { background: var(--blue); }

  :host([accent="green"]) .tile.on { border-color: var(--green-border); }
  :host([accent="green"]) .tile.on .icon-wrap {
    background: var(--green-fill); color: var(--green); border-color: var(--green-border);
  }
  :host([accent="green"]) .tile.on .zone-val { color: var(--green); }
  :host([accent="green"]) .tile.on .progress-fill { background: var(--green); }

  :host([accent="purple"]) .tile.on { border-color: var(--purple-border); }
  :host([accent="purple"]) .tile.on .icon-wrap {
    background: var(--purple-fill); color: var(--purple); border-color: var(--purple-border);
  }
  :host([accent="purple"]) .tile.on .zone-val { color: var(--purple); }
  :host([accent="purple"]) .tile.on .progress-fill { background: var(--purple); }

  /* ── Unavailable state ───────────────────────────── */
  .tile.unavailable {
    opacity: 0.38;
    filter: saturate(0.45);
    pointer-events: none;
  }
  .tile.unavailable .icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
    border-color: transparent;
  }
  .tile.unavailable .zone-val { color: var(--text-muted); opacity: 0.9; }

  /* ── Sliding state (drag active) ─────────────────── */
  .tile.sliding {
    transform: scale(1.05);
    box-shadow: var(--tile-shadow-lift);
    z-index: 100;
    border-color: var(--amber) !important;
    transition: none;
  }
  .tile.sliding .progress-track { height: 6px; }
  .tile.sliding .zone-val {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--amber);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.2px;
    background: var(--tile-bg);
    padding: 5px 16px;
    border-radius: var(--r-pill);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 101;
    border: 1px solid var(--ctrl-border);
    opacity: 1;
    white-space: nowrap;
  }

  /* ── Icon wrap ───────────────────────────────────── */
  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: var(--r-tile);
    display: grid;
    place-items: center;
    margin-bottom: 6px;
    transition: all .2s ease;
    border: 1px solid transparent;
  }
  .icon-wrap.no-container {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  /* ── Text ────────────────────────────────────────── */
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

  /* ── Progress track ──────────────────────────────── */
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
  .progress-track.hidden { display: none; }

  /* ── Manual override dot ─────────────────────────── */
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
  .tile[data-manual="true"] .manual-dot { display: block; }

  /* ── Sub-button ──────────────────────────────────── */
  .sub-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    display: grid;
    place-items: center;
    cursor: pointer;
    padding: 0;
    font: inherit;
    color: var(--text-sub);
    transition: all .15s ease;
    z-index: 2;
  }
  .sub-btn:hover { box-shadow: var(--tile-shadow-rest); }
  .sub-btn:active { transform: scale(0.92); }
  .sub-btn.hidden { display: none; }
  .tile.has-sub { padding-top: 26px; }
  :host([variant="horizontal"]) .tile.has-sub { padding-top: 10px; padding-right: 42px; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   ELEMENT CLASS
   ═══════════════════════════════════════════════════════════════ */

class TunetLightTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._brightness = 0;
    this._state = 'off'; // off | on | unavailable
    this._isManual = false;
    this._dragState = null;
    this._holdTimer = null;
    this._doubleTapTimer = null;
    this._tapCount = 0;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerCancel = this._onPointerCancel.bind(this);

    injectFonts();
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerCancel);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerCancel);
    clearTimeout(this._holdTimer);
    clearTimeout(this._doubleTapTimer);
  }

  /* ── Config ─────────────────────────────────────── */

  setConfig(config) {
    if (!config.entity) throw new Error('tunet-light-tile requires an entity');

    this._config = {
      entity: config.entity,
      name: config.name || '',
      icon: config.icon || '',
      variant: config.variant === 'horizontal' ? 'horizontal' : 'vertical',
      accent: config.accent || 'amber',
      icon_container: config.icon_container || 'auto',
      show_progress: config.show_progress !== false,
      show_value: config.show_value !== false,
      brightness: this._normalizeBrightnessConfig(config),
      manual: this._normalizeManualConfig(config),
      sub_button: config.sub_button || null,
      tap_action: normalizeAction(config.tap_action || { action: 'toggle' }, config.entity),
      hold_action: normalizeAction(config.hold_action || { action: 'more-info' }, config.entity),
      double_tap_action: normalizeAction(config.double_tap_action || { action: 'none' }, config.entity),
      show_when: config.show_when || null,
    };

    // Host attributes for CSS selectors
    if (this._config.variant === 'horizontal') this.setAttribute('variant', 'horizontal');
    else this.removeAttribute('variant');

    if (this._config.accent !== 'amber') this.setAttribute('accent', this._config.accent);
    else this.removeAttribute('accent');

    if (this._rendered) this._rebuild();
  }

  _normalizeBrightnessConfig(config) {
    const b = config.brightness || {};
    return {
      read_entity: b.read_entity || config.entity,
      write: {
        mode: (b.write && b.write.mode) || 'light-service',
        entity: (b.write && b.write.entity) || config.entity,
      },
    };
  }

  _normalizeManualConfig(config) {
    const m = config.manual || {};
    return {
      mode: m.mode || 'auto',
      entity: m.entity || '',
    };
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    this._update();
  }

  /* ── Render (once) ──────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TILE_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS_HTML + `<div class="tile off" id="tile"></div>`;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._tileEl = this.shadowRoot.getElementById('tile');
    this._rebuild();
  }

  _rebuild() {
    if (!this._tileEl) return;
    const h = escapeHtml;
    const cfg = this._config;
    const iconGlyph = cfg.icon
      ? normalizeLightIcon(cfg.icon)
      : 'lightbulb'; // Will be overridden by entity icon in _update
    const showContainer = cfg.icon_container !== 'off';

    let subBtnHtml = '';
    if (cfg.sub_button) {
      const subIcon = normalizeLightIcon(cfg.sub_button.icon || 'power_settings_new');
      subBtnHtml = `<button class="sub-btn" type="button" id="subBtn">
        <span class="icon icon-14">${h(subIcon)}</span>
      </button>`;
    }

    const valHtml = cfg.show_value ? `<div class="zone-val" id="val">Off</div>` : '';
    const progressHtml = `<div class="progress-track${cfg.show_progress ? '' : ' hidden'}" id="track">
      <div class="progress-fill" id="fill"></div>
    </div>`;

    if (cfg.variant === 'horizontal') {
      this._tileEl.innerHTML = `
        <div class="manual-dot"></div>
        ${subBtnHtml}
        <div class="icon-wrap${showContainer ? '' : ' no-container'}" id="iconWrap">
          <span class="icon icon-20" id="iconEl">${h(iconGlyph)}</span>
        </div>
        <div class="tile-body">
          <div class="zone-name" id="name">${h(cfg.name || '')}</div>
          ${valHtml}
        </div>
        ${progressHtml}
      `;
    } else {
      this._tileEl.innerHTML = `
        <div class="manual-dot"></div>
        ${subBtnHtml}
        <div class="icon-wrap${showContainer ? '' : ' no-container'}" id="iconWrap">
          <span class="icon icon-20" id="iconEl">${h(iconGlyph)}</span>
        </div>
        <div class="zone-name" id="name">${h(cfg.name || '')}</div>
        ${valHtml}
        ${progressHtml}
      `;
    }

    // Cache refs
    this.$ = {
      tile: this._tileEl,
      iconWrap: this.shadowRoot.getElementById('iconWrap'),
      iconEl: this.shadowRoot.getElementById('iconEl'),
      name: this.shadowRoot.getElementById('name'),
      val: this.shadowRoot.getElementById('val'),
      fill: this.shadowRoot.getElementById('fill'),
      track: this.shadowRoot.getElementById('track'),
      subBtn: this.shadowRoot.getElementById('subBtn'),
    };

    // ARIA
    this._tileEl.setAttribute('role', 'slider');
    this._tileEl.setAttribute('aria-valuemin', '0');
    this._tileEl.setAttribute('aria-valuemax', '100');
    this._tileEl.setAttribute('aria-valuenow', '0');
    this._tileEl.setAttribute('tabindex', '0');

    // Sub-button class
    if (cfg.sub_button) this._tileEl.classList.add('has-sub');

    // Sub-button event
    if (this.$.subBtn) {
      this.$.subBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cfg.sub_button && cfg.sub_button.tap_action) {
          this._emitAction('tunet:action', cfg.sub_button.tap_action);
        }
      });
    }

    // Pointer down for drag
    this._tileEl.addEventListener('pointerdown', (e) => this._onPointerDown(e));

    // Keyboard
    this._tileEl.addEventListener('keydown', (e) => this._onKeydown(e));
  }

  /* ── Update (every hass change) ─────────────────── */

  _update() {
    if (!this._hass || !this.$ || !this.$.tile) return;
    const cfg = this._config;
    const entity = this._hass.states[cfg.entity];

    // Conditional visibility
    if (cfg.show_when) {
      const visible = evaluateShowWhen(this._hass, cfg.show_when);
      this.hidden = !visible;
      if (!visible) return;
    } else {
      this.hidden = false;
    }

    // State resolution
    const isUnavailable = !entity || entity.state === 'unavailable';
    const isOn = entity && entity.state === 'on';
    const readEntity = cfg.brightness.read_entity || cfg.entity;
    const brightness = isOn ? readBrightnessPercent(this._hass, readEntity) : 0;

    this._state = isUnavailable ? 'unavailable' : (isOn ? 'on' : 'off');
    this._brightness = brightness;

    // Don't update visuals during active drag
    if (this._dragState && this._dragState.moved) return;

    // State classes
    const tile = this.$.tile;
    tile.classList.toggle('on', this._state === 'on');
    tile.classList.toggle('off', this._state === 'off');
    tile.classList.toggle('unavailable', this._state === 'unavailable');

    // ARIA
    tile.setAttribute('aria-valuenow', brightness);
    tile.setAttribute('aria-valuetext', isOn ? brightness + ' percent' : (isUnavailable ? 'Unavailable' : 'Off'));
    tile.setAttribute('aria-label', this._displayName());

    // Value
    if (this.$.val) {
      if (isUnavailable) this.$.val.textContent = 'Unavailable';
      else if (isOn) this.$.val.textContent = brightness + '%';
      else this.$.val.textContent = 'Off';
    }

    // Progress
    if (this.$.fill) {
      this.$.fill.style.width = brightness + '%';
    }

    // Name
    if (this.$.name) {
      this.$.name.textContent = this._displayName();
    }

    // Icon (resolve from entity if not configured)
    if (this.$.iconEl && !cfg.icon && entity) {
      this.$.iconEl.textContent = resolveEntityIcon(entity);
    }

    // Manual dot
    this._updateManualDot();

    // Sub-button visibility
    if (this.$.subBtn && cfg.sub_button && cfg.sub_button.show_when) {
      const showSub = evaluateShowWhen(this._hass, cfg.sub_button.show_when);
      this.$.subBtn.classList.toggle('hidden', !showSub);
      tile.classList.toggle('has-sub', showSub);
    }
  }

  _displayName() {
    if (this._config.name) return this._config.name;
    return friendlyName(this._hass, this._config.entity);
  }

  _updateManualDot() {
    const cfg = this._config;
    let isManual = false;

    if (cfg.manual.mode === 'off') {
      isManual = false;
    } else if (cfg.manual.mode === 'entity' && cfg.manual.entity) {
      const manualEntity = this._hass.states[cfg.manual.entity];
      isManual = manualEntity && manualEntity.state === 'on';
    }
    // mode: 'auto' — composer sets data-manual externally

    if (cfg.manual.mode !== 'auto') {
      this.$.tile.dataset.manual = isManual ? 'true' : 'false';
    }
    this._isManual = this.$.tile.dataset.manual === 'true';
  }

  /* ═══════════════════════════════════════════════════
     POINTER HANDLERS — Drag-to-dim with axis lock
     ═══════════════════════════════════════════════════ */

  _onPointerDown(e) {
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this._state === 'unavailable') return;

    try { this.$.tile.setPointerCapture(e.pointerId); } catch (_) {}

    const isTouch = (e.pointerType || 'mouse') === 'touch';

    this._dragState = {
      entity: this._config.entity,
      startX: e.clientX,
      startY: e.clientY,
      startBright: this._brightness,
      pointerType: e.pointerType || 'mouse',
      dragThreshold: isTouch ? 5 : 10,
      axisBias: isTouch ? 2 : 5,
      dragGain: isTouch ? 1.12 : 0.95,
      axisLocked: false,
      ignoreTap: false,
      moved: false,
      pointerId: e.pointerId,
      currentBright: undefined,
    };

    // Hold timer for hold_action
    clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      if (this._dragState && !this._dragState.moved) {
        this._dragState.ignoreTap = true;
        this._emitAction('tunet:action', this._config.hold_action);
        this._cancelDrag();
      }
    }, 500);
  }

  _onPointerMove(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    if (ds.pointerId !== e.pointerId) return;

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Cancel hold on any significant movement
    if (absDx > 3 || absDy > 3) {
      clearTimeout(this._holdTimer);
    }

    if (!ds.axisLocked) {
      if (absDx < ds.dragThreshold && absDy < ds.dragThreshold) return;
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
      this.$.tile.classList.add('sliding');
      document.body.style.cursor = 'grabbing';
    }

    if (e.cancelable) e.preventDefault();
    const width = Math.max(this.$.tile.offsetWidth, 1);
    const dragRange = ds.pointerType === 'touch'
      ? Math.max(width * 0.82, 110)
      : Math.max(width * 1.20, 185);
    const change = (dx / dragRange) * 100 * ds.dragGain;
    const newBrt = Math.round(Math.max(0, Math.min(100, ds.startBright + change)));
    if (newBrt === ds.currentBright) return;

    // Optimistic UI
    if (this.$.fill) {
      this.$.fill.style.transition = 'none';
      this.$.fill.style.width = newBrt + '%';
    }
    if (this.$.val) {
      this.$.val.textContent = newBrt > 0 ? newBrt + '%' : 'Off';
    }

    this.$.tile.classList.toggle('on', newBrt > 0);
    this.$.tile.classList.toggle('off', newBrt <= 0);

    this.$.tile.setAttribute('aria-valuenow', newBrt);
    ds.currentBright = newBrt;

    // Preview event
    this.dispatchEvent(new CustomEvent('tunet:value-preview', {
      bubbles: true, composed: true,
      detail: { entity: ds.entity, value: newBrt, source: 'drag' },
    }));
  }

  _onPointerUp(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    if (ds.pointerId !== e.pointerId) return;
    clearTimeout(this._holdTimer);

    this._finishDrag(ds, {
      commit: ds.moved && ds.currentBright !== undefined,
      tap: !ds.moved && !ds.ignoreTap,
    });
  }

  _onPointerCancel(e) {
    if (!this._dragState) return;
    if (this._dragState.pointerId !== e.pointerId) return;
    clearTimeout(this._holdTimer);
    this._finishDrag(this._dragState, { commit: false, tap: false });
  }

  _finishDrag(ds, { commit, tap }) {
    this.$.tile.classList.remove('sliding');
    if (this.$.fill) this.$.fill.style.transition = '';
    try { this.$.tile.releasePointerCapture(ds.pointerId); } catch (_) {}
    document.body.style.cursor = '';

    if (commit) {
      this.dispatchEvent(new CustomEvent('tunet:value-commit', {
        bubbles: true, composed: true,
        detail: {
          entity: this._config.brightness.write.entity,
          value: ds.currentBright,
          mode: this._config.brightness.write.mode,
          source: 'drag',
        },
      }));
    } else if (tap) {
      this._handleTap();
    }

    this._dragState = null;
  }

  _cancelDrag() {
    if (!this._dragState) return;
    this.$.tile.classList.remove('sliding');
    if (this.$.fill) this.$.fill.style.transition = '';
    try { this.$.tile.releasePointerCapture(this._dragState.pointerId); } catch (_) {}
    document.body.style.cursor = '';
    this._dragState = null;
  }

  /* ── Tap / Double-tap ───────────────────────────── */

  _handleTap() {
    const dblAction = this._config.double_tap_action;
    if (dblAction && dblAction.action !== 'none') {
      this._tapCount++;
      if (this._tapCount === 1) {
        this._doubleTapTimer = setTimeout(() => {
          this._tapCount = 0;
          this._emitAction('tunet:action', this._config.tap_action);
        }, 250);
      } else if (this._tapCount >= 2) {
        clearTimeout(this._doubleTapTimer);
        this._tapCount = 0;
        this._emitAction('tunet:action', dblAction);
      }
    } else {
      this._emitAction('tunet:action', this._config.tap_action);
    }
  }

  /* ── Keyboard ───────────────────────────────────── */

  _onKeydown(e) {
    if (this._state === 'unavailable') return;
    const step = e.shiftKey ? 10 : 5;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newVal = Math.min(100, this._brightness + step);
      this._emitValueCommit(newVal, 'keyboard');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newVal = Math.max(0, this._brightness - step);
      this._emitValueCommit(newVal, 'keyboard');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._emitAction('tunet:action', this._config.tap_action);
    }
  }

  /* ═══════════════════════════════════════════════════
     EVENT EMITTERS — Primitive → Composer protocol
     ═══════════════════════════════════════════════════ */

  _emitAction(eventName, action) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true, composed: true,
      detail: {
        action,
        entity: this._config.entity,
        source: 'light-tile',
      },
    }));
  }

  _emitValueCommit(value, source) {
    this.dispatchEvent(new CustomEvent('tunet:value-commit', {
      bubbles: true, composed: true,
      detail: {
        entity: this._config.brightness.write.entity,
        value,
        mode: this._config.brightness.write.mode,
        source,
      },
    }));
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API — For composer to set external state
     ═══════════════════════════════════════════════════ */

  /** Composer calls this to set manual override state (mode: 'auto') */
  setManual(isManual) {
    if (this.$.tile) {
      this.$.tile.dataset.manual = isManual ? 'true' : 'false';
    }
    this._isManual = isManual;
  }

  /** Optimistic UI update from composer during cooldown */
  setOptimisticBrightness(pct) {
    this._brightness = pct;
    if (this.$.fill) this.$.fill.style.width = pct + '%';
    if (this.$.val) this.$.val.textContent = pct > 0 ? pct + '%' : 'Off';
    this.$.tile.classList.toggle('on', pct > 0);
    this.$.tile.classList.toggle('off', pct <= 0);
    this.$.tile.setAttribute('aria-valuenow', pct);
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

if (!customElements.get('tunet-light-tile')) {
  customElements.define('tunet-light-tile', TunetLightTile);
}

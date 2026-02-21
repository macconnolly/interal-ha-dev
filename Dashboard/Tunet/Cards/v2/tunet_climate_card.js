/**
 * Tunet Climate Card (v2 – shared base module)
 * Custom Home Assistant card with glassmorphism design
 * Version 1.1.1
 *
 * Migration: Shared tokens, reset, icon base, card surface, glass stroke,
 * and reduced motion extracted to tunet_base.js.
 * Drift fixes: --r-section 38→32, glass stroke gradient aligned to spec,
 * icon font-family Outlined removed (Rounded only).
 */

import {
  TOKENS, RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  CLIMATE_CORE_PATTERN,
  INFO_TILE_PATTERN, ICON_BUTTON_PATTERN, LABEL_BUTTON_PATTERN, GLASS_MENU_PATTERN,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';
import { dispatchAction, normalizeAction } from './tunet_runtime.js';

const CARD_VERSION = '1.1.1';

/* ===============================================================
   CSS – Base imports + card-specific styles
   =============================================================== */

const STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}
${INFO_TILE_PATTERN}
${ICON_BUTTON_PATTERN}
${LABEL_BUTTON_PATTERN}
${GLASS_MENU_PATTERN}
${CLIMATE_CORE_PATTERN}
${REDUCED_MOTION}
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-mode="heat_cool" data-action="idle">

      <!-- Header -->
      <div class="hdr">
        <div class="hdr-tile" id="hdrTile" data-action="idle">
          <div class="hdr-icon" id="hdrIcon" data-a="idle">
            <span class="icon icon-18" id="hdrIconEl">thermostat</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Climate</span>
            <span class="hdr-sub" id="hdrSub"></span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <button class="fan-btn" id="fanBtn" title="Fan" aria-label="Toggle fan" data-action="idle">
          <span class="icon icon-18" id="fanIconEl">mode_fan</span>
        </button>
        <div class="mode-wrap">
          <button class="mode-btn" id="modeBtn" aria-expanded="false" data-action="idle">
            <span class="icon mode-icon" id="modeIcon">device_thermostat</span>
            <span id="modeLbl">Heat / Cool</span>
            <span class="icon chevron">expand_more</span>
          </button>
          <div class="mode-menu" id="modeMenu">
            <button class="mode-opt active" data-m="heat_cool">
              <span class="icon icon-18" style="color:var(--amber)">device_thermostat</span> Heat / Cool
            </button>
            <button class="mode-opt" data-m="heat">
              <span class="icon icon-18" style="color:var(--amber)">local_fire_department</span> Heat
            </button>
            <button class="mode-opt" data-m="cool">
              <span class="icon icon-18" style="color:var(--blue)">ac_unit</span> Cool
            </button>
            <button class="mode-opt" data-m="off">
              <span class="icon icon-18">power_settings_new</span> Off
            </button>
            <div class="mode-divider"></div>
            <button class="mode-opt eco-opt" id="ecoOpt" data-m="eco">
              <span class="icon icon-18" style="color:var(--green)">eco</span> Eco
              <span class="eco-check" id="ecoCheck">
                <span class="icon icon-14" style="color:#fff">check</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Temperatures -->
      <div class="temps">
        <div class="t-group indoor">
          <span class="t-label indoor">Indoor</span>
          <span class="t-val" id="curTemp">--<span class="deg">&deg;</span></span>
        </div>
        <div class="t-right" id="tRight">
          <div class="t-group heat">
            <span class="t-label heat">Heat</span>
            <span class="t-val heat" id="heatR">--<span class="deg">&deg;</span></span>
          </div>
          <div class="t-group cool">
            <span class="t-label cool">Cool</span>
            <span class="t-val cool" id="coolR">--<span class="deg">&deg;</span></span>
          </div>
        </div>
      </div>

      <!-- Slider -->
      <div class="slider-zone">
        <div class="slider" id="slider">
          <div class="track">
            <div class="fill-h" id="fillH"></div>
            <div class="fill-c" id="fillC"></div>
            <div class="deadband" id="db"></div>
          </div>
          <div class="thumb heat" id="tH" role="slider" aria-label="Heat setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="68" aria-valuetext="Heat setpoint: 68 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="thumb cool" id="tC" role="slider" aria-label="Cool setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="76" aria-valuetext="Cool setpoint: 76 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="cur-marker" id="curMark">
            <div class="cur-arrow"></div>
            <div class="cur-label" id="curLbl">--&deg;</div>
          </div>
        </div>
        <div class="scale">
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMin">60&deg;</span></div>
          <div class="scale-mark" id="sMidMark"><div class="scale-tick"></div><span class="scale-num" id="sMid">70&deg;</span></div>
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMax">80&deg;</span></div>
        </div>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetClimateCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._drag = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._debounceTimer = null;
    this._rendered = false;

    // Inject fonts into document.head (once globally)
    injectFonts();

    // Bound handlers for document-level listeners
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onEndDrag.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onEndDrag.bind(this);
    this._onDocClick = this._onDocClick.bind(this);
  }

  /* -- Config -- */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { filter: [{ domain: 'climate' }] } },
        },
        {
          name: 'humidity_entity',
          selector: { entity: { filter: [{ domain: 'sensor', device_class: 'humidity' }] } },
        },
        {
          name: 'name',
          selector: { text: {} },
        },
        {
          name: 'surface',
          selector: { select: { options: ['card', 'section'] } },
        },
        {
          name: '',
          type: 'grid',
          schema: [
            {
              name: 'display_min',
              selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } },
            },
            {
              name: 'display_max',
              selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } },
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Climate Entity',
          humidity_entity: 'Humidity Sensor',
          name: 'Card Name',
          surface: 'Surface Style',
          display_min: 'Scale Min',
          display_max: 'Scale Max',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Climate',
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (climate.*)');
    }
    this._config = {
      entity: config.entity,
      humidity_entity: config.humidity_entity || '',
      name: config.name || 'Climate',
      display_min: config.display_min != null ? Number(config.display_min) : null,
      display_max: config.display_max != null ? Number(config.display_max) : null,
      surface: config.surface === 'section' ? 'section' : 'card',
      tap_action: normalizeAction(config.tap_action || { action: 'more-info' }, config.entity),
      fan_tap_action: config.fan_tap_action ? normalizeAction(config.fan_tap_action, config.entity) : null,
      mode_tap_action: config.mode_tap_action ? normalizeAction(config.mode_tap_action, config.entity) : null,
      eco_tap_action: config.eco_tap_action ? normalizeAction(config.eco_tap_action, config.entity) : null,
    };

    if (this._config.surface === 'section') {
      this.setAttribute('surface', 'section');
    } else {
      this.removeAttribute('surface');
    }

    if (this._rendered) this._updateAll();
  }

  /* -- HA State -- */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
    }

    // Detect dark mode via shared utility
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Only update if relevant entity changed
    const entity = this._config.entity;
    const humEntity = this._config.humidity_entity;
    if (!oldHass ||
        (entity && oldHass.states[entity] !== hass.states[entity]) ||
        (humEntity && oldHass.states[humEntity] !== hass.states[humEntity])) {
      this._updateAll();
    }
  }

  getCardSize() {
    return 4;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    document.removeEventListener('click', this._onDocClick);
    clearTimeout(this._debounceTimer);
    clearTimeout(this._cooldownTimer);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  /* -- Render -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'hdrTile', 'hdrIcon', 'hdrIconEl', 'cardTitle', 'hdrSub', 'fanBtn', 'fanIconEl',
      'modeBtn', 'modeLbl', 'modeIcon', 'modeMenu', 'ecoOpt', 'ecoCheck',
      'curTemp', 'heatR', 'coolR', 'tRight',
      'slider', 'fillH', 'fillC', 'db', 'tH', 'tC', 'curMark', 'curLbl',
      'sMin', 'sMid', 'sMidMark', 'sMax',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  /* -- Setup Listeners -- */

  _setupListeners() {
    const $ = this.$;

    // Header tile - open more_info
    $.hdrTile.addEventListener('click', (e) => {
      e.stopPropagation();
      this._dispatchConfigAction(this._config.tap_action, this._config.entity);
    });

    // Fan toggle
    $.fanBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._config.fan_tap_action) {
        this._dispatchConfigAction(this._config.fan_tap_action, this._config.entity);
      } else {
        this._toggleFan();
      }
    });

    // Mode menu toggle
    $.modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._config.mode_tap_action) {
        this._dispatchConfigAction(this._config.mode_tap_action, this._config.entity);
      } else {
        this._toggleMenu();
      }
    });

    // Mode options
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._setMode(opt.dataset.m);
      });
    });

    // Eco toggle
    $.ecoOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._config.eco_tap_action) {
        this._dispatchConfigAction(this._config.eco_tap_action, this._config.entity);
      } else {
        this._toggleEco();
      }
    });

    // Thumb drag - mouse
    $.tH.addEventListener('mousedown', (e) => this._startDrag('heat', e));
    $.tC.addEventListener('mousedown', (e) => this._startDrag('cool', e));

    // Thumb drag - touch
    $.tH.addEventListener('touchstart', (e) => this._startDrag('heat', e), { passive: false });
    $.tC.addEventListener('touchstart', (e) => this._startDrag('cool', e), { passive: false });

    // Keyboard on thumbs
    $.tH.addEventListener('keydown', (e) => this._thumbKey('heat', e));
    $.tC.addEventListener('keydown', (e) => this._thumbKey('cool', e));

    // Resize observer for slider recalculation
    this._resizeObserver = new ResizeObserver(() => this._renderSlider());
    this._resizeObserver.observe($.slider);
  }

  /* -- Entity Helpers -- */

  _getEntity() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity] || null;
  }

  _getHumidity() {
    if (!this._hass || !this._config.humidity_entity) return null;
    return this._hass.states[this._config.humidity_entity] || null;
  }

  _getState() {
    const entity = this._getEntity();
    if (!entity) return null;
    const a = entity.attributes;
    const mode = entity.state; // heat, cool, heat_cool, off, auto, dry, fan_only
    const action = a.hvac_action || 'idle'; // heating, cooling, idle, off, drying, fan

    // Determine setpoints
    let heat, cool;
    if (mode === 'heat_cool' || mode === 'auto') {
      heat = a.target_temp_low;
      cool = a.target_temp_high;
    } else if (mode === 'heat') {
      heat = a.temperature;
      cool = null;
    } else if (mode === 'cool') {
      heat = null;
      cool = a.temperature;
    } else {
      heat = a.target_temp_low || a.temperature;
      cool = a.target_temp_high || a.temperature;
    }

    const minTemp = a.min_temp || 45;
    const maxTemp = a.max_temp || 95;
    const displayMin = this._config.display_min != null ? this._config.display_min : Math.max(minTemp, (heat || minTemp) - 10);
    const displayMax = this._config.display_max != null ? this._config.display_max : Math.min(maxTemp, (cool || maxTemp) + 10);

    // Fan
    const fanMode = a.fan_mode || 'auto';
    const fanOn = fanMode === 'on' || fanMode === 'high' || fanMode === 'medium' || fanMode === 'low';

    // Preset
    const presetMode = a.preset_mode || 'none';

    // Humidity
    const humEntity = this._getHumidity();
    const humidity = humEntity ? Math.round(Number(humEntity.state)) : null;

    // Normalize mode for our card (map auto -> heat_cool, etc.)
    let cardMode = mode;
    if (mode === 'auto') cardMode = 'heat_cool';
    if (mode === 'fan_only' || mode === 'dry') cardMode = 'off'; // not natively supported, show as off

    return {
      mode: cardMode,
      action,
      heat: heat != null ? Math.round(heat) : null,
      cool: cool != null ? Math.round(cool) : null,
      cur: a.current_temperature != null ? Math.round(a.current_temperature) : null,
      humidity,
      fanOn,
      preset: presetMode,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      displayMin: Math.round(displayMin),
      displayMax: Math.round(displayMax),
      hvacModes: a.hvac_modes || [],
      fanModes: a.fan_modes || [],
      presetModes: a.preset_modes || [],
    };
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card) return;
    // Don't overwrite slider while user is dragging or during service cooldown
    if (this._drag || this._serviceCooldown) return;
    const s = this._getState();
    if (!s) return;

    // Store for slider math
    this._state = s;

    // Card title
    $.cardTitle.textContent = this._config.name || 'Climate';

    // Card data attributes
    $.card.dataset.mode = s.mode;
    $.card.dataset.action = s.action;

    // Header icon state - icon changes based on action
    $.hdrIcon.dataset.a = s.action;
    $.hdrTile.dataset.action = s.action;
    const actionIcons = { heating: 'local_fire_department', cooling: 'ac_unit' };
    $.hdrIconEl.textContent = actionIcons[s.action] || 'thermostat';
    if (s.action === 'heating' || s.action === 'cooling') {
      $.hdrIconEl.classList.add('filled');
    } else {
      $.hdrIconEl.classList.remove('filled');
    }

    // Fan button - action color overrides green when system is active
    $.fanBtn.classList.toggle('on', s.fanOn);
    $.fanBtn.dataset.action = s.action;
    if (s.fanOn) $.fanIconEl.classList.add('filled');
    else $.fanIconEl.classList.remove('filled');

    // Hide fan button if entity doesn't support fan modes
    $.fanBtn.style.display = (s.fanModes && s.fanModes.length > 0) ? '' : 'none';

    // Mode button - label, icon, and accent (accent follows action, not mode)
    const modeLabels = { heat_cool: 'Heat / Cool', heat: 'Heat', cool: 'Cool', off: 'Off' };
    const modeIcons = { heat_cool: 'device_thermostat', heat: 'local_fire_department', cool: 'ac_unit', off: 'power_settings_new' };
    $.modeLbl.textContent = modeLabels[s.mode] || s.mode;
    $.modeIcon.textContent = modeIcons[s.mode] || 'device_thermostat';
    $.modeBtn.dataset.action = s.action;

    // Mode menu active states
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.m === s.mode);
    });

    // Eco
    $.ecoOpt.classList.toggle('active', s.preset === 'eco');
    // Hide eco option if entity doesn't support it
    const hasEco = s.presetModes && s.presetModes.includes('eco');
    $.ecoOpt.style.display = hasEco ? '' : 'none';
    // Hide divider too if no eco
    const divider = this.shadowRoot.querySelector('.mode-divider');
    if (divider) divider.style.display = hasEco ? '' : 'none';

    // Hide mode options not supported by entity
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      const m = opt.dataset.m;
      const haMode = m === 'heat_cool' ? 'heat_cool' : m;
      // Also check for 'auto' mapping to heat_cool
      const supported = s.hvacModes.includes(haMode) || (m === 'heat_cool' && s.hvacModes.includes('auto'));
      opt.style.display = supported ? '' : 'none';
    });

    // Temperature values
    const D = '<span class="deg">&deg;</span>';
    $.curTemp.innerHTML = (s.cur != null ? s.cur : '--') + D;

    if (s.heat != null) $.heatR.innerHTML = s.heat + D;
    else $.heatR.innerHTML = '--' + D;

    if (s.cool != null) $.coolR.innerHTML = s.cool + D;
    else $.coolR.innerHTML = '--' + D;

    // Header subtitle - humidity + action state
    this._updateSubtitle(s);

    // Scale labels
    $.sMin.textContent = s.displayMin + '°';
    $.sMid.textContent = Math.round(s.displayMin + (s.displayMax - s.displayMin) / 2) + '°';
    $.sMax.textContent = s.displayMax + '°';

    // Mid-scale suppression
    if (s.cur != null) {
      const midTemp = s.displayMin + (s.displayMax - s.displayMin) / 2;
      $.sMidMark.style.opacity = Math.abs(s.cur - midTemp) < 3 ? '0' : '1';
    }

    // Render slider positions
    this._renderSlider();
  }

  /* -- Slider Math -- */

  _t2p(temp) {
    const s = this._state;
    if (!s) return 0;
    return (temp - s.displayMin) / (s.displayMax - s.displayMin);
  }

  _p2t(p) {
    const s = this._state;
    if (!s) return 0;
    return Math.round(s.displayMin + p * (s.displayMax - s.displayMin));
  }

  _p2px(p) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return PAD + Math.max(0, Math.min(1, p)) * (w - 2 * PAD);
  }

  _px2p(px) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return Math.max(0, Math.min(1, (px - PAD) / (w - 2 * PAD)));
  }

  _updateSubtitle(s) {
    const $ = this.$;
    if (!$ || !$.hdrSub) return;

    const actionNames = { heating: 'Heating', cooling: 'Cooling', idle: 'Idle', off: 'Off', drying: 'Drying' };
    const actionClass = { heating: 'heat-ic', cooling: 'cool-ic' };

    let parts = [];

    // Humidity
    if (s.humidity != null) {
      parts.push(s.humidity + '% humidity');
    }

    // Build action + fan label
    const isActive = s.action === 'heating' || s.action === 'cooling';

    if (isActive && s.fanOn) {
      // Active HVAC + Fan: "Cooling · Fan" both in action color
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="' + cls + '">' + label + ' \u00b7 Fan</span>');
    } else if (isActive) {
      // Active HVAC only
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="' + cls + '">' + label + '</span>');
    } else if (s.fanOn) {
      // Fan only (idle/off + fan)
      let label = 'Fan';
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="fan-ic">' + label + '</span>');
    } else {
      // Idle/Off
      let label = actionNames[s.action] || 'Idle';
      if (s.preset === 'eco' && s.action !== 'off') label += ' \u00b7 Eco';
      parts.push(label);
    }

    $.hdrSub.innerHTML = parts.join(' \u00b7 ');
  }

  _renderSlider() {
    const $ = this.$;
    const s = this._state;
    if (!s || !$.slider || !$.slider.offsetWidth) return;

    const w = $.slider.offsetWidth;

    if (s.heat != null) {
      const hp = this._t2p(s.heat);
      const hpx = this._p2px(hp);
      $.tH.style.left = hpx + 'px';
      $.fillH.style.width = hpx + 'px';

      // ARIA
      $.tH.setAttribute('aria-valuenow', s.heat);
      $.tH.setAttribute('aria-valuemin', s.minTemp);
      $.tH.setAttribute('aria-valuemax', s.cool != null ? s.cool - 2 : s.maxTemp);
      $.tH.setAttribute('aria-valuetext', 'Heat setpoint: ' + s.heat + ' degrees');
    }

    if (s.cool != null) {
      const cp = this._t2p(s.cool);
      const cpx = this._p2px(cp);
      $.tC.style.left = cpx + 'px';
      $.fillC.style.width = (w - cpx) + 'px';

      // ARIA
      $.tC.setAttribute('aria-valuenow', s.cool);
      $.tC.setAttribute('aria-valuemin', s.heat != null ? s.heat + 2 : s.minTemp);
      $.tC.setAttribute('aria-valuemax', s.maxTemp);
      $.tC.setAttribute('aria-valuetext', 'Cool setpoint: ' + s.cool + ' degrees');
    }

    // Deadband (only in heat_cool mode)
    if (s.mode === 'heat_cool' && s.heat != null && s.cool != null) {
      const hpx = this._p2px(this._t2p(s.heat));
      const cpx = this._p2px(this._t2p(s.cool));
      $.db.style.left = hpx + 'px';
      $.db.style.width = Math.max(0, cpx - hpx) + 'px';
      $.db.style.display = '';
    } else {
      $.db.style.display = 'none';
    }

    // Current temp marker
    if (s.cur != null) {
      $.curMark.style.left = this._p2px(this._t2p(s.cur)) + 'px';
      $.curLbl.textContent = s.cur + '°';
      $.curMark.style.display = '';
    } else {
      $.curMark.style.display = 'none';
    }
  }

  /* -- Drag Handlers -- */

  _startDrag(which, e) {
    e.preventDefault();
    e.stopPropagation();
    this._drag = which;
    this._dragActive = false;
    this._dragStartX = e.touches ? e.touches[0].clientX : e.clientX;

    const thumbEl = which === 'heat' ? this.$.tH : this.$.tC;
    thumbEl.style.transition = 'none';
    document.body.style.cursor = 'grabbing';
  }

  _onMouseMove(e) {
    if (!this._drag) return;
    this._handleDragMove(e.clientX);
  }

  _onTouchMove(e) {
    if (!this._drag) return;
    e.preventDefault();
    this._handleDragMove(e.touches[0].clientX);
  }

  _handleDragMove(cx) {
    const DRAG_THRESHOLD = 4;

    if (!this._dragActive) {
      if (Math.abs(cx - this._dragStartX) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      const thumbEl = this._drag === 'heat' ? this.$.tH : this.$.tC;
      thumbEl.classList.add('dragging');
    }

    const sl = this.$.slider;
    const r = sl.getBoundingClientRect();
    const px = cx - r.left;
    const p = this._px2p(px);
    const t = this._p2t(p);
    const s = this._state;

    if (this._drag === 'heat') {
      const maxHeat = s.cool != null ? s.cool - 2 : s.maxTemp;
      s.heat = Math.max(s.minTemp, Math.min(t, maxHeat));
    } else {
      const minCool = s.heat != null ? s.heat + 2 : s.minTemp;
      s.cool = Math.min(s.maxTemp, Math.max(t, minCool));
    }

    // Update visuals (no service call yet)
    this._renderSlider();

    // Update displayed setpoint values
    const D = '<span class="deg">&deg;</span>';
    if (this._drag === 'heat' && s.heat != null) {
      this.$.heatR.innerHTML = s.heat + D;
    }
    if (this._drag === 'cool' && s.cool != null) {
      this.$.coolR.innerHTML = s.cool + D;
    }
  }

  _onEndDrag() {
    if (!this._drag) return;

    const which = this._drag;
    const thumbEl = which === 'heat' ? this.$.tH : this.$.tC;
    thumbEl.style.transition = '';
    thumbEl.classList.remove('dragging');

    document.body.style.cursor = '';

    if (this._dragActive) {
      // Debounce service call to prevent rate limiting on rapid adjustments
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._callSetTemperature(), 300);
    }

    this._drag = null;
    this._dragActive = false;
  }

  /* -- Keyboard -- */

  _thumbKey(which, e) {
    const step = e.shiftKey ? 5 : 1;
    const s = this._state;
    if (!s) return;
    let changed = false;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (which === 'heat' && s.heat != null) {
        const max = s.cool != null ? s.cool - 2 : s.maxTemp;
        s.heat = Math.min(s.heat + step, max);
        changed = true;
      } else if (which === 'cool' && s.cool != null) {
        s.cool = Math.min(s.cool + step, s.maxTemp);
        changed = true;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (which === 'heat' && s.heat != null) {
        s.heat = Math.max(s.heat - step, s.minTemp);
        changed = true;
      } else if (which === 'cool' && s.cool != null) {
        const min = s.heat != null ? s.heat + 2 : s.minTemp;
        s.cool = Math.max(s.cool - step, min);
        changed = true;
      }
    }

    if (changed) {
      this._renderSlider();
      const D = '<span class="deg">&deg;</span>';
      if (s.heat != null) this.$.heatR.innerHTML = s.heat + D;
      if (s.cool != null) this.$.coolR.innerHTML = s.cool + D;
      this._debouncedSetTemperature();
    }
  }

  _dispatchConfigAction(action, fallbackEntity) {
    dispatchAction(this._hass, this, action, fallbackEntity)
      .catch(() => this._updateAll());
  }

  /* -- Service Calls -- */

  _callSetTemperature() {
    const s = this._state;
    if (!s || !this._hass) return;

    const data = { entity_id: this._config.entity };

    if (s.mode === 'heat_cool') {
      if (s.heat != null) data.target_temp_low = s.heat;
      if (s.cool != null) data.target_temp_high = s.cool;
    } else if (s.mode === 'heat' && s.heat != null) {
      data.temperature = s.heat;
    } else if (s.mode === 'cool' && s.cool != null) {
      data.temperature = s.cool;
    }

    this._hass.callService('climate', 'set_temperature', data);

    // Block state bounce-back from resetting slider for 1.5s after service call
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
  }

  _debouncedSetTemperature() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._callSetTemperature(), 400);
  }

  _setMode(mode) {
    if (!this._hass) return;

    // Close menu
    this.$.modeMenu.classList.remove('open');
    this.$.modeBtn.setAttribute('aria-expanded', 'false');

    // Map heat_cool back to auto if entity uses auto
    const s = this._state;
    let haMode = mode;
    if (mode === 'heat_cool' && s && s.hvacModes.includes('auto') && !s.hvacModes.includes('heat_cool')) {
      haMode = 'auto';
    }

    this._hass.callService('climate', 'set_hvac_mode', {
      entity_id: this._config.entity,
      hvac_mode: haMode,
    });
  }

  _toggleFan() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;

    const newMode = s.fanOn ? 'off' : 'on';

    // Optimistic UI update - show change immediately
    s.fanOn = !s.fanOn;
    this.$.fanBtn.classList.toggle('on', s.fanOn);
    if (s.fanOn) this.$.fanIconEl.classList.add('filled');
    else this.$.fanIconEl.classList.remove('filled');
    this._updateSubtitle(s);

    // Block state bounce-back briefly
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);

    this._hass.callService('climate', 'set_fan_mode', {
      entity_id: this._config.entity,
      fan_mode: newMode,
    });
  }

  _toggleEco() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;

    const newPreset = s.preset === 'eco' ? 'none' : 'eco';
    this._hass.callService('climate', 'set_preset_mode', {
      entity_id: this._config.entity,
      preset_mode: newPreset,
    });
  }

  /* -- Menu -- */

  _toggleMenu() {
    const menu = this.$.modeMenu;
    const btn = this.$.modeBtn;
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', menu.classList.contains('open'));
  }

  _onDocClick(e) {
    // Close menu when clicking outside
    if (!this.$.modeMenu || !this.$.modeMenu.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector('.mode-wrap'))) {
      this.$.modeMenu.classList.remove('open');
      this.$.modeBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

registerCard('tunet-climate-card', TunetClimateCard, {
  name: 'Tunet Climate Card',
  description: 'Glassmorphism climate controller with dual-range slider',
  documentationURL: 'https://github.com/tunet/tunet-climate-card',
});

logCardVersion('TUNET-CLIMATE', CARD_VERSION, '#D4850A');

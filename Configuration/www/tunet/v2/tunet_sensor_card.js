/**
 * Tunet Sensor Card v1.1.0
 * ──────────────────────────────────────────────────────────────
 * Dedicated environment sensor detail panel:
 *   Section-container wrapper  ·  Row-based sensor readings
 *   Trend indicators (rising/falling/stable)  ·  Min/max range
 *   Threshold-based accent switching  ·  Dirty-diff updates
 *   HA entity integration  ·  Configurable sensor rows
 *
 * v1.1.0 – Migrated to tunet_base.js shared module
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS,
  RESET, BASE_FONT, ICON_BASE,
  SECTION_SURFACE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';

const CARD_VERSION = '1.1.0';

/* ═══════════════════════════════════════════════════════════════
   CSS — Card-specific overrides + unique styles
   ═══════════════════════════════════════════════════════════════ */

const CARD_OVERRIDES = `
  /* Card-specific token additions */
  :host {
    --r-icon: 16px;
    display: block;
  }

  /* Section container overrides */
  .section-container {
    gap: 16px;
    width: 100%;
  }

  /* Section glass stroke (sensor card variant) */
  .section-container::before {
    content: "";
    position: absolute; inset: 0;
    border-radius: var(--r-section);
    padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40),
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }
`;

const CARD_STYLES = `
  /* ── Icon size utilities ────────────────────────── */
  .icon-20 { font-size: 20px; }
  .icon-18 { font-size: 18px; }
  .icon-16 { font-size: 16px; }
  .icon-14 { font-size: 14px; }

  /* ── Section Header ────────────────────────────── */
  .section-hdr {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }
  .section-title {
    font-size: 15px; font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .section-title .icon {
    font-size: 20px;
  }
  .section-spacer { flex: 1; }
  .section-action {
    font-size: 12px; font-weight: 600;
    color: var(--text-sub); cursor: pointer;
    padding: 6px 12px; border-radius: var(--r-pill);
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 4px;
  }
  .section-action:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .section-action:active { transform: scale(0.97); }

  /* ═══════════════════════════════════════════════
     SENSOR ROWS
     ═══════════════════════════════════════════════ */
  .sensor-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .sensor-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: var(--r-icon);
    position: relative;
  }
  .sensor-row:hover {
    background: var(--gray-ghost);
  }
  .sensor-row:active {
    transform: scale(0.99);
  }
  .sensor-row:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .sensor-row[data-interaction="none"] { cursor: default; }
  .sensor-row[data-interaction="none"]:hover { background: transparent; }
  .sensor-row[data-interaction="none"]:active { transform: none; }

  /* Divider between rows */
  .sensor-row + .sensor-row::before {
    content: "";
    position: absolute;
    top: 0; left: 48px; right: 4px;
    height: 1px;
    background: var(--divider);
  }

  /* ── Icon Wrap ─────────────────────────────────── */
  .sensor-icon {
    width: 36px; height: 36px;
    border-radius: var(--r-icon);
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .sensor-icon .icon {
    font-size: 20px;
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Accent icon backgrounds */
  .sensor-row[data-accent="amber"] .sensor-icon { background: var(--amber-fill); color: var(--amber); }
  .sensor-row[data-accent="blue"] .sensor-icon { background: var(--blue-fill); color: var(--blue); }
  .sensor-row[data-accent="green"] .sensor-icon { background: var(--green-fill); color: var(--green); }
  .sensor-row[data-accent="red"] .sensor-icon { background: var(--red-fill); color: var(--red); }
  .sensor-row[data-accent="purple"] .sensor-icon { background: var(--purple-fill); color: var(--purple); }
  .sensor-row[data-accent="muted"] .sensor-icon { background: var(--track-bg); color: var(--text-muted); }

  /* Threshold overrides */
  .sensor-row[data-style="warning"] .sensor-icon { background: var(--amber-fill); color: var(--amber); }
  .sensor-row[data-style="warning"] .sensor-val { color: var(--amber); }
  .sensor-row[data-style="error"] .sensor-icon { background: var(--red-fill); color: var(--red); }
  .sensor-row[data-style="error"] .sensor-val { color: var(--red); }
  .sensor-row[data-style="success"] .sensor-icon { background: var(--green-fill); color: var(--green); }
  .sensor-row[data-style="success"] .sensor-val { color: var(--green); }
  .sensor-row[data-style="info"] .sensor-icon { background: var(--blue-fill); color: var(--blue); }
  .sensor-row[data-style="info"] .sensor-val { color: var(--blue); }

  /* ── Sensor Info (label + sublabel) ────────────── */
  .sensor-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .sensor-label {
    font-size: 13px; font-weight: 600;
    color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sensor-sub {
    font-size: 11px; font-weight: 500;
    color: var(--text-muted); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 4px;
  }
  .sensor-sub .range-sep {
    opacity: 0.5;
  }

  /* ── Value + Unit ──────────────────────────────── */
  .sensor-val-wrap {
    display: flex; align-items: baseline; gap: 2px;
    flex-shrink: 0;
  }
  .sensor-val {
    font-size: 20px; font-weight: 700;
    letter-spacing: -0.3px; line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }
  .sensor-unit {
    font-size: 11px; font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.2px;
  }

  /* ── Trend Arrow ───────────────────────────────── */
  .sensor-trend {
    width: 20px; height: 20px;
    display: grid; place-items: center;
    flex-shrink: 0;
    margin-left: 2px;
  }
  .sensor-trend .icon {
    font-size: 16px;
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
    transition: color 0.2s, transform 0.2s;
  }
  .sensor-trend[data-trend="rising"] .icon { color: var(--red); transform: rotate(0deg); }
  .sensor-trend[data-trend="falling"] .icon { color: var(--blue); transform: rotate(180deg); }
  .sensor-trend[data-trend="stable"] .icon { color: var(--text-muted); transform: rotate(90deg); }

  /* ── Sparkline (optional inline mini-chart) ───── */
  .sensor-spark {
    width: 48px; height: 24px;
    flex-shrink: 0;
    margin-left: auto;
  }
  .sensor-spark svg {
    width: 100%; height: 100%;
    overflow: visible;
  }
  .spark-line {
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sensor-row[data-accent="amber"] .spark-line { stroke: var(--amber); }
  .sensor-row[data-accent="blue"] .spark-line { stroke: var(--blue); }
  .sensor-row[data-accent="green"] .spark-line { stroke: var(--green); }
  .sensor-row[data-accent="red"] .spark-line { stroke: var(--red); }
  .sensor-row[data-accent="purple"] .spark-line { stroke: var(--purple); }
  .sensor-row[data-accent="muted"] .spark-line { stroke: var(--text-muted); }
  /* Threshold override on sparkline */
  .sensor-row[data-style="warning"] .spark-line { stroke: var(--amber); }
  .sensor-row[data-style="error"] .spark-line { stroke: var(--red); }
  .sensor-row[data-style="success"] .spark-line { stroke: var(--green); }
  .sensor-row[data-style="info"] .spark-line { stroke: var(--blue); }

  /* ── Empty State ───────────────────────────────── */
  .sensor-empty {
    padding: 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 440px) {
    .section-container { padding: 16px; }
    .sensor-row { gap: 10px; padding: 10px 2px; }
    .sensor-val { font-size: 18px; }
    .sensor-spark { width: 40px; height: 20px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   Composite style sheet
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_ALL_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${SECTION_SURFACE} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;

/* ═══════════════════════════════════════════════════════════════
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">
          <span class="icon filled" id="sectionIcon" style="color:var(--blue)">sensors</span>
          <span id="sectionText">Environment</span>
        </span>
        <div class="section-spacer"></div>
      </div>
      <div class="sensor-list" id="sensorList"></div>
    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   SensorStyleCompiler - Threshold evaluation
   ═══════════════════════════════════════════════════════════════ */

class SensorStyleCompiler {
  static evaluate(value, thresholds) {
    if (!thresholds || !thresholds.length) return null;
    if (value === null || value === undefined || isNaN(value)) return null;
    const num = Number(value);
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      const tv = Number(t.value);
      const cond = t.condition || 'gte';
      let match = false;
      switch (cond) {
        case 'gte': match = num >= tv; break;
        case 'gt':  match = num > tv;  break;
        case 'lte': match = num <= tv; break;
        case 'lt':  match = num < tv;  break;
        case 'eq':  match = num === tv; break;
        case 'neq': match = num !== tv; break;
      }
      if (match) return t.style || 'warning';
    }
    return null;
  }

  static evaluateState(state, stateStyles) {
    if (!stateStyles || !stateStyles.length || !state) return null;
    for (const ss of stateStyles) {
      if (ss.state === state) return ss.style || 'warning';
    }
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   TrendComputer - History-based trend detection
   ═══════════════════════════════════════════════════════════════ */

class TrendComputer {
  static compute(history, threshold = 0.5) {
    if (!history || history.length < 2) return 'stable';
    const recent = history.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const delta = last - first;
    if (delta > threshold) return 'rising';
    if (delta < -threshold) return 'falling';
    return 'stable';
  }

  static sparklinePath(data, width = 48, height = 24, padding = 3) {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const usableH = height - padding * 2;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = padding + usableH - ((v - min) / range) * usableH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return 'M' + points.join(' L');
  }
}

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetSensorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._rowRefs = [];
    this._prevValues = {};
    this._historyCache = {};
    this._throttleTimer = null;
    this._historyTimer = null;

    injectFonts();
  }

  /* ── Config ─────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } },
      ],
      computeLabel: (schema) => ({
        title: 'Section Title',
        icon: 'Section Icon',
      }[schema.name] || schema.name),
    };
  }

  static getStubConfig() {
    return {
      title: 'Environment',
      icon: 'sensors',
      icon_color: 'blue',
      show_sparkline: true,
      show_trend: true,
      sensors: [
        {
          entity: 'sensor.living_room_temperature',
          label: 'Living Room',
          icon: 'thermostat',
          accent: 'amber',
          unit: '\u00b0F',
          precision: 0,
          thresholds: [
            { value: 80, condition: 'gte', style: 'error' },
            { value: 75, condition: 'gte', style: 'warning' },
          ],
          show_range: true,
        },
        {
          entity: 'sensor.living_room_humidity',
          label: 'Humidity',
          icon: 'water_drop',
          accent: 'blue',
          unit: '%',
          precision: 0,
          thresholds: [
            { value: 60, condition: 'gte', style: 'warning' },
            { value: 20, condition: 'lte', style: 'warning' },
          ],
          show_range: true,
        },
        {
          entity: 'sensor.outdoor_temperature',
          label: 'Outside',
          icon: 'device_thermostat',
          accent: 'blue',
          unit: '\u00b0F',
          precision: 0,
          show_range: true,
        },
        {
          entity: 'sensor.aqi',
          label: 'Air Quality',
          icon: 'air',
          accent: 'green',
          unit: 'AQI',
          thresholds: [
            { value: 150, condition: 'gte', style: 'error' },
            { value: 100, condition: 'gte', style: 'warning' },
            { value: 50, condition: 'lte', style: 'success' },
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config.sensors || !Array.isArray(config.sensors) || config.sensors.length === 0) {
      throw new Error('Please define at least one sensor in the sensors array');
    }
    this._config = {
      title: config.title || 'Environment',
      icon: config.icon || 'sensors',
      icon_color: config.icon_color || 'blue',
      show_sparkline: config.show_sparkline !== false,
      show_trend: config.show_trend !== false,
      history_hours: config.history_hours || 6,
      sensors: config.sensors,
    };
    if (this._rendered && this._hass) {
      this._buildRows();
      this._updateAll(true);
    }
  }

  /* ── HA State ───────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._buildRows();
      this._setupListeners();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!oldHass) {
      this._updateAll(true);
      this._fetchAllHistory();
    } else {
      this._scheduleUpdate();
    }
  }

  _scheduleUpdate() {
    if (this._throttleTimer) return;
    this._throttleTimer = setTimeout(() => {
      this._throttleTimer = null;
      this._updateAll(false);
    }, 500);
  }

  getCardSize() {
    return 1 + (this._config.sensors || []).length;
  }

  connectedCallback() {
    this._historyTimer = setInterval(() => {
      if (this._hass) this._fetchAllHistory();
    }, 5 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._throttleTimer) clearTimeout(this._throttleTimer);
    if (this._historyTimer) clearInterval(this._historyTimer);
  }

  /* ── Render ─────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = SENSOR_ALL_STYLES;
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = SENSOR_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
      sectionText: this.shadowRoot.getElementById('sectionText'),
      sectionIcon: this.shadowRoot.getElementById('sectionIcon'),
      sensorList: this.shadowRoot.getElementById('sensorList'),
    };
  }

  _buildRows() {
    const list = this.$.sensorList;
    list.innerHTML = '';
    this._rowRefs = [];
    this._prevValues = {};

    this.$.sectionText.textContent = this._config.title;
    this.$.sectionIcon.textContent = this._config.icon;
    if (this._config.icon_color) {
      this.$.sectionIcon.style.color = `var(--${this._config.icon_color})`;
    }

    if (this._config.sensors.length === 0) {
      list.innerHTML = '<div class="sensor-empty">No sensors configured</div>';
      return;
    }

    for (const sensorCfg of this._config.sensors) {
      const row = document.createElement('div');
      row.className = 'sensor-row';
      row.dataset.accent = sensorCfg.accent || 'muted';
      row.dataset.entity = sensorCfg.entity || '';
      const interactionType = (sensorCfg.interaction && sensorCfg.interaction.type) || 'more_info';
      row.dataset.interaction = interactionType;
      if (interactionType !== 'none') {
        row.setAttribute('role', 'button');
        row.setAttribute('tabindex', '0');
      } else {
        row.setAttribute('tabindex', '-1');
      }

      const sparkHtml = this._config.show_sparkline ? `
        <div class="sensor-spark" id="spark-${this._rowRefs.length}">
          <svg viewBox="0 0 48 24" preserveAspectRatio="none">
            <path class="spark-line" d="" />
          </svg>
        </div>
      ` : '';

      const trendHtml = this._config.show_trend ? `
        <div class="sensor-trend" data-trend="stable">
          <span class="icon">arrow_upward</span>
        </div>
      ` : '';

      row.innerHTML = `
        <div class="sensor-icon">
          <span class="icon filled">${sensorCfg.icon || 'sensors'}</span>
        </div>
        <div class="sensor-info">
          <span class="sensor-label">${sensorCfg.label || sensorCfg.entity || ''}</span>
          <span class="sensor-sub" id="sub-${this._rowRefs.length}"></span>
        </div>
        ${sparkHtml}
        <div class="sensor-val-wrap">
          <span class="sensor-val">--</span>
          <span class="sensor-unit"></span>
        </div>
        ${trendHtml}
      `;

      list.appendChild(row);
      this._rowRefs.push({
        el: row,
        cfg: sensorCfg,
        valEl: row.querySelector('.sensor-val'),
        unitEl: row.querySelector('.sensor-unit'),
        subEl: row.querySelector('.sensor-sub'),
        trendEl: row.querySelector('.sensor-trend'),
        sparkEl: row.querySelector('.sensor-spark'),
        sparkPath: row.querySelector('.spark-line'),
      });
    }
  }

  /* ── Listeners ────────────────────────────────── */

  _setupListeners() {
    const activateRow = (row) => {
      if (!row) return;
      const idx = [...this.$.sensorList.children].indexOf(row);
      if (idx < 0 || idx >= this._rowRefs.length) return;
      const ref = this._rowRefs[idx];
      const cfg = ref.cfg;
      const interaction = cfg.interaction || { type: 'more_info' };

      switch (interaction.type) {
        case 'navigate':
          this.dispatchEvent(new CustomEvent('tunet-navigate', {
            bubbles: true, composed: true,
            detail: { card: interaction.target_card || '', entity: cfg.entity },
          }));
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
              bubbles: true, composed: true,
              detail: { entityId: cfg.entity },
            }));
          }
          break;

        case 'more_info':
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
              bubbles: true, composed: true,
              detail: { entityId: cfg.entity },
            }));
          }
          break;

        case 'none':
        default:
          break;
      }
    };

    this.$.sensorList.addEventListener('click', (e) => {
      const row = e.target.closest('.sensor-row');
      if (!row) return;
      activateRow(row);
    });

    this.$.sensorList.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const row = e.target.closest('.sensor-row');
      if (!row || row.dataset.interaction === 'none') return;
      e.preventDefault();
      activateRow(row);
    });
  }

  /* ── History Fetching ─────────────────────────── */

  async _fetchAllHistory() {
    if (!this._hass) return;

    for (let i = 0; i < this._rowRefs.length; i++) {
      const ref = this._rowRefs[i];
      const cfg = ref.cfg;
      if (!cfg.entity) continue;

      const needsHistory = this._config.show_sparkline || this._config.show_trend || cfg.show_range;
      if (!needsHistory) continue;

      const cached = this._historyCache[cfg.entity];
      if (cached && Date.now() - cached.lastFetch < 120000) continue;

      try {
        const hours = this._config.history_hours || 6;
        const end = new Date();
        const start = new Date(end.getTime() - hours * 3600000);

        const url = `history/period/${start.toISOString()}?filter_entity_id=${cfg.entity}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
        const result = await this._hass.callApi('GET', url);

        if (result && result[0] && result[0].length > 0) {
          const points = result[0]
            .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
            .filter(p => !isNaN(p.v));

          this._historyCache[cfg.entity] = {
            data: points,
            lastFetch: Date.now(),
          };

          this._updateRowHistory(i);
        }
      } catch (err) {
        console.debug(`[tunet-sensor-card] History fetch failed for ${cfg.entity}:`, err.message);
      }
    }
  }

  _updateRowHistory(idx) {
    const ref = this._rowRefs[idx];
    if (!ref) return;
    const cfg = ref.cfg;
    const cached = this._historyCache[cfg.entity];
    if (!cached || !cached.data.length) return;

    const values = cached.data.map(p => p.v);

    if (ref.sparkPath && values.length >= 2) {
      const path = TrendComputer.sparklinePath(values);
      ref.sparkPath.setAttribute('d', path);
    }

    if (ref.trendEl) {
      const trend = TrendComputer.compute(values, cfg.trend_threshold || 0.5);
      ref.trendEl.dataset.trend = trend;
    }

    if (cfg.show_range && ref.subEl && values.length >= 2) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const prec = cfg.precision != null ? cfg.precision : 1;
      const unit = cfg.unit || '';
      ref.subEl.innerHTML = `${min.toFixed(prec)}${unit} <span class="range-sep">&ndash;</span> ${max.toFixed(prec)}${unit}`;
    }
  }

  /* ── State Update (with dirty-diff) ──────────── */

  _updateAll(force = false) {
    if (!this._hass || !this._rendered) return;

    for (let i = 0; i < this._rowRefs.length; i++) {
      const ref = this._rowRefs[i];
      const cfg = ref.cfg;

      let val, rawVal, unit;

      if (cfg.entity) {
        const entity = this._hass.states[cfg.entity];
        if (!entity) {
          val = '--';
          rawVal = null;
          unit = cfg.unit || '';
        } else {
          rawVal = entity.state;
          unit = cfg.unit || entity.attributes.unit_of_measurement || '';

          if (!isNaN(rawVal) && rawVal !== '') {
            const prec = cfg.precision != null ? cfg.precision : 1;
            val = Number(rawVal).toFixed(prec);
            if (prec === 0) val = Math.round(Number(rawVal));
          } else {
            val = rawVal;
          }
        }
      } else {
        val = '--';
        rawVal = null;
        unit = cfg.unit || '';
      }

      const cacheKey = `row_${i}`;
      const prevRaw = this._prevValues[cacheKey];
      if (!force && prevRaw === rawVal) continue;
      this._prevValues[cacheKey] = rawVal;

      const display = val !== null && val !== undefined ? val : '--';
      ref.valEl.textContent = display;
      ref.unitEl.textContent = unit;

      let thresholdStyle = null;
      if (cfg.thresholds && rawVal !== null && !isNaN(rawVal)) {
        thresholdStyle = SensorStyleCompiler.evaluate(rawVal, cfg.thresholds);
      }
      if (!thresholdStyle && cfg.state_styles && rawVal !== null) {
        thresholdStyle = SensorStyleCompiler.evaluateState(String(rawVal), cfg.state_styles);
      }

      if (thresholdStyle) {
        ref.el.dataset.style = thresholdStyle;
      } else {
        delete ref.el.dataset.style;
      }

      if (!cfg.show_range && ref.subEl && cfg.entity) {
        const entity = this._hass.states[cfg.entity];
        if (entity && entity.attributes.friendly_name && entity.attributes.friendly_name !== cfg.label) {
          ref.subEl.textContent = entity.attributes.friendly_name;
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-sensor-card', TunetSensorCard, {
  name: 'Tunet Sensor Card',
  description: 'Glassmorphism environment sensor panel - row-based readings, sparklines, trend arrows, threshold styling, min/max ranges',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-sensor-card',
});

logCardVersion('TUNET-SENSOR', CARD_VERSION, '#34C759');

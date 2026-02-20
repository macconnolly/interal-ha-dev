/**
 * Tunet Sensor Card  v1.0.0
 * ──────────────────────────────────────────────────────────────
 * Dedicated environment sensor detail panel:
 *   Section-container wrapper  ·  Row-based sensor readings
 *   Trend indicators (rising/falling/stable)  ·  Min/max range
 *   Threshold-based accent switching  ·  Dirty-diff updates
 *   HA entity integration  ·  Configurable sensor rows
 *
 * Complements tunet_status_card.js (overview grid) with
 * deeper per-sensor detail in a vertical list format.
 *
 * Reference:
 *   /Mockups/tunet-overview-dashboard.html
 * ──────────────────────────────────────────────────────────────
 */

const SENSOR_CARD_VERSION = '1.0.0';

if (!window.TunetCardFoundation) {
  window.TunetCardFoundation = {
    escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    normalizeIcon(icon, options = {}) {
      const fallback = options.fallback || 'lightbulb';
      const aliases = options.aliases || {};
      const allow = options.allow || null;
      if (!icon) return fallback;
      const raw = String(icon).replace(/^mdi:/, '').trim();
      const resolved = aliases[raw] || raw;
      if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return fallback;
      if (allow && allow.size && !allow.has(resolved)) return fallback;
      return resolved;
    },
  };
}

/* ═══════════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_STYLES = `
  /* ── Tokens: Light ───────────────────────────── */
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --bg: #f4f4f9;
    --tile-bg: rgba(255,255,255,0.92);
    --parent-bg: rgba(255,255,255,0.35);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10,0.10);
    --amber-border: rgba(212,133,10,0.22);
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --red: #FF3B30;
    --red-fill: rgba(255,59,48,0.10);
    --red-border: rgba(255,59,48,0.22);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.18);
    --track-bg: rgba(28,28,30,0.055);
    --gray-ghost: rgba(0,0,0,0.035);
    --border-ghost: transparent;
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.06);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0,0.06);
    --r-card: 24px;
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --r-section: 38px;
    --r-tile: 16px;
    --r-icon: 16px;
    --r-pill: 999px;
    --divider: rgba(0,0,0,0.06);
    color-scheme: light;
    display: block;
  }

  /* ── Tokens: Dark (Midnight Navy) ────────────── */
  :host(.dark) {
    --glass: rgba(30,41,59,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --bg: #0f172a;
    --tile-bg: rgba(30,41,59,0.90);
    --parent-bg: rgba(30,41,59,0.60);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36,0.14);
    --amber-border: rgba(251,191,36,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.18);
    --red: #FF453A;
    --red-fill: rgba(255,69,58,0.14);
    --red-border: rgba(255,69,58,0.25);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.22);
    --track-bg: rgba(255,255,255,0.06);
    --gray-ghost: rgba(255,255,255,0.04);
    --border-ghost: rgba(255,255,255,0.05);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.25);
    --divider: rgba(255,255,255,0.06);
    color-scheme: dark;
  }

  /* ── Reset ───────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Icons ───────────────────────────────────── */
  .icon {
    font-family: 'Material Symbols Outlined', 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle;
    flex-shrink: 0; -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-20 { font-size: 20px; }
  .icon-18 { font-size: 18px; }
  .icon-16 { font-size: 16px; }
  .icon-14 { font-size: 14px; }

  /* ═══════════════════════════════════════════════
     SECTION CONTAINER - Outer frosted shell
     ═══════════════════════════════════════════════ */
  .section-container {
    position: relative;
    background: var(--parent-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--r-section);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 20px;
    box-shadow: var(--shadow-section);
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
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

  /* ── Accessibility ─────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
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
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" rel="stylesheet">

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
   TileStyleCompiler - Threshold evaluation
   ═══════════════════════════════════════════════════════════════ */

class SensorStyleCompiler {
  /**
   * Evaluate numeric thresholds. Sorted descending; first match wins.
   * @param {number} value
   * @param {Array} thresholds - [{value, condition, style}]
   * @returns {string|null}
   */
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

  /**
   * Evaluate state-based styles.
   * @param {string} state
   * @param {Array} stateStyles - [{state, style}]
   * @returns {string|null}
   */
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
  /**
   * Determine trend direction from recent history.
   * @param {Array<number>} history - Recent values (oldest first)
   * @param {number} threshold - Minimum change to register as rising/falling (default 0.5)
   * @returns {'rising'|'falling'|'stable'}
   */
  static compute(history, threshold = 0.5) {
    if (!history || history.length < 2) return 'stable';
    const recent = history.slice(-3); // last 3 data points
    const first = recent[0];
    const last = recent[recent.length - 1];
    const delta = last - first;
    if (delta > threshold) return 'rising';
    if (delta < -threshold) return 'falling';
    return 'stable';
  }

  /**
   * Generate SVG path for sparkline from history data.
   * @param {Array<number>} data - Data points
   * @param {number} width - SVG viewport width
   * @param {number} height - SVG viewport height
   * @param {number} padding - Vertical padding
   * @returns {string} SVG path d attribute
   */
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
    this._historyCache = {};      // entity_id -> {data: [], lastFetch: timestamp}
    this._throttleTimer = null;
    this._historyTimer = null;

    TunetSensorCard._injectFonts();
  }

  /* ── Font injection (once globally) ────────── */

  static _injectFonts() {
    if (TunetSensorCard._fontsInjected) return;
    TunetSensorCard._fontsInjected = true;
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward' },
    ];
    for (const cfg of links) {
      if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
      const link = document.createElement('link');
      link.rel = cfg.rel; link.href = cfg.href;
      if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
      document.head.appendChild(link);
    }
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
          unit: '°F',
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
          unit: '°F',
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

  /**
   * Config schema per sensor row:
   * {
   *   entity: string              - HA entity_id (required)
   *   label: string               - Display name
   *   icon: string                - Material icon name
   *   accent: string              - Accent color (amber|blue|green|red|purple|muted)
   *   unit: string                - Override unit (else uses entity's unit_of_measurement)
   *   precision: number           - Decimal places (default: 1)
   *   show_range: boolean         - Show min/max from history
   *   thresholds: Array           - [{value, condition, style}] for numeric
   *   state_styles: Array         - [{state, style}] for non-numeric
   *   interaction: {
   *     type: 'more_info'|'navigate'|'none',
   *     target_card: string
   *   }
   * }
   *
   * Card-level config:
   * {
   *   title: string               - Section header text
   *   icon: string                - Section header icon
   *   icon_color: string          - Section icon CSS color token name
   *   show_sparkline: boolean     - Enable sparkline mini-charts
   *   show_trend: boolean         - Enable trend arrows
   *   history_hours: number       - Hours of history for trends/sparklines (default: 6)
   *   sensors: Array              - Sensor row configs
   * }
   */

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

    // Dark mode
    const isDark = !!(hass.themes && hass.themes.darkMode);
    this.classList.toggle('dark', isDark);

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
    // Start periodic history refresh (every 5 min)
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
    style.textContent = SENSOR_STYLES;
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

    // Update header
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

      const iconName = window.TunetCardFoundation.normalizeIcon(sensorCfg.icon || 'sensors', {
        fallback: 'sensors',
      });
      const h = window.TunetCardFoundation.escapeHtml;
      row.innerHTML = `
        <div class="sensor-icon">
          <span class="icon filled">${h(iconName)}</span>
        </div>
        <div class="sensor-info">
          <span class="sensor-label">${h(sensorCfg.label || sensorCfg.entity || '')}</span>
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

      // Only fetch if sparkline or trend or range is needed
      const needsHistory = this._config.show_sparkline || this._config.show_trend || cfg.show_range;
      if (!needsHistory) continue;

      // Rate limit: don't re-fetch within 2 minutes
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

          // Update sparkline + trend for this row
          this._updateRowHistory(i);
        }
      } catch (err) {
        // History API not available or entity not found - silently skip
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

    // Update sparkline
    if (ref.sparkPath && values.length >= 2) {
      const path = TrendComputer.sparklinePath(values);
      ref.sparkPath.setAttribute('d', path);
    }

    // Update trend
    if (ref.trendEl) {
      const trend = TrendComputer.compute(values, cfg.trend_threshold || 0.5);
      ref.trendEl.dataset.trend = trend;
    }

    // Update sub-label with min/max range
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

      // Get current value
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

          // Format numeric
          if (!isNaN(rawVal) && rawVal !== '') {
            const prec = cfg.precision != null ? cfg.precision : 1;
            val = Number(rawVal).toFixed(prec);
            // Remove trailing zeros if precision is 0
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

      // Dirty check
      const cacheKey = `row_${i}`;
      const prevRaw = this._prevValues[cacheKey];
      if (!force && prevRaw === rawVal) continue;
      this._prevValues[cacheKey] = rawVal;

      // Update value
      const display = val !== null && val !== undefined ? val : '--';
      ref.valEl.textContent = display;
      ref.unitEl.textContent = unit;

      // Evaluate thresholds
      let thresholdStyle = null;
      if (cfg.thresholds && rawVal !== null && !isNaN(rawVal)) {
        thresholdStyle = SensorStyleCompiler.evaluate(rawVal, cfg.thresholds);
      }
      if (!thresholdStyle && cfg.state_styles && rawVal !== null) {
        thresholdStyle = SensorStyleCompiler.evaluateState(String(rawVal), cfg.state_styles);
      }

      // Apply threshold style
      if (thresholdStyle) {
        ref.el.dataset.style = thresholdStyle;
      } else {
        delete ref.el.dataset.style;
      }

      // Update sub-label: show entity friendly name as sublabel if no range
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

if (!customElements.get('tunet-sensor-card')) {
  customElements.define('tunet-sensor-card', TunetSensorCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-sensor-card')) {
  window.customCards.push({
    type: 'tunet-sensor-card',
    name: 'Tunet Sensor Card',
    description: 'Glassmorphism environment sensor panel - row-based readings, sparklines, trend arrows, threshold styling, min/max ranges',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-sensor-card',
  });
}

console.info(
  `%c TUNET-SENSOR-CARD %c v${SENSOR_CARD_VERSION} `,
  'color: #fff; background: #34C759; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #34C759; background: #e5f9ed; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);

/**
 * Tunet Weather Card (v2 – ES Module)
 * Current conditions + forecast with glassmorphism design
 * Version 1.6.1
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
  renderConfigPlaceholder,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '1.6.1';

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    display: block;
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Header */
  .hdr {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: var(--ctrl-min-h, 42px);
    border-radius: 10px; border: 1px solid var(--blue-border);
    background: var(--blue-fill); box-shadow: var(--ctrl-sh);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard);
    max-width: 100%;
  }
  @media (hover: hover) {
    .info-tile:hover { box-shadow: var(--shadow); }
  }
  .info-tile:active { transform: scale(var(--press-scale)); }
  .info-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    color: var(--blue);
  }
  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title { font-weight: 700; font-size: 14px; color: var(--text-sub); letter-spacing: .1px; line-height: 1.15; }
  .hdr-sub { font-size: 11.5px; font-weight: 600; color: var(--text-muted); letter-spacing: .1px; line-height: 1.15; }
  .hdr-spacer { flex: 1 1 auto; min-width: 0; }
  .hdr-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    min-width: 0;
    max-width: 100%;
    flex: 0 1 auto;
  }
  .seg-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    max-width: 100%;
    min-width: 0;
    flex: 0 1 auto;
  }
  .seg-btn {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 28px;
    padding: 0 11px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.25px;
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
    white-space: nowrap;
  }
  .seg-btn.active {
    background: var(--blue-fill);
    color: var(--blue);
  }
  .seg-group[hidden] { display: none !important; }

  /* Weather body */
  .weather-body { display: flex; flex-direction: column; gap: 10px; }
  .weather-main {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    gap: 12px;
    padding: 0 2px;
  }
  .weather-current { display: flex; flex-direction: column; gap: 2px; }
  .weather-temp {
    font-size: 42px; font-weight: 700; line-height: 1; letter-spacing: -1.5px;
    font-variant-numeric: tabular-nums; color: var(--text);
  }
  .deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }
  .weather-desc {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-sub);
    margin-top: 4px;
    white-space: normal;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 12ch;
  }

  .weather-details {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
    padding-top: 6px;
    align-content: start;
    min-width: 0;
  }
  .weather-detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-sub);
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .weather-detail .icon { color: var(--blue); font-size: 16px; width: 16px; height: 16px; }
  .weather-detail .val { font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }

  /* Forecast */
  .weather-forecast { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; }
  .forecast-tile {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 4px 5px; border-radius: 11px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }
  .forecast-tile:first-child { background: var(--blue-fill); border-color: var(--blue-border); }
  .forecast-day {
    font-size: 11.6px; font-weight: 700; letter-spacing: .2px; text-transform: uppercase; line-height: 1.08;
    color: var(--text-muted);
  }
  .forecast-tile:first-child .forecast-day { color: var(--blue); }
  .forecast-icon { color: var(--text-sub); font-size: 19px; line-height: 1; }
  .forecast-tile:first-child .forecast-icon { color: var(--blue); }
  .forecast-temps { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .forecast-hi { font-size: 13.8px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; line-height: 1.05; }
  .forecast-lo { font-size: 12.4px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; line-height: 1.05; }
  .forecast-precip-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .forecast-bar {
    width: 86%;
    height: 4px;
    border-radius: 999px;
    background: var(--track-bg);
    overflow: hidden;
  }
  .forecast-bar-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: rgba(0,122,255,0.86);
  }
  :host(.dark) .forecast-bar-fill {
    background: rgba(96,165,250,0.92);
  }
  .forecast-precip {
    font-size: 12px;
    font-weight: 700;
    color: var(--blue);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 720px) {
    .hdr-spacer { display: none; }
    .hdr-controls {
      gap: 4px;
      width: 100%;
      flex: 1 1 100%;
      justify-content: stretch;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .seg-group { width: 100%; }
    .seg-btn { padding: 0 8px; font-size: 11px; }
    .weather-main { grid-template-columns: 1fr; gap: 8px; }
    .weather-desc { max-width: none; }
  }

  @media (max-width: 480px) {
    .card { padding: var(--card-pad, 14px); }
    .hdr-controls {
      grid-template-columns: 1fr;
    }
    .weather-details {
      grid-template-columns: 1fr;
      gap: 5px;
      padding-top: 2px;
    }
    .seg-btn {
      min-height: 26px;
      padding: 0 7px;
      font-size: 10.8px;
    }
    .forecast-tile { padding: 6px 3px 4px; }
    .forecast-day { font-size: 11.2px; }
    .forecast-hi { font-size: 13.2px; }
    .forecast-lo { font-size: 12px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_WEATHER_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// Data maps
// ═══════════════════════════════════════════════════════════

const CONDITION_ICONS = {
  'clear-night': 'bedtime',
  'cloudy': 'cloud',
  'exceptional': 'warning',
  'fog': 'foggy',
  'hail': 'weather_hail',
  'lightning': 'thunderstorm',
  'lightning-rainy': 'thunderstorm',
  'partlycloudy': 'partly_cloudy_day',
  'pouring': 'rainy',
  'rainy': 'rainy',
  'snowy': 'weather_snowy',
  'snowy-rainy': 'weather_snowy',
  'sunny': 'sunny',
  'windy': 'air',
  'windy-variant': 'air',
};

function humanizeWeatherCondition(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRECIP_PROBABILITY_KEYS = [
  'precipitation_probability',
  'precipitation_chance',
  'precip_probability',
  'rain_probability',
  'snow_probability',
  'probability_of_precipitation',
  'probability_of_rain',
  'pop',
  'precip_chance',
  'chance_of_rain',
  'rain_chance',
  'precipitationProbability',
  'precipProbability',
  'precipitation.probability',
  'precipitation.chance',
  'rain.probability',
];

const PRECIP_AMOUNT_KEYS = [
  'precipitation',
  'precipitation_amount',
  'precipitation_total',
  'precip_amount',
  'total_precipitation',
  'liquid_precipitation',
  'rain',
  'rain_amount',
  'rain_total',
  'snow',
  'snow_amount',
  'snow_total',
  'precipitation.mm',
  'precipitation.value',
];

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._forecastDaily = [];
    this._forecastHourly = [];
    this._forecastUnsub = { daily: null, hourly: null };
    this._viewMode = 'daily';
    this._metricMode = 'temperature';
    this._viewPinned = false;
    this._metricPinned = false;
    injectFonts();
  }

  disconnectedCallback() {
    this._unsubForecast();
  }

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'weather' }] } } },
        { name: 'name', selector: { text: {} } },
        { name: 'forecast_days', selector: { number: { min: 1, max: 7, step: 1, mode: 'box' } } },
        { name: 'forecast_hours', selector: { number: { min: 4, max: 24, step: 1, mode: 'box' } } },
        { name: 'forecast_view', selector: { select: { options: ['auto', 'daily', 'hourly'] } } },
        { name: 'forecast_metric', selector: { select: { options: ['auto', 'temperature', 'precipitation'] } } },
        { name: 'show_view_toggle', selector: { boolean: {} } },
        { name: 'show_metric_toggle', selector: { boolean: {} } },
        { name: 'auto_precip_threshold', selector: { number: { min: 0, max: 100, step: 1, mode: 'box' } } },
        { name: 'show_last_updated', selector: { boolean: {} } },
      ],
      computeLabel: (s) => {
        const labels = {
          entity: 'Weather Entity',
          name: 'Card Name',
          forecast_days: 'Forecast Days',
          forecast_hours: 'Forecast Hours',
          forecast_view: 'Forecast View',
          forecast_metric: 'Forecast Metric',
          show_view_toggle: 'Show Daily/Hourly Toggle',
          show_metric_toggle: 'Show Temp/Precip Toggle',
          auto_precip_threshold: 'Auto Precip Threshold (%)',
          show_last_updated: 'Show Last Updated',
        };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return { entity: '', name: 'Weather' };
  }

  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Select a weather entity to display forecasts', 'Weather');
      return;
    }
    this._config = {
      entity: config.entity,
      name: config.name || 'Weather',
      forecast_days: config.forecast_days || 5,
      forecast_hours: config.forecast_hours || 8,
      forecast_view: config.forecast_view || 'auto',
      forecast_metric: config.forecast_metric || 'auto',
      show_view_toggle: config.show_view_toggle !== false,
      show_metric_toggle: config.show_metric_toggle !== false,
      auto_precip_threshold: Number.isFinite(Number(config.auto_precip_threshold))
        ? Math.max(0, Math.min(100, Number(config.auto_precip_threshold)))
        : 45,
      show_last_updated: config.show_last_updated !== false,
    };
    this._viewPinned = false;
    this._metricPinned = false;
    if (this._rendered) this._updateAll();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    const entity = this._config.entity;

    if (!oldHass || (entity && (!this._forecastUnsub || this._subscribedEntity !== entity))) {
      this._subscribedEntity = entity;
      this._subscribeForecast();
    }

    if (!oldHass || (entity && oldHass.states[entity] !== hass.states[entity])) {
      this._updateAll();
    }
  }

  getCardSize() {
    const hasForecast = this._config.forecast_days > 0;
    return hasForecast ? 5 : 3;
  }

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
      rows: 'auto',
      min_rows: 3,
    };
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_WEATHER_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card">
          <div class="hdr">
            <div class="info-tile" id="infoTile">
              <div class="entity-icon"><span class="icon filled" style="font-size:18px" id="condIcon">cloud</span></div>
              <div class="hdr-text">
                <span class="hdr-title" id="cardTitle">Weather</span>
                <span class="hdr-sub" id="hdrSub"></span>
              </div>
            </div>
            <div class="hdr-spacer"></div>
            <div class="hdr-controls">
              <div class="seg-group" id="viewToggle">
                <button type="button" class="seg-btn" id="viewDailyBtn">Daily</button>
                <button type="button" class="seg-btn" id="viewHourlyBtn">Hourly</button>
              </div>
              <div class="seg-group" id="metricToggle">
                <button type="button" class="seg-btn" id="metricTempBtn">Temp</button>
                <button type="button" class="seg-btn" id="metricPrecipBtn">Precip</button>
              </div>
            </div>
          </div>
          <div class="weather-body">
            <div class="weather-main">
              <div class="weather-current">
                <span class="weather-temp" id="curTemp">--<span class="deg">&deg;</span></span>
                <span class="weather-desc" id="condDesc">--</span>
              </div>
              <div class="weather-details" id="details"></div>
            </div>
            <div class="weather-forecast" id="forecast"></div>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      infoTile: this.shadowRoot.getElementById('infoTile'),
      condIcon: this.shadowRoot.getElementById('condIcon'),
      cardTitle: this.shadowRoot.getElementById('cardTitle'),
      hdrSub: this.shadowRoot.getElementById('hdrSub'),
      curTemp: this.shadowRoot.getElementById('curTemp'),
      condDesc: this.shadowRoot.getElementById('condDesc'),
      details: this.shadowRoot.getElementById('details'),
      forecast: this.shadowRoot.getElementById('forecast'),
      viewToggle: this.shadowRoot.getElementById('viewToggle'),
      viewDailyBtn: this.shadowRoot.getElementById('viewDailyBtn'),
      viewHourlyBtn: this.shadowRoot.getElementById('viewHourlyBtn'),
      metricToggle: this.shadowRoot.getElementById('metricToggle'),
      metricTempBtn: this.shadowRoot.getElementById('metricTempBtn'),
      metricPrecipBtn: this.shadowRoot.getElementById('metricPrecipBtn'),
    };

    this.$.infoTile.addEventListener('click', () => {
      if (!this._hass || !this._config.entity) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });
    this.$.viewDailyBtn?.addEventListener('click', () => this._setViewMode('daily', true));
    this.$.viewHourlyBtn?.addEventListener('click', () => this._setViewMode('hourly', true));
    this.$.metricTempBtn?.addEventListener('click', () => this._setMetricMode('temperature', true));
    this.$.metricPrecipBtn?.addEventListener('click', () => this._setMetricMode('precipitation', true));
  }

  _unsubForecast() {
    if (!this._forecastUnsub) return;
    if (typeof this._forecastUnsub.daily === 'function') {
      this._forecastUnsub.daily();
      this._forecastUnsub.daily = null;
    }
    if (typeof this._forecastUnsub.hourly === 'function') {
      this._forecastUnsub.hourly();
      this._forecastUnsub.hourly = null;
    }
  }

  async _subscribeForecast() {
    if (!this._hass || !this._config.entity) return;

    this._unsubForecast();
    await Promise.all([
      this._subscribeForecastType('daily'),
      this._subscribeForecastType('hourly'),
    ]);
    this._renderForecast();
  }

  async _subscribeForecastType(type) {
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (msg.forecast && Array.isArray(msg.forecast)) {
            if (type === 'hourly') this._forecastHourly = msg.forecast;
            else this._forecastDaily = msg.forecast;
            this._renderForecast();
          }
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: type,
          entity_id: this._config.entity,
        }
      );
      this._forecastUnsub[type] = unsub;
      return;
    } catch (_) {
      // Fallback to one-shot fetch below
    }

    await this._fetchForecastType(type);
  }

  async _fetchForecastType(type) {
    try {
      const result = await this._hass.callService('weather', 'get_forecasts', {
        type,
      }, { entity_id: this._config.entity }, false, true);

      const forecast = result?.response?.[this._config.entity]?.forecast
        || result?.[this._config.entity]?.forecast;
      if (Array.isArray(forecast) && forecast.length > 0) {
        if (type === 'hourly') this._forecastHourly = forecast;
        else this._forecastDaily = forecast;
        return;
      }
    } catch (_) {}

    if (type === 'daily') {
      const entity = this._hass.states[this._config.entity];
      if (entity && Array.isArray(entity.attributes?.forecast)) {
        this._forecastDaily = entity.attributes.forecast;
      }
    }
  }

  _updateAll() {
    if (!this.$ || !this._hass) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;

    const a = entity.attributes;
    const condition = entity.state;
    this._applyAutoModes(condition);
    this._updateToggleControls();

    this.$.cardTitle.textContent = this._config.name;
    this.$.condIcon.textContent = CONDITION_ICONS[condition] || 'cloud';

    const temp = a.temperature != null ? Math.round(a.temperature) : '--';
    this.$.curTemp.innerHTML = `${temp}<span class="deg">&deg;</span>`;

    const condNames = {
      'clear-night': 'Clear Night', 'cloudy': 'Cloudy', 'fog': 'Foggy',
      'hail': 'Hail', 'lightning': 'Thunderstorm', 'lightning-rainy': 'Thunderstorm',
      'partlycloudy': 'Partly Cloudy', 'pouring': 'Heavy Rain', 'rainy': 'Rainy',
      'snowy': 'Snowy', 'snowy-rainy': 'Sleet', 'sunny': 'Sunny',
      'windy': 'Windy', 'windy-variant': 'Windy', 'exceptional': 'Exceptional',
    };
    this.$.condDesc.textContent = condNames[condition] || humanizeWeatherCondition(condition);

    const lastUpdate = entity.last_updated;
    if (this._config.show_last_updated && lastUpdate) {
      const mins = Math.round((Date.now() - new Date(lastUpdate).getTime()) / 60000);
      this.$.hdrSub.textContent = mins < 1 ? 'Just updated' : `Updated ${mins} min ago`;
    } else {
      this.$.hdrSub.textContent = '';
    }

    const details = [];
    if (a.wind_speed != null) {
      const dir = a.wind_bearing != null ? this._windDir(a.wind_bearing) : '';
      details.push({ icon: 'air', label: 'Wind', value: `${Math.round(a.wind_speed)} mph ${dir}`.trim() });
    }
    if (a.humidity != null) {
      details.push({ icon: 'water_drop', label: 'Humidity', value: `${Math.round(a.humidity)}%` });
    }
    if (a.uv_index != null) {
      details.push({ icon: 'wb_sunny', label: 'UV', value: String(Math.round(a.uv_index)) });
    }
    if (a.pressure != null) {
      details.push({ icon: 'speed', label: 'Pressure', value: `${Math.round(a.pressure)} hPa` });
    }

    this.$.details.innerHTML = details.map(d =>
      `<div class="weather-detail">
        <span class="icon">${d.icon}</span>
        ${d.label} <span class="val">${d.value}</span>
      </div>`
    ).join('');

    if (this._forecastDaily.length || this._forecastHourly.length) this._renderForecast();
  }

  _renderForecast() {
    if (!this.$) return;
    const source = this._viewMode === 'hourly' ? this._forecastHourly : this._forecastDaily;
    const limit = this._resolveForecastLimit();
    const points = Array.isArray(source) ? source.slice(0, limit) : [];
    if (!points.length) {
      this.$.forecast.innerHTML = '';
      return;
    }

    this.$.forecast.innerHTML = points.map((fc, i) => {
      const dt = new Date(fc.datetime);
      const dayName = this._viewMode === 'hourly'
        ? (i === 0 ? 'Now' : this._formatHourLabel(dt))
        : (i === 0 ? 'Now' : DAY_NAMES[dt.getDay()]);
      const icon = CONDITION_ICONS[fc.condition] || 'cloud';
      const isPrecip = this._metricMode === 'precipitation';
      const hi = fc.temperature != null ? Math.round(fc.temperature) : '--';
      const lo = this._viewMode === 'daily' && fc.templow != null ? Math.round(fc.templow) : null;
      const precip = this._resolvePrecipPresentation(fc);

      return `
        <div class="forecast-tile">
          <span class="forecast-day">${dayName}</span>
          <span class="icon forecast-icon">${icon}</span>
          ${isPrecip
            ? `<div class="forecast-precip-wrap">
                <div class="forecast-bar"><div class="forecast-bar-fill" style="width:${precip.barPercent}%"></div></div>
                <span class="forecast-precip">${precip.label}</span>
              </div>`
            : `<div class="forecast-temps">
                <span class="forecast-hi">${hi}&deg;</span>
                ${lo != null ? `<span class="forecast-lo">${lo}&deg;</span>` : ''}
              </div>`
          }
        </div>`;
    }).join('');
  }

  _resolveForecastLimit() {
    const dailyCount = Math.max(1, Number(this._config.forecast_days) || 5);
    const hourlyCount = Math.max(1, Number(this._config.forecast_hours) || 8);
    // Parity rule: in hourly + precipitation mode, render the same tile count as daily forecast.
    if (this._viewMode === 'hourly' && this._metricMode === 'precipitation') return dailyCount;
    return this._viewMode === 'hourly' ? hourlyCount : dailyCount;
  }

  _readForecastValue(fc, keyPath) {
    if (!fc || !keyPath) return null;
    if (Object.prototype.hasOwnProperty.call(fc, keyPath)) return fc[keyPath];
    if (fc.attributes && Object.prototype.hasOwnProperty.call(fc.attributes, keyPath)) {
      return fc.attributes[keyPath];
    }

    if (!keyPath.includes('.')) return null;
    const parts = keyPath.split('.');
    let cur = fc;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object' || !(part in cur)) return null;
      cur = cur[part];
    }
    return cur;
  }

  _toFiniteNumber(value, depth = 0) {
    if (value == null || depth > 2) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
      const match = value.trim().match(/-?\d+(\.\d+)?/);
      if (!match) return null;
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'object') {
      for (const key of ['value', 'amount', 'probability', 'chance', 'total', 'mm']) {
        if (!(key in value)) continue;
        const parsed = this._toFiniteNumber(value[key], depth + 1);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  }

  _pickPrecipCandidate(fc, keys, normalize) {
    let firstValid = null;
    for (const key of keys) {
      const raw = this._readForecastValue(fc, key);
      if (raw == null) continue;
      const normalized = normalize.call(this, raw, key);
      if (!Number.isFinite(normalized)) continue;
      const candidate = { value: normalized, source: key };
      if (!firstValid) firstValid = candidate;
      if (normalized > 0) return candidate;
    }
    return firstValid;
  }

  _normalizePrecipProbability(raw, key) {
    let probability = this._toFiniteNumber(raw);
    if (!Number.isFinite(probability)) return NaN;
    const isPercentString = typeof raw === 'string' && raw.includes('%');
    if (probability > 0 && probability <= 1 && !isPercentString) probability *= 100;
    probability = Math.max(0, Math.min(100, probability));
    return Math.round(probability);
  }

  _normalizePrecipAmount(raw, key) {
    let amount = this._toFiniteNumber(raw);
    if (!Number.isFinite(amount)) return NaN;
    if (/(?:_in|inches?|inch)/i.test(String(key))) amount *= 25.4;
    amount = Math.max(0, amount);
    return Math.round(amount * 10) / 10;
  }

  _resolvePrecipProbability(fc) {
    return this._pickPrecipCandidate(fc, PRECIP_PROBABILITY_KEYS, this._normalizePrecipProbability);
  }

  _resolvePrecipAmount(fc) {
    return this._pickPrecipCandidate(fc, PRECIP_AMOUNT_KEYS, this._normalizePrecipAmount);
  }

  _resolvePrecipPresentation(fc) {
    const probability = this._resolvePrecipProbability(fc);
    const amount = this._resolvePrecipAmount(fc);
    const probabilityValue = probability?.value;
    const amountValue = amount?.value;

    if (Number.isFinite(probabilityValue) && probabilityValue > 0) {
      return { barPercent: probabilityValue, label: `${probabilityValue}%` };
    }
    if (Number.isFinite(amountValue) && amountValue > 0) {
      return {
        barPercent: Math.max(0, Math.min(100, Math.round((amountValue / 10) * 100))),
        label: `${amountValue.toFixed(1)} mm`,
      };
    }
    if (Number.isFinite(probabilityValue)) {
      return { barPercent: probabilityValue, label: `${probabilityValue}%` };
    }
    if (Number.isFinite(amountValue)) {
      return {
        barPercent: Math.max(0, Math.min(100, Math.round((amountValue / 10) * 100))),
        label: `${amountValue.toFixed(1)} mm`,
      };
    }
    return { barPercent: 0, label: '--' };
  }

  _setViewMode(mode, pinned = false) {
    this._viewMode = mode === 'hourly' ? 'hourly' : 'daily';
    if (pinned) this._viewPinned = true;
    this._updateToggleControls();
    this._renderForecast();
  }

  _setMetricMode(mode, pinned = false) {
    this._metricMode = mode === 'precipitation' ? 'precipitation' : 'temperature';
    if (pinned) this._metricPinned = true;
    this._updateToggleControls();
    this._renderForecast();
  }

  _updateToggleControls() {
    if (!this.$) return;
    if (this.$.viewToggle) this.$.viewToggle.hidden = !this._config.show_view_toggle;
    if (this.$.metricToggle) this.$.metricToggle.hidden = !this._config.show_metric_toggle;
    this.$.viewDailyBtn?.classList.toggle('active', this._viewMode === 'daily');
    this.$.viewHourlyBtn?.classList.toggle('active', this._viewMode === 'hourly');
    this.$.metricTempBtn?.classList.toggle('active', this._metricMode === 'temperature');
    this.$.metricPrecipBtn?.classList.toggle('active', this._metricMode === 'precipitation');
  }

  _applyAutoModes(condition) {
    const precipCondition = this._isPrecipCondition(condition);
    const hourlySlice = (this._forecastHourly || []).slice(0, Math.max(1, this._config.forecast_hours || 8));
    const maxPrecip = hourlySlice.reduce((maxVal, fc) => {
      const probability = this._resolvePrecipProbability(fc)?.value;
      if (Number.isFinite(probability)) return Math.max(maxVal, Number(probability));
      const amount = this._resolvePrecipAmount(fc)?.value;
      if (Number.isFinite(amount)) {
        const amountScore = Math.max(0, Math.min(100, Math.round((amount / 10) * 100)));
        return Math.max(maxVal, amountScore);
      }
      return maxVal;
    }, 0);
    const precipLikely = precipCondition || maxPrecip >= (this._config.auto_precip_threshold || 45);

    if (!this._viewPinned) {
      if (this._config.forecast_view === 'hourly') this._viewMode = 'hourly';
      else if (this._config.forecast_view === 'daily') this._viewMode = 'daily';
      else this._viewMode = precipLikely ? 'hourly' : 'daily';
    }

    if (!this._metricPinned) {
      if (this._config.forecast_metric === 'precipitation') this._metricMode = 'precipitation';
      else if (this._config.forecast_metric === 'temperature') this._metricMode = 'temperature';
      else this._metricMode = precipLikely ? 'precipitation' : 'temperature';
    }
  }

  _isPrecipCondition(condition) {
    return ['rainy', 'pouring', 'lightning-rainy', 'snowy', 'snowy-rainy', 'hail', 'lightning']
      .includes(String(condition || '').toLowerCase());
  }

  _formatHourLabel(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '--';
    try {
      return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(date);
    } catch (_) {
      return date.toLocaleTimeString([], { hour: 'numeric' });
    }
  }

  _windDir(bearing) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(bearing / 22.5) % 16];
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-weather-card', TunetWeatherCard, {
  name: 'Tunet Weather Card',
  description: 'Weather conditions and forecast with glassmorphism design',
  preview: true,
});

logCardVersion('TUNET-WEATHER', CARD_VERSION, '#007AFF');

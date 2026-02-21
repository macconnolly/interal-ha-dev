/**
 * Tunet Weather Card (v2 – ES Module)
 * Current conditions + forecast with glassmorphism design
 * Version 1.4.0
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

const CARD_VERSION = '1.4.0';

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
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--blue-border);
    background: var(--blue-fill); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    color: var(--blue);
  }
  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title { font-weight: 700; font-size: 13px; color: var(--text-sub); letter-spacing: .1px; line-height: 1.15; }
  .hdr-sub { font-size: 10.5px; font-weight: 600; color: var(--text-muted); letter-spacing: .1px; line-height: 1.15; }
  .hdr-spacer { flex: 1; }

  /* Weather body */
  .weather-body { display: flex; flex-direction: column; gap: 14px; }
  .weather-main { display: flex; align-items: flex-start; gap: 20px; padding: 0 4px; }
  .weather-current { display: flex; flex-direction: column; gap: 2px; }
  .weather-temp {
    font-size: 42px; font-weight: 700; line-height: 1; letter-spacing: -1.5px;
    font-variant-numeric: tabular-nums; color: var(--text);
  }
  .deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }
  .weather-desc { font-size: 13px; font-weight: 600; color: var(--text-sub); margin-top: 4px; }

  .weather-details { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; }
  .weather-detail { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-sub); }
  .weather-detail .icon { color: var(--blue); font-size: 16px; width: 16px; height: 16px; }
  .weather-detail .val { font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }

  /* Forecast */
  .weather-forecast { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .forecast-tile {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 10px 4px 8px; border-radius: 12px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all .15s;
  }
  .forecast-tile:first-child { background: var(--blue-fill); border-color: var(--blue-border); }
  .forecast-day {
    font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase;
    color: var(--text-muted);
  }
  .forecast-tile:first-child .forecast-day { color: var(--blue); }
  .forecast-icon { color: var(--text-sub); }
  .forecast-tile:first-child .forecast-icon { color: var(--blue); }
  .forecast-temps { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .forecast-hi { font-size: 13px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .forecast-lo { font-size: 11px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .weather-forecast { grid-template-columns: repeat(3, 1fr); }
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    this._forecast = [];
    this._forecastUnsub = null;
    injectFonts();
  }

  disconnectedCallback() {
    this._unsubForecast();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'weather' }] } } },
        { name: 'name', selector: { text: {} } },
        { name: 'forecast_days', selector: { number: { min: 1, max: 7, step: 1, mode: 'box' } } },
        { name: 'show_last_updated', selector: { boolean: {} } },
      ],
      computeLabel: (s) => {
        const labels = {
          entity: 'Weather Entity',
          name: 'Card Name',
          forecast_days: 'Forecast Days',
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
    if (!config.entity) throw new Error('Please define a weather entity');
    this._config = {
      entity: config.entity,
      name: config.name || 'Weather',
      forecast_days: config.forecast_days || 5,
      show_last_updated: config.show_last_updated !== false,
    };
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
    };

    this.$.infoTile.addEventListener('click', () => {
      if (!this._hass || !this._config.entity) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });
  }

  _unsubForecast() {
    if (this._forecastUnsub) {
      this._forecastUnsub();
      this._forecastUnsub = null;
    }
  }

  async _subscribeForecast() {
    if (!this._hass || !this._config.entity) return;

    this._unsubForecast();

    try {
      this._forecastUnsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (msg.forecast && Array.isArray(msg.forecast)) {
            this._forecast = msg.forecast;
            this._renderForecast();
          }
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: this._config.entity,
        }
      );
    } catch {
      try {
        const result = await this._hass.callService('weather', 'get_forecasts', {
          type: 'daily',
        }, { entity_id: this._config.entity }, false, true);

        const forecast = result?.response?.[this._config.entity]?.forecast
          || result?.[this._config.entity]?.forecast;
        if (Array.isArray(forecast) && forecast.length > 0) {
          this._forecast = forecast;
          this._renderForecast();
          return;
        }
      } catch (_) {}

      try {
        const entity = this._hass.states[this._config.entity];
        if (entity && entity.attributes.forecast) {
          this._forecast = entity.attributes.forecast;
          this._renderForecast();
        }
      } catch (_) {}
    }
  }

  _updateAll() {
    if (!this.$ || !this._hass) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;

    const a = entity.attributes;
    const condition = entity.state;

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
    this.$.condDesc.textContent = condNames[condition] || condition;

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

    if (this._forecast.length) this._renderForecast();
  }

  _renderForecast() {
    if (!this.$ || !this._forecast.length) return;

    const days = this._forecast.slice(0, this._config.forecast_days);
    this.$.forecast.innerHTML = days.map((fc, i) => {
      const dt = new Date(fc.datetime);
      const dayName = i === 0 ? 'Now' : DAY_NAMES[dt.getDay()];
      const icon = CONDITION_ICONS[fc.condition] || 'cloud';
      const hi = fc.temperature != null ? Math.round(fc.temperature) : '--';
      const lo = fc.templow != null ? Math.round(fc.templow) : null;

      return `
        <div class="forecast-tile">
          <span class="forecast-day">${dayName}</span>
          <span class="icon forecast-icon" style="font-size:20px">${icon}</span>
          <div class="forecast-temps">
            <span class="forecast-hi">${hi}&deg;</span>
            ${lo != null ? `<span class="forecast-lo">${lo}&deg;</span>` : ''}
          </div>
        </div>`;
    }).join('');
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

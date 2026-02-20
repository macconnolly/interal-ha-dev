/**
 * Tunet Weather Card
 * Current conditions + forecast with glassmorphism design
 * Version 1.0.0
 */

const TUNET_WEATHER_VERSION = '1.1.0';

const TUNET_WEATHER_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0,0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --r-card: 24px;
    --r-tile: 16px;
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    color-scheme: light;
    display: block;
  }

  :host(.dark) {
    --glass: rgba(44,44,46,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.55);
    --text-muted: rgba(245,245,247,0.35);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.14);
    --blue-border: rgba(10,132,255,0.24);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    color-scheme: dark;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .icon {
    font-family: 'Material Symbols Outlined', 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle; flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }

  /* Card */
  .card {
    position: relative; width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex; flex-direction: column; gap: 0;
    transition: background .3s, border-color .3s;
  }
  .card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

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
  .forecast { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .fc-tile {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 10px 4px 8px; border-radius: 12px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--tile-shadow-rest);
    transition: all .15s;
  }
  .fc-tile:hover { box-shadow: var(--tile-shadow-lift); }
  .fc-tile.now { background: var(--blue-fill); border-color: var(--blue-border); }
  .fc-day {
    font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase;
    color: var(--text-muted);
  }
  .fc-tile.now .fc-day { color: var(--blue); }
  .fc-icon { color: var(--text-sub); font-size: 20px; width: 20px; height: 20px; }
  .fc-tile.now .fc-icon { color: var(--blue); }
  .fc-temps { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .fc-hi { font-size: 13px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .fc-lo { font-size: 11px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .forecast { grid-template-columns: repeat(3, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Map HA weather conditions to Material Symbols
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

class TunetWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._forecast = [];
    TunetWeatherCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetWeatherCard._fontsInjected) return;
    TunetWeatherCard._fontsInjected = true;
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

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
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

    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');

    const entity = this._config.entity;
    if (!oldHass || (entity && oldHass.states[entity] !== hass.states[entity])) {
      this._updateAll();
      this._fetchForecast();
    }
  }

  getCardSize() {
    return 5;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_WEATHER_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const fontLinks = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" rel="stylesheet">
    `;

    const tpl = document.createElement('template');
    tpl.innerHTML = fontLinks + `
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
            <div class="forecast" id="forecast"></div>
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

  async _fetchForecast() {
    if (!this._hass || !this._config.entity) return;
    try {
      const result = await this._hass.callWS({
        type: 'weather/get_forecasts',
        entity_ids: [this._config.entity],
        forecast_type: 'daily',
      });
      const forecast = result
        && result[this._config.entity]
        && Array.isArray(result[this._config.entity].forecast)
        ? result[this._config.entity].forecast
        : [];
      if (forecast.length > 0) {
        this._forecast = forecast;
        this._renderForecast();
        return;
      }
    } catch {
      // Fall through to attribute fallback.
    }

    try {
      const entity = this._hass.states[this._config.entity];
      if (entity && entity.attributes.forecast) {
        this._forecast = entity.attributes.forecast;
        this._renderForecast();
      }
    } catch (_) {}
  }

  _updateAll() {
    if (!this.$ || !this._hass) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;

    const a = entity.attributes;
    const condition = entity.state;

    this.$.cardTitle.textContent = this._config.name;
    this.$.condIcon.textContent = CONDITION_ICONS[condition] || 'cloud';

    // Current temp
    const temp = a.temperature != null ? Math.round(a.temperature) : '--';
    this.$.curTemp.innerHTML = `${temp}<span class="deg">&deg;</span>`;

    // Condition description
    const condNames = {
      'clear-night': 'Clear Night', 'cloudy': 'Cloudy', 'fog': 'Foggy',
      'hail': 'Hail', 'lightning': 'Thunderstorm', 'lightning-rainy': 'Thunderstorm',
      'partlycloudy': 'Partly Cloudy', 'pouring': 'Heavy Rain', 'rainy': 'Rainy',
      'snowy': 'Snowy', 'snowy-rainy': 'Sleet', 'sunny': 'Sunny',
      'windy': 'Windy', 'windy-variant': 'Windy', 'exceptional': 'Exceptional',
    };
    this.$.condDesc.textContent = condNames[condition] || condition;

    // Header subtitle
    const lastUpdate = entity.last_updated;
    if (this._config.show_last_updated && lastUpdate) {
      const mins = Math.round((Date.now() - new Date(lastUpdate).getTime()) / 60000);
      this.$.hdrSub.textContent = mins < 1 ? 'Just updated' : `Updated ${mins} min ago`;
    } else {
      this.$.hdrSub.textContent = '';
    }

    // Details
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

    // Render forecast from cache
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
        <div class="fc-tile${i === 0 ? ' now' : ''}">
          <span class="fc-day">${dayName}</span>
          <span class="icon fc-icon">${icon}</span>
          <div class="fc-temps">
            <span class="fc-hi">${hi}&deg;</span>
            ${lo != null ? `<span class="fc-lo">${lo}&deg;</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  _windDir(bearing) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(bearing / 22.5) % 16];
  }
}

if (!customElements.get('tunet-weather-card')) {
  customElements.define('tunet-weather-card', TunetWeatherCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-weather-card')) {
  window.customCards.push({
    type: 'tunet-weather-card',
    name: 'Tunet Weather Card',
    description: 'Weather conditions and forecast with glassmorphism design',
    preview: true,
  });
}

console.info(
  `%c TUNET-WEATHER-CARD %c v${TUNET_WEATHER_VERSION} `,
  'color: #fff; background: #007AFF; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #007AFF; background: #e0f0ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);

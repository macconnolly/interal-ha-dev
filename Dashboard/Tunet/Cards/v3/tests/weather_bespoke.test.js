import { describe, it, expect, vi } from 'vitest';
import {
  readCardSource,
  extractCSSBlocks,
} from './helpers/css_contract_helpers.js';

import '../tunet_weather_card.js';

function readCardCSS(filename) {
  return extractCSSBlocks(readCardSource(filename)).join('\n');
}

function makeWeatherHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    connection: {
      subscribeMessage: vi.fn(async () => () => {}),
    },
    callService: vi.fn(async () => ({})),
    states: {
      'weather.home': {
        entity_id: 'weather.home',
        state: 'partlycloudy',
        last_updated: new Date().toISOString(),
        attributes: {
          temperature: 53,
          humidity: 21,
          wind_speed: 9,
          wind_bearing: 25,
          uv_index: 0,
          pressure: 1012,
        },
      },
      ...overrides,
    },
  };
}

function createWeatherCard(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-weather-card');
  el.setConfig({
    entity: 'weather.home',
    name: 'Weather',
    forecast_view: 'hourly',
    forecast_metric: 'temperature',
    show_view_toggle: true,
    show_metric_toggle: true,
    show_last_updated: false,
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeWeatherHass(hassOverrides);
  return el;
}

describe('Weather card: CD8 phone-density contract', () => {
  it('uses flip chips instead of segmented control groups', () => {
    const css = readCardCSS('tunet_weather_card.js');
    expect(css).toMatch(/\.flip-chip\s*\{/);
    expect(css).not.toMatch(/\.seg-group\s*\{/);
    expect(css).not.toMatch(/\.seg-btn\s*\{/);
  });

  it('hides detail labels at phone width', () => {
    const css = readCardCSS('tunet_weather_card.js');
    expect(css).toMatch(/@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.weather-detail\s+\.lbl\s*\{\s*display\s*:\s*none/s);
  });

  it('defaults show_pressure to false', () => {
    const el = document.createElement('tunet-weather-card');
    el.setConfig({ entity: 'weather.home' });
    expect(el._config.show_pressure).toBe(false);
  });

  it('only renders pressure when show_pressure is explicitly enabled', () => {
    const hidden = createWeatherCard();
    expect(hidden.shadowRoot.getElementById('details').textContent).not.toContain('Pressure');
    hidden.remove();

    const visible = createWeatherCard({ show_pressure: true });
    expect(visible.shadowRoot.getElementById('details').textContent).toContain('Pressure');
    visible.remove();
  });

  it('renders alternate-state flip-chip labels', () => {
    const el = createWeatherCard({
      forecast_view: 'daily',
      forecast_metric: 'temperature',
    });
    expect(el.shadowRoot.getElementById('viewChip').textContent).toBe('Hourly');
    expect(el.shadowRoot.getElementById('metricChip').textContent).toBe('Precip');
    el.remove();
  });

  it('shows UV in the top-right of hourly temperature forecast tiles when forecast data provides it', () => {
    const el = createWeatherCard({
      forecast_view: 'hourly',
      forecast_metric: 'temperature',
    });
    el._viewMode = 'hourly';
    el._metricMode = 'temperature';
    el._forecastHourly = [
      {
        datetime: new Date().toISOString(),
        condition: 'sunny',
        temperature: 61,
        uv_index: 6,
      },
    ];
    el._renderForecast();

    const forecastText = el.shadowRoot.getElementById('forecast').textContent.replace(/\s+/g, ' ');
    expect(forecastText).toContain('UV');
    expect(forecastText).toContain('6');
    expect(el.shadowRoot.querySelector('.forecast-aux')).not.toBeNull();
    el.remove();
  });

  it('prefers hourly temperature for dry auto/auto mode when hourly UV data exists', () => {
    const el = createWeatherCard({
      forecast_view: 'auto',
      forecast_metric: 'auto',
    });
    el._forecastHourly = [
      {
        datetime: new Date().toISOString(),
        condition: 'sunny',
        temperature: 61,
        uv_index: 6,
      },
    ];

    el._applyAutoModes('sunny');

    expect(el._viewMode).toBe('hourly');
    expect(el._metricMode).toBe('temperature');
    el.remove();
  });

  it('recomputes auto/auto into hourly temperature when hourly UV data arrives after initial render', () => {
    const el = createWeatherCard({
      forecast_view: 'auto',
      forecast_metric: 'auto',
    });

    expect(el._viewMode).toBe('daily');
    expect(el._metricMode).toBe('temperature');

    el._forecastHourly = [
      {
        datetime: new Date().toISOString(),
        condition: 'sunny',
        temperature: 61,
        uv_index: 6,
      },
    ];
    el._refreshForecastDrivenModes();
    el._renderForecast();

    expect(el._viewMode).toBe('hourly');
    expect(el._metricMode).toBe('temperature');
    expect(el.shadowRoot.querySelector('.forecast-aux')).not.toBeNull();
    el.remove();
  });

  it('keeps precip-driven auto/auto mode on hourly precipitation even when UV data exists', () => {
    const el = createWeatherCard({
      forecast_view: 'auto',
      forecast_metric: 'auto',
      auto_precip_threshold: 45,
    });
    el._forecastHourly = [
      {
        datetime: new Date().toISOString(),
        condition: 'rainy',
        precipitation_probability: 68,
        uv_index: 4,
      },
    ];

    el._applyAutoModes('rainy');

    expect(el._viewMode).toBe('hourly');
    expect(el._metricMode).toBe('precipitation');
    el.remove();
  });

  it('does not show UV badges for precipitation tiles', () => {
    const el = createWeatherCard({
      forecast_view: 'hourly',
      forecast_metric: 'precipitation',
    });
    el._viewMode = 'hourly';
    el._metricMode = 'precipitation';
    el._forecastHourly = [
      {
        datetime: new Date().toISOString(),
        condition: 'rainy',
        precipitation_probability: 45,
        uv_index: 7,
      },
    ];
    el._renderForecast();

    expect(el.shadowRoot.querySelector('.forecast-aux')).toBeNull();
    el.remove();
  });
});

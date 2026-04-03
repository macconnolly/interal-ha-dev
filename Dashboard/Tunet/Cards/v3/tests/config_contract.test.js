/**
 * Config Contract Tests
 *
 * Guards for CD1 (Configuration Clarity And Editor Policy).
 * Tests that getStubConfig() output can be passed to setConfig()
 * without throwing, for every card class.
 *
 * This is the most basic contract test: "can a newly-added card
 * render without manual YAML?" If getStubConfig() produces something
 * setConfig() rejects, the card is broken in the HA editor flow.
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Polyfill window.matchMedia for jsdom (nav card uses it for desktop breakpoint)
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Import card files — each self-registers via registerCard()
// jsdom provides customElements, document, window
import '../tunet_actions_card.js';
import '../tunet_scenes_card.js';
import '../tunet_light_tile.js';
import '../tunet_lighting_card.js';
import '../tunet_rooms_card.js';
import '../tunet_climate_card.js';
import '../tunet_sensor_card.js';
import '../tunet_weather_card.js';
import '../tunet_media_card.js';
import '../tunet_sonos_card.js';
import '../tunet_speaker_grid_card.js';
import '../tunet_nav_card.js';
import '../tunet_status_card.js';

const CARDS = [
  { tag: 'tunet-actions-card', tier: 'yaml-first' },
  { tag: 'tunet-scenes-card', tier: 'editor-complete' },
  { tag: 'tunet-light-tile', tier: 'editor-complete' },
  { tag: 'tunet-lighting-card', tier: 'editor-lite' },
  { tag: 'tunet-rooms-card', tier: 'editor-lite' },
  { tag: 'tunet-climate-card', tier: 'editor-lite' },
  { tag: 'tunet-sensor-card', tier: 'editor-complete' },
  { tag: 'tunet-weather-card', tier: 'editor-complete' },
  { tag: 'tunet-media-card', tier: 'editor-lite' },
  { tag: 'tunet-sonos-card', tier: 'editor-lite' },
  { tag: 'tunet-speaker-grid-card', tier: 'editor-lite' },
  { tag: 'tunet-nav-card', tier: 'editor-complete' },
  { tag: 'tunet-status-card', tier: 'yaml-first' },
];

// Known CD1 findings: these stubs produce configs that setConfig() rejects.
// Each entry documents WHY the stub fails. CD1 must fix these and remove
// the entry from this list — at which point the test enforces non-regression.
// Known stub failures: these stubs produce configs that setConfig() still rejects.
// Cards removed from this list have been fixed to handle missing config gracefully.
// Remaining entries are intentionally deferred — complex cards where editor parity
// is not the current priority.
const KNOWN_STUB_FAILURES = {
  // Status: polymorphic tile types (5 subtypes) — editor parity deferred
  // Sensor: requires sensors array with entity IDs — stub has real IDs but may not match target HA instance
};

describe('config contract — stub → setConfig roundtrip', () => {
  for (const { tag, tier } of CARDS) {
    const knownFailure = KNOWN_STUB_FAILURES[tag];

    if (knownFailure) {
      it.fails(`${tag} (${tier}): getStubConfig() passes setConfig() [KNOWN CD1 ISSUE: ${knownFailure}]`, () => {
        const CardClass = customElements.get(tag);
        const stub = CardClass.getStubConfig();
        const el = document.createElement(tag);
        expect(() => el.setConfig(stub)).not.toThrow();
      });
    } else {
      it(`${tag} (${tier}): getStubConfig() passes setConfig() without throwing`, () => {
        const CardClass = customElements.get(tag);
        expect(CardClass, `${tag} should be registered`).toBeDefined();

        expect(typeof CardClass.getStubConfig).toBe('function');
        const stub = CardClass.getStubConfig();
        expect(stub, `${tag}.getStubConfig() should return an object`).toBeTruthy();
        expect(typeof stub).toBe('object');

        const el = document.createElement(tag);
        expect(typeof el.setConfig).toBe('function');
        expect(() => el.setConfig(stub)).not.toThrow();
      });
    }
  }
});

describe('config contract — has editor (getConfigForm or getConfigElement)', () => {
  for (const { tag } of CARDS) {
    it(`${tag}: has static getConfigForm() or getConfigElement()`, () => {
      const CardClass = customElements.get(tag);
      const hasForm = typeof CardClass.getConfigForm === 'function';
      const hasElement = typeof CardClass.getConfigElement === 'function';
      expect(hasForm || hasElement, `${tag} should have getConfigForm or getConfigElement`).toBe(true);
      if (hasForm) {
        const form = CardClass.getConfigForm();
        expect(form).toBeTruthy();
        expect(form.schema).toBeDefined();
        expect(Array.isArray(form.schema)).toBe(true);
      }
    });
  }
});

describe('config contract — getGridOptions returns valid Sections hints', () => {
  for (const { tag } of CARDS) {
    it(`${tag}: getGridOptions() returns valid object`, () => {
      const CardClass = customElements.get(tag);
      const el = document.createElement(tag);

      // Some cards need setConfig before getGridOptions works
      try {
        const stub = CardClass.getStubConfig();
        el.setConfig(stub);
      } catch { /* some cards may throw without hass — acceptable */ }

      if (typeof el.getGridOptions === 'function') {
        const grid = el.getGridOptions();
        expect(grid).toBeTruthy();
        expect(typeof grid).toBe('object');

        // rows should be 'auto' or a number — never undefined
        if ('rows' in grid) {
          expect(grid.rows === 'auto' || typeof grid.rows === 'number',
            `${tag}: rows should be 'auto' or number, got ${grid.rows}`
          ).toBe(true);
        }
      }
    });
  }
});

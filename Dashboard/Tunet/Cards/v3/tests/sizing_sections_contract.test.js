/**
 * Sizing Sections Contract Tests — CD4
 *
 * Cross-card Sections intent assertions. Does NOT duplicate:
 *   - config_contract.test.js (getGridOptions shape validation)
 *   - sizing_contract.test.js (autoSizeFromWidth/bucketFromWidth boundaries)
 *   - profile_resolver.test.js (selectProfileSize/resolveSizeProfile/_setProfileVars)
 *
 * This suite tests the BINDING RULES that connect those existing suites
 * to the Sections grid contract:
 *   - Every card uses rows: 'auto' (no fixed rows)
 *   - Only nav uses columns: 'full'
 *   - Scenes allow_wrap default is Sections-safe
 *   - Profile tile_size override wins over auto-sizing
 *   - Lighting grid-auto-rows is profile-controlled, not hardcoded
 */

import { describe, it, expect } from 'vitest';
import {
  CARD_REGISTRY,
  CD2_CARDS,
} from './helpers/css_contract_helpers.js';

// Polyfill matchMedia for jsdom
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Import all cards
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

import {
  autoSizeFromWidth,
  selectProfileSize,
} from '../tunet_base.js';

// ─── Helpers ──────────────────────────────────────────────────────────

function createConfiguredCard(tag) {
  const CardClass = customElements.get(tag);
  const el = document.createElement(tag);
  try {
    const stub = CardClass.getStubConfig();
    el.setConfig(stub);
  } catch { /* some cards throw without hass */ }
  return el;
}

// ═══════════════════════════════════════════════════════════════════════
// Sections contract: rows: 'auto' for every card
// ═══════════════════════════════════════════════════════════════════════

describe('Sections contract: every card uses rows auto', () => {
  for (const card of CARD_REGISTRY) {
    it(`${card.tag} getGridOptions().rows === 'auto'`, () => {
      const el = createConfiguredCard(card.tag);
      if (typeof el.getGridOptions !== 'function') return;
      const grid = el.getGridOptions();
      expect(grid.rows, `${card.tag} must use rows: 'auto' for Sections`).toBe('auto');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Sections contract: columns: 'full' only on nav
// ═══════════════════════════════════════════════════════════════════════

describe('Sections contract: columns full only on nav', () => {
  for (const card of CARD_REGISTRY) {
    it(`${card.tag} columns contract`, () => {
      const el = createConfiguredCard(card.tag);
      if (typeof el.getGridOptions !== 'function') return;
      const grid = el.getGridOptions();
      if (card.tag === 'tunet-nav-card') {
        expect(grid.columns).toBe('full');
      } else {
        expect(
          typeof grid.columns === 'number',
          `${card.tag}: columns should be numeric, not '${grid.columns}' (only nav uses 'full')`
        ).toBe(true);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Sections contract: min_columns <= columns (when both numeric)
// ═══════════════════════════════════════════════════════════════════════

describe('Sections contract: min_columns <= columns', () => {
  for (const card of CARD_REGISTRY) {
    it(`${card.tag} min_columns <= columns`, () => {
      const el = createConfiguredCard(card.tag);
      if (typeof el.getGridOptions !== 'function') return;
      const grid = el.getGridOptions();
      if (typeof grid.columns === 'number' && typeof grid.min_columns === 'number') {
        expect(
          grid.min_columns <= grid.columns,
          `${card.tag}: min_columns (${grid.min_columns}) > columns (${grid.columns})`
        ).toBe(true);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: allow_wrap default is Sections-safe
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: allow_wrap Sections contract', () => {
  it('getStubConfig returns allow_wrap: true (Sections-safe default)', () => {
    const ScenesClass = customElements.get('tunet-scenes-card');
    const stub = ScenesClass.getStubConfig();
    expect(stub.allow_wrap, 'Scenes stub config should default to allow_wrap: true for Sections safety').toBe(true);
  });

  it('allow_wrap: true + header + 5 scenes: min_rows=3, min_columns=6', () => {
    const el = document.createElement('tunet-scenes-card');
    el.setConfig({
      scenes: [
        { entity: 'scene.a', name: 'A' },
        { entity: 'scene.b', name: 'B' },
        { entity: 'scene.c', name: 'C' },
        { entity: 'scene.d', name: 'D' },
        { entity: 'scene.e', name: 'E' },
      ],
      allow_wrap: true,
      show_header: true,
    });
    const grid = el.getGridOptions();
    expect(grid.rows).toBe('auto');
    expect(grid.min_rows).toBe(3);
    expect(grid.min_columns).toBe(6);
  });

  it('allow_wrap: false (strip mode): min_columns=9', () => {
    const el = document.createElement('tunet-scenes-card');
    el.setConfig({
      scenes: [
        { entity: 'scene.a', name: 'A' },
        { entity: 'scene.b', name: 'B' },
      ],
      allow_wrap: false,
    });
    const grid = el.getGridOptions();
    expect(grid.rows).toBe('auto');
    expect(grid.min_columns).toBe(9);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Actions: Sections sizing contract (CD5)
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: Sections sizing contract (CD5)', () => {
  it('compact default: min_rows=1, min_columns=6', () => {
    const el = document.createElement('tunet-actions-card');
    el.setConfig({ variant: 'default', compact: true, actions: [{ name: 'A', service: 'light.turn_on', entity_id: 'light.a' }] });
    const grid = el.getGridOptions();
    expect(grid.min_rows).toBe(1);
    expect(grid.min_columns).toBe(6);
  });

  it('compact mode_strip: min_rows=2, min_columns=9', () => {
    const el = document.createElement('tunet-actions-card');
    el.setConfig({ variant: 'mode_strip', compact: true });
    const grid = el.getGridOptions();
    expect(grid.min_rows).toBe(2);
    expect(grid.min_columns).toBe(9);
  });

  it('relaxed default: min_rows=2, min_columns=9', () => {
    const el = document.createElement('tunet-actions-card');
    el.setConfig({ variant: 'default', compact: false, actions: [{ name: 'A', service: 'light.turn_on', entity_id: 'light.a' }] });
    const grid = el.getGridOptions();
    expect(grid.min_rows).toBe(2);
    expect(grid.min_columns).toBe(9);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Profile cards: tile_size override wins over auto-sizing
// ═══════════════════════════════════════════════════════════════════════

describe('Profile system: tile_size override precedence', () => {
  const PROFILE_CARDS = [
    { tag: 'tunet-light-tile', preset: 'lighting' },
    { tag: 'tunet-lighting-card', preset: 'lighting' },
    { tag: 'tunet-rooms-card', preset: 'rooms' },
    { tag: 'tunet-sensor-card', preset: 'environment' },
    { tag: 'tunet-speaker-grid-card', preset: 'speakers' },
  ];

  it('explicit tile_size overrides width-based auto-sizing', () => {
    // At 800px, autoSizeFromWidth returns 'standard'
    expect(autoSizeFromWidth(800)).toBe('standard');

    // But with explicit userSize='compact', selectProfileSize should return compact
    const result = selectProfileSize({
      preset: 'lighting',
      layout: 'grid',
      widthHint: 800,
      userSize: 'compact',
    });
    expect(result.size).toBe('compact');
  });

  it('null tile_size falls back to auto-sizing', () => {
    const result = selectProfileSize({
      preset: 'lighting',
      layout: 'grid',
      widthHint: 800,
      userSize: null,
    });
    expect(result.size).toBe('standard');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Lighting: max_rows constraint present
// ═══════════════════════════════════════════════════════════════════════

describe('Lighting: grid mode has max_rows constraint', () => {
  it('getGridOptions returns max_rows for grid mode', () => {
    const el = document.createElement('tunet-lighting-card');
    try {
      const CardClass = customElements.get('tunet-lighting-card');
      el.setConfig(CardClass.getStubConfig());
    } catch {}
    const grid = el.getGridOptions();
    expect(grid.max_rows).toBeDefined();
    expect(typeof grid.max_rows).toBe('number');
    expect(grid.max_rows).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Regression gate: no card returns fixed numeric rows
// ═══════════════════════════════════════════════════════════════════════

describe('Regression gate: no fixed numeric rows', () => {
  for (const card of CARD_REGISTRY) {
    it(`${card.tag} does not return a fixed numeric rows value`, () => {
      const el = createConfiguredCard(card.tag);
      if (typeof el.getGridOptions !== 'function') return;
      const grid = el.getGridOptions();
      expect(
        grid.rows,
        `${card.tag}: rows must be 'auto', got ${grid.rows} — fixed rows violate Sections contract`
      ).toBe('auto');
    });
  }
});

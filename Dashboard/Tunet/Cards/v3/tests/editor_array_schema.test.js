/**
 * Editor Array Schema Tests
 *
 * Guards for getConfigForm() schema validity across all 13 Tunet cards.
 * Verifies that schemas won't crash HA's form renderer, that
 * object+fields+multiple patterns are correct, and that stub configs
 * pass through setConfig cleanly.
 *
 * Key bug verified here: HA's _computeLabelCallback calls .split() on the
 * return value of computeLabel/computeHelper. If these return undefined
 * (e.g., for expandable/grid schema items with no `name` property),
 * HA crashes with "Cannot read properties of undefined (reading 'split')".
 *
 * See DIAGNOSIS section at the bottom of this file for the full analysis
 * and proposed fix.
 */

import { describe, it, expect } from 'vitest';

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

// Import all 13 card files — each self-registers via registerCard()
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

// ═══════════════════════════════════════════════════════════
// Card registry
// ═══════════════════════════════════════════════════════════

const ALL_CARDS = [
  'tunet-actions-card',
  'tunet-scenes-card',
  'tunet-light-tile',
  'tunet-lighting-card',
  'tunet-rooms-card',
  'tunet-climate-card',
  'tunet-sensor-card',
  'tunet-weather-card',
  'tunet-media-card',
  'tunet-sonos-card',
  'tunet-speaker-grid-card',
  'tunet-nav-card',
  'tunet-status-card',
];

// Structural types that don't require a `name` property.
// HA treats these as layout wrappers, not form fields.
const STRUCTURAL_TYPES = new Set(['expandable', 'grid']);

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

/** Recursively walk a schema tree, yielding every item including nested ones. */
function* walkSchema(schema) {
  for (const entry of schema || []) {
    yield entry;
    if (Array.isArray(entry?.schema)) {
      yield* walkSchema(entry.schema);
    }
  }
}

/** Get form data for a card tag. Returns { schema, computeLabel, computeHelper } or null. */
function getForm(tag) {
  const CardClass = customElements.get(tag);
  if (!CardClass || typeof CardClass.getConfigForm !== 'function') return null;
  return CardClass.getConfigForm();
}

/** Check if a schema item is a structural type (expandable, grid) that doesn't need a name. */
function isStructural(item) {
  return item.type && STRUCTURAL_TYPES.has(item.type);
}

// ═══════════════════════════════════════════════════════════
// 1. Schema Structure Validation
// ═══════════════════════════════════════════════════════════

// Cards that use getConfigElement() instead of getConfigForm()
const CUSTOM_EDITOR_CARDS = new Set(['tunet-lighting-card']);

describe('schema structure — every card with getConfigForm()', () => {
  for (const tag of ALL_CARDS) {
    if (CUSTOM_EDITOR_CARDS.has(tag)) continue; // tested separately
    describe(tag, () => {
      it('schema is an array', () => {
        const form = getForm(tag);
        expect(form, `${tag} should have getConfigForm()`).toBeTruthy();
        expect(Array.isArray(form.schema), `${tag} schema should be an array`).toBe(true);
        expect(form.schema.length, `${tag} schema should not be empty`).toBeGreaterThan(0);
      });

      it('every schema item has a name (string) or is a structural type', () => {
        const form = getForm(tag);
        for (const item of walkSchema(form.schema)) {
          if (isStructural(item)) {
            // Structural types (expandable, grid) don't need a name,
            // but if they have one it should be a string
            if ('name' in item) {
              expect(typeof item.name).toBe('string');
            }
          } else {
            expect(
              typeof item.name,
              `${tag}: non-structural schema item must have a string name, got ${JSON.stringify(item)}`
            ).toBe('string');
          }
        }
      });

      it('every schema item with a selector has a valid selector object', () => {
        const form = getForm(tag);
        for (const item of walkSchema(form.schema)) {
          if ('selector' in item) {
            expect(
              typeof item.selector,
              `${tag}.${item.name}: selector should be an object`
            ).toBe('object');
            expect(item.selector, `${tag}.${item.name}: selector should not be null`).not.toBeNull();
            const selectorKeys = Object.keys(item.selector);
            expect(
              selectorKeys.length,
              `${tag}.${item.name}: selector should have exactly one key (the type), got ${selectorKeys}`
            ).toBe(1);
          }
        }
      });

      it('computeLabel returns a string for every schema item (not undefined)', () => {
        const form = getForm(tag);
        expect(typeof form.computeLabel, `${tag} should have computeLabel`).toBe('function');
        for (const item of walkSchema(form.schema)) {
          const label = form.computeLabel(item);
          expect(
            typeof label,
            `${tag}: computeLabel returned ${typeof label} (${label}) for item ${JSON.stringify({ name: item.name, type: item.type })}. ` +
            `HA calls .split() on this value — undefined will crash the form renderer.`
          ).toBe('string');
        }
      });

      it('computeHelper (if present) returns a string for every schema item (not undefined)', () => {
        const form = getForm(tag);
        if (typeof form.computeHelper !== 'function') return; // no computeHelper is fine
        for (const item of walkSchema(form.schema)) {
          const helper = form.computeHelper(item);
          expect(
            typeof helper,
            `${tag}: computeHelper returned ${typeof helper} (${helper}) for item ${JSON.stringify({ name: item.name, type: item.type })}. ` +
            `HA calls .split() on this value — undefined will crash the form renderer.`
          ).toBe('string');
        }
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════
// 2. object+fields+multiple Contract
// ═══════════════════════════════════════════════════════════

/** Assert that a schema field uses the object+fields+multiple pattern correctly. */
function assertObjectArrayEditor(tag, fieldName, expectedFields) {
  const form = getForm(tag);
  let entry = null;
  for (const item of walkSchema(form.schema)) {
    if (item.name === fieldName) { entry = item; break; }
  }
  expect(entry, `${tag}.${fieldName} should exist in schema`).toBeTruthy();

  const obj = entry?.selector?.object;
  expect(obj, `${tag}.${fieldName} should use object selector`).toBeTruthy();
  expect(obj.multiple, `${tag}.${fieldName} should have multiple: true`).toBe(true);
  expect(obj.fields, `${tag}.${fieldName} should define fields`).toBeTruthy();

  // Every expected field must exist
  for (const key of expectedFields) {
    expect(
      Object.prototype.hasOwnProperty.call(obj.fields, key),
      `${tag}.${fieldName} missing field "${key}"`
    ).toBe(true);
  }

  // Every field must have a label and selector
  for (const [key, field] of Object.entries(obj.fields)) {
    expect(
      typeof field.label,
      `${tag}.${fieldName}.fields.${key} must have a string label`
    ).toBe('string');
    expect(
      field.selector && typeof field.selector === 'object',
      `${tag}.${fieldName}.fields.${key} must have a selector object`
    ).toBe(true);
  }

  // label_field must reference an existing field
  if (obj.label_field) {
    expect(
      Object.prototype.hasOwnProperty.call(obj.fields, obj.label_field),
      `${tag}.${fieldName}: label_field "${obj.label_field}" must reference an existing field`
    ).toBe(true);
  }
}

describe('object+fields+multiple contract', () => {
  it('scenes card: scenes[]', () => {
    assertObjectArrayEditor('tunet-scenes-card', 'scenes', [
      'entity', 'name', 'icon', 'accent', 'state_entity', 'active_when', 'active_when_operator',
    ]);
  });

  it('actions card: actions[]', () => {
    assertObjectArrayEditor('tunet-actions-card', 'actions', [
      'name', 'icon', 'accent', 'service', 'entity_id', 'option',
      'state_entity', 'active_when', 'active_when_operator',
      'show_when_entity', 'show_when_attribute', 'show_when_operator', 'show_when_state',
    ]);
  });

  // lighting card uses getConfigElement() custom editor — schema lives in the editor class,
  // not in getConfigForm(). Zones and column_breakpoints are validated by the custom editor's
  // internal ha-form schema (LIGHTING_EDITOR_SCHEMA), not by this test suite.
  it('lighting card: uses getConfigElement() (custom editor)', () => {
    const CardClass = customElements.get('tunet-lighting-card');
    expect(typeof CardClass.getConfigElement).toBe('function');
  });

  it('rooms card: rooms[]', () => {
    assertObjectArrayEditor('tunet-rooms-card', 'rooms', [
      'name', 'icon', 'navigate_path', 'temperature_entity', 'humidity_entity', 'light_entities',
    ]);
  });

  it('sensor card: sensors[]', () => {
    assertObjectArrayEditor('tunet-sensor-card', 'sensors', [
      'entity', 'label', 'icon', 'accent', 'unit', 'precision',
    ]);
  });

  it('media card: speakers[]', () => {
    assertObjectArrayEditor('tunet-media-card', 'speakers', ['entity', 'name', 'icon']);
  });

  it('sonos card: speakers[]', () => {
    assertObjectArrayEditor('tunet-sonos-card', 'speakers', ['entity', 'name', 'icon']);
  });

  it('speaker-grid card: speakers[]', () => {
    assertObjectArrayEditor('tunet-speaker-grid-card', 'speakers', ['entity', 'name', 'icon']);
  });
});

// ═══════════════════════════════════════════════════════════
// 3. Stub → setConfig Roundtrip (no _needsConfig)
// ═══════════════════════════════════════════════════════════

describe('stub config roundtrip — getStubConfig() passes setConfig() and is usable', () => {
  for (const tag of ALL_CARDS) {
    it(`${tag}: stub passes setConfig() without throwing`, () => {
      const CardClass = customElements.get(tag);
      expect(CardClass, `${tag} should be registered`).toBeDefined();
      expect(typeof CardClass.getStubConfig, `${tag} must have getStubConfig()`).toBe('function');

      const stub = CardClass.getStubConfig();
      expect(stub, 'stub should be an object').toBeTruthy();
      expect(typeof stub).toBe('object');

      const el = document.createElement(tag);
      expect(() => el.setConfig(stub)).not.toThrow();
    });

    it(`${tag}: stub provides enough config (no _needsConfig unless entity is empty)`, () => {
      const CardClass = customElements.get(tag);
      const stub = CardClass.getStubConfig();
      const el = document.createElement(tag);
      el.setConfig(stub);

      // Cards that require an entity will set _needsConfig: true when entity is ''
      // This is acceptable design — the editor shows a placeholder prompting entity selection.
      // But cards that don't require an entity should NOT have _needsConfig.
      if (stub.entity === '' || stub.entity === undefined) {
        // Entity-requiring cards: _needsConfig is acceptable here
        // The test verifies the stub at least doesn't throw
      } else {
        // Cards with a concrete stub entity: _needsConfig should be false/absent
        expect(
          el._config._needsConfig,
          `${tag}: stub provides entity="${stub.entity}" but _config._needsConfig is true — ` +
          `stub should be sufficient for rendering`
        ).toBeFalsy();
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════
// DIAGNOSIS: Empty Config Tab Bug
// ═══════════════════════════════════════════════════════════
//
// AFFECTED CARDS: lighting, media, sonos, speaker-grid, status
// SYMPTOM: Config tab is empty in HA editor (no fields rendered)
// ROOT CAUSE: HA's form renderer crashes when computeLabel returns
//             undefined for structural schema items (expandable/grid).
//
// MECHANISM:
// HA's ha-form element calls _computeLabelCallback for every schema
// item, which calls the card's computeLabel(schemaItem). The return
// value is passed to .split() for i18n key resolution. When .split()
// receives undefined, it throws:
//
//   TypeError: Cannot read properties of undefined (reading 'split')
//
// This crashes the entire form renderer, producing an empty Config tab.
//
// WHERE THE UNDEFINED COMES FROM:
// Cards with `type: 'expandable'` schema items that have NO `name`
// property. The computeLabel pattern used by all affected cards is:
//
//   computeLabel: (s) => ({
//     entities: 'Light Entities',
//     name: 'Card Title',
//     ...
//   }[s.name] || s.name)
//
// When s.name is undefined (expandable items have no name):
//   1. {lookup}[undefined] → undefined
//   2. undefined || undefined → undefined  (the || s.name fallback is also undefined)
//   3. HA calls undefined.split() → CRASH
//
// NOTE: computeHelper is NOT affected. All 5 broken cards use the pattern:
//   computeHelper: (s) => ({...}[s.name] || '')
// The `|| ''` fallback produces an empty string (not undefined), so it's safe.
// The crash is exclusively in computeLabel, which uses `|| s.name` as fallback.
//
// WHY SOME CARDS WORK:
// - scenes, actions, nav, weather, light_tile, sensor, rooms:
//     No expandable or grid items at all — every schema item has a name.
// - climate: grid item has `name: ''` (empty string, which is a string)
//     {lookup}[''] → undefined, || '' → '' (still a string, no crash)
// - speaker-grid: grid has `name: ''` (safe), but expandable has no name (crash)
//
// WHICH CARDS ARE BROKEN (5 total):
// - tunet_lighting_card.js     (line ~862): expandable, no name
// - tunet_media_card.js        (line ~513): expandable, no name
// - tunet_sonos_card.js        (line ~600): expandable, no name
// - tunet_speaker_grid_card.js (line ~547): expandable, no name
// - tunet_status_card.js       (line ~765): expandable, no name
//
// PROPOSED FIX (two options, pick one):
//
// Option A (minimal, recommended): Guard computeLabel to return a string
// for items with undefined name:
//
//   // BEFORE (crashes):
//   computeLabel: (s) => ({
//     entity: 'Media Player',
//     ...
//   }[s.name] || s.name),
//
//   // AFTER (safe):
//   computeLabel: (s) => {
//     if (!s.name) return s.title || '';
//     return { entity: 'Media Player', ... }[s.name] || s.name;
//   },
//
// Option B (also valid): Add `name: ''` to every expandable item,
// matching what the climate card already does for its grid:
//
//   { name: '', type: 'expandable', title: 'Advanced', ... }
//
// Option A is preferred because:
// - It's defensive (handles any future structural types without schema changes)
// - It uses the expandable's own `title` property as the label (more descriptive)
// - Only 5 computeLabel functions need the one-line guard
// - The fix is in one place per card, not scattered across schema items
//
// AFFECTED FILES (computeLabel line numbers for the fix):
// - Dashboard/Tunet/Cards/v3/tunet_lighting_card.js      line ~871
// - Dashboard/Tunet/Cards/v3/tunet_media_card.js         line ~523
// - Dashboard/Tunet/Cards/v3/tunet_sonos_card.js         line ~610
// - Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js  line ~557
// - Dashboard/Tunet/Cards/v3/tunet_status_card.js        line ~773

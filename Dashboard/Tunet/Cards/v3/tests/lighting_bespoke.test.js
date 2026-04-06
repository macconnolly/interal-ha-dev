/**
 * CD6 Lighting Bespoke Tests
 *
 * Covers the lighting-family follow-on work without duplicating shared
 * config/keyboard/Sections contract suites.
 */

import { describe, it, expect, vi } from 'vitest';
import { SIZE_PROFILES } from '../tunet_base.js';
import {
  readCardSource,
  extractCSSBlocks,
} from './helpers/css_contract_helpers.js';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

import '../tunet_light_tile.js';
import '../tunet_lighting_card.js';

function readCardCSS(filename) {
  return extractCSSBlocks(readCardSource(filename)).join('\n');
}

function makeLightingHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    callService: vi.fn(() => Promise.resolve()),
    states: {
      'light.living_room_lights': {
        entity_id: 'light.living_room_lights',
        state: 'on',
        attributes: {
          brightness: 204,
          friendly_name: 'Living Room Lights',
        },
      },
      'light.kitchen_island_lights': {
        entity_id: 'light.kitchen_island_lights',
        state: 'off',
        attributes: {
          brightness: 0,
          friendly_name: 'Kitchen Island Lights',
        },
      },
      'sensor.oal_system_status': {
        entity_id: 'sensor.oal_system_status',
        state: 'Adaptive',
        attributes: {
          friendly_name: 'OAL System Status',
        },
      },
      ...overrides,
    },
  };
}

function createLightTile(config = {}) {
  const el = document.createElement('tunet-light-tile');
  el.setConfig({
    entity: 'light.living_room_lights',
    variant: 'horizontal',
    tile_size: 'standard',
    use_profiles: true,
    ...config,
  });
  return el;
}

function createLightingCard(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-lighting-card');
  el.setConfig({
    entities: ['light.living_room_lights', 'light.kitchen_island_lights'],
    name: 'Lighting',
    tile_size: 'standard',
    layout: 'grid',
    use_profiles: true,
    primary_entity: 'sensor.oal_system_status',
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeLightingHass(hassOverrides);
  return el;
}

describe('Light tile: narrow horizontal readability contract', () => {
  it('sets narrow-horizontal at phone width for horizontal variant', () => {
    const el = createLightTile();
    el._applyProfile(390);
    expect(el.hasAttribute('narrow-horizontal')).toBe(true);
  });

  it('clears narrow-horizontal at desktop width for horizontal variant', () => {
    const el = createLightTile();
    el._applyProfile(800);
    expect(el.hasAttribute('narrow-horizontal')).toBe(false);
  });

  it('does not set narrow-horizontal for vertical variant', () => {
    const el = createLightTile({ variant: 'vertical' });
    el._applyProfile(390);
    expect(el.hasAttribute('narrow-horizontal')).toBe(false);
  });

  it('adds a two-line clamp CSS rule for narrow horizontal names', () => {
    const css = readCardCSS('tunet_light_tile.js');
    const match = css.match(/:host\(\[narrow-horizontal\]\)\s+\.lt\.horizontal\s+\.name\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/-webkit-line-clamp\s*:\s*2/);
    expect(match[1]).toMatch(/white-space\s*:\s*normal/);
  });

  it('shrinks the narrow horizontal value lane instead of forcing a large fixed width', () => {
    const css = readCardCSS('tunet_light_tile.js');
    const match = css.match(/:host\(\[narrow-horizontal\]\)\s+\.lt\.horizontal\s+\.val\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/min-width\s*:\s*3ch/);
  });
});

describe('Lighting card: synthesized responsive column defaults', () => {
  it('maps lighting consumers to the dedicated lighting-tile profile family', () => {
    const tile = createLightTile({ variant: 'vertical' });
    tile._applyProfile(800);
    expect(tile.getAttribute('profile-family')).toBe('lighting-tile');

    const card = createLightingCard({ layout: 'grid' });
    card._applyProfile(800);
    expect(card.getAttribute('profile-family')).toBe('lighting-tile');
    document.body.removeChild(card);
  });

  it('defaults standard tiles to 2 columns at phone width and 3 above', () => {
    const el = document.createElement('tunet-lighting-card');
    el.setConfig({
      entities: ['light.living_room_lights'],
      tile_size: 'standard',
    });
    expect(el._resolveResponsiveColumns(390)).toBe(2);
    expect(el._resolveResponsiveColumns(900)).toBe(3);
  });

  it('defaults large tiles to 1 column at phone width and 2 above', () => {
    const el = document.createElement('tunet-lighting-card');
    el.setConfig({
      entities: ['light.living_room_lights'],
      tile_size: 'large',
    });
    expect(el._resolveResponsiveColumns(390)).toBe(1);
    expect(el._resolveResponsiveColumns(900)).toBe(2);
  });

  it('preserves explicit column_breakpoints over synthesized defaults', () => {
    const el = document.createElement('tunet-lighting-card');
    el.setConfig({
      entities: ['light.living_room_lights'],
      tile_size: 'standard',
      column_breakpoints: [
        { max_width: 500, columns: 1 },
        { columns: 4 },
      ],
    });
    expect(el._resolveResponsiveColumns(390)).toBe(1);
    expect(el._resolveResponsiveColumns(900)).toBe(4);
  });
});

describe('Lighting card: grid width-fill CSS contract', () => {
  it('uses 1fr tracks instead of a 180px tile cap', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/grid-template-columns\s*:\s*repeat\(var\(--cols,\s*3\),\s*minmax\(0,\s*1fr\)\)/);
    expect(match[1]).not.toMatch(/180px/);
  });

  it('does not center the base light grid with justify-content', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).not.toMatch(/justify-content\s*:/);
  });

  it('keeps overflow-y visible on the grid for drag pill headroom', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/overflow-y\s*:\s*visible/);
  });

  it('uses intrinsic auto rows instead of the old fixed row cap', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/grid-auto-rows\s*:\s*auto/);
    expect(match[1]).not.toMatch(/--grid-row/);
  });

  it('caps and centers desktop non-scroll grids instead of stretching them edge to edge', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?:host\(:not\(\[layout="scroll"\]\)\)\s+\.light-grid\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/column-gap\s*:\s*var\(--_tunet-grid-col-gap-desktop/);
    expect(match[1]).toMatch(/row-gap\s*:\s*var\(--_tunet-grid-row-gap-desktop/);
    expect(match[1]).toMatch(/max-width\s*:\s*min\(/);
    expect(match[1]).toMatch(/margin-inline\s*:\s*auto/);
  });
});

describe('Lighting family: scroll-parity geometry contract', () => {
  it('keeps atomic vertical tiles on the same scroll-like stack model', () => {
    const css = readCardCSS('tunet_light_tile.js');
    const vertical = css.match(/\.lt\.vertical\s*\{([^}]*)\}/s);
    expect(vertical).not.toBeNull();
    expect(vertical[1]).toMatch(/justify-content\s*:\s*center/);
    expect(vertical[1]).toMatch(/--bar-inset\s*:\s*var\(--_tunet-lighting-progress-inset/);
    expect(vertical[1]).not.toMatch(/aspect-ratio\s*:/);
    expect(css).not.toMatch(/\.lt\.vertical\s+\.progress-track\s*\{[^}]*position\s*:\s*relative/s);
  });

  it('keeps lighting-card tiles on the same bottom-anchored progress model as scroll', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const tile = css.match(/\.l-tile\s*\{([^}]*)\}/s);
    const track = css.match(/\n\s*\.progress-track\s*\{([^}]*)\}/s);
    expect(tile).not.toBeNull();
    expect(tile[1]).toMatch(/justify-content\s*:\s*center/);
    expect(tile[1]).not.toMatch(/aspect-ratio\s*:/);
    expect(track).not.toBeNull();
    expect(track[1]).toMatch(/position\s*:\s*absolute/);
    expect(track[1]).toMatch(/bottom\s*:\s*var\(--_tunet-lighting-progress-bottom/);
  });

  it('keeps scroll as its own transport layout with height-filled tiles', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/:host\(\[layout="scroll"\]\)\s+\.l-tile\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/height\s*:\s*100%/);
  });

  it('uses the shared lighting lane tokens in both lighting consumers', () => {
    const tileCss = readCardCSS('tunet_light_tile.js');
    const cardCss = readCardCSS('tunet_lighting_card.js');
    expect(tileCss).toMatch(/var\(--_tunet-lighting-pad-top/);
    expect(tileCss).toMatch(/var\(--_tunet-lighting-pad-x/);
    expect(tileCss).toMatch(/var\(--_tunet-lighting-progress-inset/);
    expect(tileCss).toMatch(/var\(--_tunet-lighting-pad-bottom/);
    expect(tileCss).toMatch(/var\(--_tunet-lighting-value-gap/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-pad-top/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-pad-x/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-progress-inset/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-pad-bottom/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-name-gap/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-value-gap/);
    expect(cardCss).toMatch(/var\(--_tunet-lighting-progress-bottom/);
  });
});

describe('Lighting card: auto-derived display name compaction', () => {
  it('shortens expanded-group member labels using the group context', () => {
    const el = document.createElement('tunet-lighting-card');
    expect(el._compactDerivedName('Living Room Spot Lights', 'Living')).toBe('Spot');
    expect(el._compactDerivedName('Floor Lamp Living Room', 'Living')).toBe('Floor');
    expect(el._compactDerivedName('Kitchen Island Pendant Lights', 'Kitchen')).toBe('Island Pendant');
    expect(el._compactDerivedName('Master Bedroom Lights', 'Bedroom')).toBe('Master Bedroom');
  });

  it('preserves explicit zone names over any derived compaction', () => {
    const el = document.createElement('tunet-lighting-card');
    expect(el._zoneName({
      entity: 'light.living_room_spot_lights',
      name: 'Spots',
      contextName: 'Living',
    })).toBe('Spots');
  });
});

describe('Lighting card: scroll inset contract', () => {
  it('adds inline padding to the scroll grid', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/:host\(\[layout="scroll"\]\)\s+\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/padding-inline\s*:\s*0\.5em/);
  });

  it('adds matching inline scroll padding to the scroll grid', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/:host\(\[layout="scroll"\]\)\s+\.light-grid\s*\{([^}]*)\}/s);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/scroll-padding-inline\s*:\s*0\.5em/);
  });

  it('keeps non-zero mobile scroll padding instead of zeroing it out', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const match = css.match(/@media\s*\(max-width:\s*440px\)\s*\{[\s\S]*?:host\(\[layout="scroll"\]\)\s+\.light-grid\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/padding-inline\s*:\s*0\.375em/);
    expect(match[1]).toMatch(/scroll-padding-inline\s*:\s*0\.375em/);
    expect(match[1]).not.toMatch(/scroll-padding-left\s*:\s*0/);
  });
});

describe('Lighting card: info tile keyboard contract', () => {
  it('dispatches hass-more-info on Enter', () => {
    const el = createLightingCard();
    const infoTile = el.shadowRoot.getElementById('infoTile');
    const events = [];
    el.addEventListener('hass-more-info', (event) => events.push(event.detail));

    infoTile.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(events).toEqual([{ entityId: 'sensor.oal_system_status' }]);
    document.body.removeChild(el);
  });

  it('dispatches hass-more-info on Space', () => {
    const el = createLightingCard();
    const infoTile = el.shadowRoot.getElementById('infoTile');
    const events = [];
    el.addEventListener('hass-more-info', (event) => events.push(event.detail));

    infoTile.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(events).toEqual([{ entityId: 'sensor.oal_system_status' }]);
    document.body.removeChild(el);
  });

  it('retains role button and tabindex on the info tile', () => {
    const el = createLightingCard();
    const infoTile = el.shadowRoot.getElementById('infoTile');
    expect(infoTile.getAttribute('role')).toBe('button');
    expect(infoTile.getAttribute('tabindex')).toBe('0');
    document.body.removeChild(el);
  });
});

describe('Lighting card: parity regression guards', () => {
  it('no longer writes the old grid-row sizing variable during grid build', () => {
    const el = createLightingCard({ layout: 'grid' });
    el._applyProfile(1440);
    el._buildGrid();
    expect(el.$.lightGrid.style.getPropertyValue('--grid-row')).toBe('');
    document.body.removeChild(el);
  });

  it('uses a materially stronger large-tier profile than standard', () => {
    const standard = SIZE_PROFILES['lighting-tile'].standard;
    const large = SIZE_PROFILES['lighting-tile'].large;
    expect(parseFloat(large.displayIconBox)).toBeGreaterThanOrEqual(3.2);
    expect(parseFloat(large.displayNameFont)).toBeGreaterThanOrEqual(1.4);
    expect(parseFloat(large.displayValueFont)).toBeGreaterThanOrEqual(1.5);
    expect(parseFloat(large.displayNameFont)).toBeGreaterThan(parseFloat(standard.displayNameFont));
    expect(parseFloat(large.displayValueFont)).toBeGreaterThan(parseFloat(standard.displayValueFont));
  });

  it('keeps the progress inset wider than the content pad across lighting size tiers', () => {
    const { compact, standard, large } = SIZE_PROFILES['lighting-tile'];
    expect(parseFloat(compact.lightingProgressInset)).toBeGreaterThan(parseFloat(compact.lightingPadX));
    expect(parseFloat(standard.lightingProgressInset)).toBeGreaterThan(parseFloat(standard.lightingPadX));
    expect(parseFloat(large.lightingProgressInset)).toBeGreaterThan(parseFloat(large.lightingPadX));
  });

  it('scales non-profile large tile content beyond padding-only changes', () => {
    const css = readCardCSS('tunet_lighting_card.js');
    const tileMatch = css.match(/:host\(:not\(\[use-profiles\]\)\[tile-size="large"\]\)\s+\.l-tile\s*\{([^}]*)\}/s);
    const nameMatch = css.match(/:host\(:not\(\[use-profiles\]\)\[tile-size="large"\]\)\s+\.zone-name\s*\{([^}]*)\}/s);
    const valueMatch = css.match(/:host\(:not\(\[use-profiles\]\)\[tile-size="large"\]\)\s+\.zone-val\s*\{([^}]*)\}/s);
    expect(tileMatch).not.toBeNull();
    expect(tileMatch[1]).toMatch(/--tile-icon-size\s*:\s*3em/);
    expect(nameMatch).not.toBeNull();
    expect(nameMatch[1]).toMatch(/font-size\s*:\s*16px/);
    expect(valueMatch).not.toBeNull();
    expect(valueMatch[1]).toMatch(/font-size\s*:\s*17px/);
  });
});

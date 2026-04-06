/**
 * CD7 Rooms Bespoke Tests
 *
 * Covers the bespoke behavior changes in CD7 for tunet-rooms-card.
 * Does NOT duplicate:
 *   - config_contract.test.js (stub roundtrip, editor tier)
 *   - sizing_sections_contract.test.js (shared Sections rows contract)
 *   - interaction_keyboard_contract.test.js (shared role/tabindex checks)
 *
 * This suite tests:
 *   - phone row-density CSS without orb hiding
 *   - shared orb/power sizing contract
 *   - row control isolation (pointer + keyboard)
 *   - tile tap precedence (toggle default, tap_action override, hold navigates)
 *   - adaptive-lighting manual reset payload scoping
 */

import { describe, it, expect, vi } from 'vitest';
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

import '../tunet_rooms_card.js';

function readRoomsCSS() {
  return extractCSSBlocks(readCardSource('tunet_rooms_card.js')).join('\n');
}

function makeHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    callService: vi.fn(() => Promise.resolve()),
    states: {
      'light.living_couch': {
        entity_id: 'light.living_couch',
        state: 'on',
        attributes: { brightness: 204, friendly_name: 'Couch' },
      },
      'light.living_floor': {
        entity_id: 'light.living_floor',
        state: 'on',
        attributes: { brightness: 178, friendly_name: 'Floor' },
      },
      'light.living_spots': {
        entity_id: 'light.living_spots',
        state: 'off',
        attributes: { brightness: 0, friendly_name: 'Spots' },
      },
      'light.kitchen_island': {
        entity_id: 'light.kitchen_island',
        state: 'off',
        attributes: { brightness: 0, friendly_name: 'Island' },
      },
      'sensor.dining_room_temperature': {
        entity_id: 'sensor.dining_room_temperature',
        state: '70',
        attributes: { unit_of_measurement: '°F', friendly_name: 'Dining Temp' },
      },
      ...overrides,
    },
  };
}

function createRooms(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-rooms-card');
  el.setConfig({
    name: 'Rooms',
    layout_variant: 'row',
    tile_size: 'standard',
    use_profiles: true,
    rooms: [
      {
        name: 'Living Room',
        icon: 'weekend',
        navigate_path: '/rooms/living',
        temperature_entity: 'sensor.dining_room_temperature',
        lights: [
          { entity: 'light.living_couch', icon: 'table_lamp', name: 'Couch' },
          { entity: 'light.living_floor', icon: 'floor_lamp', name: 'Floor' },
          { entity: 'light.living_spots', icon: 'lightbulb', name: 'Spots' },
        ],
      },
    ],
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeHass(hassOverrides);
  return el;
}

function cleanup(el) {
  if (el?.parentNode) el.parentNode.removeChild(el);
}

describe('Rooms: phone row density CSS', () => {
  const css = readRoomsCSS();

  it('tightens row controls at phone width without introducing overflow-badge markup', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*440px\)[\s\S]*?\.room-grid\.row-mode\s+\.room-tile\s*\{[\s\S]*?--row-btn-size\s*:\s*2\.26em/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*440px\)[\s\S]*?\.room-grid\.row-mode\s+\.room-row-controls\s*\{[\s\S]*?gap\s*:\s*calc\(var\(--_tunet-row-gap,\s*0\.52em\)\s*\*\s*0\.72\)/s);
    expect(css).not.toContain('data-overflow-count');
    expect(css).not.toContain('nth-child(n+3)');
  });

  it('keeps orb and power controls on the same shared size variable', () => {
    expect(css).toMatch(/\.room-grid\.row-mode\s+\.room-tile\s*\{[\s\S]*?--row-btn-size:\s*var\(--_tunet-row-control-size,\s*var\(--rooms-row-btn-size,\s*3\.16em\)\);[\s\S]*?--row-btn-icon-size:\s*var\(--_tunet-row-control-icon,\s*var\(--rooms-row-btn-icon-size,\s*1\.62em\)\)/s);
    expect(css).toMatch(/\.room-grid\.row-mode\s+\.room-tile-icon\s*\{[\s\S]*?width:\s*var\(--row-btn-size\);[\s\S]*?height:\s*var\(--row-btn-size\)/s);
    expect(css).toMatch(/\.room-action-btn\s*\{[\s\S]*?width:\s*var\(--row-btn-size\);[\s\S]*?height:\s*var\(--row-btn-size\)/s);
    expect(css).toMatch(/\.room-orb\s*\{[\s\S]*?width:\s*var\(--row-btn-size\);[\s\S]*?height:\s*var\(--row-btn-size\)/s);
  });

  it('drops the word bri from the status output and slightly raises desktop row typography', () => {
    expect(css).not.toContain('% bri');
    expect(css).toMatch(/\.room-grid\.row-mode\s+\.room-tile-name\s*\{[\s\S]*?font-size:\s*var\(--_tunet-row-display-name-font,\s*var\(--type-row-title,\s*1\.09375em\)\)/s);
    expect(css).toMatch(/\.room-grid\.row-mode\s+\.room-tile-status\s*\{[\s\S]*?font-size:\s*var\(--_tunet-row-display-status-font,\s*var\(--type-row-status,\s*0\.96875em\)\)/s);
    expect(css).toMatch(/\.room-grid\.row-mode\.slim-mode\s+\.room-tile-name\s*\{[\s\S]*?font-size:\s*0\.84em/s);
    expect(css).toMatch(/\.room-grid\.row-mode\.slim-mode\s+\.room-tile-status\s*\{[\s\S]*?font-size:\s*0\.72em/s);
  });

  it('does not include the speculative desktop 6.5em row-height override', () => {
    expect(css).not.toContain('min-height: 6.5em');
  });

  it('suppresses parent pressed scaling only while a nested row control is active', () => {
    expect(css).toMatch(/\.room-grid\.row-mode\s+\.room-tile\.control-press-active:active\s*\{[^}]*transform:\s*none/s);
    expect(css).toMatch(/\.room-orb:active,\s*\.room-orb\.control-press-active\s*\{[^}]*transform:\s*scale\(var\(--press-scale-strong\)\)[^}]*box-shadow:\s*var\(--shadow-up\)/s);
    expect(css).toMatch(/\.room-action-btn:active,\s*\.room-action-btn\.control-press-active\s*\{[^}]*transform:\s*scale\(var\(--press-scale-strong\)\)[^}]*box-shadow:\s*var\(--shadow-up\)/s);
  });
});

describe('Rooms: row interaction isolation', () => {
  it('row body pointerup navigates to the room path', () => {
    const el = createRooms();
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    tile.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(pushState).toHaveBeenCalledOnce();
    expect(pushState.mock.calls[0][2]).toBe('/rooms/living');
    pushState.mockRestore();
    cleanup(el);
  });

  it('row body Enter navigates to the room path', () => {
    const el = createRooms();
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    tile.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(pushState).toHaveBeenCalledOnce();
    expect(pushState.mock.calls[0][2]).toBe('/rooms/living');
    pushState.mockRestore();
    cleanup(el);
  });

  it('row body Space navigates to the room path', () => {
    const el = createRooms();
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    tile.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(pushState).toHaveBeenCalledOnce();
    expect(pushState.mock.calls[0][2]).toBe('/rooms/living');
    pushState.mockRestore();
    cleanup(el);
  });

  it('orb pointerup does not bubble into row navigation', () => {
    const el = createRooms();
    const orb = el.shadowRoot.querySelector('.room-orb');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    orb.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
    cleanup(el);
  });

  it('orb click toggles only its light and does not navigate', () => {
    const el = createRooms();
    const orb = el.shadowRoot.querySelector('.room-orb');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    orb.click();
    expect(pushState).not.toHaveBeenCalled();
    expect(el._hass.callService).toHaveBeenCalledWith('light', 'turn_off', {
      entity_id: 'light.living_couch',
    });
    pushState.mockRestore();
    cleanup(el);
  });

  it('power click toggles the full room group and does not navigate', () => {
    const el = createRooms();
    const toggleBtn = el.shadowRoot.querySelector('.room-action-btn');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    toggleBtn.click();
    expect(pushState).not.toHaveBeenCalled();
    expect(el._hass.callService).toHaveBeenCalledWith('light', 'turn_off', {
      entity_id: ['light.living_couch', 'light.living_floor', 'light.living_spots'],
    });
    pushState.mockRestore();
    cleanup(el);
  });

  it('adds hover titles to row orb and power controls', () => {
    const el = createRooms();
    const orb = el.shadowRoot.querySelector('.room-orb');
    const toggleBtn = el.shadowRoot.querySelector('.room-action-btn');
    expect(orb?.getAttribute('title')).toBe('Couch');
    expect(toggleBtn?.getAttribute('title')).toBe('Turn off all Living Room');
    cleanup(el);
  });

  it('orb keydown does not trigger the row keyboard navigation path', () => {
    const el = createRooms();
    const orb = el.shadowRoot.querySelector('.room-orb');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    orb.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
    cleanup(el);
  });

  it('marks the row tile as control-press-active only while an orb is being pressed', () => {
    const el = createRooms();
    const tile = el.shadowRoot.querySelector('.room-tile');
    const orb = el.shadowRoot.querySelector('.room-orb');
    orb.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(tile.classList.contains('control-press-active')).toBe(true);
    expect(orb.classList.contains('control-press-active')).toBe(true);
    orb.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(tile.classList.contains('control-press-active')).toBe(false);
    expect(orb.classList.contains('control-press-active')).toBe(false);
    cleanup(el);
  });
});

describe('Rooms: tile tap precedence', () => {
  it('defaults tile short tap to room-light toggle (not navigation)', () => {
    const el = createRooms({ layout_variant: 'tiles' });
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    tile.dispatchEvent(new Event('pointerup', { bubbles: true }));
    // Tap toggles lights, does NOT navigate
    expect(pushState).not.toHaveBeenCalled();
    expect(el._hass.callService).toHaveBeenCalledWith('light', 'turn_off', {
      entity_id: ['light.living_couch', 'light.living_floor', 'light.living_spots'],
    });
    pushState.mockRestore();
    cleanup(el);
  });

  it('uses explicit tap_action override when configured', () => {
    const el = createRooms({
      layout_variant: 'tiles',
      rooms: [{
        name: 'Living Room',
        icon: 'weekend',
        tap_action: { action: 'more-info', entity: 'sensor.dining_room_temperature' },
        lights: [{ entity: 'light.living_couch', icon: 'table_lamp', name: 'Couch' }],
      }],
    });
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    const events = [];
    el.addEventListener('hass-more-info', (event) => events.push(event.detail));
    tile.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(pushState).not.toHaveBeenCalled();
    expect(events).toEqual([{ entityId: 'sensor.dining_room_temperature' }]);
    pushState.mockRestore();
    cleanup(el);
  });

  it('tap_action takes priority over toggle when both tap_action and lights exist', () => {
    const el = createRooms({
      layout_variant: 'tiles',
      rooms: [{
        name: 'Living Room',
        icon: 'weekend',
        navigate_path: '/rooms/living',
        tap_action: { action: 'more-info', entity: 'sensor.dining_room_temperature' },
        lights: [{ entity: 'light.living_couch', icon: 'table_lamp', name: 'Couch' }],
      }],
    });
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    const events = [];
    el.addEventListener('hass-more-info', (event) => events.push(event.detail));
    tile.dispatchEvent(new Event('pointerup', { bubbles: true }));
    // tap_action fires, not navigation or toggle
    expect(pushState).not.toHaveBeenCalled();
    expect(el._hass.callService).not.toHaveBeenCalled();
    expect(events).toEqual([{ entityId: 'sensor.dining_room_temperature' }]);
    pushState.mockRestore();
    cleanup(el);
  });

  it('toggles room lights when no tap_action exists (even with navigate_path)', () => {
    const el = createRooms({
      layout_variant: 'tiles',
      rooms: [{
        name: 'Living Room',
        icon: 'weekend',
        navigate_path: '/rooms/living',
        lights: [
          { entity: 'light.living_couch', icon: 'table_lamp', name: 'Couch' },
          { entity: 'light.living_floor', icon: 'floor_lamp', name: 'Floor' },
        ],
      }],
    });
    const tile = el.shadowRoot.querySelector('.room-tile');
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    tile.dispatchEvent(new Event('pointerup', { bubbles: true }));
    // Tap toggles, does NOT navigate
    expect(pushState).not.toHaveBeenCalled();
    expect(el._hass.callService).toHaveBeenCalledWith('light', 'turn_off', {
      entity_id: ['light.living_couch', 'light.living_floor'],
    });
    pushState.mockRestore();
    cleanup(el);
  });
});

describe('Rooms: adaptive-lighting reset', () => {
  it('scopes reset payloads to manual room lights only', () => {
    const el = createRooms({}, {
      'switch.adaptive_lighting_living': {
        entity_id: 'switch.adaptive_lighting_living',
        state: 'on',
        attributes: {
          lights: ['light.living_couch', 'light.living_floor', 'light.living_spots'],
          manual_control: ['light.living_floor', 'light.outside'],
        },
      },
      'switch.adaptive_lighting_other': {
        entity_id: 'switch.adaptive_lighting_other',
        state: 'on',
        attributes: {
          lights: ['light.kitchen_island'],
          manual_control: ['light.kitchen_island'],
        },
      },
    });
    el._resetManualControl();
    expect(el._hass.callService).toHaveBeenCalledTimes(1);
    expect(el._hass.callService).toHaveBeenCalledWith('adaptive_lighting', 'set_manual_control', {
      entity_id: 'switch.adaptive_lighting_living',
      manual_control: false,
      lights: ['light.living_floor'],
    });
    cleanup(el);
  });

  it('shows the reset button when a room light is under manual control', () => {
    const el = createRooms({}, {
      'switch.adaptive_lighting_living': {
        entity_id: 'switch.adaptive_lighting_living',
        state: 'on',
        attributes: {
          lights: ['light.living_couch', 'light.living_floor'],
          manual_control: ['light.living_floor'],
        },
      },
    });
    expect(el.shadowRoot.getElementById('manualResetBtn').hidden).toBe(false);
    cleanup(el);
  });
});

describe('Rooms: config synthesis', () => {
  it('synthesizes lights[] from light_entities[] when explicit lights are absent', () => {
    const el = document.createElement('tunet-rooms-card');
    el.setConfig({
      rooms: [{
        name: 'Test',
        icon: 'home',
        light_entities: ['light.a', 'light.b'],
      }],
    });
    expect(el._config.rooms[0].lights).toEqual([
      { entity: 'light.a', icon: 'lightbulb', name: '' },
      { entity: 'light.b', icon: 'lightbulb', name: '' },
    ]);
  });

  it('normalizes unsupported room icon aliases like sofa to a valid glyph token', () => {
    const el = document.createElement('tunet-rooms-card');
    el.setConfig({
      layout_variant: 'slim',
      rooms: [{
        name: 'Living Room',
        icon: 'sofa',
        lights: ['light.living_couch'],
      }],
    });
    document.body.appendChild(el);
    el.hass = makeHass();
    const iconGlyph = el.shadowRoot.querySelector('.room-tile-icon .icon');
    expect(iconGlyph?.textContent).toBe('weekend');
    cleanup(el);
  });

  it('shows brightness as a plain percent when no ambient sensors are configured', () => {
    const el = createRooms({
      rooms: [{
        name: 'Living Room',
        icon: 'weekend',
        lights: [
          { entity: 'light.living_couch', icon: 'table_lamp', name: 'Couch' },
          { entity: 'light.living_floor', icon: 'floor_lamp', name: 'Floor' },
        ],
      }],
    });
    const status = el.shadowRoot.querySelector('.room-tile-status')?.textContent || '';
    expect(status).toContain('%');
    expect(status).not.toContain('bri');
    cleanup(el);
  });
});

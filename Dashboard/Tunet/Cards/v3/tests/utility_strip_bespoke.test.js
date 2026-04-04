/**
 * CD5 Utility Strip Bespoke Tests
 *
 * Covers the bespoke behavior changes in CD5 for tunet-actions-card
 * and tunet-scenes-card. Does NOT duplicate:
 *   - config_contract.test.js (stub roundtrip, getConfigForm)
 *   - sizing_sections_contract.test.js (rows:'auto' universal, scenes allow_wrap)
 *   - interaction_keyboard_contract.test.js (native <button> verification)
 *   - interaction_dom_contract.test.js (style injection, base reset tokens)
 *
 * This suite tests:
 *   - Actions wrap/scroll CSS contract (variant + compact driven)
 *   - Actions layout helper sizing (getCardSize / getGridOptions)
 *   - Actions aria-pressed semantics + runtime dispatch behavior
 *   - Scenes semantic header markup
 *   - Scenes getGridOptions awareness of allow_wrap + show_header
 *   - Scenes dispatch behavior, recent-activation fallback, unavailable guard
 *   - Scenes wrap class application
 */

import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Polyfill matchMedia for jsdom
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

import '../tunet_actions_card.js';
import '../tunet_scenes_card.js';

// ─── Helpers ──────────────────────────────────────────────────────────

function createActions(overrides = {}) {
  const el = document.createElement('tunet-actions-card');
  const ActionsClass = customElements.get('tunet-actions-card');
  const stub = ActionsClass.getStubConfig();
  el.setConfig({ ...stub, ...overrides });
  return el;
}

function createScenes(overrides = {}) {
  const el = document.createElement('tunet-scenes-card');
  const ScenesClass = customElements.get('tunet-scenes-card');
  const stub = ScenesClass.getStubConfig();
  el.setConfig({ ...stub, ...overrides });
  return el;
}

function readCardCSS(filename) {
  const src = fs.readFileSync(
    path.resolve(import.meta.dirname, '..', filename),
    'utf-8'
  );
  const blocks = [];
  const re = /`([^`]*)`/gs;
  let m;
  while ((m = re.exec(src))) blocks.push(m[1]);
  return blocks.join('\n');
}

const makeActions = (n) => Array.from({ length: n }, (_, i) => ({
  name: `A${i}`, service: 'light.turn_on', entity_id: 'light.a',
}));

function makeHass(states = {}) {
  return {
    states,
    themes: {},
    callService: vi.fn(() => Promise.resolve()),
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Actions: wrap/scroll CSS contract
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: wrap/scroll CSS contract', () => {
  it('.actions-row base has overflow-x: auto (scroll default)', () => {
    const css = readCardCSS('tunet_actions_card.js');
    const base = css.match(/\.actions-row\s*\{([^}]*)\}/);
    expect(base).not.toBeNull();
    expect(base[1]).toMatch(/overflow-x\s*:\s*auto/);
  });

  it('.actions-row.wrap has flex-wrap without centered-chip layout', () => {
    const css = readCardCSS('tunet_actions_card.js');
    expect(css).toMatch(/\.actions-row\.wrap\s*\{[^}]*flex-wrap\s*:\s*wrap/s);
    const wrapBlock = css.match(/\.actions-row\.wrap\s*\{([^}]*)\}/s);
    expect(wrapBlock?.[1]).not.toMatch(/justify-content\s*:\s*center/);
  });

  it('mode_strip adds wrap class (wraps under phone pressure)', () => {
    const el = createActions({ variant: 'mode_strip', compact: true });
    el.hass = { states: {}, themes: {} };
    const row = el.shadowRoot.querySelector('.actions-row');
    expect(row.classList.contains('wrap')).toBe(true);
  });

  it('compact:false (relaxed) adds wrap class', () => {
    const el = createActions({ variant: 'default', compact: false, actions: makeActions(4) });
    el.hass = { states: {}, themes: {} };
    const row = el.shadowRoot.querySelector('.actions-row');
    expect(row.classList.contains('wrap')).toBe(true);
  });

  it('compact:true default does NOT add wrap class (thin strip)', () => {
    const el = createActions({ variant: 'default', compact: true, actions: makeActions(3) });
    el.hass = { states: {}, themes: {} };
    const row = el.shadowRoot.querySelector('.actions-row');
    expect(row.classList.contains('wrap')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Actions: layout helper → getCardSize
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: getCardSize (layout helper)', () => {
  it('compact default strip: 1', () => {
    const el = createActions({ variant: 'default', compact: true, actions: makeActions(3) });
    expect(el.getCardSize()).toBe(1);
  });

  it('relaxed default strip (compact:false): 2', () => {
    const el = createActions({ variant: 'default', compact: false, actions: makeActions(4) });
    expect(el.getCardSize()).toBe(2);
  });

  it('compact mode_strip: 2', () => {
    const el = createActions({ variant: 'mode_strip', compact: true });
    expect(el.getCardSize()).toBe(2);
  });

  it('non-compact mode_strip: 3', () => {
    const el = createActions({ variant: 'mode_strip', compact: false });
    expect(el.getCardSize()).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Actions: layout helper → getGridOptions
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: getGridOptions (layout helper)', () => {
  it('compact default strip: min_rows=1, min_columns=6', () => {
    const el = createActions({ variant: 'default', compact: true, actions: makeActions(3) });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(1);
    expect(g.min_columns).toBe(6);
  });

  it('relaxed default strip: min_rows=2, min_columns=9', () => {
    const el = createActions({ variant: 'default', compact: false, actions: makeActions(4) });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(2);
    expect(g.min_columns).toBe(9);
  });

  it('compact mode_strip: min_rows=2, min_columns=9', () => {
    const el = createActions({ variant: 'mode_strip', compact: true });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(2);
    expect(g.min_columns).toBe(9);
  });

  it('non-compact mode_strip: min_rows=2, min_columns=9, max_rows=4', () => {
    const el = createActions({ variant: 'mode_strip', compact: false });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(2);
    expect(g.min_columns).toBe(9);
    expect(g.max_rows).toBe(4);
  });

  it('rows is always auto (CD4 regression gate)', () => {
    for (const cfg of [
      { variant: 'mode_strip' },
      { variant: 'default', compact: true, actions: makeActions(1) },
      { variant: 'default', compact: false, actions: makeActions(4) },
    ]) {
      const el = createActions(cfg);
      expect(el.getGridOptions().rows).toBe('auto');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Actions: aria-pressed semantics
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: aria-pressed', () => {
  it('chip with state_entity gets aria-pressed when active', () => {
    const el = createActions({
      variant: 'default', compact: true,
      actions: [{
        name: 'Test', service: 'light.turn_on', entity_id: 'light.a',
        state_entity: 'light.a', active_when: 'on',
      }],
    });
    el.hass = { states: { 'light.a': { state: 'on', attributes: {} } }, themes: {} };
    const chip = el.shadowRoot.querySelector('.action-chip');
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('chip with state_entity gets aria-pressed=false when inactive', () => {
    const el = createActions({
      variant: 'default', compact: true,
      actions: [{
        name: 'Test', service: 'light.turn_on', entity_id: 'light.a',
        state_entity: 'light.a', active_when: 'on',
      }],
    });
    el.hass = { states: { 'light.a': { state: 'off', attributes: {} } }, themes: {} };
    const chip = el.shadowRoot.querySelector('.action-chip');
    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });

  it('chip without state_entity has no aria-pressed', () => {
    const el = createActions({
      variant: 'default', compact: true,
      actions: [{ name: 'Test', service: 'light.turn_on', entity_id: 'light.a' }],
    });
    el.hass = { states: {}, themes: {} };
    const chip = el.shadowRoot.querySelector('.action-chip');
    expect(chip.hasAttribute('aria-pressed')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Actions: runtime behavior
// ═══════════════════════════════════════════════════════════════════════

describe('Actions: runtime behavior', () => {
  it('show_when false hides the chip', () => {
    const el = createActions({
      variant: 'default',
      compact: true,
      actions: [{
        name: 'Reset',
        service: 'script.turn_on',
        entity_id: 'script.reset',
        show_when_entity: 'binary_sensor.flag',
        show_when_operator: 'equals',
        show_when_state: 'on',
      }],
    });
    el.hass = makeHass({ 'binary_sensor.flag': { state: 'off', attributes: {} } });
    const chip = el.shadowRoot.querySelector('.action-chip');
    expect(chip.classList.contains('hidden')).toBe(true);
  });

  it('service-backed chip dispatches the configured service payload', () => {
    const el = createActions({
      variant: 'default',
      compact: true,
      actions: [{
        name: 'Reset',
        service: 'script.turn_on',
        service_data: { entity_id: 'script.oal_reset_soft', reason: 'test' },
      }],
    });
    const hass = makeHass();
    el.hass = hass;
    el.shadowRoot.querySelector('.action-chip').click();
    expect(hass.callService).toHaveBeenCalledWith('script', 'turn_on', {
      entity_id: 'script.oal_reset_soft',
      reason: 'test',
    });
  });

  it('tap_action short-circuits service dispatch', () => {
    const el = createActions({
      variant: 'default',
      compact: true,
      actions: [{
        name: 'Info',
        service: 'light.turn_on',
        entity_id: 'light.a',
        tap_action: { action: 'more-info', entity: 'sensor.oal_system_status' },
      }],
    });
    const hass = makeHass();
    const seen = [];
    el.addEventListener('hass-more-info', (event) => seen.push(event.detail.entityId));
    el.hass = hass;
    el.shadowRoot.querySelector('.action-chip').click();
    expect(seen).toEqual(['sensor.oal_system_status']);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('mode_strip substitutes mode_entity into default actions', () => {
    const el = createActions({
      variant: 'mode_strip',
      compact: true,
      mode_entity: 'input_select.custom_mode',
    });
    const actions = el._config.actions;
    const modeActions = actions.filter((action) => action.service === 'input_select.select_option');
    expect(actions.length).toBeGreaterThan(0);
    expect(modeActions.length).toBeGreaterThan(0);
    expect(modeActions.every((action) => action.state_entity === 'input_select.custom_mode')).toBe(true);
    expect(modeActions.every((action) => action.service_data.entity_id === 'input_select.custom_mode')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: semantic header
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: header semantics', () => {
  it('title has role="heading" aria-level="3"', () => {
    const el = createScenes({ show_header: true, name: 'Scenes' });
    el.hass = { states: {}, themes: {} };
    const h = el.shadowRoot.querySelector('[role="heading"]');
    expect(h).not.toBeNull();
    expect(h.getAttribute('aria-level')).toBe('3');
  });

  it('header icon is decorative (aria-hidden)', () => {
    const el = createScenes({ show_header: true });
    el.hass = { states: {}, themes: {} };
    const icon = el.shadowRoot.querySelector('.hdr-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('show_header: false hides the header', () => {
    const el = createScenes({ show_header: false });
    el.hass = { states: {}, themes: {} };
    const hdr = el.shadowRoot.querySelector('.hdr');
    const hidden = hdr?.classList.contains('hidden') || hdr?.style.display === 'none' || !hdr;
    expect(hidden).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: getGridOptions awareness of allow_wrap + show_header
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: getGridOptions (allow_wrap + show_header)', () => {
  const scenes4 = Array.from({ length: 4 }, (_, i) => ({ entity: `scene.s${i}`, name: `S${i}` }));
  const scenes5 = Array.from({ length: 5 }, (_, i) => ({ entity: `scene.s${i}`, name: `S${i}` }));

  it('wrap + no header + 4 scenes: min_rows=1, min_columns=6', () => {
    const el = createScenes({ allow_wrap: true, show_header: false, scenes: scenes4 });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(1);
    expect(g.min_columns).toBe(6);
  });

  it('wrap + header + 5 scenes: min_rows=3, min_columns=6', () => {
    const el = createScenes({ allow_wrap: true, show_header: true, scenes: scenes5 });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(3);
    expect(g.min_columns).toBe(6);
  });

  it('strip + no header: min_rows=1, min_columns=9', () => {
    const el = createScenes({ allow_wrap: false, show_header: false, scenes: scenes4 });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(1);
    expect(g.min_columns).toBe(9);
  });

  it('strip + header: min_rows=2, min_columns=9', () => {
    const el = createScenes({ allow_wrap: false, show_header: true, scenes: scenes4 });
    const g = el.getGridOptions();
    expect(g.min_rows).toBe(2);
    expect(g.min_columns).toBe(9);
  });

  it('rows is always auto (CD4 regression gate)', () => {
    const el = createScenes({ allow_wrap: true, scenes: scenes4 });
    expect(el.getGridOptions().rows).toBe('auto');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: getCardSize (cross-check with getGridOptions)
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: getCardSize', () => {
  const scenes4 = Array.from({ length: 4 }, (_, i) => ({ entity: `scene.s${i}`, name: `S${i}` }));
  const scenes5 = Array.from({ length: 5 }, (_, i) => ({ entity: `scene.s${i}`, name: `S${i}` }));

  it('wrap + no header + 4 scenes: 1', () => {
    const el = createScenes({ allow_wrap: true, show_header: false, scenes: scenes4 });
    expect(el.getCardSize()).toBe(1);
  });

  it('wrap + header + 5 scenes: 3', () => {
    const el = createScenes({ allow_wrap: true, show_header: true, scenes: scenes5 });
    expect(el.getCardSize()).toBe(3);
  });

  it('strip + no header: 1', () => {
    const el = createScenes({ allow_wrap: false, show_header: false, scenes: scenes4 });
    expect(el.getCardSize()).toBe(1);
  });

  it('strip + header: 2', () => {
    const el = createScenes({ allow_wrap: false, show_header: true, scenes: scenes4 });
    expect(el.getCardSize()).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: dispatch behavior
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: dispatch behavior', () => {
  it('scene entity dispatches scene.turn_on', async () => {
    const el = createScenes({ scenes: [{ entity: 'scene.test', name: 'Test' }] });
    const hass = makeHass({ 'scene.test': { state: 'scening', attributes: {} } });
    el.hass = hass;
    el.shadowRoot.querySelector('.scene-chip').click();
    await Promise.resolve();
    expect(hass.callService).toHaveBeenCalledWith('scene', 'turn_on', { entity_id: 'scene.test' });
  });

  it('script entity dispatches script.turn_on', async () => {
    const el = createScenes({ scenes: [{ entity: 'script.test', name: 'Test' }] });
    const hass = makeHass({ 'script.test': { state: 'off', attributes: {} } });
    el.hass = hass;
    el.shadowRoot.querySelector('.scene-chip').click();
    await Promise.resolve();
    expect(hass.callService).toHaveBeenCalledWith('script', 'turn_on', { entity_id: 'script.test' });
  });

  it('automation entity dispatches automation.trigger', async () => {
    const el = createScenes({ scenes: [{ entity: 'automation.test', name: 'Test' }] });
    const hass = makeHass({ 'automation.test': { state: 'on', attributes: {} } });
    el.hass = hass;
    el.shadowRoot.querySelector('.scene-chip').click();
    await Promise.resolve();
    expect(hass.callService).toHaveBeenCalledWith('automation', 'trigger', { entity_id: 'automation.test' });
  });

  it('recent-activation fallback marks a just-activated scene active without state_entity', async () => {
    const el = createScenes({ scenes: [{ entity: 'scene.test', name: 'Test' }] });
    const hass = makeHass({ 'scene.test': { state: 'scening', attributes: {} } });
    el.hass = hass;
    const chip = el.shadowRoot.querySelector('.scene-chip');
    chip.click();
    await Promise.resolve();
    expect(chip.classList.contains('active')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: unavailable chip disabled semantics + dispatch guard
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: unavailable chip semantics', () => {
  function withHass(entityState) {
    const el = createScenes({
      scenes: [{ entity: 'scene.test', name: 'Test' }],
    });
    el.hass = { states: entityState, themes: {} };
    return el;
  }

  it('unavailable scene chip has disabled attribute', () => {
    const el = withHass({ 'scene.test': { state: 'unavailable', attributes: {} } });
    const chip = el.shadowRoot.querySelector('.scene-chip');
    expect(chip.disabled).toBe(true);
  });

  it('unavailable scene chip has is-unavailable class', () => {
    const el = withHass({ 'scene.test': { state: 'unavailable', attributes: {} } });
    const chip = el.shadowRoot.querySelector('.scene-chip');
    expect(chip.classList.contains('is-unavailable')).toBe(true);
  });

  it('available scene chip is NOT disabled', () => {
    const el = withHass({ 'scene.test': { state: 'scening', attributes: {}, entity_id: 'scene.test' } });
    const chip = el.shadowRoot.querySelector('.scene-chip');
    expect(chip.disabled).toBe(false);
  });

  it('missing entity treats chip as unavailable', () => {
    const el = withHass({});
    const chip = el.shadowRoot.querySelector('.scene-chip');
    expect(chip.disabled).toBe(true);
  });

  it('disabled chip never dispatches', async () => {
    const el = createScenes({
      scenes: [{ entity: 'scene.test', name: 'Test' }],
    });
    const hass = makeHass({ 'scene.test': { state: 'unavailable', attributes: {} } });
    el.hass = hass;
    const chip = el.shadowRoot.querySelector('.scene-chip');
    chip.click();
    await Promise.resolve();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Scenes: wrap class application
// ═══════════════════════════════════════════════════════════════════════

describe('Scenes: wrap/strip CSS class', () => {
  it('allow_wrap: true adds wrap class', () => {
    const el = createScenes({ allow_wrap: true });
    el.hass = { states: {}, themes: {} };
    const row = el.shadowRoot.querySelector('.scene-row');
    expect(row.classList.contains('wrap')).toBe(true);
  });

  it('allow_wrap: false does NOT add wrap class', () => {
    const el = createScenes({ allow_wrap: false });
    el.hass = { states: {}, themes: {} };
    const row = el.shadowRoot.querySelector('.scene-row');
    expect(row.classList.contains('wrap')).toBe(false);
  });
});

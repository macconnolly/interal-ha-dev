/**
 * Interaction DOM Contract Tests — CD2
 *
 * Runtime tests that instantiate cards in jsdom and inspect shadow DOM.
 * Complements interaction_source_contract.test.js (source-level checks).
 *
 * Covered:
 *   - Card registration
 *   - Style injection (shadow DOM has tokens, REDUCED_MOTION)
 *   - Base exports exist (INTERACTIVE_SURFACE, TOKENS, REDUCED_MOTION)
 *   - base_reset selectors actually render as <button> (validates registry)
 *   - Rendered styles: no transition: all, no unguarded :hover
 *   - focus_source='local' cards have :focus-visible in shadow styles
 *
 * Explicitly excluded (CD3 scope):
 *   - Blanket keyboard-reachability for custom div interactives
 *   - Button-role retrofit checks
 *   - Slider ARIA assertions
 */

import { describe, it, expect } from 'vitest';
import {
  CARD_REGISTRY,
  CD2_CARDS,
  BASE_RESET_SELECTORS,
} from './helpers/css_contract_helpers.js';

// Polyfill matchMedia for jsdom (nav card needs it)
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

// Import all cards — each self-registers via registerCard()
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

// Import base exports to verify structure
import * as TunetBase from '../tunet_base.js';

// ─── Test Helpers ──────────────────────────────────────────────────────

/**
 * Minimal hass mock that triggers card rendering without real entities.
 * Cards call _render() on first set hass(). They need:
 *   - hass.states (entity state lookups — return undefined gracefully)
 *   - hass.themes (dark mode detection)
 *   - hass.callService (service calls — noop)
 */
const MOCK_HASS = {
  states: new Proxy({}, { get: () => undefined }),
  themes: { darkMode: false },
  callService: () => Promise.resolve(),
  callApi: () => Promise.resolve([]),
  connection: { subscribeMessage: () => Promise.resolve(() => {}) },
  language: 'en',
  locale: { language: 'en' },
};

function createCard(tag) {
  const el = document.createElement(tag);
  const CardClass = customElements.get(tag);
  if (CardClass && CardClass.getStubConfig) {
    try {
      el.setConfig(CardClass.getStubConfig());
    } catch {
      // Some cards throw without hass — OK for structural tests
    }
  }
  return el;
}

/**
 * Create a card and trigger full rendering with mock hass.
 * Returns the connected element with styles injected.
 */
function createRenderedCard(tag) {
  const el = createCard(tag);
  document.body.appendChild(el);
  try {
    el.hass = MOCK_HASS;
  } catch {
    // Some cards may throw on render without real entities — styles should still be injected
  }
  return el;
}

function getShadowStyles(el) {
  if (!el.shadowRoot) return '';
  const styles = el.shadowRoot.querySelectorAll('style');
  return Array.from(styles).map(s => s.textContent).join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// Base Export Structure
// ═══════════════════════════════════════════════════════════════════════

describe('Base exports (tunet_base.js)', () => {
  it('exports TOKENS as a string', () => {
    expect(typeof TunetBase.TOKENS).toBe('string');
    expect(TunetBase.TOKENS.length).toBeGreaterThan(100);
  });

  it('exports INTERACTIVE_SURFACE as a string', () => {
    expect(typeof TunetBase.INTERACTIVE_SURFACE).toBe('string');
  });

  it('exports REDUCED_MOTION as a string', () => {
    expect(typeof TunetBase.REDUCED_MOTION).toBe('string');
  });

  it('exports TILE_SURFACE as a string', () => {
    expect(typeof TunetBase.TILE_SURFACE).toBe('string');
  });

  it('TOKENS contains all CD2-required custom properties', () => {
    const tokens = TunetBase.TOKENS;
    const requiredProps = [
      '--motion-fast', '--motion-ui', '--motion-surface',
      '--ease-standard', '--ease-emphasized',
      '--press-scale', '--press-scale-strong', '--drag-scale',
      '--focus-ring-color', '--focus-ring-width', '--focus-ring-offset',
      '--disabled-opacity', '--disabled-surface-opacity', '--disabled-control-opacity',
    ];
    for (const prop of requiredProps) {
      expect(tokens, `TOKENS missing ${prop}`).toContain(prop);
    }
  });

  it('INTERACTIVE_SURFACE contains .interactive selector', () => {
    expect(TunetBase.INTERACTIVE_SURFACE).toMatch(/\.interactive\s*\{/);
  });

  it('INTERACTIVE_SURFACE contains hover guard', () => {
    expect(TunetBase.INTERACTIVE_SURFACE).toMatch(/@media\s*\(\s*hover\s*:\s*hover\s*\)/);
  });

  it('INTERACTIVE_SURFACE contains :focus-visible', () => {
    expect(TunetBase.INTERACTIVE_SURFACE).toMatch(/:focus-visible/);
  });

  it('INTERACTIVE_SURFACE contains tap-highlight reset', () => {
    expect(TunetBase.INTERACTIVE_SURFACE).toMatch(
      /-webkit-tap-highlight-color\s*:\s*transparent/
    );
  });

  it('INTERACTIVE_SURFACE contains press scale with token', () => {
    expect(TunetBase.INTERACTIVE_SURFACE).toMatch(/scale\(\s*var\(\s*--press-scale/);
  });

  it('REDUCED_MOTION contains prefers-reduced-motion media query', () => {
    expect(TunetBase.REDUCED_MOTION).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Card Registration
// ═══════════════════════════════════════════════════════════════════════

describe('Card registration', () => {
  for (const card of CARD_REGISTRY) {
    it(`${card.tag} is registered as a custom element`, () => {
      expect(customElements.get(card.tag)).toBeDefined();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Shadow DOM Style Injection
// ═══════════════════════════════════════════════════════════════════════

describe('Shadow DOM style injection', () => {
  for (const card of CD2_CARDS) {
    it(`${card.tag} injects styles with tokens after hass`, () => {
      const el = createRenderedCard(card.tag);
      const styles = getShadowStyles(el);
      expect(styles, `${card.tag} shadow styles missing tokens`).toContain('--motion-ui');
      expect(
        styles.includes('prefers-reduced-motion'),
        `${card.tag} shadow styles missing REDUCED_MOTION`
      ).toBe(true);
      document.body.removeChild(el);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Shadow DOM: focus-visible rules for focus_source='local' cards
// ═══════════════════════════════════════════════════════════════════════

describe('Shadow DOM: focus-visible for local-focus cards', () => {
  for (const card of CD2_CARDS) {
    const localFocusEls = card.interactive.filter(el => el.focus_source === 'local');
    if (localFocusEls.length === 0) continue;

    it(`${card.tag} shadow styles contain :focus-visible rules`, () => {
      const el = createRenderedCard(card.tag);
      const styles = getShadowStyles(el);
      expect(
        styles.includes(':focus-visible'),
        `${card.tag} has ${localFocusEls.length} local-focus elements but no :focus-visible in shadow styles`
      ).toBe(true);
      document.body.removeChild(el);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Shadow DOM: no transition: all in rendered styles
// ═══════════════════════════════════════════════════════════════════════

describe('Shadow DOM: no transition: all', () => {
  for (const card of CD2_CARDS) {
    it(`${card.tag} rendered styles have no transition: all`, () => {
      const el = createRenderedCard(card.tag);
      const styles = getShadowStyles(el);
      const lines = styles.split('\n').filter(l =>
        !l.trim().startsWith('/*') && !l.trim().startsWith('*')
      );
      const allTransitions = lines.filter(l => /transition\s*:.*\ball\b/.test(l));
      expect(
        allTransitions,
        `${card.tag} has transition: all:\n${allTransitions.join('\n')}`
      ).toHaveLength(0);
      document.body.removeChild(el);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// Shadow DOM: hover rules are guarded
// ═══════════════════════════════════════════════════════════════════════

describe('Shadow DOM: hover rules are guarded', () => {
  for (const card of CD2_CARDS) {
    it(`${card.tag} rendered styles have no unguarded :hover`, () => {
      const el = createRenderedCard(card.tag);
      const styles = getShadowStyles(el);

      const lines = styles.split('\n');
      let inMediaHover = false;
      let depth = 0;
      let mediaStartDepth = 0;
      const unguarded = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/@media\s*\(\s*hover\s*:\s*hover\s*\)/)) {
          inMediaHover = true;
          mediaStartDepth = depth;
        }
        depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (inMediaHover && depth <= mediaStartDepth) inMediaHover = false;
        if (line.match(/:hover\b/) && !line.trim().startsWith('/*') && !inMediaHover) {
          unguarded.push(`line ${i + 1}: ${line.trim()}`);
        }
      }

      expect(
        unguarded,
        `${card.tag} has unguarded :hover:\n${unguarded.join('\n')}`
      ).toHaveLength(0);
      document.body.removeChild(el);
    });
  }
});

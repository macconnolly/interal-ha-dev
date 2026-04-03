/**
 * Interaction Source Contract Tests — CD2
 *
 * Encodes cross_card_interaction_vocabulary.md as executable assertions.
 * Tests inspect card source files (CSS-in-JS template literals) for
 * contract compliance. These tests define the CD2 finish line.
 *
 * Covered:
 *   §1 Hover: all :hover guarded by @media (hover: hover)
 *   §2 Active: press scales use tokens, not hardcoded values
 *   §3 Focus-visible: focus_source='local' selectors have card-local rules
 *   §5 Transitions: zero transition: all; interactive timing uses tokens
 *   §6 INTERACTIVE_SURFACE: base export exists
 *   §7 Drift: --spring resolved, --accent forbidden in focus-ring, tap-highlight
 *
 * NOT covered (visual/live validation):
 *   Climate visual non-regression, disabled/off appearance, runtime HA behavior
 *
 * NOT covered (CD3 scope):
 *   Blanket keyboard-reachability for custom div interactives
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  CARD_REGISTRY,
  CD2_CARDS,
  LOCAL_FOCUS_SELECTORS,
  LOCAL_TAP_SELECTORS,
  REQUIRED_CD2_TOKENS,
  readCardSource,
  readBaseSource,
  extractCSSBlocks,
  findHoverRules,
  findTransitions,
  findScaleValues,
  hasFocusVisible,
  hasTapHighlightReset,
  extractDefinedVars,
} from './helpers/css_contract_helpers.js';

// ─── Shared State ──────────────────────────────────────────────────────

let baseSource;
let baseDefinedVars;
const cardSources = new Map();
const cardCSS = new Map();

beforeAll(() => {
  baseSource = readBaseSource();
  baseDefinedVars = extractDefinedVars(baseSource);

  for (const card of CARD_REGISTRY) {
    const source = readCardSource(card.file);
    cardSources.set(card.file, source);
    cardCSS.set(card.file, extractCSSBlocks(source).join('\n'));
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §6 — Base Contract: INTERACTIVE_SURFACE and required tokens
// ═══════════════════════════════════════════════════════════════════════

describe('Base contract (tunet_base.js)', () => {
  it('exports INTERACTIVE_SURFACE', () => {
    expect(baseSource).toMatch(/export\s+const\s+INTERACTIVE_SURFACE/);
  });

  it('INTERACTIVE_SURFACE includes .interactive class with hover guard', () => {
    const match = baseSource.match(/INTERACTIVE_SURFACE\s*=\s*`([\s\S]*?)`/);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toMatch(/\.interactive\s*\{/);
      expect(match[1]).toMatch(/@media\s*\(\s*hover\s*:\s*hover\s*\)/);
    }
  });

  it('INTERACTIVE_SURFACE includes focus-visible with tokens', () => {
    const match = baseSource.match(/INTERACTIVE_SURFACE\s*=\s*`([\s\S]*?)`/);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toMatch(/:focus-visible/);
      expect(match[1]).toMatch(/--focus-ring-width/);
      expect(match[1]).toMatch(/--focus-ring-color/);
      expect(match[1]).toMatch(/--focus-ring-offset/);
    }
  });

  it('INTERACTIVE_SURFACE includes tap-highlight reset', () => {
    const match = baseSource.match(/INTERACTIVE_SURFACE\s*=\s*`([\s\S]*?)`/);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toMatch(/-webkit-tap-highlight-color\s*:\s*transparent/);
    }
  });

  it('INTERACTIVE_SURFACE includes press scale token', () => {
    const match = baseSource.match(/INTERACTIVE_SURFACE\s*=\s*`([\s\S]*?)`/);
    expect(match).not.toBeNull();
    if (match) {
      expect(match[1]).toMatch(/--press-scale/);
    }
  });

  describe('required CD2 tokens in TOKENS export', () => {
    for (const token of REQUIRED_CD2_TOKENS) {
      it(`defines ${token}`, () => {
        expect(baseDefinedVars.has(token)).toBe(true);
      });
    }
  });

  it('base RESET includes tap-highlight reset for native buttons', () => {
    expect(baseSource).toMatch(
      /button[^{]*\{[^}]*-webkit-tap-highlight-color\s*:\s*transparent/s
    );
  });

  it('prefers-contrast: more thickens the shared focus ring', () => {
    expect(baseSource).toMatch(
      /prefers-contrast\s*:\s*more[\s\S]*?--focus-ring-width/
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// §5 — Transitions: no transition: all
// ═══════════════════════════════════════════════════════════════════════

describe('§5 Transitions: no transition: all', () => {
  for (const card of CD2_CARDS) {
    it(`${card.file} has zero transition: all`, () => {
      const css = cardCSS.get(card.file);
      const transitions = findTransitions(css);
      const allTransitions = transitions.filter(t => t.isAll);
      expect(
        allTransitions,
        `Found ${allTransitions.length} transition: all at lines: ${allTransitions.map(t => t.line).join(', ')}`
      ).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §1 — Hover: all :hover guarded by @media (hover: hover)
// ═══════════════════════════════════════════════════════════════════════

describe('§1 Hover: all :hover guarded', () => {
  for (const card of CD2_CARDS) {
    it(`${card.file} has no unguarded :hover rules`, () => {
      const css = cardCSS.get(card.file);
      const hovers = findHoverRules(css);
      const unguarded = hovers.filter(h => !h.guarded);
      expect(
        unguarded,
        `Found ${unguarded.length} unguarded :hover at lines: ${unguarded.map(h => `${h.line} (${h.rule})`).join(', ')}`
      ).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §2 — Active/Press: scale values use tokens
// ═══════════════════════════════════════════════════════════════════════

describe('§2 Active: press scales use tokens', () => {
  const FORBIDDEN_SCALES = ['.90', '0.90', '.94', '0.94', '.96', '0.96', '.98', '0.98', '.99', '0.99'];

  for (const card of CD2_CARDS) {
    it(`${card.file} has no forbidden hardcoded scale values`, () => {
      const css = cardCSS.get(card.file);
      const scales = findScaleValues(css);
      const hardcoded = scales.filter(s =>
        !s.usesToken && FORBIDDEN_SCALES.includes(s.value)
      );
      expect(
        hardcoded,
        `Found hardcoded scales: ${hardcoded.map(s => `scale(${s.value}) at line ${s.line}`).join(', ')}`
      ).toHaveLength(0);
    });

    it(`${card.file} all :active scale transforms use var() tokens`, () => {
      const source = cardSources.get(card.file);
      const activeScaleRegex = /:active\s*\{[^}]*scale\(([^)]+)\)/g;
      let match;
      const violations = [];
      while ((match = activeScaleRegex.exec(source)) !== null) {
        const value = match[1].trim();
        if (!value.startsWith('var(')) {
          violations.push(value);
        }
      }
      expect(
        violations,
        `Active scale without token: ${violations.join(', ')}`
      ).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §3 — Focus-Visible: local selectors have card-local :focus-visible
// ═══════════════════════════════════════════════════════════════════════

describe('§3 Focus-visible: local selectors have card-local rules', () => {
  for (const el of LOCAL_FOCUS_SELECTORS) {
    it(`${el.file} ${el.selector} (focus_source=local) has :focus-visible`, () => {
      const css = cardCSS.get(el.file);
      expect(
        hasFocusVisible(css, el.selector),
        `${el.selector} in ${el.file} needs card-local :focus-visible (custom div interactive)`
      ).toBe(true);
    });
  }
});

describe('§3 Focus-visible: token compliance', () => {
  for (const card of CD2_CARDS) {
    it(`${card.file} focus-visible rules use token refs (not hardcoded 2px/3px)`, () => {
      const css = cardCSS.get(card.file);
      const focusBlocks = css.match(/:focus-visible\s*\{[^}]*\}/g) || [];
      for (const block of focusBlocks) {
        expect(block, 'focus-visible has hardcoded outline width')
          .not.toMatch(/outline:\s*[23]px\s/);
      }
    });

    it(`${card.file} focus-visible rules use --focus-ring-color (not card-local accent)`, () => {
      const css = cardCSS.get(card.file);
      const focusBlocks = css.match(/:focus-visible\s*\{[^}]*\}/g) || [];
      for (const block of focusBlocks) {
        expect(block, 'focus-visible uses card-local accent token instead of --focus-ring-color')
          .not.toMatch(/var\(\s*--accent\b/);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §7.4 — Tap highlight: local selectors have tap-highlight reset
// ═══════════════════════════════════════════════════════════════════════

describe('§7.4 Tap highlight: local selectors have reset', () => {
  for (const card of CD2_CARDS) {
    const localTapEls = card.interactive.filter(el => el.tap_source === 'local');
    if (localTapEls.length === 0) continue;

    it(`${card.file} has -webkit-tap-highlight-color: transparent for local interactive elements`, () => {
      const css = cardCSS.get(card.file);
      expect(
        hasTapHighlightReset(css),
        `${card.file} missing -webkit-tap-highlight-color: transparent (has ${localTapEls.length} local interactive elements)`
      ).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §7.5 — CSS variable drift: --spring
// ═══════════════════════════════════════════════════════════════════════

describe('§7.5 --spring resolved', () => {
  it('--spring is either in base TOKENS or not used by any CD2 card', () => {
    if (baseDefinedVars.has('--spring')) return;
    for (const card of CD2_CARDS) {
      const css = cardCSS.get(card.file);
      expect(css, `${card.file} uses --spring but it is not in base TOKENS`)
        .not.toMatch(/var\(\s*--spring\b/);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// §5 — Reduced motion: cards compose REDUCED_MOTION
// ═══════════════════════════════════════════════════════════════════════

describe('§5 Reduced motion', () => {
  it('tunet_base.js exports REDUCED_MOTION with prefers-reduced-motion', () => {
    expect(baseSource).toMatch(/export\s+const\s+REDUCED_MOTION/);
    expect(baseSource).toMatch(/REDUCED_MOTION[\s\S]*?prefers-reduced-motion\s*:\s*reduce/);
  });

  for (const card of CD2_CARDS) {
    it(`${card.file} composes REDUCED_MOTION`, () => {
      const source = cardSources.get(card.file);
      expect(
        source.includes('REDUCED_MOTION') || source.includes('prefers-reduced-motion'),
        `${card.file} does not include REDUCED_MOTION in its styles`
      ).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §5 — Transitions: interactive selectors use token timing
// ═══════════════════════════════════════════════════════════════════════

describe('§5 Transitions: interactive timing uses tokens', () => {
  const FORBIDDEN_TIMINGS = ['.15s', '0.15s', '.16s', '0.16s', '.2s', '0.2s', '.3s', '0.3s'];

  for (const card of CD2_CARDS) {
    const interactiveSelectors = card.interactive.map(el => el.selector);
    if (interactiveSelectors.length === 0) continue;

    it(`${card.file} interactive selectors use token timing`, () => {
      const source = cardSources.get(card.file);
      const violations = [];

      for (const sel of interactiveSelectors) {
        const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Find CSS blocks for this selector (selector { ... })
        const blockRegex = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g');
        let match;
        while ((match = blockRegex.exec(source)) !== null) {
          const block = match[1];
          const transMatch = block.match(/transition\s*:\s*([^;]+)/);
          if (transMatch) {
            const val = transMatch[1];
            for (const forbidden of FORBIDDEN_TIMINGS) {
              if (val.includes(forbidden) && !val.includes('var(')) {
                violations.push(`${sel}: "${val.trim()}" uses hardcoded ${forbidden}`);
              }
            }
          }
        }
      }

      expect(
        violations,
        `Hardcoded timing on interactive selectors:\n${violations.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// §1 — Hover: no translateY on hover (speaker_grid drift)
// ═══════════════════════════════════════════════════════════════════════

describe('§1 Hover: no translateY on hover', () => {
  for (const card of CD2_CARDS) {
    it(`${card.file} does not use translateY on :hover`, () => {
      const css = cardCSS.get(card.file);
      const hoverBlocks = css.match(/:hover\s*\{[^}]*\}/g) || [];
      for (const block of hoverBlocks) {
        expect(block, `${card.file} hover uses translateY (shadow-lift only per vocabulary §1)`)
          .not.toMatch(/translateY/);
      }
    });
  }
});

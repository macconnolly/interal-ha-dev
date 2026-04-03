/**
 * Bundle Safety Tests
 *
 * Guards for CD0 side-effect fix and ongoing bundle correctness.
 * With esbuild bundling, tunet_base.js is inlined into each of the
 * 13 card bundles. Module-scoped state must be window-scoped to
 * prevent 13 independent copies from causing duplicate side effects.
 *
 * These tests verify the shared guards work correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { injectFonts, registerCard } from '../tunet_base.js';

describe('injectFonts bundle safety', () => {
  beforeEach(() => {
    // Reset the window flag between tests
    window.__tunetFontsInjected = false;

    // Remove any injected links from prior runs
    document.head.querySelectorAll('link[href*="fonts.googleapis"]').forEach((el) => el.remove());
    document.head.querySelectorAll('link[href*="fonts.gstatic"]').forEach((el) => el.remove());
  });

  it('sets window.__tunetFontsInjected after first call', () => {
    expect(window.__tunetFontsInjected).toBe(false);
    injectFonts();
    expect(window.__tunetFontsInjected).toBe(true);
  });

  it('injects font link elements into document.head', () => {
    injectFonts();
    const links = document.head.querySelectorAll('link[href*="fonts.googleapis"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('does not inject twice when called multiple times', () => {
    injectFonts();
    const countAfterFirst = document.head.querySelectorAll('link').length;
    injectFonts();
    const countAfterSecond = document.head.querySelectorAll('link').length;
    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('respects pre-set window flag (simulates another bundle already ran)', () => {
    window.__tunetFontsInjected = true;
    injectFonts();
    const links = document.head.querySelectorAll('link[href*="fonts.googleapis"]');
    expect(links.length).toBe(0);
  });
});

describe('registerCard guard', () => {
  it('does not throw when registering the same tag twice', () => {
    // registerCard uses customElements.get() guard
    // First call defines, second call skips
    class TestCard1 extends HTMLElement {}
    class TestCard2 extends HTMLElement {}

    expect(() => {
      registerCard('test-card-guard-check', TestCard1, { name: 'Test', version: '0.0.1' });
    }).not.toThrow();

    expect(() => {
      registerCard('test-card-guard-check', TestCard2, { name: 'Test', version: '0.0.2' });
    }).not.toThrow();

    // The first registration wins
    expect(customElements.get('test-card-guard-check')).toBe(TestCard1);
  });
});

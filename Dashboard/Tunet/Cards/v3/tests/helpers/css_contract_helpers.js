/**
 * CSS Contract Test Helpers
 *
 * Shared utilities for the CD2 interaction contract test suites.
 * Two extraction modes:
 *   1. Source-level: reads .js files as text, extracts CSS from template literals
 *   2. Runtime: instantiates cards in jsdom, reads shadow DOM stylesheets
 */

import fs from 'node:fs';
import path from 'node:path';

const V3_DIR = path.resolve(import.meta.dirname, '..', '..');

// ─── Card Registry ─────────────────────────────────────────────────────
//
// Each entry maps a card file to its interactive CSS selectors and metadata.
// This is the CONTRACT — tests assert against this registry.
//
// Categories (from cross_card_interaction_vocabulary.md §8):
//   control  = tap-toggle, hold-to-drag (light tiles, speaker tiles)
//   nav      = tap-navigate, hold-popup (room tiles)
//   action   = tap-only (chips, buttons)
//   info     = tap-more-info (headers, sensor rows)
//   drag     = instant-drag (thumbs, sliders)
//
// focus_source / tap_source:
//   'base_reset' = native <button> or [role="button"]/[tabindex] — base RESET
//                  in tunet_base.js L288-294 provides :focus-visible and
//                  (after Step 2) -webkit-tap-highlight-color: transparent
//   'local'      = custom <div>/<span> interactive — card MUST provide
//                  card-local :focus-visible and tap-highlight rules
//
// element_tag: expected HTML element for DOM verification

export const CARD_REGISTRY = [
  {
    file: 'tunet_actions_card.js',
    tag: 'tunet-actions-card',
    excluded: false,
    interactive: [
      { selector: '.action-chip', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_scenes_card.js',
    tag: 'tunet-scenes-card',
    excluded: false,
    interactive: [
      { selector: '.scene-chip', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_light_tile.js',
    tag: 'tunet-light-tile',
    excluded: false,
    interactive: [
      { selector: '.lt', category: 'control', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
    ],
  },
  {
    file: 'tunet_lighting_card.js',
    tag: 'tunet-lighting-card',
    excluded: false,
    interactive: [
      { selector: '.info-tile', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.toggle-btn', category: 'action', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.mode-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.fan-btn', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.l-tile', category: 'control', press: 'strong', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
    ],
  },
  {
    file: 'tunet_rooms_card.js',
    tag: 'tunet-rooms-card',
    excluded: false,
    interactive: [
      { selector: '.section-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.room-tile', category: 'nav', press: 'strong', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.room-action-btn', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.room-orb', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_climate_card.js',
    tag: 'tunet-climate-card',
    excluded: false,
    interactive: [
      { selector: '.hdr-tile', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.fan-btn', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.mode-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.mode-opt', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_sensor_card.js',
    tag: 'tunet-sensor-card',
    excluded: false,
    interactive: [
      // .section-action removed — dead CSS (class never applied to any element)
      { selector: '.sensor-row', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
    ],
  },
  {
    file: 'tunet_weather_card.js',
    tag: 'tunet-weather-card',
    excluded: false,
    interactive: [
      { selector: '.info-tile', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
    ],
  },
  {
    file: 'tunet_media_card.js',
    tag: 'tunet-media-card',
    excluded: false,
    interactive: [
      { selector: '.info-tile', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.speaker-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.grp-check', category: 'action', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.t-btn', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.vol-icon', category: 'action', press: 'strong', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.vol-close', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_sonos_card.js',
    tag: 'tunet-sonos-card',
    excluded: false,
    interactive: [
      { selector: '.t-btn', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.source-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
      { selector: '.speaker-tile', category: 'control', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.vol-icon', category: 'action', press: 'strong', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_speaker_grid_card.js',
    tag: 'tunet-speaker-grid-card',
    excluded: false,
    interactive: [
      { selector: '.info-tile', category: 'info', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.spk-tile', category: 'control', press: 'standard', focus_source: 'local', tap_source: 'local', element_tag: 'div' },
      { selector: '.action-btn', category: 'action', press: 'standard', focus_source: 'base_reset', tap_source: 'base_reset', element_tag: 'button' },
    ],
  },
  {
    file: 'tunet_status_card.js',
    tag: 'tunet-status-card',
    excluded: true, // status lock — verify-only in CD2
    interactive: [],
  },
  {
    file: 'tunet_nav_card.js',
    tag: 'tunet-nav-card',
    excluded: true, // verify-only in CD2 (already reference-quality)
    interactive: [],
  },
];

// Cards that CD2 actively modifies
export const CD2_CARDS = CARD_REGISTRY.filter(c => !c.excluded);

// All card files for broad assertions
export const ALL_CARD_FILES = CARD_REGISTRY.map(c => c.file);

// Selectors that need card-local focus-visible
export const LOCAL_FOCUS_SELECTORS = CD2_CARDS.flatMap(c =>
  c.interactive.filter(el => el.focus_source === 'local').map(el => ({ ...el, file: c.file }))
);

// Selectors that need card-local tap-highlight
export const LOCAL_TAP_SELECTORS = CD2_CARDS.flatMap(c =>
  c.interactive.filter(el => el.tap_source === 'local').map(el => ({ ...el, file: c.file }))
);

// Selectors backed by native buttons (for DOM verification)
export const BASE_RESET_SELECTORS = CD2_CARDS.flatMap(c =>
  c.interactive.filter(el => el.focus_source === 'base_reset').map(el => ({ ...el, file: c.file, tag: c.tag }))
);

// ─── Source-Level Helpers ──────────────────────────────────────────────

/**
 * Read a card's source file as a string.
 */
export function readCardSource(filename) {
  return fs.readFileSync(path.join(V3_DIR, filename), 'utf-8');
}

/**
 * Read tunet_base.js source.
 */
export function readBaseSource() {
  return fs.readFileSync(path.join(V3_DIR, 'tunet_base.js'), 'utf-8');
}

/**
 * Extract all CSS content from template literals in a JS source string.
 * Captures content between backticks that looks like CSS (contains { }).
 * Returns an array of CSS strings.
 */
export function extractCSSBlocks(source) {
  const blocks = [];
  const templateLiteralRegex = /`([^`]*\{[^`]*\}[^`]*)`/g;
  let match;
  while ((match = templateLiteralRegex.exec(source)) !== null) {
    const content = match[1];
    if (content.includes('{') && (content.includes(':') || content.includes('var('))) {
      blocks.push(content);
    }
  }
  return blocks;
}

/**
 * Find all :hover rules in CSS text. Returns array of objects:
 * { rule: string, guarded: boolean, line: number }
 */
export function findHoverRules(cssText) {
  const results = [];
  const lines = cssText.split('\n');

  let inMediaHover = false;
  let braceDepth = 0;
  let mediaStartDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/@media\s*\(\s*hover\s*:\s*hover\s*\)/)) {
      inMediaHover = true;
      mediaStartDepth = braceDepth;
    }

    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    braceDepth += opens - closes;

    if (inMediaHover && braceDepth <= mediaStartDepth) {
      inMediaHover = false;
    }

    if (line.match(/:hover\b/) && !line.match(/^\s*\/[/*]/)) {
      results.push({
        rule: line.trim(),
        guarded: inMediaHover,
        line: i + 1,
      });
    }
  }

  return results;
}

/**
 * Find all transition declarations in CSS text.
 * Returns array of { value: string, line: number, isAll: boolean }
 */
export function findTransitions(cssText) {
  const results = [];
  const lines = cssText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/transition\s*:\s*([^;]+)/);
    if (match && !lines[i].match(/^\s*\/[/*]/)) {
      results.push({
        value: match[1].trim(),
        line: i + 1,
        isAll: /\ball\b/.test(match[1]),
      });
    }
  }
  return results;
}

/**
 * Find all scale() transform values in CSS text.
 * Returns array of { value: string, usesToken: boolean, line: number }
 */
export function findScaleValues(cssText) {
  const results = [];
  const lines = cssText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/scale\(([^)]+)\)/);
    if (match && !lines[i].match(/^\s*\/[/*]/)) {
      const value = match[1].trim();
      results.push({
        value,
        usesToken: value.startsWith('var('),
        line: i + 1,
      });
    }
  }
  return results;
}

/**
 * Check if CSS text contains :focus-visible rules for a given selector.
 */
export function hasFocusVisible(cssText, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}[^{]*:focus-visible`).test(cssText);
}

/**
 * Check if CSS text contains -webkit-tap-highlight-color: transparent
 * for a given selector or globally.
 */
export function hasTapHighlightReset(cssText, selector) {
  if (!selector) {
    return cssText.includes('-webkit-tap-highlight-color: transparent') ||
           cssText.includes('-webkit-tap-highlight-color:transparent');
  }
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}[^}]*-webkit-tap-highlight-color\\s*:\\s*transparent`, 's');
  return regex.test(cssText);
}

/**
 * Extract all CSS custom property names defined in a :host or :host(.dark) block.
 */
export function extractDefinedVars(tokensCSS) {
  const vars = new Set();
  const regex = /--([\w-]+)\s*:/g;
  let match;
  while ((match = regex.exec(tokensCSS)) !== null) {
    vars.add(`--${match[1]}`);
  }
  return vars;
}

// ─── Token Contract ────────────────────────────────────────────────────

/**
 * CD2-required tokens that MUST exist in tunet_base.js TOKENS.
 * From cross_card_interaction_vocabulary.md §Token Reference.
 */
export const REQUIRED_CD2_TOKENS = [
  '--motion-fast',
  '--motion-ui',
  '--motion-surface',
  '--ease-standard',
  '--ease-emphasized',
  '--press-scale',
  '--press-scale-strong',
  '--lift-scale',
  '--drag-scale',
  '--focus-ring-color',
  '--focus-ring-width',
  '--focus-ring-offset',
  '--disabled-opacity',
  '--disabled-surface-opacity',
  '--disabled-control-opacity',
];

/**
 * Press token expected per press category.
 */
export const PRESS_TOKEN_MAP = {
  standard: '--press-scale',
  strong: '--press-scale-strong',
};

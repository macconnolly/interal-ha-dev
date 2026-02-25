/**
 * tunet_speaker_grid_card.js — Bundled standalone build
 * Generated: 2026-02-25T05:37:39.056Z
 * Source: v2/tunet_speaker_grid_card.js + v2/tunet_base.js
 * This file is auto-generated. Edit v2/ sources, then re-run: node v2/bundle.js
 */

(function() {
'use strict';

// ═══════════════════════════════════════════════════════════
// TUNET BASE MODULE (inlined from tunet_base.js)
// ═══════════════════════════════════════════════════════════

/**
 * Tunet Base Module
 * Shared tokens, CSS blocks, and utilities for the Tunet card suite
 * Version 1.0.0
 *
 * Architecture: String exports, not inheritance.
 * Each card remains a standalone HTMLElement subclass.
 * Cards import CSS strings and concatenate them into their shadow DOM <style>.
 */

// ═══════════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════════

/**
 * Complete token system: light mode (spec §2.1) + dark mode (spec §2.2).
 * Source: design_language.md v8.3
 */
const TOKENS = `
  :host {
    /* Glass Surfaces */
    --glass: rgba(255,255,255, 0.68);
    --glass-border: rgba(255,255,255, 0.45);

    /* Shadows (two-layer: contact + ambient) */
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

    /* Text */
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30, 0.55);
    --text-muted: #8E8E93;

    /* Accent: Amber */
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10, 0.10);
    --amber-border: rgba(212,133,10, 0.22);

    /* Accent: Blue */
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255, 0.09);
    --blue-border: rgba(0,122,255, 0.18);

    /* Accent: Green */
    --green: #34C759;
    --green-fill: rgba(52,199,89, 0.12);
    --green-border: rgba(52,199,89, 0.15);

    /* Accent: Purple */
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222, 0.10);
    --purple-border: rgba(175,82,222, 0.18);

    /* Accent: Red */
    --red: #FF3B30;
    --red-fill: rgba(255,59,48, 0.10);
    --red-border: rgba(255,59,48, 0.22);

    /* Track / Slider */
    --track-bg: rgba(28,28,30, 0.055);
    --track-h: 44px;

    /* Thumb */
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

    /* Radii */
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 14px;

    /* Controls */
    --ctrl-bg: rgba(255,255,255, 0.52);
    --ctrl-border: rgba(0,0,0, 0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);

    /* Chips */
    --chip-bg: rgba(255,255,255, 0.48);
    --chip-border: rgba(0,0,0, 0.05);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.04);

    /* Dropdown Menu */
    --dd-bg: rgba(255,255,255, 0.84);
    --dd-border: rgba(255,255,255, 0.60);

    /* Dividers */
    --divider: rgba(28,28,30, 0.07);

    /* Toggle Switch */
    --toggle-off: rgba(28,28,30, 0.10);
    --toggle-on: rgba(52,199,89, 0.28);
    --toggle-knob: rgba(255,255,255, 0.96);

    /* Tile Surfaces */
    --tile-bg: rgba(255,255,255, 0.92);
    --tile-bg-off: rgba(28,28,30, 0.04);
    --gray-ghost: rgba(0, 0, 0, 0.035);
    --border-ghost: transparent;

    /* Section Container */
    --section-bg: rgba(255,255,255, 0.35);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.10);

    color-scheme: light;
    display: block;
  }

  :host(.dark) {
    --glass: rgba(44,44,46, 0.72);
    --glass-border: rgba(255,255,255, 0.08);

    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);

    --text: #F5F5F7;
    --text-sub: rgba(245,245,247, 0.50);
    --text-muted: rgba(245,245,247, 0.35);

    --amber: #E8961E;
    --amber-fill: rgba(232,150,30, 0.14);
    --amber-border: rgba(232,150,30, 0.25);

    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255, 0.13);
    --blue-border: rgba(10,132,255, 0.22);

    --green: #30D158;
    --green-fill: rgba(48,209,88, 0.14);
    --green-border: rgba(48,209,88, 0.18);

    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242, 0.14);
    --purple-border: rgba(191,90,242, 0.22);

    --red: #FF453A;
    --red-fill: rgba(255,69,58, 0.14);
    --red-border: rgba(255,69,58, 0.25);

    --track-bg: rgba(255,255,255, 0.06);
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);

    --ctrl-bg: rgba(255,255,255, 0.08);
    --ctrl-border: rgba(255,255,255, 0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);

    --chip-bg: rgba(58,58,60, 0.50);
    --chip-border: rgba(255,255,255, 0.06);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.18);

    --dd-bg: rgba(58,58,60, 0.88);
    --dd-border: rgba(255,255,255, 0.08);

    --divider: rgba(255,255,255, 0.06);

    --toggle-off: rgba(255,255,255, 0.10);
    --toggle-on: rgba(48,209,88, 0.30);
    --toggle-knob: rgba(255,255,255, 0.92);

    --tile-bg: rgba(44,44,46, 0.90);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255, 255, 255, 0.05);
    --border-ghost: rgba(255, 255, 255, 0.08);

    --section-bg: rgba(255,255,255, 0.05);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.25);

    color-scheme: dark;
  }
`;

/**
 * Midnight Navy dark mode override.
 * Append AFTER TOKENS to override dark mode with navy palette.
 * Used by: lighting card only.
 * Source: lighting-section-mockup-polish.html + parity lock values.
 */
const TOKENS_MIDNIGHT = `
  :host(.dark) {
    /* Midnight Navy - Parity Lock baseline */
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.10);

    --text: #F8FAFC;
    --text-sub: rgba(248,250,252, 0.65);
    --text-muted: rgba(248,250,252, 0.40);

    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36, 0.12);
    --amber-border: rgba(251,191,36, 0.25);

    --tile-bg: rgba(255,255,255, 0.08);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255,255,255, 0.04);
    --border-ghost: rgba(255,255,255, 0.05);

    --section-bg: rgba(30,41,59, 0.60);

    --track-bg: rgba(255,255,255, 0.08);
    --shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.40), 0 20px 40px rgba(0,0,0,0.35);
  }
`;

// ═══════════════════════════════════════════════════════════
// SHARED CSS BLOCKS
// ═══════════════════════════════════════════════════════════

const RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

const BASE_FONT = `
  .wrap, .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

/**
 * Material Symbols Rounded icon base.
 * Uses CSS custom properties for font-variation-settings.
 * Font-family: Rounded only (not Outlined).
 */
const ICON_BASE = `
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal;
    font-style: normal;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
    flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-28 { font-size: 28px; width: 28px; height: 28px; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }
`;

/** Universal glass card shell. Spec §3.1 */
const CARD_SURFACE = `
  .card {
    position: relative;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
    overflow: hidden;
  }
`;

/** Glass stroke pseudo-element for card surface. Spec §3.2 */
const CARD_SURFACE_GLASS_STROKE = `
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(
      160deg,
      rgba(255,255,255, 0.60),
      rgba(255,255,255, 0.10) 40%,
      rgba(255,255,255, 0.02) 60%,
      rgba(255,255,255, 0.25)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  :host(.dark) .card::before {
    background: linear-gradient(
      160deg,
      rgba(255,255,255, 0.12),
      rgba(255,255,255, 0.03) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.06)
    );
  }
`;

/** Section container surface (status, lighting cards) */
const SECTION_SURFACE = `
  .section-container {
    border-radius: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
`;

/** Base tile surface for status, lighting, sensor tiles */
const TILE_SURFACE = `
  .tile {
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost);
    box-shadow: var(--shadow);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: background .2s, border-color .2s, box-shadow .2s, transform .2s;
    cursor: pointer;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
  }

  .tile:hover {
    box-shadow: var(--shadow-up);
  }

  .tile:active {
    transform: scale(0.97);
  }

  .tile.off {
    background: var(--tile-bg-off);
    box-shadow: none;
  }

  .tile.off .tile-icon {
    background: var(--gray-ghost);
    color: var(--text-muted);
  }
`;

/** Shared section header row */
const HEADER_PATTERN = `
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 28px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--text-sub);
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

/** Shared control button surface (info tile, toggle buttons, selectors) */
const CTRL_SURFACE = `
  .ctrl-btn {
    min-height: 42px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    cursor: pointer;
    transition: all .15s;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
  }

  .ctrl-btn:hover {
    box-shadow: var(--shadow);
  }

  .ctrl-btn:active {
    transform: scale(0.95);
  }
`;

/** Shared dropdown menu */
const DROPDOWN_MENU = `
  .dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 220px;
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 10;
    display: none;
    flex-direction: column;
    gap: 1px;
  }

  .dd-menu.open {
    display: flex;
    animation: menuIn .14s ease forwards;
  }

  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dd-option {
    padding: 9px 12px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background .1s;
    user-select: none;
  }

  .dd-option:hover {
    background: var(--track-bg);
  }

  .dd-option:active {
    transform: scale(0.97);
  }

  .dd-divider {
    height: 1px;
    background: var(--divider);
    margin: 3px 8px;
  }
`;

const REDUCED_MOTION = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const RESPONSIVE_BASE = `
  @media (max-width: 440px) {
    .card { padding: 16px; }
    .section-container { padding: 16px; border-radius: 28px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// FONT INJECTION
// ═══════════════════════════════════════════════════════════

let _fontsInjected = false;

/**
 * Inject Google Fonts links into document.head (idempotent).
 * Call once from any card's constructor.
 */
function injectFonts() {
  if (_fontsInjected) return;
  _fontsInjected = true;
  const links = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200' },
  ];
  for (const cfg of links) {
    if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = cfg.rel;
    link.href = cfg.href;
    if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
    document.head.appendChild(link);
  }
}

/**
 * Font link tags for injection into shadow DOM.
 * Use inside the card's _render() template.
 */
const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
`;

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Standardized dark mode detection.
 * @param {Object} hass - Home Assistant instance
 * @returns {boolean}
 */
function detectDarkMode(hass) {
  if (!hass?.themes) return false;
  const theme = hass.themes?.darkMode;
  if (typeof theme === 'boolean') return theme;
  const selected = hass.themes?.theme;
  if (selected && selected.toLowerCase().includes('dark')) return true;
  return false;
}

/**
 * Apply or remove .dark class on host element.
 * @param {HTMLElement} element - The custom element (this)
 * @param {boolean} isDark
 */
function applyDarkClass(element, isDark) {
  element.classList.toggle('dark', isDark);
}

/**
 * Fire a custom event (for hass-more-info, etc.).
 * @param {HTMLElement} element
 * @param {string} type - Event type
 * @param {Object} detail - Event detail payload
 */
function fireEvent(element, type, detail = {}) {
  element.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  }));
}

/**
 * Idempotent card registration with HA.
 * @param {string} tagName - Custom element tag (e.g. 'tunet-climate-card')
 * @param {Function} cardClass - The HTMLElement subclass
 * @param {Object} meta - { name, description, documentationURL? }
 */
function registerCard(tagName, cardClass, meta) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, cardClass);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.some(c => c.type === tagName)) {
    window.customCards.push({
      type: tagName,
      preview: true,
      ...meta,
    });
  }
}

/**
 * Console branding for card version logging.
 * @param {string} name - Display name (e.g. 'TUNET-CLIMATE')
 * @param {string} version - Version string
 * @param {string} color - Hex color for badge
 */
function logCardVersion(name, version, color = '#D4850A') {
  const lightBg = color + '20';
  console.info(
    `%c ${name} %c v${version} `,
    `color: #fff; background: ${color}; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `color: ${color}; background: ${lightBg}; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;`
  );
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


// ═══════════════════════════════════════════════════════════
// CARD: tunet_speaker_grid_card.js
// ═══════════════════════════════════════════════════════════

/**
 * Tunet Speaker Grid Card (v2 – ES Module)
 * Sonos speaker grid with per-speaker volume control and group management
 * Auto-detects speakers from binary_sensor.sonos_*_in_playing_group entities
 *
 * Horizontal tile layout: icon | name + song | vol% | vol-bar (bottom)
 *
 * Interactions:
 *   Tap        = toggle group membership
 *   Drag L/R   = volume control (200px = full range)
 *   Hold 500ms = open more-info dialog
 *
 * Version 3.1.0
 */

const CARD_VERSION = '3.1.0';

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    /* Steel Blue accent */
    --accent: #4682B4;
    --accent-fill: rgba(70,130,180,0.10);
    --accent-border: rgba(70,130,180,0.22);
    --accent-glow: rgba(70,130,180,0.45);
    --accent-vol-bar: rgba(70,130,180,0.80);

    /* Card-specific tile tokens */
    --tile-bg-off: rgba(28,28,30,0.04);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --divider: rgba(28,28,30,0.07);
    --r-pill: 999px;
    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    display: block;
  }
  :host(.dark) {
    --accent: #6BA3C7;
    --accent-fill: rgba(107,163,199,0.14);
    --accent-border: rgba(107,163,199,0.28);
    --accent-glow: rgba(107,163,199,0.50);
    --accent-vol-bar: rgba(107,163,199,0.85);

    --tile-bg-off: rgba(255,255,255,0.04);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.16);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
    --divider: rgba(255,255,255,0.06);
  }

  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Icon size helpers */
  .icon-20 { font-size: 20px; --ms-opsz: 20; }
  .icon-18 { font-size: 18px; --ms-opsz: 20; }

  /* ── Header ─────────────────────────────────────── */
  .grid-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease; min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }

  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all .2s ease; color: var(--text-muted);
  }

  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title {
    font-weight: 700; font-size: 13px; color: var(--text-sub);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px; font-weight: 600; color: var(--text-muted);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-spacer { flex: 1; }

  /* ── Speaker Grid ───────────────────────────────── */
  .spk-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
    gap: 10px;
    width: 100%; min-width: 0;
  }

  /* ═══════════════════════════════════════════════════
     HORIZONTAL SPEAKER TILE
     ═══════════════════════════════════════════════════ */
  .spk-tile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px 14px 10px;
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    border: 1px solid transparent;
    box-shadow: var(--tile-shadow-rest);
    cursor: pointer; user-select: none;
    touch-action: pan-y;
    min-height: 62px;
    min-width: 0;
    overflow: visible;
    transition:
      transform .2s var(--spring),
      box-shadow .2s ease,
      border-color .2s ease,
      background-color .3s ease;
  }

  /* Size presets via host attribute */
  :host([tile-size="compact"]) .spk-tile { padding: 8px 10px 12px 8px; min-height: 56px; gap: 8px; }
  :host([tile-size="large"]) .spk-tile { padding: 12px 14px 16px 12px; min-height: 68px; }

  .spk-tile:hover {
    box-shadow: var(--tile-shadow-lift);
    transform: translateY(-1px);
  }
  .spk-tile:active { transform: scale(.98); }
  .spk-tile:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  /* ── Icon circle (left) ──────────────────────── */
  .tile-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: all .2s ease;
  }
  :host([tile-size="compact"]) .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
  :host([tile-size="large"]) .tile-icon-wrap { width: 44px; height: 44px; }

  .tile-icon-wrap .icon {
    color: inherit;
    transition: color .15s ease;
  }

  /* ── Text stack (center) ─────────────────────── */
  .spk-text {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .spk-name {
    font-size: 13px; font-weight: 600; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-name { font-size: 12px; }

  .spk-meta {
    font-size: 11px; font-weight: 500; line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-meta { font-size: 10px; }

  /* ── Volume % (right) ────────────────────────── */
  .spk-vol {
    font-size: 14px; font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1px;
    flex-shrink: 0;
    min-width: 36px; text-align: right;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-vol { font-size: 13px; }

  /* ── Volume bar (bottom inset) ───────────────── */
  .vol-track {
    position: absolute;
    bottom: 6px; left: 10px; right: 10px;
    height: 3px;
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
  }
  .vol-fill {
    height: 100%;
    border-radius: var(--r-track);
    transition: width .15s ease-out;
  }

  /* ── Group dot (top-right corner) ────────────── */
  .group-dot {
    position: absolute;
    top: 8px; right: 8px;
    width: 8px; height: 8px;
    border-radius: 50%;
    display: none;
  }

  /* ── Floating Volume Pill (during drag) ──────── */
  .vol-pill {
    position: absolute; top: -4px; left: 50%;
    transform: translate(-50%, -100%);
    padding: 5px 14px; border-radius: var(--r-pill);
    background: var(--tile-bg);
    border: 1px solid var(--accent-border);
    box-shadow: var(--tile-shadow-lift);
    font-size: 14px; font-weight: 700; color: var(--accent);
    font-variant-numeric: tabular-nums;
    pointer-events: none; z-index: 101;
    opacity: 0; transition: opacity .12s ease;
    backdrop-filter: blur(12px);
  }

  /* ════════════════════════════════════════
     STATE: IDLE (not in group)
     ════════════════════════════════════════ */
  .spk-tile.idle .tile-icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
  }
  .spk-tile.idle .spk-name { color: var(--text-sub); }
  .spk-tile.idle .spk-meta { color: var(--text-muted); }
  .spk-tile.idle .spk-vol  { color: var(--text-muted); }
  .spk-tile.idle .vol-fill { background: var(--text-muted); opacity: 0.25; }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PLAYING
     ════════════════════════════════════════ */
  .spk-tile.in-group {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .spk-tile.in-group .spk-name { color: var(--text); }
  .spk-tile.in-group .spk-meta { color: var(--text-sub); }
  .spk-tile.in-group .spk-vol  { color: var(--accent); }
  .spk-tile.in-group .vol-fill { background: var(--accent-vol-bar); }
  .spk-tile.in-group .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
  }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PAUSED
     ════════════════════════════════════════ */
  .spk-tile.in-group.paused {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group.paused .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
    opacity: 0.55;
  }
  .spk-tile.in-group.paused .spk-meta { color: var(--text-muted); font-style: italic; }
  .spk-tile.in-group.paused .spk-vol  { color: var(--text-muted); }
  .spk-tile.in-group.paused .vol-fill { background: var(--accent-vol-bar); opacity: 0.30; }
  .spk-tile.in-group.paused .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
    opacity: 0.5;
  }

  /* ════════════════════════════════════════
     STATE: DRAGGING (volume adjust)
     ════════════════════════════════════════ */
  .spk-tile.dragging {
    transform: scale(1.03);
    box-shadow: var(--tile-shadow-lift);
    z-index: 100;
    border-color: var(--accent);
  }
  .spk-tile.dragging .vol-pill { opacity: 1; }

  /* ── Action Buttons ────────────────────────────── */
  .grid-actions {
    display: flex; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid var(--divider);
  }
  .action-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 12px; border-radius: 11px;
    border: none; background: transparent; font-family: inherit;
    font-size: 13px; font-weight: 600; color: var(--text-sub);
    cursor: pointer; transition: background .1s;
    user-select: none;
  }
  .action-btn:hover { background: var(--track-bg); color: var(--text); }
  .action-btn:active { transform: scale(.97); }
  .action-btn .icon { color: var(--accent); }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 440px) {
    .card { padding: 16px; --r-card: 20px; }
    .spk-grid {
      grid-template-columns: repeat(var(--cols-sm, 2), minmax(0, 1fr));
      gap: 8px;
    }
    .spk-tile { min-height: 56px; padding: 8px 10px 12px 8px; gap: 8px; }
    .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
    .spk-name { font-size: 12px; }
    .spk-meta { font-size: 10px; }
    .spk-vol { font-size: 13px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_SPEAKER_GRID_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════════════════════

const TUNET_SPEAKER_GRID_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card">

      <!-- Header -->
      <div class="grid-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon icon-18">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">Loading...</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
      </div>

      <!-- Speaker Grid -->
      <div class="spk-grid" id="spkGrid"></div>

      <!-- Group Actions -->
      <div class="grid-actions" id="gridActions" style="display:none">
        <button class="action-btn" id="groupAllBtn" aria-label="Group all speakers">
          <span class="icon icon-18">link</span> Group All
        </button>
        <button class="action-btn" id="ungroupBtn" aria-label="Ungroup all speakers">
          <span class="icon icon-18">link_off</span> Ungroup All
        </button>
      </div>

    </div>
  </div>
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetSpeakerGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._cachedSpeakers = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._tileRefs = new Map();

    // Drag state
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._volDebounce = null;

    // Long-press state
    this._longPressTimer = null;
    this._longPressFired = false;

    injectFonts();
  }

  /* ── Config ─────────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { filter: [{ domain: 'media_player' }] } },
        },
        { name: 'name', selector: { text: {} } },
        {
          name: 'coordinator_sensor',
          selector: { entity: { filter: [{ domain: 'sensor' }] } },
        },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns',     selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
            { name: 'tile_size',   selector: { select: { options: ['standard', 'compact', 'large'] } } },
          ],
        },
        { name: 'show_group_actions', selector: { boolean: {} } },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => ({
        entity:             'Media Player Entity',
        name:               'Card Name',
        coordinator_sensor: 'Coordinator Sensor',
        columns:            'Grid Columns',
        tile_size:          'Tile Size',
        show_group_actions: 'Show Group/Ungroup Buttons',
        custom_css:         'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .spk-grid, .spk-tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Speakers',
      coordinator_sensor: 'sensor.sonos_smart_coordinator',
      columns: 4,
      tile_size: 'standard',
      show_group_actions: true,
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a media_player entity');
    }

    const asFinite = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };
    const columns = Math.max(2, Math.min(8, Math.round(asFinite(config.columns, 4))));
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');

    this._config = {
      entity: config.entity,
      name: config.name || 'Speakers',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      columns,
      tile_size: tileSize,
      show_group_actions: config.show_group_actions !== false,
      custom_css: config.custom_css || '',
    };

    this.setAttribute('tile-size', tileSize);

    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildGrid();
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildGrid();
    }

    let changed = !oldHass;
    if (!changed) {
      const watchList = [this._config.entity, this._config.coordinator_sensor];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity));
      }
      for (const eid of watchList) {
        if (eid && oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    const speakers = this._cachedSpeakers || this._config.speakers || [];
    const cols = this._config.columns || 4;
    const rows = Math.max(1, Math.ceil(speakers.length / cols));
    return 1 + rows;
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._cooldownTimer);
  }

  /* ── Helpers ────────────────────────────────────── */

  _binarySensorFor(entityId) {
    const room = entityId.replace('media_player.', '');
    return `binary_sensor.sonos_${room}_in_playing_group`;
  }

  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService('script', name, data);
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_playing_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
            icon: 'speaker',
          });
        }
      }
    }
    return speakers;
  }

  /* ── Rendering ──────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SPEAKER_GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SPEAKER_GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {};
    const ids = ['card', 'infoTile', 'cardTitle', 'hdrSub', 'spkGrid', 'gridActions', 'groupAllBtn', 'ungroupBtn'];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  _setupListeners() {
    const $ = this.$;

    $.infoTile.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });

    $.groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_group_all_to_playing');
    });

    $.ungroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_ungroup_all');
    });
  }

  /* ── Build Speaker Grid ──────────────────────────── */

  _buildGrid() {
    const grid = this.$.spkGrid;
    if (!grid) return;
    grid.innerHTML = '';
    this._tileRefs.clear();

    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    const speakers = this._cachedSpeakers || [];
    const cols = this._config.columns;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cols-sm', Math.min(2, cols));

    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'spk-tile idle';
      tile.tabIndex = 0;
      tile.setAttribute('role', 'slider');
      tile.setAttribute('aria-label', spk.name || spk.entity);
      tile.setAttribute('aria-valuemin', '0');
      tile.setAttribute('aria-valuemax', '100');
      tile.setAttribute('aria-valuenow', '0');
      tile.dataset.entity = spk.entity;

      const dotEl = document.createElement('div');
      dotEl.className = 'group-dot';
      tile.appendChild(dotEl);

      const iconWrap = document.createElement('div');
      iconWrap.className = 'tile-icon-wrap';
      const icon = document.createElement('span');
      icon.className = 'icon icon-20';
      icon.textContent = spk.icon || 'speaker';
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);

      const textWrap = document.createElement('div');
      textWrap.className = 'spk-text';

      const nameEl = document.createElement('div');
      nameEl.className = 'spk-name';
      nameEl.textContent = spk.name || spk.entity;
      textWrap.appendChild(nameEl);

      const metaEl = document.createElement('div');
      metaEl.className = 'spk-meta';
      metaEl.textContent = 'Not grouped';
      textWrap.appendChild(metaEl);

      tile.appendChild(textWrap);

      const volEl = document.createElement('div');
      volEl.className = 'spk-vol';
      volEl.textContent = '--';
      tile.appendChild(volEl);

      const volTrack = document.createElement('div');
      volTrack.className = 'vol-track';
      const volFill = document.createElement('div');
      volFill.className = 'vol-fill';
      volFill.style.width = '0%';
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);

      const pill = document.createElement('div');
      pill.className = 'vol-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);

      tile.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });

      grid.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, iconWrap, nameEl, metaEl, volEl, volFill, dotEl, pill });
    }

    if (this.$.gridActions) {
      this.$.gridActions.style.display =
        (this._config.show_group_actions && speakers.length > 1) ? '' : 'none';
    }
  }

  /* ── Tile Pointer Handling ──────────────────────── */

  _onTilePointerDown(entity, e, tile) {
    this._dragEntity = entity;
    this._dragStartX = e.clientX;
    this._dragActive = false;
    this._longPressFired = false;

    const playerState = this._hass && this._hass.states[entity];
    this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;

    clearTimeout(this._longPressTimer);
    this._longPressTimer = setTimeout(() => {
      if (!this._dragActive && this._dragEntity === entity) {
        this._longPressFired = true;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: entity },
        }));
        this._dragEntity = null;
      }
    }, 500);
  }

  _onPointerMove(e) {
    if (!this._dragEntity) return;

    const dx = e.clientX - this._dragStartX;
    const THRESHOLD = 4;

    if (!this._dragActive) {
      if (Math.abs(dx) < THRESHOLD) return;
      this._dragActive = true;
      clearTimeout(this._longPressTimer);

      const refs = this._tileRefs.get(this._dragEntity);
      if (refs) refs.tile.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
    }

    const pct = Math.max(0, Math.min(100, this._dragVol + Math.round(dx / 2)));

    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volEl.textContent = pct + '%';
      refs.pill.textContent = pct + '%';
      refs.volFill.style.width = pct + '%';
      refs.tile.setAttribute('aria-valuenow', String(pct));
    }

    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._callService('media_player', 'volume_set', {
        entity_id: this._dragEntity,
        volume_level: pct / 100,
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
    }, 200);
  }

  _onPointerUp(e) {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);

    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);

    if (refs) {
      refs.tile.classList.remove('dragging');
    }
    document.body.style.cursor = '';

    if (!this._dragActive && !this._longPressFired) {
      this._callScript('sonos_toggle_group_membership', {
        target_speaker: entity,
      });
    }

    this._dragEntity = null;
    this._dragActive = false;
  }

  /* ── Full Update ────────────────────────────────── */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._serviceCooldown) return;

    const speakers = this._cachedSpeakers || [];
    $.cardTitle.textContent = this._config.name;

    let groupedCount = 0;
    for (const spk of speakers) {
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      if (bs && bs.state === 'on') groupedCount++;
    }

    $.hdrSub.textContent = `${speakers.length} speakers \u00b7 ${groupedCount} grouped`;

    const coordSensor = this._hass.states[this._config.coordinator_sensor];
    const mainEntity = this._hass.states[this._config.entity];
    const isPlaying = (mainEntity && mainEntity.state === 'playing') ||
                      (coordSensor && coordSensor.state && coordSensor.state !== 'idle' && coordSensor.state !== 'unknown');

    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      const inGroup = bs && bs.state === 'on';
      const playerState = this._hass.states[spk.entity];
      const speakerState = playerState ? playerState.state : 'idle';
      const isPaused = speakerState === 'paused';

      refs.tile.className = 'spk-tile';
      if (inGroup) {
        refs.tile.classList.add('in-group');
        if (isPaused) refs.tile.classList.add('paused');
      } else {
        refs.tile.classList.add('idle');
      }

      if (inGroup && playerState) {
        if (isPaused) {
          refs.metaEl.textContent = 'Paused';
        } else {
          const title = playerState.attributes.media_title || '';
          const artist = playerState.attributes.media_artist || '';
          if (title) {
            refs.metaEl.textContent = artist ? `${title} \u2013 ${artist}` : title;
          } else {
            refs.metaEl.textContent = speakerState === 'playing' ? 'Playing' : 'Idle';
          }
        }
      } else {
        refs.metaEl.textContent = 'Not grouped';
      }

      if (playerState && !this._dragActive) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + '%';
        refs.volFill.style.width = vol + '%';
        refs.tile.setAttribute('aria-valuenow', String(vol));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-speaker-grid-card', TunetSpeakerGridCard, {
  name: 'Tunet Speaker Grid Card',
  description: 'Sonos speaker grid with horizontal tiles, volume control, and group management',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-speaker-grid-card',
});

logCardVersion('TUNET-SPEAKER-GRID', CARD_VERSION, '#4682B4');


})();
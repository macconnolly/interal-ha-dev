/**
 * tunet_weather_card.js — Bundled standalone build
 * Generated: 2026-02-25T05:37:39.059Z
 * Source: v2/tunet_weather_card.js + v2/tunet_base.js
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
// CARD: tunet_weather_card.js
// ═══════════════════════════════════════════════════════════

/**
 * Tunet Weather Card (v2 – ES Module)
 * Current conditions + forecast with glassmorphism design
 * Version 1.4.0
 */

const CARD_VERSION = '1.4.0';

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    display: block;
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Header */
  .hdr {
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--blue-border);
    background: var(--blue-fill); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    color: var(--blue);
  }
  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title { font-weight: 700; font-size: 13px; color: var(--text-sub); letter-spacing: .1px; line-height: 1.15; }
  .hdr-sub { font-size: 10.5px; font-weight: 600; color: var(--text-muted); letter-spacing: .1px; line-height: 1.15; }
  .hdr-spacer { flex: 1; }

  /* Weather body */
  .weather-body { display: flex; flex-direction: column; gap: 14px; }
  .weather-main { display: flex; align-items: flex-start; gap: 20px; padding: 0 4px; }
  .weather-current { display: flex; flex-direction: column; gap: 2px; }
  .weather-temp {
    font-size: 42px; font-weight: 700; line-height: 1; letter-spacing: -1.5px;
    font-variant-numeric: tabular-nums; color: var(--text);
  }
  .deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }
  .weather-desc { font-size: 13px; font-weight: 600; color: var(--text-sub); margin-top: 4px; }

  .weather-details { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; }
  .weather-detail { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-sub); }
  .weather-detail .icon { color: var(--blue); font-size: 16px; width: 16px; height: 16px; }
  .weather-detail .val { font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }

  /* Forecast */
  .weather-forecast { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .forecast-tile {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 10px 4px 8px; border-radius: 12px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all .15s;
  }
  .forecast-tile:first-child { background: var(--blue-fill); border-color: var(--blue-border); }
  .forecast-day {
    font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase;
    color: var(--text-muted);
  }
  .forecast-tile:first-child .forecast-day { color: var(--blue); }
  .forecast-icon { color: var(--text-sub); }
  .forecast-tile:first-child .forecast-icon { color: var(--blue); }
  .forecast-temps { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .forecast-hi { font-size: 13px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .forecast-lo { font-size: 11px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .weather-forecast { grid-template-columns: repeat(3, 1fr); }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_WEATHER_STYLES = `
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
// Data maps
// ═══════════════════════════════════════════════════════════

const CONDITION_ICONS = {
  'clear-night': 'bedtime',
  'cloudy': 'cloud',
  'exceptional': 'warning',
  'fog': 'foggy',
  'hail': 'weather_hail',
  'lightning': 'thunderstorm',
  'lightning-rainy': 'thunderstorm',
  'partlycloudy': 'partly_cloudy_day',
  'pouring': 'rainy',
  'rainy': 'rainy',
  'snowy': 'weather_snowy',
  'snowy-rainy': 'weather_snowy',
  'sunny': 'sunny',
  'windy': 'air',
  'windy-variant': 'air',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._forecast = [];
    this._forecastUnsub = null;
    injectFonts();
  }

  disconnectedCallback() {
    this._unsubForecast();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'weather' }] } } },
        { name: 'name', selector: { text: {} } },
        { name: 'forecast_days', selector: { number: { min: 1, max: 7, step: 1, mode: 'box' } } },
        { name: 'show_last_updated', selector: { boolean: {} } },
      ],
      computeLabel: (s) => {
        const labels = {
          entity: 'Weather Entity',
          name: 'Card Name',
          forecast_days: 'Forecast Days',
          show_last_updated: 'Show Last Updated',
        };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return { entity: '', name: 'Weather' };
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Please define a weather entity');
    this._config = {
      entity: config.entity,
      name: config.name || 'Weather',
      forecast_days: config.forecast_days || 5,
      show_last_updated: config.show_last_updated !== false,
    };
    if (this._rendered) this._updateAll();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    const entity = this._config.entity;

    if (!oldHass || (entity && (!this._forecastUnsub || this._subscribedEntity !== entity))) {
      this._subscribedEntity = entity;
      this._subscribeForecast();
    }

    if (!oldHass || (entity && oldHass.states[entity] !== hass.states[entity])) {
      this._updateAll();
    }
  }

  getCardSize() {
    const hasForecast = this._config.forecast_days > 0;
    return hasForecast ? 5 : 3;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_WEATHER_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card">
          <div class="hdr">
            <div class="info-tile" id="infoTile">
              <div class="entity-icon"><span class="icon filled" style="font-size:18px" id="condIcon">cloud</span></div>
              <div class="hdr-text">
                <span class="hdr-title" id="cardTitle">Weather</span>
                <span class="hdr-sub" id="hdrSub"></span>
              </div>
            </div>
            <div class="hdr-spacer"></div>
          </div>
          <div class="weather-body">
            <div class="weather-main">
              <div class="weather-current">
                <span class="weather-temp" id="curTemp">--<span class="deg">&deg;</span></span>
                <span class="weather-desc" id="condDesc">--</span>
              </div>
              <div class="weather-details" id="details"></div>
            </div>
            <div class="weather-forecast" id="forecast"></div>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      infoTile: this.shadowRoot.getElementById('infoTile'),
      condIcon: this.shadowRoot.getElementById('condIcon'),
      cardTitle: this.shadowRoot.getElementById('cardTitle'),
      hdrSub: this.shadowRoot.getElementById('hdrSub'),
      curTemp: this.shadowRoot.getElementById('curTemp'),
      condDesc: this.shadowRoot.getElementById('condDesc'),
      details: this.shadowRoot.getElementById('details'),
      forecast: this.shadowRoot.getElementById('forecast'),
    };

    this.$.infoTile.addEventListener('click', () => {
      if (!this._hass || !this._config.entity) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });
  }

  _unsubForecast() {
    if (this._forecastUnsub) {
      this._forecastUnsub();
      this._forecastUnsub = null;
    }
  }

  async _subscribeForecast() {
    if (!this._hass || !this._config.entity) return;

    this._unsubForecast();

    try {
      this._forecastUnsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (msg.forecast && Array.isArray(msg.forecast)) {
            this._forecast = msg.forecast;
            this._renderForecast();
          }
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: this._config.entity,
        }
      );
    } catch {
      try {
        const result = await this._hass.callService('weather', 'get_forecasts', {
          type: 'daily',
        }, { entity_id: this._config.entity }, false, true);

        const forecast = result?.response?.[this._config.entity]?.forecast
          || result?.[this._config.entity]?.forecast;
        if (Array.isArray(forecast) && forecast.length > 0) {
          this._forecast = forecast;
          this._renderForecast();
          return;
        }
      } catch (_) {}

      try {
        const entity = this._hass.states[this._config.entity];
        if (entity && entity.attributes.forecast) {
          this._forecast = entity.attributes.forecast;
          this._renderForecast();
        }
      } catch (_) {}
    }
  }

  _updateAll() {
    if (!this.$ || !this._hass) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;

    const a = entity.attributes;
    const condition = entity.state;

    this.$.cardTitle.textContent = this._config.name;
    this.$.condIcon.textContent = CONDITION_ICONS[condition] || 'cloud';

    const temp = a.temperature != null ? Math.round(a.temperature) : '--';
    this.$.curTemp.innerHTML = `${temp}<span class="deg">&deg;</span>`;

    const condNames = {
      'clear-night': 'Clear Night', 'cloudy': 'Cloudy', 'fog': 'Foggy',
      'hail': 'Hail', 'lightning': 'Thunderstorm', 'lightning-rainy': 'Thunderstorm',
      'partlycloudy': 'Partly Cloudy', 'pouring': 'Heavy Rain', 'rainy': 'Rainy',
      'snowy': 'Snowy', 'snowy-rainy': 'Sleet', 'sunny': 'Sunny',
      'windy': 'Windy', 'windy-variant': 'Windy', 'exceptional': 'Exceptional',
    };
    this.$.condDesc.textContent = condNames[condition] || condition;

    const lastUpdate = entity.last_updated;
    if (this._config.show_last_updated && lastUpdate) {
      const mins = Math.round((Date.now() - new Date(lastUpdate).getTime()) / 60000);
      this.$.hdrSub.textContent = mins < 1 ? 'Just updated' : `Updated ${mins} min ago`;
    } else {
      this.$.hdrSub.textContent = '';
    }

    const details = [];
    if (a.wind_speed != null) {
      const dir = a.wind_bearing != null ? this._windDir(a.wind_bearing) : '';
      details.push({ icon: 'air', label: 'Wind', value: `${Math.round(a.wind_speed)} mph ${dir}`.trim() });
    }
    if (a.humidity != null) {
      details.push({ icon: 'water_drop', label: 'Humidity', value: `${Math.round(a.humidity)}%` });
    }
    if (a.uv_index != null) {
      details.push({ icon: 'wb_sunny', label: 'UV', value: String(Math.round(a.uv_index)) });
    }
    if (a.pressure != null) {
      details.push({ icon: 'speed', label: 'Pressure', value: `${Math.round(a.pressure)} hPa` });
    }

    this.$.details.innerHTML = details.map(d =>
      `<div class="weather-detail">
        <span class="icon">${d.icon}</span>
        ${d.label} <span class="val">${d.value}</span>
      </div>`
    ).join('');

    if (this._forecast.length) this._renderForecast();
  }

  _renderForecast() {
    if (!this.$ || !this._forecast.length) return;

    const days = this._forecast.slice(0, this._config.forecast_days);
    this.$.forecast.innerHTML = days.map((fc, i) => {
      const dt = new Date(fc.datetime);
      const dayName = i === 0 ? 'Now' : DAY_NAMES[dt.getDay()];
      const icon = CONDITION_ICONS[fc.condition] || 'cloud';
      const hi = fc.temperature != null ? Math.round(fc.temperature) : '--';
      const lo = fc.templow != null ? Math.round(fc.templow) : null;

      return `
        <div class="forecast-tile">
          <span class="forecast-day">${dayName}</span>
          <span class="icon forecast-icon" style="font-size:20px">${icon}</span>
          <div class="forecast-temps">
            <span class="forecast-hi">${hi}&deg;</span>
            ${lo != null ? `<span class="forecast-lo">${lo}&deg;</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  _windDir(bearing) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(bearing / 22.5) % 16];
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-weather-card', TunetWeatherCard, {
  name: 'Tunet Weather Card',
  description: 'Weather conditions and forecast with glassmorphism design',
  preview: true,
});

logCardVersion('TUNET-WEATHER', CARD_VERSION, '#007AFF');


})();
/**
 * tunet_rooms_card.js — Bundled standalone build
 * Generated: 2026-02-25T05:37:39.054Z
 * Source: v2/tunet_rooms_card.js + v2/tunet_base.js
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
// CARD: tunet_rooms_card.js
// ═══════════════════════════════════════════════════════════

/**
 * Tunet Rooms Card (v2 – ES Module)
 * Custom Home Assistant card with glassmorphism design
 * Room overview capsules with per-room light group orbs
 * Version 2.2.0
 */

const CARD_VERSION = '2.2.0';

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'lamp',
  table_lamp: 'lamp',
  light_group: 'lightbulb',
};

const ROOM_ICON_FALLBACKS = new Set([
  'home', 'weekend', 'kitchen', 'restaurant', 'bed', 'desk', 'desktop_windows',
  'lightbulb', 'light', 'lamp', 'highlight', 'view_column', 'nightlight', 'shelves',
  'chevron_right',
]);

function normalizeIcon(icon) {
  if (!icon) return 'lightbulb';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
  if (ROOM_ICON_FALLBACKS.has(resolved)) return resolved;
  return resolved;
}

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

/** Overrides on top of base section surface */
const CARD_OVERRIDES = `
  :host { display: block; }
  .section-container {
    position: relative;
    gap: 16px;
    width: 100%;
    box-shadow: var(--section-shadow), var(--inset);
  }

  /* Section glass stroke */
  .section-container::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-section); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40), rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* -- Section Header -- */
  .section-hdr {
    display: flex; align-items: center; padding: 0 4px;
  }
  .section-title {
    font-size: 17px; font-weight: 700; letter-spacing: -0.2px;
    color: var(--text);
  }
  .section-spacer { flex: 1; }
  .section-action {
    font-size: 13px; font-weight: 600; color: var(--text-muted);
    cursor: pointer; transition: color 0.15s;
    background: none; border: none; font-family: inherit;
    display: flex; align-items: center; gap: 2px;
  }
  .section-action:hover { color: var(--text-sub); }

  /* -- Room List -- */
  .room-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  /* -- Room Capsule -- */
  .room-card {
    min-height: 108px; border-radius: var(--r-card);
    background: var(--glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08), var(--inset);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    align-items: center;
    padding: 10px 14px;
    row-gap: 8px;
    column-gap: 12px;
    cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden;
  }
  .room-card::before {
    content: ""; position: absolute; inset: 0; border-radius: var(--r-card); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .room-card::before {
    background: linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }
  .room-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), var(--inset); }
  .room-card.active { border-color: var(--amber-border); }

  .room-icon {
    width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
    flex-shrink: 0; transition: all 0.2s; border: 1px solid transparent;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }
  .room-card:not(.active) .room-icon { background: var(--gray-ghost); color: var(--text-muted); }
  .room-card.active .room-icon { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-card.active .room-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .room-info {
    min-width: 0;
    grid-column: 2;
    grid-row: 1;
  }
  .room-name { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .room-status {
    font-size: 11.5px; font-weight: 600; color: var(--text-muted); line-height: 1.2; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-status .amber-txt { color: var(--amber); }

  .room-controls {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
  }
  .room-sub-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  /* -- Light Group Orbs -- */
  .room-orb {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
    flex-shrink: 0; cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    background: var(--gray-ghost); color: var(--text-muted);
    padding: 0;
    font: inherit;
  }
  .room-orb:hover { background: var(--track-bg); }
  .room-orb:active { transform: scale(0.92); }
  .room-orb.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-orb.on .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .room-orb.expanded {
    border-color: var(--amber-border);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    transform: scale(1.03);
  }

  .room-slider-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--track-bg);
    box-shadow: var(--inset);
  }
  .room-slider-wrap.hidden { display: none; }
  .room-slider-wrap .icon {
    color: var(--amber);
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
  .room-slider {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: var(--track-bg);
    outline: none;
  }
  .room-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--amber-border);
    background: var(--amber);
    box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .room-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--amber-border);
    background: var(--amber);
    box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .room-slider-val {
    min-width: 34px;
    text-align: right;
    font-size: 11px;
    font-weight: 700;
    color: var(--amber);
    font-variant-numeric: tabular-nums;
  }

  .room-chevron {
    color: var(--text-muted);
    flex-shrink: 0;
    cursor: pointer;
    grid-column: 3;
    grid-row: 1;
  }

  @media (max-width: 760px) {
    .room-list { grid-template-columns: 1fr; }
  }
  @media (max-width: 440px) {
    .room-card { padding: 10px; min-height: 102px; row-gap: 6px; column-gap: 8px; }
    .room-icon { width: 38px; height: 38px; }
    .room-orb { width: 30px; height: 30px; }
    .room-slider-wrap { padding: 5px 7px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_ROOMS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${SECTION_SURFACE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════════════════════

const ROOMS_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">Rooms</span>
        <div class="section-spacer"></div>
      </div>
      <div class="room-list" id="roomList"></div>
    </div>
  </div>
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetRoomsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._serviceCooldown = {};
    this._cooldownTimers = {};
    injectFonts();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'rooms', selector: { object: {} } },
        { name: 'enable_sub_buttons', selector: { boolean: {} } },
        { name: 'sub_slider_timeout_ms', selector: { number: { min: 1200, max: 8000, step: 100, mode: 'box' } } },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          rooms: 'Rooms Config',
          enable_sub_buttons: 'Enable Sub-Button Sliders',
          sub_slider_timeout_ms: 'Sub-Slider Auto-Close (ms)',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Rooms',
      enable_sub_buttons: true,
      sub_slider_timeout_ms: 3200,
      rooms: [
        {
          name: 'Living Room',
          icon: 'weekend',
          lights: [
            { entity: 'light.living_room', icon: 'lightbulb', name: 'Main' },
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config.rooms || !Array.isArray(config.rooms) || config.rooms.length === 0) {
      throw new Error('Please define at least one room');
    }
    const timeoutMsRaw = Number(config.sub_slider_timeout_ms);
    const timeoutMs = Number.isFinite(timeoutMsRaw)
      ? Math.max(1200, Math.min(8000, Math.round(timeoutMsRaw)))
      : 3200;
    this._config = {
      name: config.name || 'Rooms',
      enable_sub_buttons: config.enable_sub_buttons !== false,
      sub_slider_timeout_ms: timeoutMs,
      rooms: config.rooms.map((room) => ({
        name: room.name || 'Room',
        icon: normalizeIcon(room.icon || 'home'),
        temperature_entity: room.temperature_entity || '',
        navigate_path: room.navigate_path || '',
        lights: (room.lights || []).map((light) => ({
          entity: light.entity || '',
          icon: normalizeIcon(light.icon || 'lightbulb'),
          name: light.name || '',
          sub_button: light.sub_button !== false,
        })),
      })),
    };
    if (this._rendered) {
      this._buildRooms();
      this._updateAll();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildRooms();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    if (!oldHass || this._entitiesChanged(oldHass, hass)) this._updateAll();
  }

  _entitiesChanged(o, n) {
    for (const room of this._config.rooms) {
      for (const light of (room.lights || [])) {
        if (light.entity && o.states[light.entity] !== n.states[light.entity]) return true;
      }
      if (room.temperature_entity && o.states[room.temperature_entity] !== n.states[room.temperature_entity]) return true;
    }
    return false;
  }

  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    const rows = Math.ceil(roomCount / 2);
    return Math.max(2, rows * 3);
  }
  connectedCallback() {}
  disconnectedCallback() {
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    if (Array.isArray(this._roomRefs)) {
      for (const ref of this._roomRefs) {
        clearTimeout(ref && ref.sliderTimer);
      }
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOMS_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomList: this.shadowRoot.getElementById('roomList'),
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
    };
  }

  _setEntityCooldown(entityId) {
    this._serviceCooldown[entityId] = true;
    clearTimeout(this._cooldownTimers[entityId]);
    this._cooldownTimers[entityId] = setTimeout(() => {
      this._serviceCooldown[entityId] = false;
    }, 1500);
  }

  _supportsBrightness(entity) {
    if (!entity || entity.state === 'unavailable') return false;
    if (entity.attributes && entity.attributes.brightness != null) return true;
    const modes = entity.attributes && entity.attributes.supported_color_modes;
    if (!Array.isArray(modes)) return false;
    return !modes.includes('onoff');
  }

  _brightnessPct(entity) {
    if (!entity || entity.state !== 'on') return 0;
    const b = entity.attributes && entity.attributes.brightness;
    if (b == null) return 100;
    return Math.max(1, Math.min(100, Math.round((Number(b) / 255) * 100)));
  }

  _closeSubSlider(ref) {
    if (!ref || !ref.sliderWrap) return;
    clearTimeout(ref.sliderTimer);
    ref.sliderTimer = null;
    ref.sliderEntity = '';
    ref.sliderWrap.classList.add('hidden');
    ref.sliderInput.dataset.entity = '';
    ref.sliderValue.textContent = '--';
    for (const orb of ref.orbEls) orb.classList.remove('expanded');
  }

  _openSubSlider(ref, entityId) {
    if (!this._config.enable_sub_buttons) return false;
    const entity = this._hass && this._hass.states[entityId];
    if (!this._supportsBrightness(entity)) return false;

    if (ref.sliderEntity === entityId && !ref.sliderWrap.classList.contains('hidden')) {
      this._closeSubSlider(ref);
      return true;
    }

    ref.sliderEntity = entityId;
    ref.sliderWrap.classList.remove('hidden');
    ref.sliderInput.dataset.entity = entityId;
    const pct = this._brightnessPct(entity);
    ref.sliderInput.value = String(pct);
    ref.sliderValue.textContent = `${pct}%`;
    for (const orb of ref.orbEls) {
      orb.classList.toggle('expanded', orb.dataset.entity === entityId);
    }

    clearTimeout(ref.sliderTimer);
    ref.sliderTimer = setTimeout(() => this._closeSubSlider(ref), this._config.sub_slider_timeout_ms || 3200);
    return true;
  }

  _setRoomLightBrightness(ref, entityId, pct) {
    if (!this._hass || !entityId) return;
    const clamped = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    this._setEntityCooldown(entityId);
    const payload = clamped <= 0
      ? this._hass.callService('light', 'turn_off', { entity_id: entityId })
      : this._hass.callService('light', 'turn_on', { entity_id: entityId, brightness_pct: clamped });
    if (payload && typeof payload.catch === 'function') {
      payload.catch(() => this._updateAll());
    }
    if (ref && ref.sliderValue) {
      ref.sliderValue.textContent = clamped <= 0 ? 'Off' : `${clamped}%`;
      clearTimeout(ref.sliderTimer);
      ref.sliderTimer = setTimeout(() => this._closeSubSlider(ref), this._config.sub_slider_timeout_ms || 3200);
    }
  }

  _toggleRoomLight(ref, entityId, orb) {
    if (!this._hass || !entityId) return;
    const before = orb.classList.contains('on');
    orb.classList.toggle('on', !before);
    const maybePromise = this._hass.callService('light', 'toggle', { entity_id: entityId });
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {
        orb.classList.toggle('on', before);
        this._updateAll();
      });
    }
    this._setEntityCooldown(entityId);
  }

  _toggleRoomGroup(ref) {
    if (!this._hass || !ref || !ref.cfg) return;
    const entityIds = (ref.cfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entityIds.length) return;

    let anyOn = false;
    for (const entityId of entityIds) {
      const state = this._hass.states[entityId];
      if (state && state.state === 'on') {
        anyOn = true;
        break;
      }
    }

    const domain = 'light';
    const service = anyOn ? 'turn_off' : 'turn_on';
    for (const entityId of entityIds) {
      this._setEntityCooldown(entityId);
    }
    const result = this._hass.callService(domain, service, { entity_id: entityIds });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
  }

  _buildRooms() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const list = this.$.roomList;
    if (Array.isArray(this._roomRefs)) {
      for (const ref of this._roomRefs) clearTimeout(ref && ref.sliderTimer);
    }
    list.innerHTML = '';
    this._roomRefs = [];

    this._config.rooms.forEach((roomCfg, roomIndex) => {
      const card = document.createElement('div');
      card.className = 'room-card';

      let orbsHtml = '';
      for (const light of (roomCfg.lights || [])) {
        if (!light.entity) continue;
        orbsHtml += `
          <button class="room-orb" type="button" data-entity="${light.entity}" title="${light.name || ''}">
            <span class="icon" style="font-size:16px">${normalizeIcon(light.icon || 'lightbulb')}</span>
          </button>
        `;
      }

      card.innerHTML = `
        <button class="room-icon" type="button" aria-label="Toggle ${roomCfg.name || 'room'} lights">
          <span class="icon" style="font-size:24px">${normalizeIcon(roomCfg.icon || 'home')}</span>
        </button>
        <div class="room-info">
          <div class="room-name">${roomCfg.name || 'Room'}</div>
          <div class="room-status">--</div>
        </div>
        <span class="icon room-chevron" style="font-size:18px">chevron_right</span>
        <div class="room-controls">
          <div class="room-sub-controls">${orbsHtml}</div>
          <div class="room-slider-wrap hidden" id="room-slider-wrap-${roomIndex}">
            <span class="icon">tune</span>
            <input class="room-slider" type="range" min="0" max="100" step="1" value="50" data-entity="">
            <span class="room-slider-val">--</span>
          </div>
        </div>
      `;

      const statusEl = card.querySelector('.room-status');
      const orbEls = Array.from(card.querySelectorAll('.room-orb'));
      const sliderWrap = card.querySelector(`#room-slider-wrap-${roomIndex}`);
      const sliderInput = sliderWrap.querySelector('.room-slider');
      const sliderValue = sliderWrap.querySelector('.room-slider-val');
      const roomIcon = card.querySelector('.room-icon');

      const ref = {
        el: card,
        cfg: roomCfg,
        statusEl,
        orbEls,
        sliderWrap,
        sliderInput,
        sliderValue,
        sliderEntity: '',
        sliderTimer: null,
      };

      roomIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleRoomGroup(ref);
      });

      orbEls.forEach((orb) => {
        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          const entityId = orb.dataset.entity;
          if (!entityId || !this._hass) return;
          const entity = this._hass.states[entityId];
          const lightCfg = (roomCfg.lights || []).find((l) => l.entity === entityId);
          const allowSub = this._config.enable_sub_buttons && (!lightCfg || lightCfg.sub_button !== false);
          if (allowSub && this._openSubSlider(ref, entityId)) return;
          if (entity && entity.state === 'unavailable') return;
          this._toggleRoomLight(ref, entityId, orb);
        });
      });

      sliderInput.addEventListener('input', (e) => {
        const entityId = sliderInput.dataset.entity;
        if (!entityId) return;
        const pct = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        sliderValue.textContent = pct <= 0 ? 'Off' : `${pct}%`;
      });
      sliderInput.addEventListener('pointerdown', (e) => e.stopPropagation());
      sliderWrap.addEventListener('click', (e) => e.stopPropagation());

      sliderInput.addEventListener('change', (e) => {
        const entityId = sliderInput.dataset.entity;
        if (!entityId) return;
        const pct = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        this._setRoomLightBrightness(ref, entityId, pct);
      });

      card.addEventListener('click', () => {
        if (roomCfg.navigate_path) {
          history.pushState(null, '', roomCfg.navigate_path);
          const event = new Event('location-changed');
          window.dispatchEvent(event);
        } else if ((roomCfg.lights || []).length && roomCfg.lights[0].entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: roomCfg.lights[0].entity },
          }));
        }
      });

      list.appendChild(card);
      this._roomRefs.push(ref);
    });
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    for (const ref of this._roomRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;
      let totalBright = 0;
      let brightCount = 0;

      // Update orbs
      ref.orbEls.forEach((orb, i) => {
        const light = lights[i];
        if (!light || !light.entity) return;

        const entity = this._hass.states[light.entity];
        if (!entity || entity.state === 'unavailable') {
          orb.classList.remove('on');
          orb.disabled = true;
          if (ref.sliderEntity === light.entity) this._closeSubSlider(ref);
          return;
        }

        orb.disabled = false;
        const isOn = entity && entity.state === 'on';
        if (!this._serviceCooldown[light.entity]) {
          orb.classList.toggle('on', isOn);
        }

        if (isOn) {
          onCount++;
          const b = entity.attributes.brightness;
          if (b != null) {
            totalBright += Math.round((b / 255) * 100);
            brightCount++;
          }
        }

        orb.dataset.dimmable = this._supportsBrightness(entity) ? 'true' : 'false';
      });

      // Room active state
      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);

      if (ref.sliderEntity) {
        const sliderEntity = this._hass.states[ref.sliderEntity];
        if (!sliderEntity || sliderEntity.state === 'unavailable') {
          this._closeSubSlider(ref);
        } else {
          const pct = this._brightnessPct(sliderEntity);
          ref.sliderInput.value = String(pct);
          ref.sliderValue.textContent = sliderEntity.state === 'on' ? `${pct}%` : 'Off';
        }
      }

      // Status text
      let statusParts = [];
      if (anyOn) {
        if (onCount === lights.length) {
          statusParts.push('<span class="amber-txt">On</span>');
        } else {
          statusParts.push(`<span class="amber-txt">${onCount} of ${lights.length} on</span>`);
        }
        if (brightCount > 0) {
          statusParts.push(Math.round(totalBright / brightCount) + '%');
        }
      } else {
        statusParts.push('All off');
      }

      // Temperature
      if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state) {
          const unit = tempEntity.attributes.unit_of_measurement || '°F';
          statusParts.push(Math.round(Number(tempEntity.state)) + unit);
        }
      }

      ref.statusEl.innerHTML = statusParts.join(' \u00b7 ');
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-rooms-card', TunetRoomsCard, {
  name: 'Tunet Rooms Card',
  description: 'Glassmorphism room overview with per-room light group orbs',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-rooms-card',
});

logCardVersion('TUNET-ROOMS', CARD_VERSION, '#D4850A');


})();
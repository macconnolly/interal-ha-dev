/**
 * tunet_sensor_card.js — Bundled standalone build
 * Generated: 2026-02-25T05:37:39.055Z
 * Source: v2/tunet_sensor_card.js + v2/tunet_base.js
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
// CARD: tunet_sensor_card.js
// ═══════════════════════════════════════════════════════════

/**
 * Tunet Sensor Card v1.1.0
 * ──────────────────────────────────────────────────────────────
 * Dedicated environment sensor detail panel:
 *   Section-container wrapper  ·  Row-based sensor readings
 *   Trend indicators (rising/falling/stable)  ·  Min/max range
 *   Threshold-based accent switching  ·  Dirty-diff updates
 *   HA entity integration  ·  Configurable sensor rows
 *
 * v1.1.0 – Migrated to tunet_base.js shared module
 * ──────────────────────────────────────────────────────────────
 */

const CARD_VERSION = '1.1.0';

/* ═══════════════════════════════════════════════════════════════
   CSS — Card-specific overrides + unique styles
   ═══════════════════════════════════════════════════════════════ */

const CARD_OVERRIDES = `
  /* Card-specific token additions */
  :host {
    --r-icon: 16px;
    display: block;
  }

  /* Section container overrides */
  .section-container {
    gap: 16px;
    width: 100%;
  }

  /* Section glass stroke (sensor card variant) */
  .section-container::before {
    content: "";
    position: absolute; inset: 0;
    border-radius: var(--r-section);
    padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40),
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }
`;

const CARD_STYLES = `
  /* ── Icon size utilities ────────────────────────── */
  .icon-20 { font-size: 20px; }
  .icon-18 { font-size: 18px; }
  .icon-16 { font-size: 16px; }
  .icon-14 { font-size: 14px; }

  /* ── Section Header ────────────────────────────── */
  .section-hdr {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }
  .section-title {
    font-size: 15px; font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .section-title .icon {
    font-size: 20px;
  }
  .section-spacer { flex: 1; }
  .section-action {
    font-size: 12px; font-weight: 600;
    color: var(--text-sub); cursor: pointer;
    padding: 6px 12px; border-radius: var(--r-pill);
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 4px;
  }
  .section-action:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .section-action:active { transform: scale(0.97); }

  /* ═══════════════════════════════════════════════
     SENSOR ROWS
     ═══════════════════════════════════════════════ */
  .sensor-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .sensor-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: var(--r-icon);
    position: relative;
  }
  .sensor-row:hover {
    background: var(--gray-ghost);
  }
  .sensor-row:active {
    transform: scale(0.99);
  }
  .sensor-row:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .sensor-row[data-interaction="none"] { cursor: default; }
  .sensor-row[data-interaction="none"]:hover { background: transparent; }
  .sensor-row[data-interaction="none"]:active { transform: none; }

  /* Divider between rows */
  .sensor-row + .sensor-row::before {
    content: "";
    position: absolute;
    top: 0; left: 48px; right: 4px;
    height: 1px;
    background: var(--divider);
  }

  /* ── Icon Wrap ─────────────────────────────────── */
  .sensor-icon {
    width: 36px; height: 36px;
    border-radius: var(--r-icon);
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .sensor-icon .icon {
    font-size: 20px;
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Accent icon backgrounds */
  .sensor-row[data-accent="amber"] .sensor-icon { background: var(--amber-fill); color: var(--amber); }
  .sensor-row[data-accent="blue"] .sensor-icon { background: var(--blue-fill); color: var(--blue); }
  .sensor-row[data-accent="green"] .sensor-icon { background: var(--green-fill); color: var(--green); }
  .sensor-row[data-accent="red"] .sensor-icon { background: var(--red-fill); color: var(--red); }
  .sensor-row[data-accent="purple"] .sensor-icon { background: var(--purple-fill); color: var(--purple); }
  .sensor-row[data-accent="muted"] .sensor-icon { background: var(--track-bg); color: var(--text-muted); }

  /* Threshold overrides */
  .sensor-row[data-style="warning"] .sensor-icon { background: var(--amber-fill); color: var(--amber); }
  .sensor-row[data-style="warning"] .sensor-val { color: var(--amber); }
  .sensor-row[data-style="error"] .sensor-icon { background: var(--red-fill); color: var(--red); }
  .sensor-row[data-style="error"] .sensor-val { color: var(--red); }
  .sensor-row[data-style="success"] .sensor-icon { background: var(--green-fill); color: var(--green); }
  .sensor-row[data-style="success"] .sensor-val { color: var(--green); }
  .sensor-row[data-style="info"] .sensor-icon { background: var(--blue-fill); color: var(--blue); }
  .sensor-row[data-style="info"] .sensor-val { color: var(--blue); }

  /* ── Sensor Info (label + sublabel) ────────────── */
  .sensor-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .sensor-label {
    font-size: 13px; font-weight: 600;
    color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sensor-sub {
    font-size: 11px; font-weight: 500;
    color: var(--text-muted); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 4px;
  }
  .sensor-sub .range-sep {
    opacity: 0.5;
  }

  /* ── Value + Unit ──────────────────────────────── */
  .sensor-val-wrap {
    display: flex; align-items: baseline; gap: 2px;
    flex-shrink: 0;
  }
  .sensor-val {
    font-size: 20px; font-weight: 700;
    letter-spacing: -0.3px; line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }
  .sensor-unit {
    font-size: 11px; font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.2px;
  }

  /* ── Trend Arrow ───────────────────────────────── */
  .sensor-trend {
    width: 20px; height: 20px;
    display: grid; place-items: center;
    flex-shrink: 0;
    margin-left: 2px;
  }
  .sensor-trend .icon {
    font-size: 16px;
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
    transition: color 0.2s, transform 0.2s;
  }
  .sensor-trend[data-trend="rising"] .icon { color: var(--red); transform: rotate(0deg); }
  .sensor-trend[data-trend="falling"] .icon { color: var(--blue); transform: rotate(180deg); }
  .sensor-trend[data-trend="stable"] .icon { color: var(--text-muted); transform: rotate(90deg); }

  /* ── Sparkline (optional inline mini-chart) ───── */
  .sensor-spark {
    width: 48px; height: 24px;
    flex-shrink: 0;
    margin-left: auto;
  }
  .sensor-spark svg {
    width: 100%; height: 100%;
    overflow: visible;
  }
  .spark-line {
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sensor-row[data-accent="amber"] .spark-line { stroke: var(--amber); }
  .sensor-row[data-accent="blue"] .spark-line { stroke: var(--blue); }
  .sensor-row[data-accent="green"] .spark-line { stroke: var(--green); }
  .sensor-row[data-accent="red"] .spark-line { stroke: var(--red); }
  .sensor-row[data-accent="purple"] .spark-line { stroke: var(--purple); }
  .sensor-row[data-accent="muted"] .spark-line { stroke: var(--text-muted); }
  /* Threshold override on sparkline */
  .sensor-row[data-style="warning"] .spark-line { stroke: var(--amber); }
  .sensor-row[data-style="error"] .spark-line { stroke: var(--red); }
  .sensor-row[data-style="success"] .spark-line { stroke: var(--green); }
  .sensor-row[data-style="info"] .spark-line { stroke: var(--blue); }

  /* ── Empty State ───────────────────────────────── */
  .sensor-empty {
    padding: 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 440px) {
    .section-container { padding: 16px; }
    .sensor-row { gap: 10px; padding: 10px 2px; }
    .sensor-val { font-size: 18px; }
    .sensor-spark { width: 40px; height: 20px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   Composite style sheet
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_ALL_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${SECTION_SURFACE} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;

/* ═══════════════════════════════════════════════════════════════
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const SENSOR_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">
          <span class="icon filled" id="sectionIcon" style="color:var(--blue)">sensors</span>
          <span id="sectionText">Environment</span>
        </span>
        <div class="section-spacer"></div>
      </div>
      <div class="sensor-list" id="sensorList"></div>
    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   SensorStyleCompiler - Threshold evaluation
   ═══════════════════════════════════════════════════════════════ */

class SensorStyleCompiler {
  static evaluate(value, thresholds) {
    if (!thresholds || !thresholds.length) return null;
    if (value === null || value === undefined || isNaN(value)) return null;
    const num = Number(value);
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      const tv = Number(t.value);
      const cond = t.condition || 'gte';
      let match = false;
      switch (cond) {
        case 'gte': match = num >= tv; break;
        case 'gt':  match = num > tv;  break;
        case 'lte': match = num <= tv; break;
        case 'lt':  match = num < tv;  break;
        case 'eq':  match = num === tv; break;
        case 'neq': match = num !== tv; break;
      }
      if (match) return t.style || 'warning';
    }
    return null;
  }

  static evaluateState(state, stateStyles) {
    if (!stateStyles || !stateStyles.length || !state) return null;
    for (const ss of stateStyles) {
      if (ss.state === state) return ss.style || 'warning';
    }
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   TrendComputer - History-based trend detection
   ═══════════════════════════════════════════════════════════════ */

class TrendComputer {
  static compute(history, threshold = 0.5) {
    if (!history || history.length < 2) return 'stable';
    const recent = history.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const delta = last - first;
    if (delta > threshold) return 'rising';
    if (delta < -threshold) return 'falling';
    return 'stable';
  }

  static sparklinePath(data, width = 48, height = 24, padding = 3) {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const usableH = height - padding * 2;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = padding + usableH - ((v - min) / range) * usableH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return 'M' + points.join(' L');
  }
}

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetSensorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._rowRefs = [];
    this._prevValues = {};
    this._historyCache = {};
    this._throttleTimer = null;
    this._historyTimer = null;

    injectFonts();
  }

  /* ── Config ─────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } },
      ],
      computeLabel: (schema) => ({
        title: 'Section Title',
        icon: 'Section Icon',
      }[schema.name] || schema.name),
    };
  }

  static getStubConfig() {
    return {
      title: 'Environment',
      icon: 'sensors',
      icon_color: 'blue',
      show_sparkline: true,
      show_trend: true,
      sensors: [
        {
          entity: 'sensor.living_room_temperature',
          label: 'Living Room',
          icon: 'thermostat',
          accent: 'amber',
          unit: '\u00b0F',
          precision: 0,
          thresholds: [
            { value: 80, condition: 'gte', style: 'error' },
            { value: 75, condition: 'gte', style: 'warning' },
          ],
          show_range: true,
        },
        {
          entity: 'sensor.living_room_humidity',
          label: 'Humidity',
          icon: 'water_drop',
          accent: 'blue',
          unit: '%',
          precision: 0,
          thresholds: [
            { value: 60, condition: 'gte', style: 'warning' },
            { value: 20, condition: 'lte', style: 'warning' },
          ],
          show_range: true,
        },
        {
          entity: 'sensor.outdoor_temperature',
          label: 'Outside',
          icon: 'device_thermostat',
          accent: 'blue',
          unit: '\u00b0F',
          precision: 0,
          show_range: true,
        },
        {
          entity: 'sensor.aqi',
          label: 'Air Quality',
          icon: 'air',
          accent: 'green',
          unit: 'AQI',
          thresholds: [
            { value: 150, condition: 'gte', style: 'error' },
            { value: 100, condition: 'gte', style: 'warning' },
            { value: 50, condition: 'lte', style: 'success' },
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config.sensors || !Array.isArray(config.sensors) || config.sensors.length === 0) {
      throw new Error('Please define at least one sensor in the sensors array');
    }
    this._config = {
      title: config.title || 'Environment',
      icon: config.icon || 'sensors',
      icon_color: config.icon_color || 'blue',
      show_sparkline: config.show_sparkline !== false,
      show_trend: config.show_trend !== false,
      history_hours: config.history_hours || 6,
      sensors: config.sensors,
    };
    if (this._rendered && this._hass) {
      this._buildRows();
      this._updateAll(true);
    }
  }

  /* ── HA State ───────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._buildRows();
      this._setupListeners();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!oldHass) {
      this._updateAll(true);
      this._fetchAllHistory();
    } else {
      this._scheduleUpdate();
    }
  }

  _scheduleUpdate() {
    if (this._throttleTimer) return;
    this._throttleTimer = setTimeout(() => {
      this._throttleTimer = null;
      this._updateAll(false);
    }, 500);
  }

  getCardSize() {
    return 1 + (this._config.sensors || []).length;
  }

  connectedCallback() {
    this._historyTimer = setInterval(() => {
      if (this._hass) this._fetchAllHistory();
    }, 5 * 60 * 1000);
  }

  disconnectedCallback() {
    if (this._throttleTimer) clearTimeout(this._throttleTimer);
    if (this._historyTimer) clearInterval(this._historyTimer);
  }

  /* ── Render ─────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = SENSOR_ALL_STYLES;
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = SENSOR_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
      sectionText: this.shadowRoot.getElementById('sectionText'),
      sectionIcon: this.shadowRoot.getElementById('sectionIcon'),
      sensorList: this.shadowRoot.getElementById('sensorList'),
    };
  }

  _buildRows() {
    const list = this.$.sensorList;
    list.innerHTML = '';
    this._rowRefs = [];
    this._prevValues = {};

    this.$.sectionText.textContent = this._config.title;
    this.$.sectionIcon.textContent = this._config.icon;
    if (this._config.icon_color) {
      this.$.sectionIcon.style.color = `var(--${this._config.icon_color})`;
    }

    if (this._config.sensors.length === 0) {
      list.innerHTML = '<div class="sensor-empty">No sensors configured</div>';
      return;
    }

    for (const sensorCfg of this._config.sensors) {
      const row = document.createElement('div');
      row.className = 'sensor-row';
      row.dataset.accent = sensorCfg.accent || 'muted';
      row.dataset.entity = sensorCfg.entity || '';
      const interactionType = (sensorCfg.interaction && sensorCfg.interaction.type) || 'more_info';
      row.dataset.interaction = interactionType;
      if (interactionType !== 'none') {
        row.setAttribute('role', 'button');
        row.setAttribute('tabindex', '0');
      } else {
        row.setAttribute('tabindex', '-1');
      }

      const sparkHtml = this._config.show_sparkline ? `
        <div class="sensor-spark" id="spark-${this._rowRefs.length}">
          <svg viewBox="0 0 48 24" preserveAspectRatio="none">
            <path class="spark-line" d="" />
          </svg>
        </div>
      ` : '';

      const trendHtml = this._config.show_trend ? `
        <div class="sensor-trend" data-trend="stable">
          <span class="icon">arrow_upward</span>
        </div>
      ` : '';

      row.innerHTML = `
        <div class="sensor-icon">
          <span class="icon filled">${sensorCfg.icon || 'sensors'}</span>
        </div>
        <div class="sensor-info">
          <span class="sensor-label">${sensorCfg.label || sensorCfg.entity || ''}</span>
          <span class="sensor-sub" id="sub-${this._rowRefs.length}"></span>
        </div>
        ${sparkHtml}
        <div class="sensor-val-wrap">
          <span class="sensor-val">--</span>
          <span class="sensor-unit"></span>
        </div>
        ${trendHtml}
      `;

      list.appendChild(row);
      this._rowRefs.push({
        el: row,
        cfg: sensorCfg,
        valEl: row.querySelector('.sensor-val'),
        unitEl: row.querySelector('.sensor-unit'),
        subEl: row.querySelector('.sensor-sub'),
        trendEl: row.querySelector('.sensor-trend'),
        sparkEl: row.querySelector('.sensor-spark'),
        sparkPath: row.querySelector('.spark-line'),
      });
    }
  }

  /* ── Listeners ────────────────────────────────── */

  _setupListeners() {
    const activateRow = (row) => {
      if (!row) return;
      const idx = [...this.$.sensorList.children].indexOf(row);
      if (idx < 0 || idx >= this._rowRefs.length) return;
      const ref = this._rowRefs[idx];
      const cfg = ref.cfg;
      const interaction = cfg.interaction || { type: 'more_info' };

      switch (interaction.type) {
        case 'navigate':
          this.dispatchEvent(new CustomEvent('tunet-navigate', {
            bubbles: true, composed: true,
            detail: { card: interaction.target_card || '', entity: cfg.entity },
          }));
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
              bubbles: true, composed: true,
              detail: { entityId: cfg.entity },
            }));
          }
          break;

        case 'more_info':
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
              bubbles: true, composed: true,
              detail: { entityId: cfg.entity },
            }));
          }
          break;

        case 'none':
        default:
          break;
      }
    };

    this.$.sensorList.addEventListener('click', (e) => {
      const row = e.target.closest('.sensor-row');
      if (!row) return;
      activateRow(row);
    });

    this.$.sensorList.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const row = e.target.closest('.sensor-row');
      if (!row || row.dataset.interaction === 'none') return;
      e.preventDefault();
      activateRow(row);
    });
  }

  /* ── History Fetching ─────────────────────────── */

  async _fetchAllHistory() {
    if (!this._hass) return;

    for (let i = 0; i < this._rowRefs.length; i++) {
      const ref = this._rowRefs[i];
      const cfg = ref.cfg;
      if (!cfg.entity) continue;

      const needsHistory = this._config.show_sparkline || this._config.show_trend || cfg.show_range;
      if (!needsHistory) continue;

      const cached = this._historyCache[cfg.entity];
      if (cached && Date.now() - cached.lastFetch < 120000) continue;

      try {
        const hours = this._config.history_hours || 6;
        const end = new Date();
        const start = new Date(end.getTime() - hours * 3600000);

        const url = `history/period/${start.toISOString()}?filter_entity_id=${cfg.entity}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
        const result = await this._hass.callApi('GET', url);

        if (result && result[0] && result[0].length > 0) {
          const points = result[0]
            .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
            .filter(p => !isNaN(p.v));

          this._historyCache[cfg.entity] = {
            data: points,
            lastFetch: Date.now(),
          };

          this._updateRowHistory(i);
        }
      } catch (err) {
        console.debug(`[tunet-sensor-card] History fetch failed for ${cfg.entity}:`, err.message);
      }
    }
  }

  _updateRowHistory(idx) {
    const ref = this._rowRefs[idx];
    if (!ref) return;
    const cfg = ref.cfg;
    const cached = this._historyCache[cfg.entity];
    if (!cached || !cached.data.length) return;

    const values = cached.data.map(p => p.v);

    if (ref.sparkPath && values.length >= 2) {
      const path = TrendComputer.sparklinePath(values);
      ref.sparkPath.setAttribute('d', path);
    }

    if (ref.trendEl) {
      const trend = TrendComputer.compute(values, cfg.trend_threshold || 0.5);
      ref.trendEl.dataset.trend = trend;
    }

    if (cfg.show_range && ref.subEl && values.length >= 2) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const prec = cfg.precision != null ? cfg.precision : 1;
      const unit = cfg.unit || '';
      ref.subEl.innerHTML = `${min.toFixed(prec)}${unit} <span class="range-sep">&ndash;</span> ${max.toFixed(prec)}${unit}`;
    }
  }

  /* ── State Update (with dirty-diff) ──────────── */

  _updateAll(force = false) {
    if (!this._hass || !this._rendered) return;

    for (let i = 0; i < this._rowRefs.length; i++) {
      const ref = this._rowRefs[i];
      const cfg = ref.cfg;

      let val, rawVal, unit;

      if (cfg.entity) {
        const entity = this._hass.states[cfg.entity];
        if (!entity) {
          val = '--';
          rawVal = null;
          unit = cfg.unit || '';
        } else {
          rawVal = entity.state;
          unit = cfg.unit || entity.attributes.unit_of_measurement || '';

          if (!isNaN(rawVal) && rawVal !== '') {
            const prec = cfg.precision != null ? cfg.precision : 1;
            val = Number(rawVal).toFixed(prec);
            if (prec === 0) val = Math.round(Number(rawVal));
          } else {
            val = rawVal;
          }
        }
      } else {
        val = '--';
        rawVal = null;
        unit = cfg.unit || '';
      }

      const cacheKey = `row_${i}`;
      const prevRaw = this._prevValues[cacheKey];
      if (!force && prevRaw === rawVal) continue;
      this._prevValues[cacheKey] = rawVal;

      const display = val !== null && val !== undefined ? val : '--';
      ref.valEl.textContent = display;
      ref.unitEl.textContent = unit;

      let thresholdStyle = null;
      if (cfg.thresholds && rawVal !== null && !isNaN(rawVal)) {
        thresholdStyle = SensorStyleCompiler.evaluate(rawVal, cfg.thresholds);
      }
      if (!thresholdStyle && cfg.state_styles && rawVal !== null) {
        thresholdStyle = SensorStyleCompiler.evaluateState(String(rawVal), cfg.state_styles);
      }

      if (thresholdStyle) {
        ref.el.dataset.style = thresholdStyle;
      } else {
        delete ref.el.dataset.style;
      }

      if (!cfg.show_range && ref.subEl && cfg.entity) {
        const entity = this._hass.states[cfg.entity];
        if (entity && entity.attributes.friendly_name && entity.attributes.friendly_name !== cfg.label) {
          ref.subEl.textContent = entity.attributes.friendly_name;
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-sensor-card', TunetSensorCard, {
  name: 'Tunet Sensor Card',
  description: 'Glassmorphism environment sensor panel - row-based readings, sparklines, trend arrows, threshold styling, min/max ranges',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-sensor-card',
});

logCardVersion('TUNET-SENSOR', CARD_VERSION, '#34C759');


})();
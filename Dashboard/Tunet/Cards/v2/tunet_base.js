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
export const TOKENS = `
  :host {
    /* Glass Surfaces */
    --glass: rgba(255,255,255, 0.68);
    --glass-border: rgba(255,255,255, 0.45);

    /* Shadows (two-layer: contact + ambient) */
    --shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --shadow-up: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

    /* Text */
    --text: #1C1C1E;
    --text-sub: #8E8E93;
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
    --track-bg: rgba(0,0,0, 0.06);
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

    /* Surface Blur */
    --blur-card: 24px;
    --blur-section: 20px;
    --blur-menu: 24px;

    /* Motion + Interaction */
    --motion-fast: 0.12s;
    --motion-ui: 0.18s;
    --motion-surface: 0.28s;
    --ease-standard: cubic-bezier(0.2, 0, 0, 1);
    --ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1);
    --press-scale: 0.97;
    --press-scale-strong: 0.95;
    --lift-scale: 1.03;
    --drag-scale: 1.05;

    /* Focus */
    --focus-ring-color: var(--blue);
    --focus-ring-width: 2px;
    --focus-ring-offset: 3px;

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
    --gray-ghost: rgba(0, 0, 0, 0.03);
    --border-ghost: transparent;

    /* Icon Surfaces */
    --icon-wrap-size: 44px;
    --icon-wrap-size-sm: 24px;
    --icon-wrap-radius: 16px;
    --icon-wrap-radius-sm: 6px;
    --icon-wrap-bg-off: var(--gray-ghost);
    --icon-wrap-fg-off: var(--text-muted);
    --icon-wrap-bg-on: var(--amber-fill);
    --icon-wrap-fg-on: var(--amber);
    --icon-wrap-border-on: var(--amber-border);

    /* Semantic glow usage: alert/group/override only */
    --glow-manual: 0 0 12px rgba(255,82,82,0.60);
    --glow-group: 0 0 10px rgba(0,122,255,0.45);

    /* Section Container */
    --section-bg: rgba(255,255,255, 0.45);
    --section-gap: 16px;
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --section-shadow: var(--shadow-section);

    color-scheme: light;
    display: block;
  }

  :host(.dark) {
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.10);

    --shadow: 0 4px 20px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.50);
    --shadow-up: 0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);

    --text: #F8FAFC;
    --text-sub: rgba(248,250,252, 0.65);
    --text-muted: rgba(248,250,252, 0.45);

    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36, 0.12);
    --amber-border: rgba(251,191,36, 0.25);

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
    --blur-card: 24px;
    --blur-section: 20px;
    --blur-menu: 24px;
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

    --tile-bg: rgba(30,41,59, 0.92);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255,255,255, 0.04);
    --border-ghost: rgba(255,255,255, 0.05);
    --icon-wrap-bg-off: var(--gray-ghost);
    --icon-wrap-fg-off: var(--text-muted);
    --icon-wrap-bg-on: var(--amber-fill);
    --icon-wrap-fg-on: var(--amber);
    --icon-wrap-border-on: var(--amber-border);
    --glow-group: 0 0 10px rgba(10,132,255,0.50);

    --section-bg: rgba(30,41,59, 0.60);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.35);
    --section-shadow: var(--shadow-section);

    color-scheme: dark;
  }

  button:focus-visible,
  [role="button"]:focus-visible,
  [tabindex]:focus-visible,
  .focus-ring:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (prefers-contrast: more) {
    :host {
      --text-sub: rgba(28,28,30, 0.78);
      --text-muted: rgba(28,28,30, 0.64);
      --ctrl-border: rgba(0,0,0, 0.14);
      --chip-border: rgba(0,0,0, 0.14);
      --border-ghost: rgba(0,0,0, 0.12);
      --divider: rgba(28,28,30, 0.14);
      --focus-ring-width: 3px;
    }
    :host(.dark) {
      --text-sub: rgba(248,250,252, 0.86);
      --text-muted: rgba(248,250,252, 0.66);
      --ctrl-border: rgba(255,255,255, 0.20);
      --chip-border: rgba(255,255,255, 0.18);
      --border-ghost: rgba(255,255,255, 0.16);
      --divider: rgba(255,255,255, 0.16);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host {
      --glass: rgba(255,255,255, 0.94);
      --section-bg: rgba(255,255,255, 0.92);
      --dd-bg: rgba(255,255,255, 0.96);
      --ctrl-bg: rgba(255,255,255, 0.88);
      --chip-bg: rgba(255,255,255, 0.86);
      --blur-card: 0px;
      --blur-section: 0px;
      --blur-menu: 0px;
    }
    :host(.dark) {
      --glass: rgba(30,41,59, 0.92);
      --section-bg: rgba(30,41,59, 0.88);
      --dd-bg: rgba(30,41,59, 0.94);
      --ctrl-bg: rgba(30,41,59, 0.78);
      --chip-bg: rgba(30,41,59, 0.76);
    }
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    :host {
      --glass: rgba(255,255,255, 0.94);
      --section-bg: rgba(255,255,255, 0.92);
      --dd-bg: rgba(255,255,255, 0.96);
    }
    :host(.dark) {
      --glass: rgba(30,41,59, 0.92);
      --section-bg: rgba(30,41,59, 0.88);
      --dd-bg: rgba(30,41,59, 0.94);
    }
  }
`;

/**
 * Midnight Navy dark mode override.
 * Append AFTER TOKENS to override dark mode with navy palette.
 * Used by: lighting card only.
 * Source: lighting-section-mockup-polish.html + parity lock values.
 */
export const TOKENS_MIDNIGHT = `
  :host(.dark) {
    /* Midnight Navy - Parity Lock baseline */
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.10);

    --text: #F8FAFC;
    --text-sub: rgba(248,250,252, 0.65);
    --text-muted: rgba(248,250,252, 0.45);

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
    --shadow-up: 0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40);
  }
`;

// ═══════════════════════════════════════════════════════════
// SHARED CSS BLOCKS
// ═══════════════════════════════════════════════════════════

export const RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

export const BASE_FONT = `
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
export const ICON_BASE = `
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
export const CARD_SURFACE = `
  .card {
    position: relative;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(var(--blur-card));
    -webkit-backdrop-filter: blur(var(--blur-card));
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    transition:
      background var(--motion-surface) var(--ease-standard),
      border-color var(--motion-surface) var(--ease-standard),
      box-shadow var(--motion-surface) var(--ease-standard),
      opacity var(--motion-surface) var(--ease-standard),
      transform var(--motion-ui) var(--ease-standard);
    overflow: hidden;
  }
`;

/** Glass stroke pseudo-element for card surface. Spec §3.2 */
export const CARD_SURFACE_GLASS_STROKE = `
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
export const SECTION_SURFACE = `
  .section-container {
    border-radius: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(var(--blur-section));
    -webkit-backdrop-filter: blur(var(--blur-section));
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: var(--section-gap);
  }
`;

/** Base tile surface for status, lighting, sensor tiles */
export const TILE_SURFACE = `
  .tile {
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost);
    box-shadow: var(--shadow);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition:
      background var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      box-shadow var(--motion-ui) var(--ease-standard),
      transform var(--motion-ui) var(--ease-emphasized);
    cursor: pointer;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
  }

  @media (hover: hover) {
    .tile:hover {
      box-shadow: var(--shadow-up);
    }
  }

  .tile:active {
    transform: scale(var(--press-scale));
  }

  .tile.dragging {
    transform: scale(var(--drag-scale));
    box-shadow: var(--shadow-up);
  }

  .tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
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
export const HEADER_PATTERN = `
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

/** Shared compact header/info tile language for cards */
export const INFO_TILE_PATTERN = `
  .hdr,
  .media-hdr,
  .grid-hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .info-tile,
  .hdr-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized);
    min-width: 0;
  }

  @media (hover: hover) {
    .info-tile:hover,
    .hdr-tile:hover {
      box-shadow: var(--shadow);
    }
  }

  .info-tile:active,
  .hdr-tile:active {
    transform: scale(0.98);
  }

  .info-tile:focus-visible,
  .hdr-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .entity-icon,
  .hdr-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: all var(--motion-ui) var(--ease-standard);
    color: var(--text-muted);
    border: 1px solid transparent;
    background: transparent;
  }

  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .hdr-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hdr-spacer {
    flex: 1;
  }
`;

/** Shared control button surface (info tile, toggle buttons, selectors) */
export const CTRL_SURFACE = `
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
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized),
      color var(--motion-fast) var(--ease-standard);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
  }

  @media (hover: hover) {
    .ctrl-btn:hover {
      box-shadow: var(--shadow);
    }
  }

  .ctrl-btn:active {
    transform: scale(var(--press-scale-strong));
  }

  .ctrl-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

/** Shared icon-style compact control button */
export const ICON_BUTTON_PATTERN = `
  .icon-btn,
  .toggle-btn,
  .fan-btn {
    width: 42px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized),
      color var(--motion-fast) var(--ease-standard);
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
  }

  @media (hover: hover) {
    .icon-btn:hover,
    .toggle-btn:hover,
    .fan-btn:hover {
      box-shadow: var(--shadow);
    }
  }

  .icon-btn:active,
  .toggle-btn:active {
    transform: scale(var(--press-scale-strong));
  }

  .fan-btn:active {
    transform: scale(0.94);
  }

  .icon-btn:focus-visible,
  .toggle-btn:focus-visible,
  .fan-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

/** Shared label/pill control button */
export const LABEL_BUTTON_PATTERN = `
  .label-btn,
  .selector-btn,
  .mode-btn,
  .speaker-btn,
  .source-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 42px;
    box-sizing: border-box;
    padding: 0 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.2px;
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized),
      color var(--motion-fast) var(--ease-standard);
  }

  @media (hover: hover) {
    .label-btn:hover,
    .selector-btn:hover,
    .mode-btn:hover,
    .speaker-btn:hover,
    .source-btn:hover {
      box-shadow: var(--shadow);
    }
  }

  .label-btn:active,
  .selector-btn:active,
  .mode-btn:active,
  .speaker-btn:active,
  .source-btn:active {
    transform: scale(var(--press-scale));
  }

  .label-btn:focus-visible,
  .selector-btn:focus-visible,
  .mode-btn:focus-visible,
  .speaker-btn:focus-visible,
  .source-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

/** Shared dropdown menu */
export const DROPDOWN_MENU = `
  .dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 220px;
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(var(--blur-menu));
    -webkit-backdrop-filter: blur(var(--blur-menu));
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 10;
    display: none;
    flex-direction: column;
    gap: 1px;
  }

  .dd-menu.open {
    display: flex;
    animation: menuIn var(--motion-fast) var(--ease-standard) forwards;
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
    transition:
      background var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized);
    user-select: none;
  }

  @media (hover: hover) {
    .dd-option:hover {
      background: var(--track-bg);
    }
  }

  .dd-option:active {
    transform: scale(var(--press-scale));
  }

  .dd-option:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: calc(var(--focus-ring-offset) - 1px);
  }

  .dd-divider {
    height: 1px;
    background: var(--divider);
    margin: 3px 8px;
  }
`;

/** Shared dropdown visual surface with class aliases */
export const GLASS_MENU_PATTERN = `
  .dd-menu,
  .mode-menu,
  .tile-dd-menu {
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(var(--blur-menu));
    -webkit-backdrop-filter: blur(var(--blur-menu));
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 20;
    display: none;
    flex-direction: column;
    gap: 1px;
  }

  .dd-menu.open,
  .mode-menu.open,
  .tile-dd-menu.open {
    display: flex;
    animation: menuIn var(--motion-fast) var(--ease-standard) forwards;
  }

  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dd-option,
  .mode-opt,
  .tile-dd-opt {
    padding: 9px 12px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition:
      background var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized);
    user-select: none;
  }

  @media (hover: hover) {
    .dd-option:hover,
    .mode-opt:hover,
    .tile-dd-opt:hover {
      background: var(--track-bg);
    }
  }

  .dd-option:active,
  .mode-opt:active,
  .tile-dd-opt:active {
    transform: scale(var(--press-scale));
  }
`;

/** Shared section glass stroke; attach to section-container shells */
export const SECTION_GLASS_STROKE = `
  .section-container {
    position: relative;
  }

  .section-container::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-section);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(
      160deg,
      rgba(255,255,255,0.40),
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.14)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  :host(.dark) .section-container::before {
    background: linear-gradient(
      160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08)
    );
  }
`;

/** Shared compact action chip surface */
export const ACTION_CHIP_SURFACE = `
  .action-chip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3em;
    padding: 0.5em 0.25em;
    border-radius: 0.875em;
    background: var(--tile-bg);
    box-shadow: var(--shadow);
    font-family: inherit;
    font-size: 0.6875em;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.01em;
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized),
      color var(--motion-fast) var(--ease-standard);
    user-select: none;
    white-space: nowrap;
    border: 1px solid transparent;
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) {
    .action-chip:hover {
      box-shadow: var(--shadow-up);
    }
  }

  .action-chip:active {
    transform: scale(0.96);
  }

  .action-chip:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: 2px;
  }
`;

/**
 * Shared event-only light tile primitive surface.
 * Composer cards should override tile geometry via CSS variables on host.
 */
export const LIGHT_TILE_PATTERN = `
  :host {
    display: block;
    contain: layout style;
  }

  .lt {
    --icon-size: 44px;
    --icon-radius: var(--r-tile, 16px);
    --bar-h: 4px;
    --bar-h-active: 6px;
    --bar-inset: 14px;
    --bar-bottom: 10px;
    --pill-bg: var(--tile-bg);
    --pill-shadow: 0 10px 30px rgba(0,0,0,0.3);
    --pill-border: 1px solid rgba(255,255,255,0.1);

    position: relative;
    border-radius: var(--r-tile, 16px);
    background: var(--pill-bg, var(--tile-bg));
    border: 1px solid var(--border-ghost, transparent);
    box-shadow: var(--shadow);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    overflow: visible;
    transition:
      transform var(--motion-ui, 0.18s) var(--ease-emphasized),
      box-shadow var(--motion-ui, 0.18s) var(--ease-standard),
      border-color var(--motion-ui, 0.18s) var(--ease-standard),
      background-color var(--motion-surface, 0.28s) var(--ease-standard);
  }

  .lt.vertical {
    aspect-ratio: var(--lt-aspect-ratio, 1 / 0.95);
    height: var(--lt-height, auto);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  @media (max-width: 440px) {
    .lt.vertical {
      aspect-ratio: var(--lt-aspect-ratio-mobile, 1 / 1.05);
    }
  }

  .lt.horizontal {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px 14px 10px;
    min-height: 62px;
  }

  @media (max-width: 440px) {
    .lt.horizontal {
      min-height: 56px;
      padding: 8px 10px 12px 8px;
      gap: 8px;
    }
  }

  @media (hover: hover) {
    .lt:hover {
      box-shadow: var(--shadow-up);
    }
  }

  .lt:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--blue, #007aff));
    outline-offset: var(--focus-ring-offset, 3px);
  }

  .icon-wrap {
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: var(--icon-radius);
    display: grid;
    place-items: center;
    border: 1px solid transparent;
    transition: all var(--motion-ui, 0.18s) var(--ease-standard);
    margin-bottom: 6px;
  }

  .lt.horizontal .icon-wrap {
    margin-bottom: 0;
  }

  .lt.no-icon-wrap .icon-wrap {
    background: transparent !important;
    border-color: transparent !important;
  }

  @media (max-width: 440px) {
    .lt.horizontal .icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }
  }

  .tile-icon {
    font-size: 24px;
  }

  .lt.horizontal .content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
    line-height: 1.15;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    margin-bottom: 1px;
    text-align: center;
  }

  .lt.horizontal .name {
    text-align: left;
    margin-bottom: 0;
  }

  @media (max-width: 440px) {
    .lt.horizontal .name {
      font-size: 13px;
    }
  }

  .val {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1px;
    line-height: 1.2;
    color: var(--text-sub);
    font-variant-numeric: tabular-nums;
    transition: color var(--motion-ui, 0.18s) var(--ease-standard);
  }

  .lt.horizontal .val {
    min-width: 40px;
    text-align: right;
  }

  .val.hide,
  .progress-track.hide {
    display: none;
  }

  .progress-track {
    position: absolute;
    bottom: var(--bar-bottom);
    left: var(--bar-inset);
    right: var(--bar-inset);
    height: var(--bar-h);
    background: var(--track-bg, rgba(0,0,0,0.06));
    border-radius: var(--r-track, 999px);
    overflow: hidden;
    transition: height var(--motion-ui, 0.18s) var(--ease-standard);
  }

  .lt.horizontal .progress-track {
    left: 10px;
    right: 10px;
    bottom: 6px;
    height: 3px;
  }

  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: var(--r-track, 999px);
    background: var(--text-sub);
    transition: width 0.1s ease-out;
  }

  .manual-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red, #ff3b30);
    box-shadow: var(--glow-manual);
    display: none;
    z-index: 2;
  }

  .lt.horizontal .manual-dot {
    top: 8px;
    right: 8px;
  }

  .lt[data-manual="true"] .manual-dot {
    display: block;
  }

  .sub-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    min-width: 24px;
    height: 24px;
    padding: 0 7px;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
  }

  .sub-btn.show {
    display: inline-flex;
  }

  .sub-btn .icon {
    font-size: 12px;
    width: 12px;
    height: 12px;
  }

  .lt.has-sub.vertical {
    padding-top: 22px;
  }

  .lt.off {
    opacity: 1;
  }

  .lt.off .icon-wrap {
    background: var(--gray-ghost, rgba(0,0,0,0.03));
    color: var(--text-muted);
  }

  .lt.off .name {
    color: var(--text-sub);
  }

  .lt.off .val {
    color: var(--text-sub);
    opacity: 0.5;
  }

  .lt.off .progress-fill {
    opacity: 0;
  }

  .lt.unavailable {
    opacity: 0.38;
    filter: saturate(0.45);
  }

  .lt.unavailable .icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
  }

  .lt.unavailable .val {
    color: var(--text-muted);
    opacity: 0.9;
  }

  .lt.on {
    border-color: var(--amber-border);
  }

  .lt.on .icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }

  .lt.on .tile-icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .lt.on .val {
    color: var(--amber);
  }

  .lt.on .progress-fill {
    background: rgba(212,133,10,0.90);
  }

  :host(.dark) .lt.on .progress-fill {
    background: rgba(251,191,36,0.90);
  }

  .lt.sliding {
    transform: scale(var(--drag-scale, 1.05));
    box-shadow: var(--shadow-up);
    border-color: var(--amber);
    z-index: 100;
    transition: none;
  }

  .lt.sliding .progress-track {
    height: var(--bar-h-active);
  }

  .lt.horizontal.sliding .progress-track {
    height: 5px;
  }

  .lt.sliding .progress-fill {
    transition: none;
  }

  .lt.vertical.sliding .val {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--amber);
    font-weight: 700;
    font-size: 15px;
    background: var(--pill-bg, var(--tile-bg));
    padding: 6px 20px;
    border-radius: 999px;
    box-shadow: var(--pill-shadow);
    border: var(--pill-border);
    white-space: nowrap;
    z-index: 101;
  }

  .lt.horizontal.sliding .val {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translate(-50%, -100%);
    color: var(--amber);
    font-weight: 700;
    font-size: 14px;
    background: var(--tile-bg);
    padding: 5px 14px;
    border-radius: 999px;
    box-shadow: var(--pill-shadow);
    border: var(--pill-border);
    white-space: nowrap;
    z-index: 101;
  }
`;

/** Climate card core styles (header, mode controls, temperature and slider system). */
export const CLIMATE_CORE_PATTERN = `
  /* ── Climate Card Surface Overrides ── */
  .card {
    padding: 20px 20px 14px;
    gap: 0;
    width: 100%;
  }
  .card[data-mode="off"] { opacity: .55; }
  .card[data-action="heating"] { border-color: rgba(212,133,10,0.16); }
  .card[data-action="cooling"] { border-color: rgba(0,122,255,0.14); }
  :host(.dark) .card[data-action="heating"] { border-color: rgba(232,150,30,0.14); }
  :host(.dark) .card[data-action="cooling"] { border-color: rgba(10,132,255,0.12); }

  /* Optional section-container surface variant */
  :host([surface="section"]) .card {
    --r-card: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--section-shadow), var(--inset);
  }

  /* -- Header -- */
  .hdr-tile[data-action="heating"] {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }
  .hdr-tile[data-action="cooling"] {
    background: var(--blue-fill);
    border-color: var(--blue-border);
  }
  .hdr-icon[data-a="heating"] {
    color: var(--amber);
  }
  .hdr-icon[data-a="cooling"] {
    color: var(--blue);
  }
  .hdr-title { color: var(--text); }
  .card[data-mode="off"] .hdr-title {
    color: var(--text-sub);
  }
  .hdr-sub {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .hdr-sub .heat-ic { color: var(--amber); }
  .hdr-sub .cool-ic { color: var(--blue); }
  .hdr-sub .fan-ic { color: var(--green); }

  /* -- Fan Button -- */
  .fan-btn.on {
    background: var(--green-fill);
    color: var(--green);
    border-color: var(--green-border);
  }
  .fan-btn.on .icon { animation: fan-spin 1.8s linear infinite; }
  .fan-btn.on[data-action="heating"] {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .fan-btn.on[data-action="cooling"] {
    background: var(--blue-fill);
    color: var(--blue);
    border-color: var(--blue-border);
  }
  @keyframes fan-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* -- Mode Button -- */
  .mode-wrap { position: relative; }
  .mode-btn .mode-icon { font-size: 16px; width: 16px; height: 16px; }
  .mode-btn .chevron { transition: transform .2s ease; font-size: 14px; width: 14px; height: 14px; }
  .mode-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .mode-btn[data-action="heating"] {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .mode-btn[data-action="cooling"] {
    background: var(--blue-fill);
    color: var(--blue);
    border-color: var(--blue-border);
  }
  .mode-btn[data-action="idle"],
  .mode-btn[data-action="off"] {
    color: var(--text-muted);
  }

  /* -- Mode Dropdown Menu -- */
  .mode-menu {
    top: calc(100% + 6px);
    right: 0;
    min-width: 160px;
  }
  .mode-opt { gap: 8px; }
  .mode-opt.active { font-weight: 700; }
  .mode-opt.active[data-m="heat_cool"],
  .mode-opt.active[data-m="heat"] { background: var(--amber-fill); color: var(--amber); }
  .mode-opt.active[data-m="cool"] { background: var(--blue-fill); color: var(--blue); }
  .mode-opt.active[data-m="off"] { background: var(--track-bg); color: var(--text-muted); }
  .mode-divider { height: 1px; background: var(--divider); margin: 3px 8px; }
  .mode-opt.eco-opt .eco-check {
    margin-left: auto;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1.5px solid var(--text-muted);
    display: grid;
    place-items: center;
    transition: all .15s;
  }
  .mode-opt.eco-opt.active .eco-check {
    background: var(--green);
    border-color: var(--green);
  }

  /* -- Temperature Zone -- */
  .temps {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .t-group { display: flex; flex-direction: column; gap: 1px; }
  .t-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .3px;
  }
  .t-label.indoor { color: var(--text-sub); }
  .t-label.heat { color: var(--amber); }
  .t-label.cool { color: var(--blue); }
  .t-val {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1.5px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .deg {
    font-size: 0.6em;
    vertical-align: baseline;
    position: relative;
    top: -0.18em;
    margin-left: -1px;
  }
  .t-val.heat { color: var(--amber); }
  .t-val.cool { color: var(--blue); }
  .t-right { display: flex; gap: 16px; }
  .t-right .t-group { align-items: flex-end; }

  /* -- Slider -- */
  .slider-zone { display: flex; flex-direction: column; margin-bottom: 0; }
  .slider {
    position: relative;
    height: var(--track-h);
    user-select: none;
    touch-action: none;
  }
  .track {
    position: absolute;
    inset: 0;
    border-radius: var(--r-track);
    background: var(--track-bg);
    overflow: hidden;
  }

  .fill-h {
    position: absolute; top: 0; bottom: 0; left: 0;
    border-radius: var(--r-track) 0 0 var(--r-track);
    background: rgba(212,133,10,0.28);
    transition: width 60ms ease;
  }
  :host(.dark) .fill-h {
    background: rgba(232,150,30,0.26);
  }
  .fill-c {
    position: absolute; top: 0; bottom: 0; right: 0;
    border-radius: 0 var(--r-track) var(--r-track) 0;
    background: rgba(0,122,255,0.26);
    transition: width 60ms ease;
  }
  :host(.dark) .fill-c {
    background: rgba(10,132,255,0.26);
  }

  .deadband {
    position: absolute; top: 0; bottom: 0;
    background: repeating-linear-gradient(90deg,
      transparent, transparent 3px,
      rgba(28,28,30,0.025) 3px, rgba(28,28,30,0.025) 4px);
    transition: left 60ms, width 60ms;
  }
  :host(.dark) .deadband {
    background: repeating-linear-gradient(90deg,
      transparent, transparent 3px,
      rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px);
  }

  .thumb {
    position: absolute; top: 50%;
    width: 44px; height: 44px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: transparent;
    cursor: grab;
    z-index: 3;
    transition: transform .15s;
    display: flex; align-items: center; justify-content: center;
  }
  .thumb:active { cursor: grabbing; transform: translate(-50%,-50%) scale(1.08); }
  .thumb.dragging { cursor: grabbing; transform: translate(-50%,-50%) scale(1.08); }
  .thumb:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }

  .thumb-stroke {
    position: absolute; width: 2px;
    top: 2px; bottom: 2px; left: 50%;
    transform: translateX(-50%);
    border-radius: 2px; z-index: 1;
  }
  .thumb.heat .thumb-stroke { background: var(--amber); }
  .thumb.cool .thumb-stroke { background: var(--blue); }

  .thumb-disc {
    width: 26px; height: 26px;
    border-radius: 999px;
    background: var(--thumb-bg);
    box-shadow: var(--thumb-sh);
    z-index: 2; position: relative;
    transition: box-shadow .15s;
  }
  .thumb:hover .thumb-disc { box-shadow: var(--thumb-sh-a); }
  .thumb:active .thumb-disc,
  .thumb.dragging .thumb-disc { box-shadow: var(--thumb-sh-a); }

  .thumb-dot {
    width: 8px; height: 8px;
    border-radius: 999px;
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    z-index: 3;
  }
  .thumb.heat .thumb-dot { background: var(--amber); box-shadow: 0 0 0 .5px rgba(212,133,10,0.3); }
  .thumb.cool .thumb-dot { background: var(--blue); box-shadow: 0 0 0 .5px rgba(0,122,255,0.3); }

  .cur-marker {
    position: absolute; bottom: -14px;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
    z-index: 2; transition: left .25s ease;
  }
  .cur-arrow {
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 5px solid var(--text-muted);
  }
  .cur-label {
    font-size: 11px; font-weight: 700;
    color: var(--text-sub);
    margin-top: 1px;
    font-variant-numeric: tabular-nums;
    letter-spacing: -.2px;
    white-space: nowrap;
  }

  .scale { display: flex; justify-content: space-between; padding: 4px 2px 0; }
  .scale-mark {
    display: flex; flex-direction: column; align-items: center;
    gap: 1px; transition: opacity .2s ease;
  }
  .scale-tick {
    width: 1px; height: 5px;
    background: var(--text-muted);
    opacity: .35; border-radius: 1px;
  }
  .scale-num {
    font-size: 11px; font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: .3px;
  }

  .card[data-mode="heat"] .fill-c,
  .card[data-mode="heat"] .thumb.cool,
  .card[data-mode="heat"] .t-group.cool { display: none; }

  .card[data-mode="cool"] .fill-h,
  .card[data-mode="cool"] .thumb.heat,
  .card[data-mode="cool"] .t-group.heat { display: none; }

  .card[data-mode="off"] .fill-h,
  .card[data-mode="off"] .fill-c,
  .card[data-mode="off"] .thumb,
  .card[data-mode="off"] .t-right,
  .card[data-mode="off"] .cur-marker { display: none; }
  .card[data-mode="off"] .track { opacity: .35; }

  .card[data-mode="heat"] .fill-h {
    border-radius: var(--r-track);
  }
  .card[data-mode="cool"] .fill-c {
    border-radius: var(--r-track);
  }

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: 16px 16px 12px; --r-track: 12px; }
    .t-val { font-size: 42px; letter-spacing: -1.3px; }
  }
`;

export const REDUCED_MOTION = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export const RESPONSIVE_BASE = `
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
export function injectFonts() {
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
export const FONT_LINKS = `
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
export function detectDarkMode(hass) {
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
export function applyDarkClass(element, isDark) {
  element.classList.toggle('dark', isDark);
}

/**
 * Fire a custom event (for hass-more-info, etc.).
 * @param {HTMLElement} element
 * @param {string} type - Event type
 * @param {Object} detail - Event detail payload
 */
export function fireEvent(element, type, detail = {}) {
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
export function registerCard(tagName, cardClass, meta) {
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
export function logCardVersion(name, version, color = '#D4850A') {
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
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

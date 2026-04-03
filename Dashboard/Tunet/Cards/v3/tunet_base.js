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

    /* Density controls (global defaults) */
    --card-pad: 20px;
    --section-pad: 20px;
    --tile-pad: 14px;
    --tile-gap: 6px;
    --ctrl-min-h: 42px;
    --ctrl-font-size: 12px;
    --ctrl-pad-x: 12px;
    --dd-option-font-size: 13px;
    --dd-option-pad-y: 9px;
    --dd-option-pad-x: 12px;
    --rooms-row-btn-size: 3.16em;
    --rooms-row-btn-radius: 12px;
    --rooms-row-btn-icon-size: 1.62em;
    --rooms-row-btn-size-slim: 2.76em;
    --rooms-row-btn-icon-size-slim: 1.42em;
    --rooms-all-toggle-min-h: 2.62em;
    --rooms-all-toggle-min-w: 6.5em;
    --rooms-all-toggle-font: 0.82em;
    --rooms-all-toggle-icon: 1.2em;

    /* Semantic type roles (desktop) */
    --type-label: 12.5px;
    --type-sub: 11px;
    --type-value: 18px;
    --type-chip: 12.5px;
    --type-row-title: 16.5px;
    --type-row-status: 14.5px;
    --row-line-height-title: 1.16;
    --row-line-height-status: 1.14;
    --row-status-max-lines: 2;

    /* Density controls (mobile baseline) */
    --density-mobile-card-pad: 13px;
    --density-mobile-section-pad: 13px;
    --density-mobile-tile-pad: 10px;
    --density-mobile-tile-gap: 4px;
    --density-mobile-ctrl-min-h: 40px;
    --density-mobile-ctrl-font: 12.5px;
    --density-mobile-ctrl-pad-x: 11px;
    --density-mobile-dd-font: 13px;
    --density-mobile-dd-pad-y: 8px;
    --density-mobile-dd-pad-x: 10px;
    --density-mobile-rooms-row-btn-size: 2.82em;
    --density-mobile-rooms-row-btn-icon-size: 1.44em;
    --density-mobile-rooms-row-btn-size-slim: 2.52em;
    --density-mobile-rooms-row-btn-icon-size-slim: 1.28em;
    --density-mobile-rooms-all-toggle-min-h: 2.34em;
    --density-mobile-rooms-all-toggle-min-w: 5.62em;
    --density-mobile-rooms-all-toggle-font: 0.74em;
    --density-mobile-rooms-all-toggle-icon: 1.06em;

    /* Semantic type roles (mobile baseline) */
    --type-label-mobile: 13px;
    --type-sub-mobile: 11.5px;
    --type-value-mobile: 18px;
    --type-chip-mobile: 13px;
    --type-row-title-mobile: 18px;
    --type-row-status-mobile: 15.5px;

    color-scheme: light;
    display: block;
    container-type: inline-size;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
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
// PROFILE REGISTRY + RESOLUTION (G1)
// ═══════════════════════════════════════════════════════════

export const PROFILE_SCHEMA_VERSION = 'v1-20260308';

export const FAMILY_KEYS = ['tile-grid', 'speaker-tile', 'rooms-row', 'indicator-tile', 'indicator-row'];
export const SIZE_KEYS = ['compact', 'standard', 'large'];

const VALID_SIZES = new Set(SIZE_KEYS);

export const PRESET_FAMILY_MAP = {
  lighting: 'tile-grid',
  speakers: 'speaker-tile',
  rooms: 'tile-grid',
  'rooms-row': 'rooms-row',
  status: 'indicator-tile',
  environment: 'indicator-row',
};

export const PROFILE_BASE = {
  compact: {
    cardPad: '0.875em',
    sectionPad: '0.875em',
    sectionGap: '0.75em',
    headerHeight: '2.375em',
    headerFont: '0.75em',
    sectionFont: '0.8125em',
    tilePad: '0.625em',
    tileGap: '0.25em',
    tileRadius: '0.75em',
    ddRadius: '0.4375em',
    iconBox: '2.125em',
    iconGlyph: '1.0625em',
    nameFont: '0.75em',
    valueFont: '1.0625em',
    subFont: '0.6875em',
    unitFont: '0.6875em',
    ctrlMinH: '2.375em',
    ctrlPadX: '0.625em',
    ctrlIconSize: '1.125em',
    ddOptionFont: '0.75em',
    ddOptionPadY: '0.5em',
    ddOptionPadX: '0.625em',
    dropdownMinH: '7.5em',
    dropdownMaxH: '13.75em',
    progressH: '0.375em',
  },
  standard: {
    cardPad: '1.25em',
    sectionPad: '1.25em',
    sectionGap: '1em',
    headerHeight: '2.625em',
    headerFont: '0.8125em',
    sectionFont: '0.875em',
    tilePad: '0.875em',
    tileGap: '0.375em',
    tileRadius: '0.875em',
    ddRadius: '0.5em',
    iconBox: '2.375em',
    iconGlyph: '1.1875em',
    nameFont: '0.8125em',
    valueFont: '1.125em',
    subFont: '0.6875em',
    unitFont: '0.6875em',
    ctrlMinH: '2.625em',
    ctrlPadX: '0.75em',
    ctrlIconSize: '1.25em',
    ddOptionFont: '0.8125em',
    ddOptionPadY: '0.5625em',
    ddOptionPadX: '0.75em',
    dropdownMinH: '7.5em',
    dropdownMaxH: '15em',
    progressH: '0.5em',
  },
  large: {
    cardPad: '1.5em',
    sectionPad: '1.5em',
    sectionGap: '1.25em',
    headerHeight: '2.75em',
    headerFont: '0.875em',
    sectionFont: '1em',
    tilePad: '1em',
    tileGap: '0.5em',
    tileRadius: '1em',
    ddRadius: '0.5625em',
    iconBox: '2.75em',
    iconGlyph: '1.375em',
    nameFont: '0.875em',
    valueFont: '1.25em',
    subFont: '0.75em',
    unitFont: '0.75em',
    ctrlMinH: '2.75em',
    ctrlPadX: '0.875em',
    ctrlIconSize: '1.375em',
    ddOptionFont: '0.875em',
    ddOptionPadY: '0.625em',
    ddOptionPadX: '0.875em',
    dropdownMinH: '8em',
    dropdownMaxH: '17.5em',
    progressH: '0.625em',
  },
};

export const SIZE_PROFILES = {
  'tile-grid': {
    compact: {
      ...PROFILE_BASE.compact,
      tileMinH: '5.125em',
      headerTitleFont: '0.95em',
      headerSubFont: '0.82em',
      displayNameFont: '1.035em',
      displayValueFont: '0.9775em',
    },
    standard: {
      ...PROFILE_BASE.standard,
      tileMinH: '5.75em',
      headerTitleFont: '0.95em',
      headerSubFont: '0.82em',
      displayNameFont: '1.12125em',
      displayValueFont: '1.035em',
    },
    large: {
      ...PROFILE_BASE.large,
      tileMinH: '6.375em',
      headerTitleFont: '0.9625em',
      headerSubFont: '0.825em',
      displayNameFont: '1.2075em',
      displayValueFont: '1.15em',
    },
  },

  'speaker-tile': {
    compact: {
      ...PROFILE_BASE.compact,
      tilePad: '0.5em',
      tileGap: '0.25em',
      tileMinH: '5.25em',
      progressH: '0.375em',
      headerTitleFont: '0.95em',
      headerSubFont: '0.82em',
      displayNameFont: '1em',
      displayMetaFont: '0.82em',
      displayValueFont: '1.115625em',
      displayActionFont: '0.88em',
    },
    standard: {
      ...PROFILE_BASE.standard,
      tilePad: '0.625em',
      tileGap: '0.3125em',
      tileMinH: '5.875em',
      subFont: '0.71875em',
      progressH: '0.4375em',
      headerTitleFont: '0.95em',
      headerSubFont: '0.82em',
      displayNameFont: '1.04em',
      displayMetaFont: '0.82em',
      displayValueFont: '1.18125em',
      displayActionFont: '0.88em',
    },
    large: {
      ...PROFILE_BASE.large,
      tilePad: '0.75em',
      tileGap: '0.4375em',
      tileMinH: '6.5em',
      progressH: '0.5625em',
      headerTitleFont: '0.9625em',
      headerSubFont: '0.825em',
      displayNameFont: '1.12em',
      displayMetaFont: '0.855em',
      displayValueFont: '1.3125em',
      displayActionFont: '0.88em',
    },
  },

  'rooms-row': {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: '0.96875em',
      rowMinH: '6.8125em',
      rowGap: '0.34em',
      rowTitleFont: '0.9375em',
      rowStatusFont: '0.8125em',
      orbSize: '2.96em',
      orbIcon: '1.56em',
      toggleSize: '2.96em',
      toggleIcon: '1.56em',
      chevronSize: '1.28em',
      rowBtnRadius: '0.5625em',
      rowDisplayNameFont: '0.99em',
      rowDisplayStatusFont: '0.8925em',
      rowLeadIconBox: '1.9536em',
      rowLeadIconGlyph: '1.1544em',
      rowControlSize: '3.3152em',
      rowControlIcon: '1.7472em',
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: '1.0625em',
      rowMinH: '7.3125em',
      rowGap: '0.52em',
      rowTitleFont: '1.03125em',
      rowStatusFont: '0.90625em',
      orbSize: '3.16em',
      orbIcon: '1.62em',
      toggleSize: '3.16em',
      toggleIcon: '1.62em',
      chevronSize: '1.56em',
      rowBtnRadius: '0.75em',
      rowDisplayNameFont: '1.018875em',
      rowDisplayStatusFont: '0.89775em',
      rowLeadIconBox: '2.0856em',
      rowLeadIconGlyph: '1.1988em',
      rowControlSize: '3.16em',
      rowControlIcon: '1.62em',
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: '1.125em',
      rowMinH: '7.875em',
      rowGap: '0.625em',
      rowTitleFont: '1.125em',
      rowStatusFont: '0.96875em',
      orbSize: '3.4em',
      orbIcon: '1.76em',
      toggleSize: '3.4em',
      toggleIcon: '1.76em',
      chevronSize: '1.7em',
      rowBtnRadius: '0.8125em',
      rowDisplayNameFont: '1.155em',
      rowDisplayStatusFont: '1.05em',
      rowLeadIconBox: '2.244em',
      rowLeadIconGlyph: '1.3024em',
      rowControlSize: '3.4em',
      rowControlIcon: '1.76em',
    },
  },

  'indicator-tile': {
    compact: {
      ...PROFILE_BASE.compact,
      headerFont: '0.875em',
      sectionFont: '0.875em',
      tileMinH: '5.5em',
      timerFont: '1.0625em',
      timerLetterSpacing: '0.02em',
      alarmPillFont: '0.875em',
      alarmBtnH: '1.125em',
      alarmBtnFont: '0.5em',
      alarmIconSize: '0.625em',
      dropdownMaxH: '13.75em',
      displayIconBox: '2.55em',
      displayIconGlyph: '1.29625em',
      displayNameFont: '1.035em',
      displayValueFont: '1.04125em',
      displayMetaFont: '0.87125em',
      timerDisplayFont: '1.1475em',
      dropdownValueFont: '0.87em',
      statusTileGap: '0.13em',
      statusTilePadTop: '0.425em',
      statusTilePadBottom: '0.5625em',
    },
    standard: {
      ...PROFILE_BASE.standard,
      headerFont: '1em',
      sectionFont: '0.9375em',
      tileMinH: '5.875em',
      timerFont: '1.125em',
      timerLetterSpacing: '0.03125em',
      alarmPillFont: '0.9375em',
      alarmBtnH: '1.25em',
      alarmBtnFont: '0.5625em',
      alarmIconSize: '0.6875em',
      dropdownMaxH: '15em',
      displayIconBox: '2.85em',
      displayIconGlyph: '1.44875em',
      displayNameFont: '1.12125em',
      displayValueFont: '1.1025em',
      displayMetaFont: '0.9225em',
      timerDisplayFont: '1.215em',
      dropdownValueFont: '0.9425em',
      statusTileGap: '0.195em',
      statusTilePadTop: '0.595em',
      statusTilePadBottom: '0.7875em',
    },
    large: {
      ...PROFILE_BASE.large,
      headerFont: '1.125em',
      sectionFont: '1em',
      tileMinH: '7.125em',
      timerFont: '1.25em',
      timerLetterSpacing: '0.04em',
      alarmPillFont: '1em',
      alarmBtnH: '1.375em',
      alarmBtnFont: '0.625em',
      alarmIconSize: '0.75em',
      dropdownMaxH: '17.5em',
      displayIconBox: '3.3em',
      displayIconGlyph: '1.6775em',
      displayNameFont: '1.2075em',
      displayValueFont: '1.225em',
      displayMetaFont: '1.025em',
      timerDisplayFont: '1.35em',
      dropdownValueFont: '1.015em',
      statusTileGap: '0.26em',
      statusTilePadTop: '0.68em',
      statusTilePadBottom: '0.9em',
    },
  },

  'indicator-row': {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: '0.875em',
      rowMinH: '3em',
      rowGap: '0.625em',
      rowPadY: '0.625em',
      rowPadX: '0.125em',
      iconBox: '2em',
      iconGlyph: '1.125em',
      nameFont: '0.75em',
      subFont: '0.6875em',
      valueFont: '1.125em',
      unitFont: '0.6875em',
      sparklineW: '2.5em',
      sparklineH: '1.25em',
      trendBox: '1.125em',
      trendGlyph: '0.875em',
      sparkStroke: '0.09375em',
      displayIconBox: '2.24em',
      displayIconGlyph: '1.26em',
      displayNameFont: '0.99em',
      displayValueFont: '1.035em',
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: '0.9375em',
      rowMinH: '3.5em',
      rowGap: '0.75em',
      rowPadY: '0.75em',
      rowPadX: '0.25em',
      iconBox: '2.25em',
      iconGlyph: '1.25em',
      nameFont: '0.8125em',
      subFont: '0.6875em',
      valueFont: '1.25em',
      unitFont: '0.6875em',
      sparklineW: '3em',
      sparklineH: '1.5em',
      trendBox: '1.25em',
      trendGlyph: '1em',
      sparkStroke: '0.09375em',
      displayIconBox: '2.52em',
      displayIconGlyph: '1.4em',
      displayNameFont: '1.0725em',
      displayValueFont: '1.15em',
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: '1em',
      rowMinH: '4em',
      rowGap: '0.875em',
      rowPadY: '0.875em',
      rowPadX: '0.3125em',
      iconBox: '2.5em',
      iconGlyph: '1.375em',
      nameFont: '0.875em',
      subFont: '0.75em',
      valueFont: '1.375em',
      unitFont: '0.75em',
      sparklineW: '3.5em',
      sparklineH: '1.75em',
      trendBox: '1.375em',
      trendGlyph: '1.125em',
      sparkStroke: '0.109375em',
      displayIconBox: '2.8em',
      displayIconGlyph: '1.54em',
      displayNameFont: '1.155em',
      displayValueFont: '1.265em',
    },
  },
};

export const TOKEN_MAP = {
  cardPad: '--_tunet-card-pad',
  sectionPad: '--_tunet-section-pad',
  sectionGap: '--_tunet-section-gap',
  headerHeight: '--_tunet-header-height',
  headerFont: '--_tunet-header-font',
  headerTitleFont: '--_tunet-header-title-font',
  headerSubFont: '--_tunet-header-sub-font',
  sectionFont: '--_tunet-section-font',
  tilePad: '--_tunet-tile-pad',
  tileGap: '--_tunet-tile-gap',
  tileRadius: '--_tunet-tile-radius',
  tileMinH: '--_tunet-tile-min-h',
  iconBox: '--_tunet-icon-box',
  iconGlyph: '--_tunet-icon-glyph',
  nameFont: '--_tunet-name-font',
  valueFont: '--_tunet-value-font',
  subFont: '--_tunet-sub-font',
  unitFont: '--_tunet-unit-font',
  displayNameFont: '--_tunet-display-name-font',
  displayValueFont: '--_tunet-display-value-font',
  displayMetaFont: '--_tunet-display-meta-font',
  displayActionFont: '--_tunet-display-action-font',
  displayIconBox: '--_tunet-display-icon-box',
  displayIconGlyph: '--_tunet-display-icon-glyph',
  progressH: '--_tunet-progress-h',
  ctrlMinH: '--_tunet-ctrl-min-h',
  ctrlPadX: '--_tunet-ctrl-pad-x',
  ctrlIconSize: '--_tunet-ctrl-icon-size',
  ddRadius: '--_tunet-dd-radius',
  ddOptionFont: '--_tunet-dd-option-font',
  ddOptionPadY: '--_tunet-dd-option-pad-y',
  ddOptionPadX: '--_tunet-dd-option-pad-x',
  dropdownMinH: '--_tunet-dropdown-min-h',
  dropdownMaxH: '--_tunet-dropdown-max-h',
  rowMinH: '--_tunet-row-min-h',
  rowGap: '--_tunet-row-gap',
  rowTitleFont: '--_tunet-row-title-font',
  rowStatusFont: '--_tunet-row-status-font',
  orbSize: '--_tunet-orb-size',
  orbIcon: '--_tunet-orb-icon',
  toggleSize: '--_tunet-toggle-size',
  toggleIcon: '--_tunet-toggle-icon',
  chevronSize: '--_tunet-chevron-size',
  rowBtnRadius: '--_tunet-row-btn-radius',
  timerFont: '--_tunet-timer-font',
  timerDisplayFont: '--_tunet-timer-display-font',
  timerLetterSpacing: '--_tunet-timer-ls',
  alarmPillFont: '--_tunet-alarm-pill-font',
  alarmBtnH: '--_tunet-alarm-btn-h',
  alarmBtnFont: '--_tunet-alarm-btn-font',
  alarmIconSize: '--_tunet-alarm-icon-size',
  rowPadY: '--_tunet-row-pad-y',
  rowPadX: '--_tunet-row-pad-x',
  rowDisplayNameFont: '--_tunet-row-display-name-font',
  rowDisplayStatusFont: '--_tunet-row-display-status-font',
  rowLeadIconBox: '--_tunet-row-lead-icon-box',
  rowLeadIconGlyph: '--_tunet-row-lead-icon-glyph',
  rowControlSize: '--_tunet-row-control-size',
  rowControlIcon: '--_tunet-row-control-icon',
  dropdownValueFont: '--_tunet-dropdown-value-font',
  statusTileGap: '--_tunet-status-tile-gap',
  statusTilePadTop: '--_tunet-status-pad-top',
  statusTilePadBottom: '--_tunet-status-pad-bottom',
  sparklineW: '--_tunet-sparkline-w',
  sparklineH: '--_tunet-sparkline-h',
  trendBox: '--_tunet-trend-box',
  trendGlyph: '--_tunet-trend-glyph',
  sparkStroke: '--_tunet-spark-stroke',
};

export const OVERRIDE_PAIRS = [
  ['--profile-card-pad', '--_tunet-card-pad'],
  ['--profile-tile-pad', '--_tunet-tile-pad'],
  ['--profile-tile-gap', '--_tunet-tile-gap'],
  ['--profile-icon-box', '--_tunet-icon-box'],
  ['--profile-name-font', '--_tunet-name-font'],
  ['--profile-value-font', '--_tunet-value-font'],
  ['--profile-header-font', '--_tunet-header-font'],
  ['--profile-section-font', '--_tunet-section-font'],
  ['--profile-progress-h', '--_tunet-progress-h'],
];

let _warnedLegacyResolverWidthHint = false;

function normalizeSize(size) {
  if (size == null) return '';
  return String(size).trim().toLowerCase();
}

export function autoSizeFromWidth(widthPx) {
  const width = Number(widthPx);
  if (!Number.isFinite(width) || width <= 0) return 'standard';
  if (width < 600) return 'compact';
  return 'standard';
}

export function bucketFromWidth(widthPx) {
  const width = Number(widthPx);
  if (!Number.isFinite(width) || width <= 0) return 'md';
  if (width < 400) return 'xs';
  if (width < 600) return 'sm';
  if (width < 800) return 'md';
  return 'lg';
}

export function selectProfileSize({ preset, layout, widthHint, userSize } = {}) {
  const normalizedPreset = String(preset || '').trim().toLowerCase();
  const normalizedLayout = String(layout || '').trim().toLowerCase();
  const rowMode = normalizedPreset === 'rooms' && (normalizedLayout === 'row' || normalizedLayout === 'slim');
  const mapKey = rowMode ? 'rooms-row' : normalizedPreset;
  const family = PRESET_FAMILY_MAP[mapKey];
  const explicitSize = normalizeSize(userSize);
  const sizeFromUser = VALID_SIZES.has(explicitSize) ? explicitSize : '';

  if (explicitSize && !sizeFromUser) {
    console.warn(`[TunetProfile] Unknown userSize "${userSize}". Falling back to auto size.`);
  }

  if (!family) {
    console.warn(`[TunetProfile] Unknown preset "${preset}" (layout: "${layout}"). Falling back to tile-grid.`);
    return { family: 'tile-grid', size: sizeFromUser || autoSizeFromWidth(widthHint) };
  }

  return { family, size: sizeFromUser || autoSizeFromWidth(widthHint) };
}

export function resolveSizeProfile({ family, size, widthHint } = {}) {
  if (widthHint !== undefined && !_warnedLegacyResolverWidthHint) {
    _warnedLegacyResolverWidthHint = true;
    console.warn('[TunetProfile] resolveSizeProfile(widthHint) is deprecated. Width-based size selection belongs in selectProfileSize().');
  }

  const normalizedFamily = String(family || '').trim();
  const normalizedSize = normalizeSize(size) || 'standard';
  const familyProfiles = SIZE_PROFILES[normalizedFamily];

  if (!familyProfiles) {
    console.warn(`[TunetProfile] Unknown family "${family}". Falling back to tile-grid standard.`);
    return { ...SIZE_PROFILES['tile-grid'].standard };
  }

  if (!familyProfiles[normalizedSize]) {
    console.warn(`[TunetProfile] Unknown size "${size}" for family "${family}". Falling back to standard.`);
    return { ...familyProfiles.standard };
  }

  return { ...familyProfiles[normalizedSize] };
}

export function _setProfileVars(hostElement, profile = {}, { bridgePublicOverrides = true } = {}) {
  if (!hostElement || !hostElement.style) return;

  for (const propName of [...hostElement.style]) {
    if (propName.startsWith('--_tunet-')) hostElement.style.removeProperty(propName);
  }

  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    if (profile[key] !== undefined) hostElement.style.setProperty(cssVar, profile[key]);
  }

  if (!bridgePublicOverrides || typeof getComputedStyle !== 'function') return;

  const computed = getComputedStyle(hostElement);
  for (const [publicVar, privateVar] of OVERRIDE_PAIRS) {
    const override = computed.getPropertyValue(publicVar).trim();
    if (override) hostElement.style.setProperty(privateVar, override);
  }
}

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
    line-height: 1.1;
    text-transform: none;
    letter-spacing: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
    flex-shrink: 0;
    overflow: visible;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 400;
    --ms-grad: 0;
    --ms-opsz: 24;
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
    padding: var(--card-pad, 20px);
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
    padding: var(--section-pad, 20px);
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
    padding: var(--tile-pad, 14px);
    display: flex;
    flex-direction: column;
    gap: var(--tile-gap, 6px);
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

/** Shared control button surface (info tile, toggle buttons, selectors) */
export const CTRL_SURFACE = `
  .ctrl-btn {
    min-height: var(--ctrl-min-h, 42px);
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 var(--ctrl-pad-x, 12px);
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized),
      color var(--motion-fast) var(--ease-standard);
    font-family: inherit;
    font-size: var(--ctrl-font-size, 12px);
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
    padding: var(--dd-option-pad-y, 9px) var(--dd-option-pad-x, 12px);
    border-radius: 11px;
    font-size: var(--dd-option-font-size, 13px);
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
  @container (max-width: 440px) {
    :host {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
      --card-pad: var(--density-mobile-card-pad, 14px);
      --section-pad: var(--density-mobile-section-pad, 14px);
      --tile-pad: var(--density-mobile-tile-pad, 10px);
      --tile-gap: var(--density-mobile-tile-gap, 4px);
      --ctrl-min-h: var(--density-mobile-ctrl-min-h, 38px);
      --ctrl-font-size: var(--density-mobile-ctrl-font, 12px);
      --ctrl-pad-x: var(--density-mobile-ctrl-pad-x, 10px);
      --dd-option-font-size: var(--density-mobile-dd-font, 12px);
      --dd-option-pad-y: var(--density-mobile-dd-pad-y, 8px);
      --dd-option-pad-x: var(--density-mobile-dd-pad-x, 10px);
      --rooms-row-btn-size: var(--density-mobile-rooms-row-btn-size, 3.4em);
      --rooms-row-btn-icon-size: var(--density-mobile-rooms-row-btn-icon-size, 1.76em);
      --rooms-row-btn-size-slim: var(--density-mobile-rooms-row-btn-size-slim, 2.96em);
      --rooms-row-btn-icon-size-slim: var(--density-mobile-rooms-row-btn-icon-size-slim, 1.56em);
      --rooms-all-toggle-min-h: var(--density-mobile-rooms-all-toggle-min-h, 2.62em);
      --rooms-all-toggle-min-w: var(--density-mobile-rooms-all-toggle-min-w, 6.96em);
      --rooms-all-toggle-font: var(--density-mobile-rooms-all-toggle-font, 0.84em);
      --rooms-all-toggle-icon: var(--density-mobile-rooms-all-toggle-icon, 1.26em);
      --type-label: var(--type-label-mobile, 13px);
      --type-sub: var(--type-sub-mobile, 11.5px);
      --type-value: var(--type-value-mobile, 18px);
      --type-chip: var(--type-chip-mobile, 13px);
      --type-row-title: var(--type-row-title-mobile, 18px);
      --type-row-status: var(--type-row-status-mobile, 15.5px);
    }
    .card { padding: var(--card-pad); }
    .section-container { padding: var(--section-pad); border-radius: 24px; }
    .tile { padding: var(--tile-pad); gap: var(--tile-gap); }
  }

  @supports not (container-type: inline-size) {
    @media (max-width: 440px) {
      :host {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        --card-pad: var(--density-mobile-card-pad, 14px);
        --section-pad: var(--density-mobile-section-pad, 14px);
        --tile-pad: var(--density-mobile-tile-pad, 10px);
        --tile-gap: var(--density-mobile-tile-gap, 4px);
        --ctrl-min-h: var(--density-mobile-ctrl-min-h, 38px);
        --ctrl-font-size: var(--density-mobile-ctrl-font, 12px);
        --ctrl-pad-x: var(--density-mobile-ctrl-pad-x, 10px);
        --dd-option-font-size: var(--density-mobile-dd-font, 12px);
        --dd-option-pad-y: var(--density-mobile-dd-pad-y, 8px);
        --dd-option-pad-x: var(--density-mobile-dd-pad-x, 10px);
        --rooms-row-btn-size: var(--density-mobile-rooms-row-btn-size, 3.4em);
        --rooms-row-btn-icon-size: var(--density-mobile-rooms-row-btn-icon-size, 1.76em);
        --rooms-row-btn-size-slim: var(--density-mobile-rooms-row-btn-size-slim, 2.96em);
        --rooms-row-btn-icon-size-slim: var(--density-mobile-rooms-row-btn-icon-size-slim, 1.56em);
        --rooms-all-toggle-min-h: var(--density-mobile-rooms-all-toggle-min-h, 2.62em);
        --rooms-all-toggle-min-w: var(--density-mobile-rooms-all-toggle-min-w, 6.96em);
        --rooms-all-toggle-font: var(--density-mobile-rooms-all-toggle-font, 0.84em);
        --rooms-all-toggle-icon: var(--density-mobile-rooms-all-toggle-icon, 1.26em);
        --type-label: var(--type-label-mobile, 13px);
        --type-sub: var(--type-sub-mobile, 11.5px);
        --type-value: var(--type-value-mobile, 18px);
        --type-chip: var(--type-chip-mobile, 13px);
        --type-row-title: var(--type-row-title-mobile, 18px);
        --type-row-status: var(--type-row-status-mobile, 15.5px);
      }
      .card { padding: var(--card-pad); }
      .section-container { padding: var(--section-pad); border-radius: 24px; }
      .tile { padding: var(--tile-pad); gap: var(--tile-gap); }
    }
  }
`;

// ═══════════════════════════════════════════════════════════
// FONT INJECTION
// ═══════════════════════════════════════════════════════════

/**
 * Inject Google Fonts links into document.head (idempotent).
 * Call once from any card's constructor.
 *
 * Uses window-scoped flag so that bundled copies (one per card)
 * share a single injection guard instead of each bundle tracking
 * its own module-scoped flag independently.
 */
export function injectFonts() {
  if (window.__tunetFontsInjected) return;
  window.__tunetFontsInjected = true;
  const links = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
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
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
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
 * Normalize a navigation path for Home Assistant routing.
 * @param {string} value
 * @returns {string}
 */
export function normalizePath(value) {
  const raw = (value == null ? '' : String(value)).trim();
  if (!raw) return '';
  return raw.startsWith('/') || raw.startsWith('#') ? raw : `/${raw}`;
}

/**
 * Navigate using HA's navigation event, with history fallback.
 * @param {string} path
 * @param {Object} options
 * @param {boolean} options.replace
 * @param {HTMLElement|null} options.sourceEl
 */
export function navigatePath(path, { replace = false, sourceEl = null } = {}) {
  const normalized = normalizePath(path);
  if (!normalized) return;

  const targets = [];
  if (sourceEl && typeof sourceEl.dispatchEvent === 'function') targets.push(sourceEl);
  if (document && typeof document.dispatchEvent === 'function') targets.push(document);
  if (window && typeof window.dispatchEvent === 'function') targets.push(window);

  for (const target of targets) {
    const navEvent = new CustomEvent('hass-navigate', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { path: normalized, replace },
    });
    const notCanceled = target.dispatchEvent(navEvent);
    if (!notCanceled || navEvent.defaultPrevented) return;
  }

  if (replace) {
    window.history.replaceState(null, '', normalized);
  } else {
    window.history.pushState(null, '', normalized);
  }
  window.dispatchEvent(new Event('location-changed'));
}

/**
 * Execute a Lovelace-style action object.
 * Supports: more-info, navigate, url, call-service, fire-dom-event, none.
 * @param {Object} args
 * @param {HTMLElement} args.element
 * @param {Object} args.hass
 * @param {Object} args.actionConfig
 * @param {string} args.defaultEntityId
 * @returns {boolean}
 */
export function runCardAction({
  element,
  hass,
  actionConfig,
  defaultEntityId = '',
} = {}) {
  if (!element || !hass || !actionConfig) return false;

  const action = actionConfig.action || 'more-info';
  if (action === 'none') return true;

  if (action === 'more-info') {
    const entityId = actionConfig.entity || defaultEntityId;
    if (!entityId) return false;
    fireEvent(element, 'hass-more-info', { entityId });
    return true;
  }

  if (action === 'navigate') {
    navigatePath(actionConfig.navigation_path || actionConfig.path || '', { sourceEl: element });
    return true;
  }

  if (action === 'url') {
    if (!actionConfig.url_path) return false;
    const target = String(actionConfig.url_path).trim();
    if (!target) return false;
    if (actionConfig.new_tab) {
      window.open(target, '_blank');
      return true;
    }
    if (target.startsWith('/') || target.startsWith('#')) {
      navigatePath(target, { sourceEl: element });
      return true;
    }
    window.location.assign(target);
    return true;
  }

  if (action === 'call-service') {
    const service = String(actionConfig.service || '').trim();
    const [domain, serviceName] = service.split('.');
    if (!domain || !serviceName) return false;
    hass.callService(domain, serviceName, actionConfig.service_data || {});
    return true;
  }

  if (action === 'fire-dom-event') {
    fireEvent(element, 'll-custom', actionConfig);
    return true;
  }

  const fallbackEntityId = actionConfig.entity || defaultEntityId;
  if (!fallbackEntityId) return false;
  fireEvent(element, 'hass-more-info', { entityId: fallbackEntityId });
  return true;
}

/**
 * Shared axis-locked drag helper for touch/pointer interactions.
 * Vertical/ambiguous gestures pass through for native page scroll.
 * Horizontal gestures lock drag and can call preventDefault() safely.
 *
 * @param {Object} options
 * @param {HTMLElement} options.element
 * @param {Function} [options.shouldStart] - (event) => boolean
 * @param {Function} [options.getContext] - (event) => any context object (return false to abort)
 * @param {Function} [options.onDragStart] - (event, payload) => void
 * @param {Function} [options.onDragMove] - (event, payload) => void
 * @param {Function} [options.onDragEnd] - (event, payload) => void
 * @param {Function} [options.onTap] - (event, payload) => void
 * @param {Function} [options.onLongPress] - (event, payload) => void
 * @param {number} [options.deadzone=8]
 * @param {number} [options.axisBias=1.3]
 * @param {number} [options.longPressMs=500]
 * @param {boolean} [options.pointerCapture=false]
 * @returns {{destroy: Function}}
 */
export function createAxisLockedDrag(options = {}) {
  const {
    element,
    shouldStart,
    getContext,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    onLongPress,
    deadzone = 8,
    axisBias = 1.3,
    longPressMs = 500,
    pointerCapture = false,
  } = options;

  if (!element) {
    return { destroy() {} };
  }

  let state = null;

  const clearLongPress = () => {
    if (!state || !state.longPressTimer) return;
    clearTimeout(state.longPressTimer);
    state.longPressTimer = null;
  };

  const releaseCapture = () => {
    if (!state || !pointerCapture) return;
    const captureEl = state.captureEl;
    if (!captureEl || typeof captureEl.releasePointerCapture !== 'function') return;
    try {
      if (captureEl.hasPointerCapture && captureEl.hasPointerCapture(state.pointerId)) {
        captureEl.releasePointerCapture(state.pointerId);
      }
    } catch (_) {
      // Ignore release failures on platforms without active pointer capture.
    }
  };

  const removeDocumentListeners = () => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
  };

  const cleanup = () => {
    clearLongPress();
    releaseCapture();
    removeDocumentListeners();
    state = null;
  };

  const payloadFromEvent = (event) => {
    if (!state) return null;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    return {
      context: state.context,
      pointerId: state.pointerId,
      pointerType: state.pointerType,
      startX: state.startX,
      startY: state.startY,
      dx,
      dy,
      absDx,
      absDy,
      phase: state.phase,
    };
  };

  const endDrag = (event, { committed = false, cancelled = false } = {}) => {
    if (!state) return;
    const wasDrag = state.phase === 'drag';
    const payload = payloadFromEvent(event);
    cleanup();
    if (wasDrag && typeof onDragEnd === 'function') {
      onDragEnd(event, { ...payload, committed, cancelled });
    }
  };

  function onPointerMove(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    const payload = payloadFromEvent(event);
    if (!payload) return;

    if (state.phase === 'pending') {
      const traveled = Math.hypot(payload.dx, payload.dy);
      if (traveled < deadzone) return;

      clearLongPress();

      if (payload.absDy > payload.absDx * axisBias) {
        cleanup();
        return;
      }

      if (payload.absDx >= payload.absDy * axisBias) {
        state.phase = 'drag';
        if (typeof onDragStart === 'function') {
          onDragStart(event, { ...payload, phase: 'drag' });
        }
      } else {
        cleanup();
        return;
      }
    }

    if (!state || state.phase !== 'drag') return;

    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof onDragMove === 'function') {
      onDragMove(event, { ...payload, phase: 'drag' });
    }
  }

  function onPointerUp(event) {
    if (!state || event.pointerId !== state.pointerId) return;

    if (state.phase === 'drag') {
      endDrag(event, { committed: true, cancelled: false });
      return;
    }

    const payload = payloadFromEvent(event);
    const longPressFired = !!state.longPressFired;
    cleanup();
    if (!longPressFired && typeof onTap === 'function') {
      onTap(event, payload);
    }
  }

  function onPointerCancel(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    endDrag(event, { committed: false, cancelled: true });
  }

  const onPointerDown = (event) => {
    if (state) return;
    if (!event.isPrimary) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (typeof shouldStart === 'function' && !shouldStart(event)) return;

    const context = typeof getContext === 'function' ? getContext(event) : {};
    if (context === false) return;

    const captureEl = context && context.captureEl instanceof HTMLElement
      ? context.captureEl
      : element;

    state = {
      pointerId: event.pointerId,
      pointerType: event.pointerType || 'mouse',
      startX: event.clientX,
      startY: event.clientY,
      phase: 'pending',
      context,
      captureEl,
      longPressTimer: null,
      longPressFired: false,
    };

    if (pointerCapture && captureEl && typeof captureEl.setPointerCapture === 'function') {
      try {
        captureEl.setPointerCapture(event.pointerId);
      } catch (_) {
        // Ignore capture failures in contexts that reject pointer capture.
      }
    }

    if (typeof onLongPress === 'function' && longPressMs > 0) {
      state.longPressTimer = setTimeout(() => {
        if (!state || state.phase !== 'pending') return;
        state.longPressFired = true;
        const payload = {
          context: state.context,
          pointerId: state.pointerId,
          pointerType: state.pointerType,
          startX: state.startX,
          startY: state.startY,
          dx: 0,
          dy: 0,
          absDx: 0,
          absDy: 0,
          phase: state.phase,
        };
        onLongPress(event, payload);
        cleanup();
      }, longPressMs);
    }

    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
  };

  element.addEventListener('pointerdown', onPointerDown);

  return {
    destroy() {
      cleanup();
      element.removeEventListener('pointerdown', onPointerDown);
    },
  };
}

/**
 * Render a "needs configuration" placeholder into a card's shadow root.
 * Call from setConfig() when required config is missing, instead of throwing.
 *
 * @param {ShadowRoot} shadowRoot - The card's shadow root
 * @param {string} message - What the user needs to configure (e.g. "Select a weather entity")
 * @param {string} [cardName] - Optional card display name for the header
 */
export function renderConfigPlaceholder(shadowRoot, message, cardName) {
  if (!shadowRoot) return;
  shadowRoot.innerHTML = `
    <style>
      :host { display: block; }
      .config-prompt {
        padding: 1.5em;
        text-align: center;
        font-family: var(--ha-card-header-font-family, 'DM Sans', sans-serif);
        color: var(--primary-text-color, #1e293b);
        background: var(--ha-card-background, rgba(255,255,255,0.68));
        border-radius: var(--ha-card-border-radius, 1em);
        border: 1px dashed var(--divider-color, rgba(0,0,0,0.12));
      }
      .config-prompt .name {
        font-weight: 600;
        font-size: 0.875em;
        margin-bottom: 0.5em;
        opacity: 0.7;
      }
      .config-prompt .message {
        font-size: 0.8125em;
        opacity: 0.55;
      }
    </style>
    <div class="config-prompt">
      ${cardName ? `<div class="name">${cardName}</div>` : ''}
      <div class="message">${message}</div>
    </div>
  `;
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

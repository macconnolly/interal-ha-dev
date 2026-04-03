// Dashboard/Tunet/Cards/v3/tunet_base.js
var TOKENS = `
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
var TOKENS_MIDNIGHT = `
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
var SIZE_KEYS = ["compact", "standard", "large"];
var VALID_SIZES = new Set(SIZE_KEYS);
var PRESET_FAMILY_MAP = {
  lighting: "tile-grid",
  speakers: "speaker-tile",
  rooms: "tile-grid",
  "rooms-row": "rooms-row",
  status: "indicator-tile",
  environment: "indicator-row"
};
var PROFILE_BASE = {
  compact: {
    cardPad: "0.875em",
    sectionPad: "0.875em",
    sectionGap: "0.75em",
    headerHeight: "2.375em",
    headerFont: "0.75em",
    sectionFont: "0.8125em",
    tilePad: "0.625em",
    tileGap: "0.25em",
    tileRadius: "0.75em",
    ddRadius: "0.4375em",
    iconBox: "2.125em",
    iconGlyph: "1.0625em",
    nameFont: "0.75em",
    valueFont: "1.0625em",
    subFont: "0.6875em",
    unitFont: "0.6875em",
    ctrlMinH: "2.375em",
    ctrlPadX: "0.625em",
    ctrlIconSize: "1.125em",
    ddOptionFont: "0.75em",
    ddOptionPadY: "0.5em",
    ddOptionPadX: "0.625em",
    dropdownMinH: "7.5em",
    dropdownMaxH: "13.75em",
    progressH: "0.375em"
  },
  standard: {
    cardPad: "1.25em",
    sectionPad: "1.25em",
    sectionGap: "1em",
    headerHeight: "2.625em",
    headerFont: "0.8125em",
    sectionFont: "0.875em",
    tilePad: "0.875em",
    tileGap: "0.375em",
    tileRadius: "0.875em",
    ddRadius: "0.5em",
    iconBox: "2.375em",
    iconGlyph: "1.1875em",
    nameFont: "0.8125em",
    valueFont: "1.125em",
    subFont: "0.6875em",
    unitFont: "0.6875em",
    ctrlMinH: "2.625em",
    ctrlPadX: "0.75em",
    ctrlIconSize: "1.25em",
    ddOptionFont: "0.8125em",
    ddOptionPadY: "0.5625em",
    ddOptionPadX: "0.75em",
    dropdownMinH: "7.5em",
    dropdownMaxH: "15em",
    progressH: "0.5em"
  },
  large: {
    cardPad: "1.5em",
    sectionPad: "1.5em",
    sectionGap: "1.25em",
    headerHeight: "2.75em",
    headerFont: "0.875em",
    sectionFont: "1em",
    tilePad: "1em",
    tileGap: "0.5em",
    tileRadius: "1em",
    ddRadius: "0.5625em",
    iconBox: "2.75em",
    iconGlyph: "1.375em",
    nameFont: "0.875em",
    valueFont: "1.25em",
    subFont: "0.75em",
    unitFont: "0.75em",
    ctrlMinH: "2.75em",
    ctrlPadX: "0.875em",
    ctrlIconSize: "1.375em",
    ddOptionFont: "0.875em",
    ddOptionPadY: "0.625em",
    ddOptionPadX: "0.875em",
    dropdownMinH: "8em",
    dropdownMaxH: "17.5em",
    progressH: "0.625em"
  }
};
var SIZE_PROFILES = {
  "tile-grid": {
    compact: {
      ...PROFILE_BASE.compact,
      tileMinH: "5.125em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.035em",
      displayValueFont: "0.9775em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      tileMinH: "5.75em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.12125em",
      displayValueFont: "1.035em"
    },
    large: {
      ...PROFILE_BASE.large,
      tileMinH: "6.375em",
      headerTitleFont: "0.9625em",
      headerSubFont: "0.825em",
      displayNameFont: "1.2075em",
      displayValueFont: "1.15em"
    }
  },
  "speaker-tile": {
    compact: {
      ...PROFILE_BASE.compact,
      tilePad: "0.5em",
      tileGap: "0.25em",
      tileMinH: "5.25em",
      progressH: "0.375em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1em",
      displayMetaFont: "0.82em",
      displayValueFont: "1.115625em",
      displayActionFont: "0.88em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      tilePad: "0.625em",
      tileGap: "0.3125em",
      tileMinH: "5.875em",
      subFont: "0.71875em",
      progressH: "0.4375em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.04em",
      displayMetaFont: "0.82em",
      displayValueFont: "1.18125em",
      displayActionFont: "0.88em"
    },
    large: {
      ...PROFILE_BASE.large,
      tilePad: "0.75em",
      tileGap: "0.4375em",
      tileMinH: "6.5em",
      progressH: "0.5625em",
      headerTitleFont: "0.9625em",
      headerSubFont: "0.825em",
      displayNameFont: "1.12em",
      displayMetaFont: "0.855em",
      displayValueFont: "1.3125em",
      displayActionFont: "0.88em"
    }
  },
  "rooms-row": {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: "0.96875em",
      rowMinH: "6.8125em",
      rowGap: "0.34em",
      rowTitleFont: "0.9375em",
      rowStatusFont: "0.8125em",
      orbSize: "2.96em",
      orbIcon: "1.56em",
      toggleSize: "2.96em",
      toggleIcon: "1.56em",
      chevronSize: "1.28em",
      rowBtnRadius: "0.5625em",
      rowDisplayNameFont: "0.99em",
      rowDisplayStatusFont: "0.8925em",
      rowLeadIconBox: "1.9536em",
      rowLeadIconGlyph: "1.1544em",
      rowControlSize: "3.3152em",
      rowControlIcon: "1.7472em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: "1.0625em",
      rowMinH: "7.3125em",
      rowGap: "0.52em",
      rowTitleFont: "1.03125em",
      rowStatusFont: "0.90625em",
      orbSize: "3.16em",
      orbIcon: "1.62em",
      toggleSize: "3.16em",
      toggleIcon: "1.62em",
      chevronSize: "1.56em",
      rowBtnRadius: "0.75em",
      rowDisplayNameFont: "1.018875em",
      rowDisplayStatusFont: "0.89775em",
      rowLeadIconBox: "2.0856em",
      rowLeadIconGlyph: "1.1988em",
      rowControlSize: "3.16em",
      rowControlIcon: "1.62em"
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: "1.125em",
      rowMinH: "7.875em",
      rowGap: "0.625em",
      rowTitleFont: "1.125em",
      rowStatusFont: "0.96875em",
      orbSize: "3.4em",
      orbIcon: "1.76em",
      toggleSize: "3.4em",
      toggleIcon: "1.76em",
      chevronSize: "1.7em",
      rowBtnRadius: "0.8125em",
      rowDisplayNameFont: "1.155em",
      rowDisplayStatusFont: "1.05em",
      rowLeadIconBox: "2.244em",
      rowLeadIconGlyph: "1.3024em",
      rowControlSize: "3.4em",
      rowControlIcon: "1.76em"
    }
  },
  "indicator-tile": {
    compact: {
      ...PROFILE_BASE.compact,
      headerFont: "0.875em",
      sectionFont: "0.875em",
      tileMinH: "5.5em",
      timerFont: "1.0625em",
      timerLetterSpacing: "0.02em",
      alarmPillFont: "0.875em",
      alarmBtnH: "1.125em",
      alarmBtnFont: "0.5em",
      alarmIconSize: "0.625em",
      dropdownMaxH: "13.75em",
      displayIconBox: "2.55em",
      displayIconGlyph: "1.29625em",
      displayNameFont: "1.035em",
      displayValueFont: "1.04125em",
      displayMetaFont: "0.87125em",
      timerDisplayFont: "1.1475em",
      dropdownValueFont: "0.87em",
      statusTileGap: "0.13em",
      statusTilePadTop: "0.425em",
      statusTilePadBottom: "0.5625em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      headerFont: "1em",
      sectionFont: "0.9375em",
      tileMinH: "5.875em",
      timerFont: "1.125em",
      timerLetterSpacing: "0.03125em",
      alarmPillFont: "0.9375em",
      alarmBtnH: "1.25em",
      alarmBtnFont: "0.5625em",
      alarmIconSize: "0.6875em",
      dropdownMaxH: "15em",
      displayIconBox: "2.85em",
      displayIconGlyph: "1.44875em",
      displayNameFont: "1.12125em",
      displayValueFont: "1.1025em",
      displayMetaFont: "0.9225em",
      timerDisplayFont: "1.215em",
      dropdownValueFont: "0.9425em",
      statusTileGap: "0.195em",
      statusTilePadTop: "0.595em",
      statusTilePadBottom: "0.7875em"
    },
    large: {
      ...PROFILE_BASE.large,
      headerFont: "1.125em",
      sectionFont: "1em",
      tileMinH: "7.125em",
      timerFont: "1.25em",
      timerLetterSpacing: "0.04em",
      alarmPillFont: "1em",
      alarmBtnH: "1.375em",
      alarmBtnFont: "0.625em",
      alarmIconSize: "0.75em",
      dropdownMaxH: "17.5em",
      displayIconBox: "3.3em",
      displayIconGlyph: "1.6775em",
      displayNameFont: "1.2075em",
      displayValueFont: "1.225em",
      displayMetaFont: "1.025em",
      timerDisplayFont: "1.35em",
      dropdownValueFont: "1.015em",
      statusTileGap: "0.26em",
      statusTilePadTop: "0.68em",
      statusTilePadBottom: "0.9em"
    }
  },
  "indicator-row": {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: "0.875em",
      rowMinH: "3em",
      rowGap: "0.625em",
      rowPadY: "0.625em",
      rowPadX: "0.125em",
      iconBox: "2em",
      iconGlyph: "1.125em",
      nameFont: "0.75em",
      subFont: "0.6875em",
      valueFont: "1.125em",
      unitFont: "0.6875em",
      sparklineW: "2.5em",
      sparklineH: "1.25em",
      trendBox: "1.125em",
      trendGlyph: "0.875em",
      sparkStroke: "0.09375em",
      displayIconBox: "2.24em",
      displayIconGlyph: "1.26em",
      displayNameFont: "0.99em",
      displayValueFont: "1.035em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: "0.9375em",
      rowMinH: "3.5em",
      rowGap: "0.75em",
      rowPadY: "0.75em",
      rowPadX: "0.25em",
      iconBox: "2.25em",
      iconGlyph: "1.25em",
      nameFont: "0.8125em",
      subFont: "0.6875em",
      valueFont: "1.25em",
      unitFont: "0.6875em",
      sparklineW: "3em",
      sparklineH: "1.5em",
      trendBox: "1.25em",
      trendGlyph: "1em",
      sparkStroke: "0.09375em",
      displayIconBox: "2.52em",
      displayIconGlyph: "1.4em",
      displayNameFont: "1.0725em",
      displayValueFont: "1.15em"
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: "1em",
      rowMinH: "4em",
      rowGap: "0.875em",
      rowPadY: "0.875em",
      rowPadX: "0.3125em",
      iconBox: "2.5em",
      iconGlyph: "1.375em",
      nameFont: "0.875em",
      subFont: "0.75em",
      valueFont: "1.375em",
      unitFont: "0.75em",
      sparklineW: "3.5em",
      sparklineH: "1.75em",
      trendBox: "1.375em",
      trendGlyph: "1.125em",
      sparkStroke: "0.109375em",
      displayIconBox: "2.8em",
      displayIconGlyph: "1.54em",
      displayNameFont: "1.155em",
      displayValueFont: "1.265em"
    }
  }
};
var TOKEN_MAP = {
  cardPad: "--_tunet-card-pad",
  sectionPad: "--_tunet-section-pad",
  sectionGap: "--_tunet-section-gap",
  headerHeight: "--_tunet-header-height",
  headerFont: "--_tunet-header-font",
  headerTitleFont: "--_tunet-header-title-font",
  headerSubFont: "--_tunet-header-sub-font",
  sectionFont: "--_tunet-section-font",
  tilePad: "--_tunet-tile-pad",
  tileGap: "--_tunet-tile-gap",
  tileRadius: "--_tunet-tile-radius",
  tileMinH: "--_tunet-tile-min-h",
  iconBox: "--_tunet-icon-box",
  iconGlyph: "--_tunet-icon-glyph",
  nameFont: "--_tunet-name-font",
  valueFont: "--_tunet-value-font",
  subFont: "--_tunet-sub-font",
  unitFont: "--_tunet-unit-font",
  displayNameFont: "--_tunet-display-name-font",
  displayValueFont: "--_tunet-display-value-font",
  displayMetaFont: "--_tunet-display-meta-font",
  displayActionFont: "--_tunet-display-action-font",
  displayIconBox: "--_tunet-display-icon-box",
  displayIconGlyph: "--_tunet-display-icon-glyph",
  progressH: "--_tunet-progress-h",
  ctrlMinH: "--_tunet-ctrl-min-h",
  ctrlPadX: "--_tunet-ctrl-pad-x",
  ctrlIconSize: "--_tunet-ctrl-icon-size",
  ddRadius: "--_tunet-dd-radius",
  ddOptionFont: "--_tunet-dd-option-font",
  ddOptionPadY: "--_tunet-dd-option-pad-y",
  ddOptionPadX: "--_tunet-dd-option-pad-x",
  dropdownMinH: "--_tunet-dropdown-min-h",
  dropdownMaxH: "--_tunet-dropdown-max-h",
  rowMinH: "--_tunet-row-min-h",
  rowGap: "--_tunet-row-gap",
  rowTitleFont: "--_tunet-row-title-font",
  rowStatusFont: "--_tunet-row-status-font",
  orbSize: "--_tunet-orb-size",
  orbIcon: "--_tunet-orb-icon",
  toggleSize: "--_tunet-toggle-size",
  toggleIcon: "--_tunet-toggle-icon",
  chevronSize: "--_tunet-chevron-size",
  rowBtnRadius: "--_tunet-row-btn-radius",
  timerFont: "--_tunet-timer-font",
  timerDisplayFont: "--_tunet-timer-display-font",
  timerLetterSpacing: "--_tunet-timer-ls",
  alarmPillFont: "--_tunet-alarm-pill-font",
  alarmBtnH: "--_tunet-alarm-btn-h",
  alarmBtnFont: "--_tunet-alarm-btn-font",
  alarmIconSize: "--_tunet-alarm-icon-size",
  rowPadY: "--_tunet-row-pad-y",
  rowPadX: "--_tunet-row-pad-x",
  rowDisplayNameFont: "--_tunet-row-display-name-font",
  rowDisplayStatusFont: "--_tunet-row-display-status-font",
  rowLeadIconBox: "--_tunet-row-lead-icon-box",
  rowLeadIconGlyph: "--_tunet-row-lead-icon-glyph",
  rowControlSize: "--_tunet-row-control-size",
  rowControlIcon: "--_tunet-row-control-icon",
  dropdownValueFont: "--_tunet-dropdown-value-font",
  statusTileGap: "--_tunet-status-tile-gap",
  statusTilePadTop: "--_tunet-status-pad-top",
  statusTilePadBottom: "--_tunet-status-pad-bottom",
  sparklineW: "--_tunet-sparkline-w",
  sparklineH: "--_tunet-sparkline-h",
  trendBox: "--_tunet-trend-box",
  trendGlyph: "--_tunet-trend-glyph",
  sparkStroke: "--_tunet-spark-stroke"
};
var OVERRIDE_PAIRS = [
  ["--profile-card-pad", "--_tunet-card-pad"],
  ["--profile-tile-pad", "--_tunet-tile-pad"],
  ["--profile-tile-gap", "--_tunet-tile-gap"],
  ["--profile-icon-box", "--_tunet-icon-box"],
  ["--profile-name-font", "--_tunet-name-font"],
  ["--profile-value-font", "--_tunet-value-font"],
  ["--profile-header-font", "--_tunet-header-font"],
  ["--profile-section-font", "--_tunet-section-font"],
  ["--profile-progress-h", "--_tunet-progress-h"]
];
var _warnedLegacyResolverWidthHint = false;
function normalizeSize(size) {
  if (size == null) return "";
  return String(size).trim().toLowerCase();
}
function autoSizeFromWidth(widthPx) {
  const width = Number(widthPx);
  if (!Number.isFinite(width) || width <= 0) return "standard";
  if (width < 600) return "compact";
  return "standard";
}
function selectProfileSize({ preset, layout, widthHint, userSize } = {}) {
  const normalizedPreset = String(preset || "").trim().toLowerCase();
  const normalizedLayout = String(layout || "").trim().toLowerCase();
  const rowMode = normalizedPreset === "rooms" && (normalizedLayout === "row" || normalizedLayout === "slim");
  const mapKey = rowMode ? "rooms-row" : normalizedPreset;
  const family = PRESET_FAMILY_MAP[mapKey];
  const explicitSize = normalizeSize(userSize);
  const sizeFromUser = VALID_SIZES.has(explicitSize) ? explicitSize : "";
  if (explicitSize && !sizeFromUser) {
    console.warn(`[TunetProfile] Unknown userSize "${userSize}". Falling back to auto size.`);
  }
  if (!family) {
    console.warn(`[TunetProfile] Unknown preset "${preset}" (layout: "${layout}"). Falling back to tile-grid.`);
    return { family: "tile-grid", size: sizeFromUser || autoSizeFromWidth(widthHint) };
  }
  return { family, size: sizeFromUser || autoSizeFromWidth(widthHint) };
}
function resolveSizeProfile({ family, size, widthHint } = {}) {
  if (widthHint !== void 0 && !_warnedLegacyResolverWidthHint) {
    _warnedLegacyResolverWidthHint = true;
    console.warn("[TunetProfile] resolveSizeProfile(widthHint) is deprecated. Width-based size selection belongs in selectProfileSize().");
  }
  const normalizedFamily = String(family || "").trim();
  const normalizedSize = normalizeSize(size) || "standard";
  const familyProfiles = SIZE_PROFILES[normalizedFamily];
  if (!familyProfiles) {
    console.warn(`[TunetProfile] Unknown family "${family}". Falling back to tile-grid standard.`);
    return { ...SIZE_PROFILES["tile-grid"].standard };
  }
  if (!familyProfiles[normalizedSize]) {
    console.warn(`[TunetProfile] Unknown size "${size}" for family "${family}". Falling back to standard.`);
    return { ...familyProfiles.standard };
  }
  return { ...familyProfiles[normalizedSize] };
}
function _setProfileVars(hostElement, profile = {}, { bridgePublicOverrides = true } = {}) {
  if (!hostElement || !hostElement.style) return;
  for (const propName of [...hostElement.style]) {
    if (propName.startsWith("--_tunet-")) hostElement.style.removeProperty(propName);
  }
  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    if (profile[key] !== void 0) hostElement.style.setProperty(cssVar, profile[key]);
  }
  if (!bridgePublicOverrides || typeof getComputedStyle !== "function") return;
  const computed = getComputedStyle(hostElement);
  for (const [publicVar, privateVar] of OVERRIDE_PAIRS) {
    const override = computed.getPropertyValue(publicVar).trim();
    if (override) hostElement.style.setProperty(privateVar, override);
  }
}
var RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;
var BASE_FONT = `
  .wrap, .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
var ICON_BASE = `
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
var REDUCED_MOTION = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
function injectFonts() {
  if (window.__tunetFontsInjected) return;
  window.__tunetFontsInjected = true;
  const links = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" }
  ];
  for (const cfg of links) {
    if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = cfg.rel;
    link.href = cfg.href;
    if (cfg.crossOrigin !== void 0) link.crossOrigin = cfg.crossOrigin;
    document.head.appendChild(link);
  }
}
var FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
`;
function detectDarkMode(hass) {
  if (!hass?.themes) return false;
  const theme = hass.themes?.darkMode;
  if (typeof theme === "boolean") return theme;
  const selected = hass.themes?.theme;
  if (selected && selected.toLowerCase().includes("dark")) return true;
  return false;
}
function applyDarkClass(element, isDark) {
  element.classList.toggle("dark", isDark);
}
function fireEvent(element, type, detail = {}) {
  element.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail
  }));
}
function createAxisLockedDrag(options = {}) {
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
    pointerCapture = false
  } = options;
  if (!element) {
    return { destroy() {
    } };
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
    if (!captureEl || typeof captureEl.releasePointerCapture !== "function") return;
    try {
      if (captureEl.hasPointerCapture && captureEl.hasPointerCapture(state.pointerId)) {
        captureEl.releasePointerCapture(state.pointerId);
      }
    } catch (_) {
    }
  };
  const removeDocumentListeners = () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
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
      phase: state.phase
    };
  };
  const endDrag = (event, { committed = false, cancelled = false } = {}) => {
    if (!state) return;
    const wasDrag = state.phase === "drag";
    const payload = payloadFromEvent(event);
    cleanup();
    if (wasDrag && typeof onDragEnd === "function") {
      onDragEnd(event, { ...payload, committed, cancelled });
    }
  };
  function onPointerMove(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    const payload = payloadFromEvent(event);
    if (!payload) return;
    if (state.phase === "pending") {
      const traveled = Math.hypot(payload.dx, payload.dy);
      if (traveled < deadzone) return;
      clearLongPress();
      if (payload.absDy > payload.absDx * axisBias) {
        cleanup();
        return;
      }
      if (payload.absDx >= payload.absDy * axisBias) {
        state.phase = "drag";
        if (typeof onDragStart === "function") {
          onDragStart(event, { ...payload, phase: "drag" });
        }
      } else {
        cleanup();
        return;
      }
    }
    if (!state || state.phase !== "drag") return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof onDragMove === "function") {
      onDragMove(event, { ...payload, phase: "drag" });
    }
  }
  function onPointerUp(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    if (state.phase === "drag") {
      endDrag(event, { committed: true, cancelled: false });
      return;
    }
    const payload = payloadFromEvent(event);
    const longPressFired = !!state.longPressFired;
    cleanup();
    if (!longPressFired && typeof onTap === "function") {
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
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (typeof shouldStart === "function" && !shouldStart(event)) return;
    const context = typeof getContext === "function" ? getContext(event) : {};
    if (context === false) return;
    const captureEl = context && context.captureEl instanceof HTMLElement ? context.captureEl : element;
    state = {
      pointerId: event.pointerId,
      pointerType: event.pointerType || "mouse",
      startX: event.clientX,
      startY: event.clientY,
      phase: "pending",
      context,
      captureEl,
      longPressTimer: null,
      longPressFired: false
    };
    if (pointerCapture && captureEl && typeof captureEl.setPointerCapture === "function") {
      try {
        captureEl.setPointerCapture(event.pointerId);
      } catch (_) {
      }
    }
    if (typeof onLongPress === "function" && longPressMs > 0) {
      state.longPressTimer = setTimeout(() => {
        if (!state || state.phase !== "pending") return;
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
          phase: state.phase
        };
        onLongPress(event, payload);
        cleanup();
      }, longPressMs);
    }
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
  };
  element.addEventListener("pointerdown", onPointerDown);
  return {
    destroy() {
      cleanup();
      element.removeEventListener("pointerdown", onPointerDown);
    }
  };
}
function renderConfigPlaceholder(shadowRoot, message, cardName) {
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
      ${cardName ? `<div class="name">${cardName}</div>` : ""}
      <div class="message">${message}</div>
    </div>
  `;
}
function registerCard(tagName, cardClass, meta) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, cardClass);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === tagName)) {
    window.customCards.push({
      type: tagName,
      preview: true,
      ...meta
    });
  }
}
function logCardVersion(name, version, color = "#D4850A") {
  const lightBg = color + "20";
  console.info(
    `%c ${name} %c v${version} `,
    `color: #fff; background: ${color}; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `color: ${color}; background: ${lightBg}; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;`
  );
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Dashboard/Tunet/Cards/v3/tunet_light_tile.js
var TILE_CSS = `
  /* \u2500\u2500 Host \u2500\u2500 */
  :host {
    display: block;
    contain: layout style;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    --card-pad: var(--_tunet-card-pad, 1.25em);
    --r-tile: var(--_tunet-tile-radius, 0.875em);
  }

  /* \u2500\u2500 Shared tile tokens \u2500\u2500 */
  .lt {
    --icon-size: var(--_tunet-icon-box, 2.375em);
    --icon-radius: calc(var(--_tunet-tile-radius, 0.875em) * 0.9);
    --bar-h: var(--_tunet-progress-h, 0.5em);
    --bar-h-active: calc(var(--_tunet-progress-h, 0.5em) * 1.25);
    --bar-inset: var(--_tunet-tile-pad, 0.875em);
    --bar-bottom: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    --pill-shadow: 0 10px 30px rgba(0,0,0,0.3);
    --pill-border: 1px solid rgba(255,255,255,0.1);

    position: relative;
    border-radius: var(--_tunet-tile-radius, var(--r-tile, 0.875em));
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost, transparent);
    box-shadow: var(--shadow);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    overflow: visible;
    transition:
      transform var(--motion-ui, 0.18s) var(--ease-emphasized, cubic-bezier(0.34, 1.56, 0.64, 1)),
      box-shadow var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color var(--motion-surface, 0.28s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  @media (hover: hover) {
    .lt:hover { box-shadow: var(--shadow-up); }
  }

  /* \u2500\u2500 Vertical variant (default) \u2500\u2500 */
  .lt.vertical {
    aspect-ratio: 1 / 0.9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: var(--_tunet-tile-min-h, 5.75em);
    padding:
      calc(var(--_tunet-tile-pad, 0.875em) * 0.7)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.39)
      calc(var(--_tunet-tile-pad, 0.875em) * 1.03);
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.4);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.vertical { aspect-ratio: 1 / 0.98; }
  }

  /* \u2500\u2500 Horizontal variant \u2500\u2500 */
  .lt.horizontal {
    display: flex;
    align-items: center;
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 1.4);
    padding:
      calc(var(--_tunet-tile-pad, 0.875em) * 0.64)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.78)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.92)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.64);
    min-height: max(calc(var(--_tunet-tile-min-h, 5.75em) * 0.9), 3.5em);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal {
      min-height: 52px;
      padding: 7px 9px 10px 7px;
      gap: 7px;
    }
  }

  .lt.horizontal .text-stack {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.25);
  }

  .lt.horizontal .val {
    flex-shrink: 0;
    min-width: calc(var(--_tunet-icon-box, 2.375em) * 0.9);
    text-align: right;
  }

  /* \u2500\u2500 Icon wrap \u2500\u2500 */
  .icon-wrap {
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: var(--icon-radius);
    display: grid;
    place-items: center;
    border: 1px solid transparent;
    transition: all var(--motion-ui, 0.18s) ease;
  }

  .lt.vertical .icon-wrap {
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.5);
  }

  .lt.horizontal .icon-wrap {
    flex-shrink: 0;
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }
  }

  .tile-icon {
    font-size: var(--_tunet-icon-glyph, 1.1875em);
    width: var(--_tunet-icon-glyph, 1.1875em);
    height: var(--_tunet-icon-glyph, 1.1875em);
  }

  /* \u2500\u2500 Name \u2500\u2500 */
  .name {
    font-size: var(--_tunet-name-font, 0.8125em);
    font-weight: 600;
    letter-spacing: 0.00625em;
    line-height: 1.15;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .lt.vertical .name {
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.2);
    text-align: center;
    min-height: 1.12em;
    line-height: 1.12;
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .name { font-size: 14px; }
  }

  /* \u2500\u2500 Value \u2500\u2500 */
  .val {
    font-size: var(--_tunet-value-font, 1.125em);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: color var(--motion-ui, 0.18s);
  }

  .lt.horizontal .val {
    font-size: calc(var(--_tunet-value-font, 1.125em) * 1.05);
    letter-spacing: 0.00625em;
  }
  .lt.vertical .val {
    line-height: 1.12;
    margin-top: calc(var(--_tunet-tile-gap, 0.375em) * 0.2);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .val { font-size: 14px; }
  }

  /* \u2500\u2500 Progress bar \u2500\u2500 */
  .progress-track {
    position: absolute;
    bottom: var(--bar-bottom);
    left: var(--bar-inset);
    right: var(--bar-inset);
    height: var(--bar-h);
    background: var(--track-bg, rgba(0,0,0,0.06));
    border-radius: 99px;
    overflow: hidden;
    transition: height var(--motion-ui, 0.18s) ease;
  }

  /* Keep vertical variant content lane naturally centered with progress in flow */
  .lt.vertical .progress-track {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: calc(100% - (var(--bar-inset) * 2));
    margin-top: calc(var(--_tunet-tile-gap, 0.375em) * 1.2);
  }

  .lt.horizontal .progress-track {
    bottom: calc(var(--_tunet-tile-pad, 0.875em) * 0.5);
    left: calc(var(--_tunet-tile-pad, 0.875em) * 0.78);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.78);
    height: calc(var(--_tunet-progress-h, 0.5em) * 0.75);
  }

  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: 99px;
    transition: width 0.1s ease-out;
  }

  /* \u2500\u2500 Manual override dot \u2500\u2500 */
  .manual-dot {
    position: absolute;
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    width: 0.5em;
    height: 0.5em;
    background: var(--red, #FF3B30);
    border-radius: 50%;
    display: none;
    box-shadow: 0 0 12px var(--glow-manual, rgba(255,82,82,0.6));
    z-index: 2;
  }

  .lt.horizontal .manual-dot {
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.6);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.6);
  }

  .lt[data-manual="true"] .manual-dot {
    display: block;
  }

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     STATE: OFF
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
  .lt.off {
    opacity: 1;
  }

  .lt.off .icon-wrap {
    background: var(--gray-ghost, rgba(0,0,0,0.03));
    color: var(--text-sub);
    border-color: transparent;
  }

  .lt.off .name {
    color: var(--text-sub);
  }

  .lt.off .val {
    color: var(--text-sub);
    opacity: 0.5;
  }

  .lt.off .progress-fill {
    background: var(--text-sub);
    opacity: 0.15;
  }

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     STATE: ON
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
  .lt.on {
    border-color: var(--amber-border);
  }

  .lt.on .icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }

  .lt.on .tile-icon {
    font-variation-settings: 'FILL' 1, 'wght' var(--ms-wght, 400), 'GRAD' var(--ms-grad, 0), 'opsz' var(--ms-opsz, 24);
  }

  .lt.on .val {
    color: var(--amber);
  }

  .lt.on .progress-fill {
    background: var(--amber);
    opacity: 0.9;
  }

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     STATE: SLIDING (drag active)
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
  .lt.sliding {
    transform: scale(1.05);
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--amber);
  }

  .lt.sliding .progress-track {
    height: var(--bar-h-active);
  }

  .lt.horizontal.sliding .progress-track {
    height: calc(var(--bar-h-active) * 0.8);
  }

  .lt.sliding .progress-fill {
    transition: none;
  }

  /* Floating pill \u2014 vertical */
  .lt.vertical.sliding .val {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--amber);
    font-weight: 700;
    font-size: calc(var(--_tunet-value-font, 1.125em) * 0.95);
    background: var(--tile-bg, #fff);
    padding: 0.375em 1.25em;
    border-radius: 99px;
    box-shadow: var(--pill-shadow);
    z-index: 101;
    border: var(--pill-border);
    white-space: nowrap;
    opacity: 1;
  }

  /* Floating pill \u2014 horizontal */
  .lt.horizontal.sliding .val {
    position: absolute;
    top: -0.25em;
    left: 50%;
    transform: translate(-50%, -100%);
    color: var(--amber);
    font-weight: 700;
    font-size: calc(var(--_tunet-value-font, 1.125em) * 0.88);
    background: var(--tile-bg, #fff);
    padding: 0.3125em 0.875em;
    border-radius: 99px;
    box-shadow: var(--pill-shadow);
    z-index: 101;
    border: var(--pill-border);
    white-space: nowrap;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* \u2500\u2500 Focus visible \u2500\u2500 */
  .lt:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, rgba(0,122,255,0.5));
    outline-offset: var(--focus-ring-offset, 2px);
  }
`;
var TAG = "tunet-light-tile";
var VERSION = "1.1.0";
var TunetLightTile = class extends HTMLElement {
  // ── HA lifecycle ──────────────────────────────────
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }
  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Select a light entity", "Light");
      return;
    }
    const tileSizeRaw = String(config.tile_size || "standard").toLowerCase();
    const tileSize = tileSizeRaw === "compact" ? "compact" : tileSizeRaw === "large" ? "large" : "standard";
    const useProfiles = config.use_profiles !== false;
    this._config = {
      variant: "vertical",
      ...config,
      tile_size: tileSize,
      use_profiles: useProfiles
    };
    this._applyProfile(this._getHostWidth());
    if (this._hass) this._render();
  }
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    const entityId = this._config?.entity;
    if (!entityId) return;
    const newState = hass.states[entityId];
    const oldState = oldHass?.states?.[entityId];
    if (!oldState || newState?.state !== oldState?.state || newState?.attributes?.brightness !== oldState?.attributes?.brightness || newState?.attributes?.friendly_name !== oldState?.attributes?.friendly_name) {
      this._render();
    }
  }
  getCardSize() {
    return this._config?.variant === "horizontal" ? 1 : 2;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 3,
      min_columns: 3,
      rows: "auto",
      min_rows: 1,
      max_rows: 4
    };
  }
  // ── Constructor ──────────────────────────────────
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._dragController = null;
    this._rendered = false;
    this._isDragging = false;
    this._cooldownUntil = 0;
    this._profileSelection = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
  }
  connectedCallback() {
    injectFonts(this.shadowRoot);
    this._buildShell();
    this._setupResizeObserver();
    if (typeof ResizeObserver === "undefined") {
      this._usingWindowResizeFallback = true;
      window.addEventListener("resize", this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }
  disconnectedCallback() {
    this._removePointerListeners();
    if (this._usingWindowResizeFallback) {
      window.removeEventListener("resize", this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
  }
  _getHostWidth(widthHint = null) {
    const parsed = Number(widthHint);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const hostWidth = Number(this.getBoundingClientRect?.().width);
    if (Number.isFinite(hostWidth) && hostWidth > 0) return hostWidth;
    return 1024;
  }
  _setLegacyTileSizeAttr(size) {
    if (size === "compact" || size === "large") this.setAttribute("tile-size", size);
    else this.removeAttribute("tile-size");
  }
  _applyProfile(widthHint = null) {
    const useProfiles = this._config?.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute("use-profiles");
      this.removeAttribute("profile-family");
      this.removeAttribute("profile-size");
      this._setLegacyTileSizeAttr(this._config?.tile_size || "standard");
      return;
    }
    const width = this._getHostWidth(widthHint);
    const selection = selectProfileSize({
      preset: "lighting",
      layout: "grid",
      widthHint: width,
      userSize: this._config?.tile_size
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute("use-profiles", "");
    this.setAttribute("profile-family", selection.family);
    this.setAttribute("profile-size", selection.size);
    this._setLegacyTileSizeAttr(selection.size);
  }
  _setupResizeObserver() {
    if (this._resizeObserver || typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries?.[0]?.contentRect?.width;
      this._onHostResize(width);
    });
    this._resizeObserver.observe(this);
  }
  _teardownResizeObserver() {
    if (!this._resizeObserver) return;
    this._resizeObserver.disconnect();
    this._resizeObserver = null;
  }
  _onHostResize(widthHint = null) {
    this._applyProfile(widthHint);
  }
  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }
  // ── Build static shell ───────────────────────────
  _buildShell() {
    const style = document.createElement("style");
    style.textContent = [
      TOKENS,
      TOKENS_MIDNIGHT,
      RESET,
      BASE_FONT,
      ICON_BASE,
      REDUCED_MOTION,
      TILE_CSS
    ].join("\n");
    const fontLink = document.createElement("template");
    fontLink.innerHTML = FONT_LINKS;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(fontLink.content.cloneNode(true));
    this._tile = document.createElement("div");
    this._tile.className = "lt";
    this._tile.setAttribute("tabindex", "0");
    this._tile.setAttribute("role", "button");
    this.shadowRoot.appendChild(this._tile);
    this._applyProfile(this._getHostWidth());
    this._setupPointerListeners();
    if (this._config && this._hass) {
      this._render();
    }
  }
  // ── Render ───────────────────────────────────────
  _render() {
    if (!this._tile || !this._config || !this._hass) return;
    if (this._isDragging) return;
    const config = this._config;
    const entity = this._hass.states[config.entity];
    if (!entity) {
      this._tile.innerHTML = `<div class="name" style="color:var(--red)">Entity not found</div>`;
      return;
    }
    const isOn = entity.state === "on";
    const brightness = isOn ? Math.round(entity.attributes.brightness / 255 * 100) : 0;
    const name = config.name || entity.attributes.friendly_name || config.entity;
    const icon = config.icon || this._defaultIcon(entity);
    const isManual = config.show_manual !== false && entity.attributes.manual_override === true;
    const variant = config.variant || "vertical";
    this._currentBrightness = brightness;
    this._tile.className = `lt ${variant} ${isOn ? "on" : "off"}`;
    this._tile.dataset.brightness = brightness;
    if (isManual) {
      this._tile.dataset.manual = "true";
    } else {
      delete this._tile.dataset.manual;
    }
    this._tile.setAttribute("aria-label", `${name}, ${isOn ? brightness + "%" : "Off"}`);
    if (variant === "horizontal") {
      this._tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="icon-wrap">
          <span class="tile-icon icon">${icon}</span>
        </div>
        <div class="text-stack">
          <div class="name">${name}</div>
        </div>
        <div class="val">${isOn ? brightness + "%" : "Off"}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${brightness}%"></div>
        </div>
      `;
    } else {
      this._tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="icon-wrap">
          <span class="tile-icon icon">${icon}</span>
        </div>
        <div class="name">${name}</div>
        <div class="val">${isOn ? brightness + "%" : "Off"}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${brightness}%"></div>
        </div>
      `;
    }
    this._rendered = true;
  }
  // ── Default icon lookup ──────────────────────────
  _defaultIcon(entity) {
    const icon = entity.attributes.icon;
    if (icon) {
      const mdiMap = {
        "mdi:lightbulb": "lightbulb",
        "mdi:ceiling-light": "light",
        "mdi:floor-lamp": "floor_lamp",
        "mdi:desk-lamp": "table_lamp",
        "mdi:lamp": "table_lamp",
        "mdi:led-strip": "highlight",
        "mdi:spotlight-beam": "highlight",
        "mdi:vanity-light": "highlight",
        "mdi:wall-sconce": "wall_lamp",
        "mdi:outdoor-lamp": "outdoor_lamp",
        "mdi:track-light": "track_changes",
        "mdi:light-recessed": "light",
        "mdi:light-switch": "toggle_on",
        "mdi:lamps": "floor_lamp"
      };
      return mdiMap[icon] || "lightbulb";
    }
    return "lightbulb";
  }
  // ── Optimistic UI update (during drag) ───────────
  _updateTileUI(brightness) {
    if (!this._tile) return;
    const brt = clamp(brightness, 0, 100);
    const isOn = brt > 0;
    this._tile.classList.toggle("on", isOn);
    this._tile.classList.toggle("off", !isOn);
    this._tile.dataset.brightness = brt;
    const fill = this._tile.querySelector(".progress-fill");
    if (fill) fill.style.width = brt + "%";
    const val = this._tile.querySelector(".val");
    if (val) val.textContent = isOn ? brt + "%" : "Off";
    const icon = this._tile.querySelector(".tile-icon");
    if (icon) {
      if (isOn) {
        icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
      } else {
        icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
      }
    }
  }
  // ── Pointer interaction ──────────────────────────
  _setupPointerListeners() {
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onContextMenu = (e) => e.preventDefault();
    this._tile.addEventListener("keydown", this._onKeyDown);
    this._tile.addEventListener("contextmenu", this._onContextMenu);
    this._dragController = createAxisLockedDrag({
      element: this._tile,
      deadzone: 8,
      axisBias: 1.3,
      longPressMs: 500,
      pointerCapture: false,
      getContext: () => ({
        startBright: parseInt(this._tile.dataset.brightness, 10) || 0,
        currentBright: parseInt(this._tile.dataset.brightness, 10) || 0,
        width: Math.max(this._tile.offsetWidth, 1)
      }),
      onDragStart: () => {
        this._isDragging = true;
        this._tile.classList.add("sliding");
      },
      onDragMove: (event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        const change = payload.dx / ctx.width * 100;
        const newBrt = Math.round(clamp(ctx.startBright + change, 0, 100));
        if (newBrt === ctx.currentBright) return;
        if (event.cancelable) event.preventDefault();
        this._updateTileUI(newBrt);
        ctx.currentBright = newBrt;
      },
      onDragEnd: (_event, payload) => {
        const ctx = payload && payload.context;
        this._isDragging = false;
        this._tile.classList.remove("sliding");
        if (payload && payload.committed && ctx) {
          this._callService(ctx.currentBright);
        }
        this._render();
      },
      onTap: () => {
        const current = parseInt(this._tile.dataset.brightness, 10) || 0;
        const target = current > 0 ? 0 : 100;
        this._updateTileUI(target);
        this._callService(target);
      },
      onLongPress: () => {
        this._openMoreInfo();
      }
    });
  }
  _removePointerListeners() {
    if (!this._tile) return;
    this._tile.removeEventListener("keydown", this._onKeyDown);
    this._tile.removeEventListener("contextmenu", this._onContextMenu);
    if (this._dragController) {
      this._dragController.destroy();
      this._dragController = null;
    }
  }
  _handleKeyDown(e) {
    const entity = this._config?.entity;
    if (!entity) return;
    const brt = parseInt(this._tile.dataset.brightness) || 0;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        const target = brt > 0 ? 0 : 100;
        this._updateTileUI(target);
        this._callService(target);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        const up = clamp(brt + 5, 0, 100);
        this._updateTileUI(up);
        this._callService(up);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        const down = clamp(brt - 5, 0, 100);
        this._updateTileUI(down);
        this._callService(down);
        break;
    }
  }
  // ── HA service calls ─────────────────────────────
  _callService(brightness) {
    if (!this._hass || !this._config?.entity) return;
    const now = Date.now();
    if (now < this._cooldownUntil) return;
    this._cooldownUntil = now + 150;
    const entity = this._config.entity;
    if (brightness === 0) {
      this._hass.callService("light", "turn_off", {
        entity_id: entity
      });
    } else {
      this._hass.callService("light", "turn_on", {
        entity_id: entity,
        brightness: Math.round(brightness / 100 * 255)
      });
    }
  }
  _openMoreInfo() {
    if (!this._config?.entity) return;
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }
  // ── Config editor (static) ─────────────────────
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { filter: [{ domain: "light" }] } } },
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { text: {} } },
        { name: "variant", selector: { select: { options: ["vertical", "horizontal"] } } },
        { name: "tile_size", selector: { select: { options: ["compact", "standard", "large"] } } },
        { name: "use_profiles", selector: { boolean: {} } }
      ],
      computeLabel: (s) => ({
        entity: "Light Entity",
        name: "Display Name",
        icon: "Icon (Material Symbols)",
        variant: "Layout Variant",
        tile_size: "Tile Size",
        use_profiles: "Use Profile Sizing"
      })[s.name] || s.name
    };
  }
  static getStubConfig() {
    return {
      entity: "light.living_room",
      variant: "vertical",
      tile_size: "standard",
      use_profiles: true
    };
  }
};
registerCard(TAG, TunetLightTile, {
  type: TAG,
  name: "Tunet Light Tile",
  description: "Atomic light tile \u2014 vertical grid or horizontal row variant"
});
logCardVersion("Tunet Light Tile", VERSION);
//# sourceMappingURL=tunet_light_tile.js.map

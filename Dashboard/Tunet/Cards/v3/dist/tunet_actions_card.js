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
var SIZE_KEYS = ["compact", "standard", "large"];
var VALID_SIZES = new Set(SIZE_KEYS);
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
var CARD_SURFACE = `
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
var CARD_SURFACE_GLASS_STROKE = `
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
function normalizePath(value) {
  const raw = (value == null ? "" : String(value)).trim();
  if (!raw) return "";
  return raw.startsWith("/") || raw.startsWith("#") ? raw : `/${raw}`;
}
function navigatePath(path, { replace = false, sourceEl = null } = {}) {
  const normalized = normalizePath(path);
  if (!normalized) return;
  const targets = [];
  if (sourceEl && typeof sourceEl.dispatchEvent === "function") targets.push(sourceEl);
  if (document && typeof document.dispatchEvent === "function") targets.push(document);
  if (window && typeof window.dispatchEvent === "function") targets.push(window);
  for (const target of targets) {
    const navEvent = new CustomEvent("hass-navigate", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { path: normalized, replace }
    });
    const notCanceled = target.dispatchEvent(navEvent);
    if (!notCanceled || navEvent.defaultPrevented) return;
  }
  if (replace) {
    window.history.replaceState(null, "", normalized);
  } else {
    window.history.pushState(null, "", normalized);
  }
  window.dispatchEvent(new Event("location-changed"));
}
function runCardAction({
  element,
  hass,
  actionConfig,
  defaultEntityId = ""
} = {}) {
  if (!element || !hass || !actionConfig) return false;
  const action = actionConfig.action || "more-info";
  if (action === "none") return true;
  if (action === "more-info") {
    const entityId = actionConfig.entity || defaultEntityId;
    if (!entityId) return false;
    fireEvent(element, "hass-more-info", { entityId });
    return true;
  }
  if (action === "navigate") {
    navigatePath(actionConfig.navigation_path || actionConfig.path || "", { sourceEl: element });
    return true;
  }
  if (action === "url") {
    if (!actionConfig.url_path) return false;
    const target = String(actionConfig.url_path).trim();
    if (!target) return false;
    if (actionConfig.new_tab) {
      window.open(target, "_blank");
      return true;
    }
    if (target.startsWith("/") || target.startsWith("#")) {
      navigatePath(target, { sourceEl: element });
      return true;
    }
    window.location.assign(target);
    return true;
  }
  if (action === "call-service") {
    const service = String(actionConfig.service || "").trim();
    const [domain, serviceName] = service.split(".");
    if (!domain || !serviceName) return false;
    hass.callService(domain, serviceName, actionConfig.service_data || {});
    return true;
  }
  if (action === "fire-dom-event") {
    fireEvent(element, "ll-custom", actionConfig);
    return true;
  }
  const fallbackEntityId = actionConfig.entity || defaultEntityId;
  if (!fallbackEntityId) return false;
  fireEvent(element, "hass-more-info", { entityId: fallbackEntityId });
  return true;
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

// Dashboard/Tunet/Cards/v3/tunet_actions_card.js
var CARD_VERSION = "2.4.4";
var DEFAULT_ACTIONS = [
  {
    name: "All On",
    icon: "lightbulb",
    accent: "amber",
    service: "light.turn_on",
    service_data: { entity_id: "light.all_adaptive_lights" },
    state_entity: "light.all_adaptive_lights",
    active_when: "on"
  },
  {
    name: "Pause",
    icon: "auto_awesome",
    accent: "blue",
    service: "input_boolean.toggle",
    service_data: { entity_id: "input_boolean.oal_system_paused" },
    state_entity: "input_boolean.oal_system_paused",
    active_when: "on"
  },
  {
    name: "Sleep",
    icon: "bed",
    accent: "purple",
    service: "input_select.select_option",
    service_data: {
      entity_id: "input_select.oal_active_configuration",
      option: "Sleep"
    },
    state_entity: "input_select.oal_active_configuration",
    active_when: "Sleep"
  },
  {
    name: "All Off",
    icon: "power_settings_new",
    accent: "amber",
    service: "light.turn_off",
    service_data: { entity_id: "light.all_adaptive_lights" },
    state_entity: "light.all_adaptive_lights",
    active_when: "off"
  }
];
var DEFAULT_MODE_ACTIONS = [
  {
    name: "All On",
    icon: "lightbulb",
    accent: "amber",
    service: "light.turn_on",
    service_data: {
      entity_id: "light.all_adaptive_lights"
    },
    state_entity: "light.all_adaptive_lights",
    active_when: "on"
  },
  {
    name: "All Off",
    icon: "power_settings_new",
    accent: "amber",
    service: "light.turn_off",
    service_data: {
      entity_id: "light.all_adaptive_lights"
    },
    state_entity: "light.all_adaptive_lights",
    active_when: "off"
  },
  {
    name: "Bedtime",
    icon: "bedtime",
    accent: "amber",
    service: "input_select.select_option",
    service_data: {
      entity_id: "__MODE_ENTITY__",
      option: "Dim Ambient"
    },
    state_entity: "__MODE_ENTITY__",
    active_when: "Dim Ambient"
  },
  {
    name: "Sleep Mode",
    icon: "bed",
    accent: "amber",
    service: "input_select.select_option",
    service_data: {
      entity_id: "__MODE_ENTITY__",
      option: "Sleep"
    },
    state_entity: "__MODE_ENTITY__",
    active_when: "Sleep"
  }
];
var ACCENT_OPTIONS = ["amber", "blue", "purple", "green", "red", "muted"];
var ACTIVE_OPERATORS = ["equals", "not_equals", "contains"];
var SHOW_WHEN_OPERATORS = ["equals", "not_equals", "contains", "gt", "gte", "lt", "lte"];
var ICON_ALIASES = {
  day: "wb_sunny",
  nightlight: "bedtime",
  floor_lamp: "lamp",
  table_lamp: "lamp",
  desk_lamp: "desk",
  shelf_auto: "shelves",
  countertops: "kitchen"
};
function normalizeIcon(icon) {
  if (!icon) return "lightbulb";
  const raw = String(icon).replace(/^mdi:/, "").trim();
  return ICON_ALIASES[raw] || raw || "lightbulb";
}
function evaluateCondition(hass, condition) {
  if (!hass || !condition || !condition.entity) return true;
  const entity = hass.states[condition.entity];
  if (!entity) return false;
  const attr = condition.attribute;
  const actualRaw = attr ? entity.attributes?.[attr] : entity.state;
  const expectedRaw = condition.state;
  const actual = String(actualRaw ?? "");
  const expected = String(expectedRaw ?? "");
  const op = String(condition.operator || "equals");
  const actualNum = Number(actualRaw);
  const expectedNum = Number(expectedRaw);
  if (op === "not_equals") return actual !== expected;
  if (op === "contains") return actual.includes(expected);
  if (op === "gt") return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum > expectedNum;
  if (op === "gte") return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum >= expectedNum;
  if (op === "lt") return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum < expectedNum;
  if (op === "lte") return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum <= expectedNum;
  return actual === expected;
}
var CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 2px 6px rgba(0,0,0,0.04), 0 0.5px 1.5px rgba(0,0,0,0.06);
    --tile-shadow-lift: 0 6px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
    display: block;
    font-size: 16px; /* em anchor - everything below scales from this */
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
  .card.compact { padding: 0.625em; border-radius: 1.25em; }
`;
var CARD_STYLES = `
  /* Action chip row */
  .actions-row {
    display: flex;
    gap: 0.42em;
  }
  .actions-row.mode-strip .action-chip {
    min-height: 2.52em;
    padding: 0.56em 0.34em;
    border-radius: 0.875em;
    font-size: var(--type-chip, 12.5px);
    font-weight: 700;
  }

  /* Individual action chip */
  .action-chip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.36em;
    min-height: 2.52em;
    padding: 0.56em 0.34em;
    border-radius: 0.875em;
    background: var(--tile-bg);
    box-shadow: var(--tile-shadow-rest);
    font-family: inherit;
    font-size: var(--type-chip, 12.5px);
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all .15s ease;
    user-select: none;
    white-space: nowrap;
    border: 1px solid transparent;
    -webkit-tap-highlight-color: transparent;
  }
  .action-chip:hover { box-shadow: var(--tile-shadow-lift); }
  .action-chip:active { transform: scale(.96); }
  .action-chip:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }
  .action-chip .icon { font-size: 1.3em; width: 1.3em; height: 1.3em; color: var(--text-muted); }
  .action-chip.hidden { display: none !important; }

  /* Active state: default (amber) */
  .action-chip.active {
    border-color: var(--amber-border);
    color: var(--amber);
    font-weight: 700;
  }
  .action-chip.active .icon {
    color: var(--amber);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Active state: blue accent */
  .action-chip[data-accent="blue"].active {
    border-color: var(--blue-border);
    color: var(--blue);
  }
  .action-chip[data-accent="blue"].active .icon { color: var(--blue); }

  /* Active state: purple accent */
  .action-chip[data-accent="purple"].active {
    border-color: var(--purple-border);
    color: var(--purple);
  }
  .action-chip[data-accent="purple"].active .icon { color: var(--purple); }

  @media (max-width: 440px) {
    :host { font-size: 16px; }
    .card.compact { padding: 0.56em; }
    .action-chip { gap: 0.32em; }
  }
`;
var TUNET_ACTIONS_STYLES = `
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
var TunetActionsCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._chipEls = [];
    injectFonts();
  }
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "variant", selector: { select: { options: ["default", "mode_strip"] } } },
        { name: "mode_entity", selector: { entity: { filter: [{ domain: "input_select" }] } } },
        { name: "compact", selector: { boolean: {} } },
        {
          name: "actions",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              description_field: "service",
              fields: {
                name: { label: "Name", required: true, selector: { text: {} } },
                icon: { label: "Icon", selector: { icon: {} } },
                accent: { label: "Accent", selector: { select: { options: ACCENT_OPTIONS } } },
                service: { label: "Service (domain.service)", required: true, selector: { text: {} } },
                entity_id: { label: "Service Target Entity", selector: { entity: {} } },
                option: { label: "Option (for select_option)", selector: { text: {} } },
                state_entity: { label: "State Entity", selector: { entity: {} } },
                active_when: { label: "Active When Value", selector: { text: {} } },
                active_when_operator: { label: "Active Operator", selector: { select: { options: ACTIVE_OPERATORS } } },
                show_when_entity: { label: "Show-When Entity", selector: { entity: {} } },
                show_when_attribute: { label: "Show-When Attribute", selector: { text: {} } },
                show_when_operator: { label: "Show-When Operator", selector: { select: { options: SHOW_WHEN_OPERATORS } } },
                show_when_state: { label: "Show-When Value", selector: { text: {} } }
              }
            }
          }
        }
      ],
      computeLabel: (schema) => {
        const labels = {
          variant: "Variant",
          mode_entity: "Mode Entity",
          compact: "Compact Layout",
          actions: "Actions"
        };
        return labels[schema.name] || schema.name;
      },
      computeHelper: (schema) => {
        const helpers = {
          actions: "Structured action editor. Existing YAML action objects still work. entity_id/option synthesize service_data when not explicitly provided in YAML."
        };
        return helpers[schema.name] || "";
      }
    };
  }
  static getStubConfig() {
    return { variant: "mode_strip", compact: true };
  }
  setConfig(config) {
    const variant = config.variant === "mode_strip" ? "mode_strip" : "default";
    const modeEntity = config.mode_entity || "input_select.oal_active_configuration";
    const sourceActions = Array.isArray(config.actions) && config.actions.length > 0 ? config.actions : variant === "mode_strip" ? DEFAULT_MODE_ACTIONS.map((a) => {
      const next = { ...a, service_data: { ...a.service_data || {} } };
      if (next.state_entity === "__MODE_ENTITY__") next.state_entity = modeEntity;
      if (next.service_data.entity_id === "__MODE_ENTITY__") next.service_data.entity_id = modeEntity;
      return next;
    }) : DEFAULT_ACTIONS;
    const normalizeAction = (a) => {
      const serviceData = a && typeof a.service_data === "object" && a.service_data != null ? { ...a.service_data } : {};
      const targetEntity = a?.entity_id || a?.service_entity || "";
      if (targetEntity && !serviceData.entity_id) serviceData.entity_id = targetEntity;
      if (a?.option != null && a.option !== "" && serviceData.option == null) serviceData.option = a.option;
      let showWhen = null;
      if (a?.show_when && typeof a.show_when === "object") {
        showWhen = a.show_when;
      } else if (a?.show_when_entity) {
        showWhen = {
          entity: a.show_when_entity,
          attribute: a.show_when_attribute || void 0,
          operator: a.show_when_operator || "equals",
          state: a.show_when_state ?? "on"
        };
      }
      return {
        name: a?.name || "",
        icon: a?.icon || "circle",
        accent: a?.accent || "amber",
        service: a?.service || "",
        service_data: serviceData,
        state_entity: a?.state_entity || "",
        active_when: a?.active_when || "on",
        active_when_operator: a?.active_when_operator || "equals",
        show_when: showWhen,
        tap_action: a?.tap_action || null
      };
    };
    this._config = {
      variant,
      compact: config.compact !== false,
      mode_entity: modeEntity,
      actions: sourceActions.map((a) => normalizeAction(a))
    };
    if (this._rendered) {
      const card = this.shadowRoot.querySelector(".card");
      if (card) card.classList.toggle("compact", !!this._config.compact);
      this._buildChips();
    }
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
    const changed = this._config.actions.some(
      (a) => a.state_entity && (!oldHass || oldHass.states[a.state_entity] !== hass.states[a.state_entity])
    );
    if (changed || !oldHass) this._update();
  }
  getCardSize() {
    if (this._config.compact) return 2;
    const actionCount = (this._config.actions || []).length;
    const rows = Math.max(1, Math.ceil(actionCount / 4));
    return 1 + rows;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 1
    };
  }
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_ACTIONS_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card${this._config.compact ? " compact" : ""}">
          <div class="actions-row" id="row"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this._row = this.shadowRoot.getElementById("row");
    this._buildChips();
  }
  _buildChips() {
    if (!this._row) return;
    this._row.innerHTML = "";
    this._row.classList.toggle("mode-strip", this._config.variant === "mode_strip");
    this._chipEls = [];
    for (const action of this._config.actions) {
      const chip = document.createElement("button");
      chip.className = "action-chip";
      chip.dataset.accent = action.accent;
      const iconName = normalizeIcon(action.icon || "circle");
      chip.innerHTML = `<span class="icon">${iconName}</span> ${action.name}`;
      chip.addEventListener("click", () => this._runAction(action));
      this._row.appendChild(chip);
      this._chipEls.push({ el: chip, action });
    }
    this._update();
  }
  _update() {
    if (!this._hass || !this._chipEls) return;
    for (const { el, action } of this._chipEls) {
      const shouldShow = evaluateCondition(this._hass, action.show_when);
      el.classList.toggle("hidden", !shouldShow);
      if (!action.state_entity) {
        el.classList.remove("active");
        continue;
      }
      const entity = this._hass.states[action.state_entity];
      if (!entity) {
        el.classList.remove("active");
        continue;
      }
      const stateValue = String(entity.state ?? "");
      const expected = String(action.active_when ?? "");
      let isActive;
      if (action.active_when_operator === "contains") {
        isActive = stateValue.includes(expected);
      } else if (action.active_when_operator === "not_equals") {
        isActive = stateValue !== expected;
      } else {
        isActive = stateValue === expected;
      }
      el.classList.toggle("active", isActive);
      const iconEl = el.querySelector(".icon");
      if (iconEl) iconEl.classList.toggle("filled", isActive);
    }
  }
  _callService(action) {
    if (!this._hass || !action.service) return;
    const [domain, service] = action.service.split(".");
    const serviceData = { ...action.service_data };
    this._hass.callService(domain, service, serviceData);
  }
  _runAction(action) {
    if (!this._hass || !action) return;
    if (action.tap_action && typeof action.tap_action === "object") {
      const ran = runCardAction({
        element: this,
        hass: this._hass,
        actionConfig: action.tap_action,
        defaultEntityId: action.state_entity || ""
      });
      if (ran) return;
    }
    this._callService(action);
  }
};
registerCard("tunet-actions-card", TunetActionsCard, {
  name: "Tunet Actions Card",
  description: "Quick action chips with state reflection and glassmorphism design",
  preview: true
});
logCardVersion("TUNET-ACTIONS", CARD_VERSION, "#007AFF");
//# sourceMappingURL=tunet_actions_card.js.map

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

// Dashboard/Tunet/Cards/v3/tunet_climate_card.js
var CARD_VERSION = "1.2.0";
var STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* \u2500\u2500 Climate Card Surface Overrides \u2500\u2500 */
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

  /* Thin variant for denser dashboard layouts */
  :host([variant="thin"]) .card {
    padding: 14px 14px 10px;
  }
  :host([variant="thin"]) .hdr {
    margin-bottom: 10px;
  }
  :host([variant="thin"]) .temps {
    display: none;
  }
  :host([variant="thin"]) .slider-zone {
    margin-top: 0;
  }
  :host([variant="thin"]) .slider {
    height: 36px;
  }
  :host([variant="thin"]) .thumb {
    width: 36px;
    height: 36px;
  }
  :host([variant="thin"]) .thumb-disc {
    width: 22px;
    height: 22px;
  }
  :host([variant="thin"]) .thumb-dot {
    width: 7px;
    height: 7px;
  }
  :host([variant="thin"]) .scale {
    padding-top: 2px;
  }
  :host([variant="thin"]) .scale-num {
    font-size: 10px;
  }
  :host([variant="thin"]) .cur-marker {
    bottom: -12px;
  }

  /* -- Header -- */
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
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
    transition: all .15s ease;
    min-width: 0;
  }
  .hdr-tile:hover { box-shadow: var(--shadow); }
  .hdr-tile:active { transform: scale(.98); }
  /* Info tile accent states - driven by hvac_action */
  .hdr-tile[data-action="heating"] {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }
  .hdr-tile[data-action="cooling"] {
    background: var(--blue-fill);
    border-color: var(--blue-border);
  }
  .hdr-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    background: transparent;
    transition: all .2s ease;
    color: var(--text-muted);
  }
  .hdr-icon[data-a="heating"] {
    color: var(--amber);
  }
  .hdr-icon[data-a="cooling"] {
    color: var(--blue);
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
    color: var(--text);
    letter-spacing: .1px;
    line-height: 1.15;
  }
  .card[data-mode="off"] .hdr-title {
    color: var(--text-sub);
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: .1px;
    line-height: 1.15;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub .heat-ic { color: var(--amber); }
  .hdr-sub .cool-ic { color: var(--blue); }
  .hdr-sub .fan-ic { color: var(--green); }
  .hdr-spacer { flex: 1; }

  /* -- Fan Button -- */
  .fan-btn {
    width: 42px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
    cursor: pointer;
    transition: all .15s ease;
  }
  .fan-btn:hover { box-shadow: var(--shadow); }
  .fan-btn:active { transform: scale(.94); }
  .fan-btn.on {
    background: var(--green-fill);
    color: var(--green);
    border-color: var(--green-border);
  }
  .fan-btn.on .icon { animation: fan-spin 1.8s linear infinite; }
  /* Fan inherits action color when system is actively heating/cooling */
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

  /* -- Mode Button (matches icon button language) -- */
  .mode-wrap { position: relative; }
  .mode-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 42px;
    box-sizing: border-box;
    padding: 0 8px 0 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    cursor: pointer;
    transition: all .15s ease;
    letter-spacing: .2px;
  }
  .mode-btn:hover { box-shadow: var(--shadow); }
  .mode-btn:active { transform: scale(.97); }
  .mode-btn .mode-icon { font-size: 16px; width: 16px; height: 16px; }
  .mode-btn .chevron { transition: transform .2s ease; font-size: 14px; width: 14px; height: 14px; }
  .mode-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* Mode accent states - driven by hvac_action, not mode */
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
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 160px;
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
  .mode-menu.open {
    display: flex;
    animation: menuIn .14s ease forwards;
  }
  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .mode-opt {
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
    transition: background .1s;
  }
  .mode-opt:hover { background: var(--track-bg); }
  .mode-opt:active { transform: scale(.97); }
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

  /* Fills */
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

  /* Deadband */
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

  /* Thumbs */
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

  /* Current temp marker */
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

  /* Scale */
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

  /* -- Mode Visibility Overrides -- */
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

  /* Single-mode fill radius override */
  .card[data-mode="heat"] .fill-h {
    border-radius: var(--r-track);
  }
  .card[data-mode="cool"] .fill-c {
    border-radius: var(--r-track);
  }

${REDUCED_MOTION}

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: 16px 16px 12px; --r-track: 12px; }
    .t-val { font-size: 42px; letter-spacing: -1.3px; }
  }
`;
var TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-mode="heat_cool" data-action="idle">

      <!-- Header -->
      <div class="hdr">
        <div class="hdr-tile" id="hdrTile" data-action="idle">
          <div class="hdr-icon" id="hdrIcon" data-a="idle">
            <span class="icon icon-18" id="hdrIconEl">thermostat</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Climate</span>
            <span class="hdr-sub" id="hdrSub"></span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <button class="fan-btn" id="fanBtn" title="Fan" aria-label="Toggle fan" data-action="idle">
          <span class="icon icon-18" id="fanIconEl">mode_fan</span>
        </button>
        <div class="mode-wrap">
          <button class="mode-btn" id="modeBtn" aria-expanded="false" data-action="idle">
            <span class="icon mode-icon" id="modeIcon">device_thermostat</span>
            <span id="modeLbl">Heat / Cool</span>
            <span class="icon chevron">expand_more</span>
          </button>
          <div class="mode-menu" id="modeMenu">
            <button class="mode-opt active" data-m="heat_cool">
              <span class="icon icon-18" style="color:var(--amber)">device_thermostat</span> Heat / Cool
            </button>
            <button class="mode-opt" data-m="heat">
              <span class="icon icon-18" style="color:var(--amber)">local_fire_department</span> Heat
            </button>
            <button class="mode-opt" data-m="cool">
              <span class="icon icon-18" style="color:var(--blue)">ac_unit</span> Cool
            </button>
            <button class="mode-opt" data-m="off">
              <span class="icon icon-18">power_settings_new</span> Off
            </button>
            <div class="mode-divider"></div>
            <button class="mode-opt eco-opt" id="ecoOpt" data-m="eco">
              <span class="icon icon-18" style="color:var(--green)">eco</span> Eco
              <span class="eco-check" id="ecoCheck">
                <span class="icon icon-14" style="color:#fff">check</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Temperatures -->
      <div class="temps">
        <div class="t-group indoor">
          <span class="t-label indoor">Indoor</span>
          <span class="t-val" id="curTemp">--<span class="deg">&deg;</span></span>
        </div>
        <div class="t-right" id="tRight">
          <div class="t-group heat">
            <span class="t-label heat">Heat</span>
            <span class="t-val heat" id="heatR">--<span class="deg">&deg;</span></span>
          </div>
          <div class="t-group cool">
            <span class="t-label cool">Cool</span>
            <span class="t-val cool" id="coolR">--<span class="deg">&deg;</span></span>
          </div>
        </div>
      </div>

      <!-- Slider -->
      <div class="slider-zone">
        <div class="slider" id="slider">
          <div class="track">
            <div class="fill-h" id="fillH"></div>
            <div class="fill-c" id="fillC"></div>
            <div class="deadband" id="db"></div>
          </div>
          <div class="thumb heat" id="tH" role="slider" aria-label="Heat setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="68" aria-valuetext="Heat setpoint: 68 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="thumb cool" id="tC" role="slider" aria-label="Cool setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="76" aria-valuetext="Cool setpoint: 76 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="cur-marker" id="curMark">
            <div class="cur-arrow"></div>
            <div class="cur-label" id="curLbl">--&deg;</div>
          </div>
        </div>
        <div class="scale">
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMin">60&deg;</span></div>
          <div class="scale-mark" id="sMidMark"><div class="scale-tick"></div><span class="scale-num" id="sMid">70&deg;</span></div>
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMax">80&deg;</span></div>
        </div>
      </div>

    </div>
  </div>
`;
var TunetClimateCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._drag = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._debounceTimer = null;
    this._rendered = false;
    injectFonts();
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onEndDrag.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onEndDrag.bind(this);
    this._onDocClick = this._onDocClick.bind(this);
  }
  /* -- Config -- */
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: { entity: { filter: [{ domain: "climate" }] } }
        },
        {
          name: "humidity_entity",
          selector: { entity: { filter: [{ domain: "sensor", device_class: "humidity" }] } }
        },
        {
          name: "name",
          selector: { text: {} }
        },
        {
          name: "surface",
          selector: { select: { options: ["card", "section"] } }
        },
        {
          name: "variant",
          selector: { select: { options: ["standard", "thin"] } }
        },
        {
          name: "",
          type: "grid",
          schema: [
            {
              name: "display_min",
              selector: { number: { min: 0, max: 120, step: 1, mode: "box" } }
            },
            {
              name: "display_max",
              selector: { number: { min: 0, max: 120, step: 1, mode: "box" } }
            }
          ]
        }
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: "Climate Entity",
          humidity_entity: "Humidity Sensor",
          name: "Card Name",
          surface: "Surface Style",
          variant: "Variant",
          display_min: "Scale Min",
          display_max: "Scale Max"
        };
        return labels[schema.name] || schema.name;
      }
    };
  }
  static getStubConfig() {
    return {
      entity: "",
      name: "Climate"
    };
  }
  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Select a climate entity", "Climate");
      return;
    }
    this._config = {
      entity: config.entity,
      humidity_entity: config.humidity_entity || "",
      name: config.name || "Climate",
      display_min: config.display_min != null ? Number(config.display_min) : null,
      display_max: config.display_max != null ? Number(config.display_max) : null,
      surface: config.surface === "section" ? "section" : "card",
      variant: config.variant === "thin" ? "thin" : "standard"
    };
    if (this._config.surface === "section") {
      this.setAttribute("surface", "section");
    } else {
      this.removeAttribute("surface");
    }
    if (this._config.variant === "thin") {
      this.setAttribute("variant", "thin");
    } else {
      this.removeAttribute("variant");
    }
    if (this._rendered) this._updateAll();
  }
  /* -- HA State -- */
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    const entity = this._config.entity;
    const humEntity = this._config.humidity_entity;
    if (!oldHass || entity && oldHass.states[entity] !== hass.states[entity] || humEntity && oldHass.states[humEntity] !== hass.states[humEntity]) {
      this._updateAll();
    }
  }
  getCardSize() {
    return this._config.variant === "thin" ? 3 : 4;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
      rows: "auto",
      min_rows: 3
    };
  }
  /* -- Lifecycle -- */
  connectedCallback() {
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("touchmove", this._onTouchMove, { passive: false });
    document.addEventListener("touchend", this._onTouchEnd);
    document.addEventListener("click", this._onDocClick);
  }
  disconnectedCallback() {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("touchmove", this._onTouchMove);
    document.removeEventListener("touchend", this._onTouchEnd);
    document.removeEventListener("click", this._onDocClick);
    clearTimeout(this._debounceTimer);
    clearTimeout(this._cooldownTimer);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
  /* -- Render -- */
  _render() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {};
    const ids = [
      "card",
      "hdrTile",
      "hdrIcon",
      "hdrIconEl",
      "cardTitle",
      "hdrSub",
      "fanBtn",
      "fanIconEl",
      "modeBtn",
      "modeLbl",
      "modeIcon",
      "modeMenu",
      "ecoOpt",
      "ecoCheck",
      "curTemp",
      "heatR",
      "coolR",
      "tRight",
      "slider",
      "fillH",
      "fillC",
      "db",
      "tH",
      "tC",
      "curMark",
      "curLbl",
      "sMin",
      "sMid",
      "sMidMark",
      "sMax"
    ];
    ids.forEach((id) => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }
  /* -- Setup Listeners -- */
  _setupListeners() {
    const $ = this.$;
    $.hdrTile.addEventListener("click", (e) => {
      e.stopPropagation();
      const ev = new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: this._config.entity } });
      this.dispatchEvent(ev);
    });
    $.fanBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleFan();
    });
    $.modeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleMenu();
    });
    this.shadowRoot.querySelectorAll(".mode-opt:not(.eco-opt)").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setMode(opt.dataset.m);
      });
    });
    $.ecoOpt.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleEco();
    });
    $.tH.addEventListener("mousedown", (e) => this._startDrag("heat", e));
    $.tC.addEventListener("mousedown", (e) => this._startDrag("cool", e));
    $.tH.addEventListener("touchstart", (e) => this._startDrag("heat", e), { passive: false });
    $.tC.addEventListener("touchstart", (e) => this._startDrag("cool", e), { passive: false });
    $.tH.addEventListener("keydown", (e) => this._thumbKey("heat", e));
    $.tC.addEventListener("keydown", (e) => this._thumbKey("cool", e));
    this._resizeObserver = new ResizeObserver(() => this._renderSlider());
    this._resizeObserver.observe($.slider);
  }
  /* -- Entity Helpers -- */
  _getEntity() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity] || null;
  }
  _getHumidity() {
    if (!this._hass || !this._config.humidity_entity) return null;
    return this._hass.states[this._config.humidity_entity] || null;
  }
  _getState() {
    const entity = this._getEntity();
    if (!entity) return null;
    const a = entity.attributes;
    const mode = entity.state;
    const action = a.hvac_action || "idle";
    let heat, cool;
    if (mode === "heat_cool" || mode === "auto") {
      heat = a.target_temp_low;
      cool = a.target_temp_high;
    } else if (mode === "heat") {
      heat = a.temperature;
      cool = null;
    } else if (mode === "cool") {
      heat = null;
      cool = a.temperature;
    } else {
      heat = a.target_temp_low || a.temperature;
      cool = a.target_temp_high || a.temperature;
    }
    const minTemp = a.min_temp || 45;
    const maxTemp = a.max_temp || 95;
    const displayMin = this._config.display_min != null ? this._config.display_min : Math.max(minTemp, (heat || minTemp) - 10);
    const displayMax = this._config.display_max != null ? this._config.display_max : Math.min(maxTemp, (cool || maxTemp) + 10);
    const fanMode = a.fan_mode || "auto";
    const fanOn = fanMode === "on" || fanMode === "high" || fanMode === "medium" || fanMode === "low";
    const presetMode = a.preset_mode || "none";
    const humEntity = this._getHumidity();
    const humidity = humEntity ? Math.round(Number(humEntity.state)) : null;
    let cardMode = mode;
    if (mode === "auto") cardMode = "heat_cool";
    if (mode === "fan_only" || mode === "dry") cardMode = "off";
    return {
      mode: cardMode,
      action,
      heat: heat != null ? Math.round(heat) : null,
      cool: cool != null ? Math.round(cool) : null,
      cur: a.current_temperature != null ? Math.round(a.current_temperature) : null,
      humidity,
      fanOn,
      preset: presetMode,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      displayMin: Math.round(displayMin),
      displayMax: Math.round(displayMax),
      hvacModes: a.hvac_modes || [],
      fanModes: a.fan_modes || [],
      presetModes: a.preset_modes || []
    };
  }
  /* -- Full Update -- */
  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card) return;
    if (this._drag || this._serviceCooldown) return;
    const s = this._getState();
    if (!s) return;
    this._state = s;
    $.cardTitle.textContent = this._config.name || "Climate";
    $.card.dataset.mode = s.mode;
    $.card.dataset.action = s.action;
    $.hdrIcon.dataset.a = s.action;
    $.hdrTile.dataset.action = s.action;
    const actionIcons = { heating: "local_fire_department", cooling: "ac_unit" };
    $.hdrIconEl.textContent = actionIcons[s.action] || "thermostat";
    if (s.action === "heating" || s.action === "cooling") {
      $.hdrIconEl.classList.add("filled");
    } else {
      $.hdrIconEl.classList.remove("filled");
    }
    $.fanBtn.classList.toggle("on", s.fanOn);
    $.fanBtn.dataset.action = s.action;
    if (s.fanOn) $.fanIconEl.classList.add("filled");
    else $.fanIconEl.classList.remove("filled");
    $.fanBtn.style.display = s.fanModes && s.fanModes.length > 0 ? "" : "none";
    const modeLabels = { heat_cool: "Heat / Cool", heat: "Heat", cool: "Cool", off: "Off" };
    const modeIcons = { heat_cool: "device_thermostat", heat: "local_fire_department", cool: "ac_unit", off: "power_settings_new" };
    $.modeLbl.textContent = modeLabels[s.mode] || s.mode;
    $.modeIcon.textContent = modeIcons[s.mode] || "device_thermostat";
    $.modeBtn.dataset.action = s.action;
    this.shadowRoot.querySelectorAll(".mode-opt:not(.eco-opt)").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.m === s.mode);
    });
    $.ecoOpt.classList.toggle("active", s.preset === "eco");
    const hasEco = s.presetModes && s.presetModes.includes("eco");
    $.ecoOpt.style.display = hasEco ? "" : "none";
    const divider = this.shadowRoot.querySelector(".mode-divider");
    if (divider) divider.style.display = hasEco ? "" : "none";
    this.shadowRoot.querySelectorAll(".mode-opt:not(.eco-opt)").forEach((opt) => {
      const m = opt.dataset.m;
      const haMode = m === "heat_cool" ? "heat_cool" : m;
      const supported = s.hvacModes.includes(haMode) || m === "heat_cool" && s.hvacModes.includes("auto");
      opt.style.display = supported ? "" : "none";
    });
    const D = '<span class="deg">&deg;</span>';
    $.curTemp.innerHTML = (s.cur != null ? s.cur : "--") + D;
    if (s.heat != null) $.heatR.innerHTML = s.heat + D;
    else $.heatR.innerHTML = "--" + D;
    if (s.cool != null) $.coolR.innerHTML = s.cool + D;
    else $.coolR.innerHTML = "--" + D;
    this._updateSubtitle(s);
    $.sMin.textContent = s.displayMin + "\xB0";
    $.sMid.textContent = Math.round(s.displayMin + (s.displayMax - s.displayMin) / 2) + "\xB0";
    $.sMax.textContent = s.displayMax + "\xB0";
    if (s.cur != null) {
      const midTemp = s.displayMin + (s.displayMax - s.displayMin) / 2;
      $.sMidMark.style.opacity = Math.abs(s.cur - midTemp) < 3 ? "0" : "1";
    }
    this._renderSlider();
  }
  /* -- Slider Math -- */
  _t2p(temp) {
    const s = this._state;
    if (!s) return 0;
    return (temp - s.displayMin) / (s.displayMax - s.displayMin);
  }
  _p2t(p) {
    const s = this._state;
    if (!s) return 0;
    return Math.round(s.displayMin + p * (s.displayMax - s.displayMin));
  }
  _p2px(p) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return PAD + Math.max(0, Math.min(1, p)) * (w - 2 * PAD);
  }
  _px2p(px) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return Math.max(0, Math.min(1, (px - PAD) / (w - 2 * PAD)));
  }
  _updateSubtitle(s) {
    const $ = this.$;
    if (!$ || !$.hdrSub) return;
    const actionNames = { heating: "Heating", cooling: "Cooling", idle: "Idle", off: "Off", drying: "Drying" };
    const actionClass = { heating: "heat-ic", cooling: "cool-ic" };
    let parts = [];
    if (this._config.variant === "thin") {
      const thinTemps = [];
      if (s.cur != null) thinTemps.push(`${s.cur}\xB0 in`);
      if (s.heat != null && s.mode !== "cool" && s.mode !== "off") thinTemps.push(`H ${s.heat}\xB0`);
      if (s.cool != null && s.mode !== "heat" && s.mode !== "off") thinTemps.push(`C ${s.cool}\xB0`);
      if (thinTemps.length) parts.push(thinTemps.join(" \xB7 "));
    }
    if (s.humidity != null) {
      parts.push(s.humidity + "% humidity");
    }
    const isActive = s.action === "heating" || s.action === "cooling";
    if (isActive && s.fanOn) {
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === "eco") label += " \xB7 Eco";
      parts.push('<span class="' + cls + '">' + label + " \xB7 Fan</span>");
    } else if (isActive) {
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === "eco") label += " \xB7 Eco";
      parts.push('<span class="' + cls + '">' + label + "</span>");
    } else if (s.fanOn) {
      let label = "Fan";
      if (s.preset === "eco") label += " \xB7 Eco";
      parts.push('<span class="fan-ic">' + label + "</span>");
    } else {
      let label = actionNames[s.action] || "Idle";
      if (s.preset === "eco" && s.action !== "off") label += " \xB7 Eco";
      parts.push(label);
    }
    $.hdrSub.innerHTML = parts.join(" \xB7 ");
  }
  _renderSlider() {
    const $ = this.$;
    const s = this._state;
    if (!s || !$.slider || !$.slider.offsetWidth) return;
    const w = $.slider.offsetWidth;
    if (s.heat != null) {
      const hp = this._t2p(s.heat);
      const hpx = this._p2px(hp);
      $.tH.style.left = hpx + "px";
      $.fillH.style.width = hpx + "px";
      $.tH.setAttribute("aria-valuenow", s.heat);
      $.tH.setAttribute("aria-valuemin", s.minTemp);
      $.tH.setAttribute("aria-valuemax", s.cool != null ? s.cool - 2 : s.maxTemp);
      $.tH.setAttribute("aria-valuetext", "Heat setpoint: " + s.heat + " degrees");
    }
    if (s.cool != null) {
      const cp = this._t2p(s.cool);
      const cpx = this._p2px(cp);
      $.tC.style.left = cpx + "px";
      $.fillC.style.width = w - cpx + "px";
      $.tC.setAttribute("aria-valuenow", s.cool);
      $.tC.setAttribute("aria-valuemin", s.heat != null ? s.heat + 2 : s.minTemp);
      $.tC.setAttribute("aria-valuemax", s.maxTemp);
      $.tC.setAttribute("aria-valuetext", "Cool setpoint: " + s.cool + " degrees");
    }
    if (s.mode === "heat_cool" && s.heat != null && s.cool != null) {
      const hpx = this._p2px(this._t2p(s.heat));
      const cpx = this._p2px(this._t2p(s.cool));
      $.db.style.left = hpx + "px";
      $.db.style.width = Math.max(0, cpx - hpx) + "px";
      $.db.style.display = "";
    } else {
      $.db.style.display = "none";
    }
    if (s.cur != null) {
      $.curMark.style.left = this._p2px(this._t2p(s.cur)) + "px";
      $.curLbl.textContent = s.cur + "\xB0";
      $.curMark.style.display = "";
    } else {
      $.curMark.style.display = "none";
    }
  }
  /* -- Drag Handlers -- */
  _startDrag(which, e) {
    e.preventDefault();
    e.stopPropagation();
    this._drag = which;
    this._dragActive = false;
    this._dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    const thumbEl = which === "heat" ? this.$.tH : this.$.tC;
    thumbEl.style.transition = "none";
    document.body.style.cursor = "grabbing";
  }
  _onMouseMove(e) {
    if (!this._drag) return;
    this._handleDragMove(e.clientX);
  }
  _onTouchMove(e) {
    if (!this._drag) return;
    e.preventDefault();
    this._handleDragMove(e.touches[0].clientX);
  }
  _handleDragMove(cx) {
    const DRAG_THRESHOLD = 4;
    if (!this._dragActive) {
      if (Math.abs(cx - this._dragStartX) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      const thumbEl = this._drag === "heat" ? this.$.tH : this.$.tC;
      thumbEl.classList.add("dragging");
    }
    const sl = this.$.slider;
    const r = sl.getBoundingClientRect();
    const px = cx - r.left;
    const p = this._px2p(px);
    const t = this._p2t(p);
    const s = this._state;
    if (this._drag === "heat") {
      const maxHeat = s.cool != null ? s.cool - 2 : s.maxTemp;
      s.heat = Math.max(s.minTemp, Math.min(t, maxHeat));
    } else {
      const minCool = s.heat != null ? s.heat + 2 : s.minTemp;
      s.cool = Math.min(s.maxTemp, Math.max(t, minCool));
    }
    this._renderSlider();
    const D = '<span class="deg">&deg;</span>';
    if (this._drag === "heat" && s.heat != null) {
      this.$.heatR.innerHTML = s.heat + D;
    }
    if (this._drag === "cool" && s.cool != null) {
      this.$.coolR.innerHTML = s.cool + D;
    }
  }
  _onEndDrag() {
    if (!this._drag) return;
    const which = this._drag;
    const thumbEl = which === "heat" ? this.$.tH : this.$.tC;
    thumbEl.style.transition = "";
    thumbEl.classList.remove("dragging");
    document.body.style.cursor = "";
    if (this._dragActive) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._callSetTemperature(), 300);
    }
    this._drag = null;
    this._dragActive = false;
  }
  /* -- Keyboard -- */
  _thumbKey(which, e) {
    const step = e.shiftKey ? 5 : 1;
    const s = this._state;
    if (!s) return;
    let changed = false;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      if (which === "heat" && s.heat != null) {
        const max = s.cool != null ? s.cool - 2 : s.maxTemp;
        s.heat = Math.min(s.heat + step, max);
        changed = true;
      } else if (which === "cool" && s.cool != null) {
        s.cool = Math.min(s.cool + step, s.maxTemp);
        changed = true;
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      if (which === "heat" && s.heat != null) {
        s.heat = Math.max(s.heat - step, s.minTemp);
        changed = true;
      } else if (which === "cool" && s.cool != null) {
        const min = s.heat != null ? s.heat + 2 : s.minTemp;
        s.cool = Math.max(s.cool - step, min);
        changed = true;
      }
    }
    if (changed) {
      this._renderSlider();
      const D = '<span class="deg">&deg;</span>';
      if (s.heat != null) this.$.heatR.innerHTML = s.heat + D;
      if (s.cool != null) this.$.coolR.innerHTML = s.cool + D;
      this._debouncedSetTemperature();
    }
  }
  /* -- Service Calls -- */
  _callSetTemperature() {
    const s = this._state;
    if (!s || !this._hass) return;
    const data = { entity_id: this._config.entity };
    if (s.mode === "heat_cool") {
      if (s.heat != null) data.target_temp_low = s.heat;
      if (s.cool != null) data.target_temp_high = s.cool;
    } else if (s.mode === "heat" && s.heat != null) {
      data.temperature = s.heat;
    } else if (s.mode === "cool" && s.cool != null) {
      data.temperature = s.cool;
    }
    this._hass.callService("climate", "set_temperature", data);
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._serviceCooldown = false;
    }, 1500);
  }
  _debouncedSetTemperature() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._callSetTemperature(), 400);
  }
  _setMode(mode) {
    if (!this._hass) return;
    this.$.modeMenu.classList.remove("open");
    this.$.modeBtn.setAttribute("aria-expanded", "false");
    const s = this._state;
    let haMode = mode;
    if (mode === "heat_cool" && s && s.hvacModes.includes("auto") && !s.hvacModes.includes("heat_cool")) {
      haMode = "auto";
    }
    this._hass.callService("climate", "set_hvac_mode", {
      entity_id: this._config.entity,
      hvac_mode: haMode
    });
  }
  _toggleFan() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;
    const newMode = s.fanOn ? "off" : "on";
    s.fanOn = !s.fanOn;
    this.$.fanBtn.classList.toggle("on", s.fanOn);
    if (s.fanOn) this.$.fanIconEl.classList.add("filled");
    else this.$.fanIconEl.classList.remove("filled");
    this._updateSubtitle(s);
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._serviceCooldown = false;
    }, 1500);
    this._hass.callService("climate", "set_fan_mode", {
      entity_id: this._config.entity,
      fan_mode: newMode
    });
  }
  _toggleEco() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;
    const newPreset = s.preset === "eco" ? "none" : "eco";
    this._hass.callService("climate", "set_preset_mode", {
      entity_id: this._config.entity,
      preset_mode: newPreset
    });
  }
  /* -- Menu -- */
  _toggleMenu() {
    const menu = this.$.modeMenu;
    const btn = this.$.modeBtn;
    menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", menu.classList.contains("open"));
  }
  _onDocClick(e) {
    if (!this.$.modeMenu || !this.$.modeMenu.classList.contains("open")) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector(".mode-wrap"))) {
      this.$.modeMenu.classList.remove("open");
      this.$.modeBtn.setAttribute("aria-expanded", "false");
    }
  }
};
registerCard("tunet-climate-card", TunetClimateCard, {
  name: "Tunet Climate Card",
  description: "Glassmorphism climate controller with dual-range slider",
  documentationURL: "https://github.com/tunet/tunet-climate-card"
});
logCardVersion("TUNET-CLIMATE", CARD_VERSION, "#D4850A");
//# sourceMappingURL=tunet_climate_card.js.map

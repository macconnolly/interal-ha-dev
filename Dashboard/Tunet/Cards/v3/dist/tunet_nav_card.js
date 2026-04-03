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

// Dashboard/Tunet/Cards/v3/tunet_nav_card.js
var CARD_VERSION = "0.2.4";
var DEFAULT_ICONS = {
  home: "home",
  rooms: "meeting_room",
  media: "speaker",
  "living-room": "weekend",
  kitchen: "kitchen",
  "dining-room": "restaurant",
  bedroom: "bed"
};
var NAV_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${REDUCED_MOTION}

  :host {
    display: block;
    font-size: 16px;
  }

  .wrap {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    inset: auto;
  }

  .nav {
    pointer-events: auto;
    background: var(--glass);
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: var(--shadow), var(--inset);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    user-select: none;
    -webkit-user-select: none;
  }

  .btn {
    all: unset;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    gap: 2px;
    cursor: pointer;
    color: var(--text-muted);
    transition:
      color var(--motion-ui) var(--ease-standard),
      transform var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard);
  }

  :host(.dark) .btn:not(.active) {
    color: rgba(248,250,252, 0.55);
  }

  .btn:active { transform: scale(var(--press-scale)); }
  .btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: 16px;
  }

  .btn .icon {
    font-size: 22px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    overflow: hidden;
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
    line-height: 1;
    white-space: nowrap;
  }

  .btn.active {
    color: var(--amber);
  }

  .btn.active .icon {
    --ms-fill: 1;
  }

  /* \u2500\u2500 Mobile dock \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  :host([data-mode="mobile"]) .wrap {
    left: 0;
    right: 0;
    bottom: 0;
    padding:
      10px 12px
      calc(10px + env(safe-area-inset-bottom));
  }

  :host([data-mode="mobile"]) .nav {
    height: 64px;
    border-radius: 22px;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(56px, 1fr);
    align-items: center;
    column-gap: 2px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-snap-type: x proximity;
    padding: 0 4px;
  }
  :host([data-mode="mobile"]) .nav::-webkit-scrollbar { display: none; }

  :host([data-mode="mobile"]) .btn {
    width: 100%;
    height: 100%;
    min-width: 56px;
    scroll-snap-align: center;
  }

  :host([data-mode="mobile"]) .label {
    display: none;
  }

  /* \u2500\u2500 Desktop rail \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  :host([data-mode="desktop"]) .wrap {
    left: 12px;
    top: 12px;
    bottom: 12px;
    padding: 0;
  }

  :host([data-mode="desktop"]) .nav {
    width: 84px;
    height: calc(100vh - 24px);
    border-radius: 28px;
    padding: 6px 0;
    gap: 6px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(var(--nav-item-count, 3), 72px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }

  :host([data-mode="desktop"]) .btn {
    width: 100%;
    height: 72px;
  }
`;
var GLOBAL_STYLE_ID = "tunet-nav-card-offsets";
function ensureGlobalOffsetsStyle() {
  if (window.TUNET_NAV_OFFSETS_DISABLED) return;
  if (document.getElementById(GLOBAL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = GLOBAL_STYLE_ID;
  style.textContent = `
    hui-view,
    hui-sections-view,
    hui-grid-view,
    hui-masonry-view,
    hui-panel-view {
      margin-left: var(--tunet-nav-offset-left, 0px);
      margin-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      padding-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      scroll-padding-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      box-sizing: border-box;
    }

    hui-view {
      display: block;
      min-height: calc(100% + var(--tunet-nav-offset-bottom, 0px));
    }
  `;
  document.head.appendChild(style);
}
function slugFromPath(path) {
  const normalized = normalizePath(path);
  if (!normalized.startsWith("/")) return "";
  const parts = normalized.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}
function labelFromSlug(slug) {
  if (!slug) return "Item";
  return slug.split("-").filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
}
function scopePrefix(path) {
  const normalized = normalizePath(path);
  if (!normalized.startsWith("/")) return "";
  const parts = normalized.split("/").filter(Boolean);
  if (!parts.length) return "";
  return `/${parts[0]}/`;
}
function defaultNavItems(config) {
  const items = [
    { key: "home", label: "Home", icon: DEFAULT_ICONS.home, path: config.home_path, match_paths: [] },
    { key: "media", label: "Media", icon: DEFAULT_ICONS.media, path: config.media_path, match_paths: [] }
  ];
  for (const roomPath of config.subview_paths) {
    const slug = slugFromPath(roomPath);
    if (!slug) continue;
    items.push({
      key: slug,
      label: labelFromSlug(slug),
      icon: DEFAULT_ICONS[slug] || "meeting_room",
      path: roomPath,
      match_paths: []
    });
  }
  if (config.include_rooms_index) {
    items.push({
      key: "rooms",
      label: "Rooms",
      icon: DEFAULT_ICONS.rooms,
      path: config.rooms_path,
      match_paths: []
    });
  }
  return items;
}
function normalizeNavItem(item, idx) {
  const key = String(item?.key || item?.id || `item-${idx}`).trim();
  const path = normalizePath(item?.path || item?.navigation_path || "");
  if (!key || !path) return null;
  const label = String(item?.label || labelFromSlug(slugFromPath(path)) || key).trim();
  const icon = String(item?.icon || DEFAULT_ICONS[key] || "radio_button_unchecked").trim();
  const match_paths = Array.isArray(item?.match_paths) ? item.match_paths.map((p) => normalizePath(p)).filter(Boolean) : [];
  return { key, label, icon, path, match_paths };
}
var TunetNavCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._rendered = false;
    this._mql = null;
    this._btnEls = [];
    this._navItems = [];
    this._scopePrefixes = [];
    this._onLocationChange = this._onLocationChange.bind(this);
    this._onMqlChange = this._onMqlChange.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    injectFonts();
  }
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "home_path", selector: { text: {} } },
        { name: "rooms_path", selector: { text: {} } },
        { name: "media_path", selector: { text: {} } },
        {
          name: "subview_paths",
          selector: { object: {} }
        },
        {
          name: "include_rooms_index",
          selector: { boolean: {} }
        },
        {
          name: "items",
          selector: { object: {} }
        },
        { name: "desktop_breakpoint", selector: { number: { min: 600, max: 1400, step: 10, mode: "box" } } },
        { name: "desktop_left_offset", selector: { number: { min: 72, max: 220, step: 2, mode: "box" } } },
        { name: "mobile_bottom_offset", selector: { number: { min: 84, max: 220, step: 2, mode: "box" } } }
      ],
      computeLabel: (s) => {
        const labels = {
          home_path: "Home Path",
          rooms_path: "Rooms Path",
          media_path: "Media Path",
          subview_paths: "Room Paths (advanced)",
          include_rooms_index: "Show Rooms Index Item",
          items: "Custom Nav Items (advanced)",
          desktop_breakpoint: "Desktop Breakpoint (px)",
          desktop_left_offset: "Desktop Left Offset (px)",
          mobile_bottom_offset: "Mobile Bottom Offset (px)"
        };
        return labels[s.name] || s.name;
      }
    };
  }
  static getStubConfig() {
    return {
      home_path: "/tunet-suite/overview",
      rooms_path: "/tunet-suite/rooms",
      media_path: "/tunet-suite/media",
      subview_paths: [
        "/tunet-suite/living-room",
        "/tunet-suite/kitchen",
        "/tunet-suite/dining-room",
        "/tunet-suite/bedroom"
      ],
      include_rooms_index: true,
      desktop_breakpoint: 900,
      desktop_left_offset: 108,
      mobile_bottom_offset: 108
    };
  }
  setConfig(config) {
    const desktopBreakpoint = Number.isFinite(Number(config.desktop_breakpoint)) ? Math.max(600, Math.min(1400, Number(config.desktop_breakpoint))) : 900;
    const desktopLeftOffset = Number.isFinite(Number(config.desktop_left_offset)) ? Math.max(72, Math.min(220, Number(config.desktop_left_offset))) : 108;
    const mobileBottomOffset = Number.isFinite(Number(config.mobile_bottom_offset)) ? Math.max(84, Math.min(220, Number(config.mobile_bottom_offset))) : 108;
    this._config = {
      home_path: normalizePath(config.home_path || "/tunet-suite/overview"),
      rooms_path: normalizePath(config.rooms_path || "/tunet-suite/rooms"),
      media_path: normalizePath(config.media_path || "/tunet-suite/media"),
      subview_paths: Array.isArray(config.subview_paths) ? config.subview_paths.map((p) => normalizePath(p)).filter(Boolean) : [],
      include_rooms_index: config.include_rooms_index !== false,
      items: Array.isArray(config.items) ? config.items : [],
      desktop_breakpoint: desktopBreakpoint,
      desktop_left_offset: desktopLeftOffset,
      mobile_bottom_offset: mobileBottomOffset
    };
    const explicitItems = this._config.items.map((item, idx) => normalizeNavItem(item, idx)).filter(Boolean);
    this._navItems = explicitItems.length ? explicitItems : defaultNavItems(this._config);
    this._scopePrefixes = [...new Set(this._navItems.map((item) => scopePrefix(item.path)).filter(Boolean))];
    this._setupMql();
    if (this._rendered) {
      this._render();
      this._updateActive();
      this._applyOffsets();
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
    applyDarkClass(this, detectDarkMode(hass));
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return {
      columns: "full",
      min_columns: 6,
      rows: "auto",
      min_rows: 1
    };
  }
  connectedCallback() {
    ensureGlobalOffsetsStyle();
    window.addEventListener("location-changed", this._onLocationChange);
    window.addEventListener("popstate", this._onLocationChange);
    window.addEventListener("resize", this._onWindowResize, { passive: true });
    this._setupMql();
    window.__tunetNavCardCount = (window.__tunetNavCardCount || 0) + 1;
    this._applyOffsets();
    this._updateActive();
  }
  disconnectedCallback() {
    window.removeEventListener("location-changed", this._onLocationChange);
    window.removeEventListener("popstate", this._onLocationChange);
    window.removeEventListener("resize", this._onWindowResize);
    if (this._mql) this._mql.removeEventListener("change", this._onMqlChange);
    const next = Math.max(0, (window.__tunetNavCardCount || 1) - 1);
    window.__tunetNavCardCount = next;
    if (next === 0) {
      document.documentElement.style.removeProperty("--tunet-nav-offset-bottom");
      document.documentElement.style.removeProperty("--tunet-nav-offset-left");
      document.getElementById(GLOBAL_STYLE_ID)?.remove();
    }
  }
  _setupMql() {
    const query = `(min-width: ${this._config.desktop_breakpoint || 900}px)`;
    if (this._mql && this._mql.media === query) return;
    if (this._mql) this._mql.removeEventListener("change", this._onMqlChange);
    this._mql = window.matchMedia(query);
    this._mql.addEventListener("change", this._onMqlChange);
    this._applyMode();
  }
  _onMqlChange() {
    this._applyMode();
    this._applyOffsets();
  }
  _onLocationChange() {
    this._updateActive();
    this._applyOffsets();
  }
  _onWindowResize() {
    this._applyMode();
    this._applyOffsets();
  }
  _applyMode() {
    const isDesktop = !!(this._mql && this._mql.matches);
    this.setAttribute("data-mode", isDesktop ? "desktop" : "mobile");
  }
  _isScopedRoute(pathname) {
    if (!this._scopePrefixes.length) return true;
    return this._scopePrefixes.some((prefix) => pathname.startsWith(prefix));
  }
  _applyOffsets() {
    if (window.TUNET_NAV_OFFSETS_DISABLED) {
      document.documentElement.style.removeProperty("--tunet-nav-offset-left");
      document.documentElement.style.removeProperty("--tunet-nav-offset-bottom");
      return;
    }
    const isDesktop = this.getAttribute("data-mode") === "desktop";
    const left = Number(this._config.desktop_left_offset) || 108;
    const configuredBottom = Number(this._config.mobile_bottom_offset) || 108;
    const measuredBottom = isDesktop ? 0 : this._measureMobileDockClearance();
    const bottom = Math.max(configuredBottom, measuredBottom);
    document.documentElement.style.setProperty("--tunet-nav-offset-left", isDesktop ? `${left}px` : "0px");
    document.documentElement.style.setProperty(
      "--tunet-nav-offset-bottom",
      isDesktop ? "0px" : `calc(${bottom}px + env(safe-area-inset-bottom))`
    );
  }
  _measureMobileDockClearance() {
    const wrap = this.shadowRoot?.querySelector(".wrap");
    const nav = this.shadowRoot?.querySelector(".nav");
    if (!wrap || !nav) return 0;
    const wrapStyle = window.getComputedStyle(wrap);
    const navRect = nav.getBoundingClientRect();
    const padTop = Number.parseFloat(wrapStyle.paddingTop || "0") || 0;
    const padBottom = Number.parseFloat(wrapStyle.paddingBottom || "0") || 0;
    return Math.ceil(navRect.height + padTop + padBottom + 12);
  }
  _updateActive() {
    if (!this._btnEls.length) return;
    const path = window.location.pathname || "";
    const activeItem = this._navItems.find(
      (item) => path.startsWith(item.path) || (item.match_paths || []).some((mp) => path.startsWith(mp))
    );
    const activeKey = activeItem?.key || "";
    for (const btn of this._btnEls) {
      btn.classList.toggle("active", btn.dataset.key === activeKey);
    }
  }
  _navigate(targetPath) {
    navigatePath(targetPath);
    this._updateActive();
  }
  _render() {
    const style = document.createElement("style");
    style.textContent = NAV_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const itemsHtml = this._navItems.map((item) => `
      <button class="btn" data-key="${item.key}" type="button" aria-label="${item.label}" title="${item.label}">
        <span class="icon">${item.icon}</span>
        <span class="label">${item.label}</span>
      </button>
    `).join("");
    const tpl = document.createElement("template");
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <nav class="nav" aria-label="Tunet Navigation" style="--nav-item-count:${this._navItems.length || 1};">
          ${itemsHtml}
        </nav>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this._btnEls = [...this.shadowRoot.querySelectorAll(".btn")];
    for (const btn of this._btnEls) {
      const key = btn.dataset.key;
      const item = this._navItems.find((it) => it.key === key);
      if (!item) continue;
      btn.addEventListener("click", () => this._navigate(item.path));
    }
    this._applyMode();
    this._applyOffsets();
    this._updateActive();
    requestAnimationFrame(() => this._applyOffsets());
  }
};
registerCard("tunet-nav-card", TunetNavCard, {
  name: "Tunet Nav Card",
  description: "Persistent navigation: bottom dock (mobile) + side rail (desktop).",
  preview: true
});
logCardVersion("TUNET-NAV", CARD_VERSION, "#D4850A");
//# sourceMappingURL=tunet_nav_card.js.map

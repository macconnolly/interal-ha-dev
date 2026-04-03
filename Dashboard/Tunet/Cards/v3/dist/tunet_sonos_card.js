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
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Dashboard/Tunet/Cards/v3/tunet_sonos_card.js
var CARD_VERSION = "1.0.0";
var CARD_OVERRIDES = `
  :host {
    /* Blue accent for Sonos */
    --sonos-blue: #007AFF;
    --sonos-blue-fill: rgba(0,122,255, 0.09);
    --sonos-blue-border: rgba(0,122,255, 0.14);
    --sonos-blue-glow: rgba(0,122,255, 0.25);

    /* Green for playing */
    --sonos-green: var(--green);
    --sonos-green-fill: var(--green-fill);
    --sonos-green-border: var(--green-border);

    /* Tile shadows */
    --tile-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);

    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    display: block;
  }

  :host(.dark) {
    --sonos-blue: #0A84FF;
    --sonos-blue-fill: rgba(10,132,255, 0.13);
    --sonos-blue-border: rgba(10,132,255, 0.18);
    --sonos-blue-glow: rgba(10,132,255, 0.35);

    --tile-shadow: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.30);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
  }

  .card {
    width: 100%;
    padding: 16px;
    gap: 12px;
    overflow: visible;
  }

  /* State borders */
  .card[data-state="playing"] { border-color: var(--sonos-blue-border); }
  .card[data-state="paused"] { opacity: 0.88; }
  .card[data-state="idle"] { opacity: 0.65; }
  .card[data-state="off"],
  .card[data-state="unavailable"] { opacity: 0.55; }
`;
var PLAYER_HEADER_STYLES = `
  .player-header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
  }

  /* Album art - 36px to match icon sizes */
  .album-art {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden;
    background: var(--sonos-blue-fill);
    display: grid; place-items: center;
    position: relative;
  }
  .album-art img {
    width: 100%; height: 100%; object-fit: cover;
    position: absolute; inset: 0;
  }
  .album-art .icon { color: var(--sonos-blue); font-size: 20px; }
  .card[data-state="playing"] .album-art { box-shadow: var(--ctrl-sh); }

  /* Track info */
  .track-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 1px;
  }
  .track-name {
    font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 11px; font-weight: 600; color: var(--text-sub); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Transport controls - all uniform */
  .transport {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }
  .t-btn {
    width: 36px; height: 36px; border-radius: 10px;
    display: grid; place-items: center;
    cursor: pointer; transition: all .15s ease;
    border: none; background: transparent; color: var(--text-sub);
  }
  .t-btn:hover { background: var(--track-bg); }
  .t-btn:active { transform: scale(.90); }
  .t-btn .icon { font-size: 20px; }
  .t-btn[disabled] { opacity: 0.35; pointer-events: none; }
`;
var SOURCE_DROPDOWN_STYLES = `
  .source-wrap { position: relative; z-index: 20; }

  .source-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--text-sub); letter-spacing: .2px;
    cursor: pointer; transition: all .15s ease;
    white-space: nowrap;
  }
  .source-btn:hover { box-shadow: var(--shadow); }
  .source-btn:active { transform: scale(.97); }
  .source-btn .icon { font-size: 16px; }
  .source-btn .chevron { font-size: 14px; transition: transform .2s ease; }
  .source-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .source-dd {
    position: absolute; top: calc(100% + 6px); right: 0;
    min-width: 200px;
    background: rgba(255,255,255, 0.96);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border, var(--ctrl-border));
    border-radius: 14px;
    box-shadow: var(--shadow-up);
    padding: 4px;
    z-index: 2147483000;
    display: none;
  }
  :host(.dark) .source-dd {
    background: rgba(30,41,59, 0.96);
  }
  .source-dd.open {
    display: block;
    animation: srcMenuIn .14s ease forwards;
  }
  @keyframes srcMenuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .source-opt {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px; font-weight: 500;
    color: var(--text);
    cursor: pointer; transition: background .12s ease;
    border: none; background: none; width: 100%;
    text-align: left; font-family: inherit;
  }
  .source-opt:hover { background: var(--track-bg); }
  .source-opt .icon { font-size: 18px; color: var(--text-sub); }
  .source-opt.active { font-weight: 700; }
  .source-opt.active .icon {
    color: var(--sonos-blue);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .source-opt .opt-sub {
    font-size: 11px; font-weight: 500; color: var(--text-muted);
    margin-left: auto; white-space: nowrap;
  }
`;
var SPEAKER_TILE_STYLES = `
  /* Horizontal scroll container */
  .speakers-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 0;
    padding: 4px 0 6px 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    margin: 0 -4px;
    padding-left: 4px;
    padding-right: 4px;
  }
  .speakers-scroll::-webkit-scrollbar { display: none; }

  /* Individual speaker tile - landscape */
  .speaker-tile {
    scroll-snap-align: start;
    flex-shrink: 0;
    width: 150px;
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--tile-shadow);
    border: 1.5px solid var(--border-ghost);
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    row-gap: 1px;
    padding: 10px 12px 16px;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: pan-y;
    transition:
      transform .3s var(--spring),
      box-shadow .3s ease,
      border-color .2s ease,
      background-color .3s ease;
  }
  .speaker-tile:hover { box-shadow: var(--tile-shadow-lift); }

  /* Grouped (active) state */
  .speaker-tile.grouped { border-color: var(--sonos-blue-border); }

  /* Sliding (drag-to-volume active) */
  .speaker-tile.sliding {
    transform: scale(1.06);
    box-shadow: var(--tile-shadow-lift);
    border-color: var(--sonos-blue);
    z-index: 100;
  }

  /* Floating volume pill */
  .spk-floating-pill {
    position: absolute;
    top: -10px; left: 50%;
    transform: translate(-50%, -100%);
    background: var(--tile-bg);
    color: var(--sonos-blue);
    padding: 5px 14px;
    border-radius: var(--r-pill);
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
    white-space: nowrap;
    z-index: 101;
    border: 1px solid var(--border-ghost);
    opacity: 0; pointer-events: none;
    transition: opacity .15s ease;
    font-variant-numeric: tabular-nums;
  }
  :host(.dark) .spk-floating-pill { border-color: rgba(255,255,255,0.08); }
  .speaker-tile.sliding .spk-floating-pill { opacity: 1; }

  /* Grouped dot indicator */
  .group-dot {
    position: absolute; top: 8px; right: 8px;
    width: 7px; height: 7px;
    background: var(--sonos-blue);
    border-radius: 50%;
    opacity: 0;
    transition: opacity .2s ease;
    box-shadow: 0 0 8px var(--sonos-blue-glow);
  }
  .speaker-tile.grouped .group-dot { opacity: 1; }

  /* Speaker icon wrap - spans both rows, sits on the left */
  .spk-icon-wrap {
    grid-row: 1 / 3;
    width: 34px; height: 34px;
    border-radius: 9px;
    display: grid; place-items: center;
    transition: all .2s ease;
    background: var(--gray-ghost);
    color: var(--text-sub);
  }
  .spk-icon-wrap .icon { font-size: 20px; }
  .speaker-tile.grouped .spk-icon-wrap {
    background: var(--sonos-blue-fill);
    color: var(--sonos-blue);
  }
  .speaker-tile.grouped .spk-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Speaker name - top row, right of icon */
  .spk-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    line-height: 1.2; text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    align-self: end;
  }

  /* Volume value - bottom row, right of icon */
  .spk-vol {
    font-size: 11px; font-weight: 700;
    color: var(--sonos-blue);
    line-height: 1;
    text-align: left;
    align-self: start;
    font-variant-numeric: tabular-nums;
    transition: color .2s ease;
  }
  .speaker-tile:not(.grouped) .spk-vol {
    color: var(--text-muted);
  }

  /* Volume bar */
  .spk-vol-track {
    position: absolute; bottom: 7px; left: 12px; right: 12px;
    height: 3px; background: var(--track-bg);
    border-radius: var(--r-pill);
    overflow: hidden;
  }
  .spk-vol-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue);
    opacity: 0.6;
    transition: width .1s linear;
  }
  .speaker-tile:not(.grouped) .spk-vol-fill {
    opacity: 0.2;
  }
`;
var VOLUME_OVERLAY_STYLES = `
  .vol-overlay {
    position: absolute; inset: 0;
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: var(--r-card);
    display: none; align-items: center; justify-content: center;
    gap: 12px; padding: 16px 20px;
    z-index: 10;
  }
  .vol-overlay.active { display: flex; }
  .vol-overlay .vol-icon {
    font-size: 20px; color: var(--text-sub); cursor: pointer;
    font-family: 'Material Symbols Rounded';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-flex; align-items: center; justify-content: center;
    border: none; background: none; padding: 4px;
  }
  .vol-overlay .vol-icon:active { transform: scale(.9); }

  .vol-slider-track {
    flex: 1; height: 6px; background: var(--track-bg);
    border-radius: var(--r-pill); position: relative; cursor: pointer;
    touch-action: none;
  }
  .vol-slider-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue); transition: width .1s linear;
  }
  .vol-slider-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 18px; height: 18px; background: var(--thumb-bg, #fff);
    border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    transition: left .1s linear;
  }
  .vol-pct {
    font-size: 14px; font-weight: 700; color: var(--sonos-blue);
    min-width: 36px; text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;
var RESPONSIVE_STYLES = `
  @media (max-width: 440px) {
    .card { padding: 14px; gap: 10px; }
    .player-header { gap: 10px; }
    .album-art { width: 32px; height: 32px; border-radius: 8px; }
    .album-art .icon { font-size: 18px; }
    .track-name { font-size: 13px; }
    .track-artist { font-size: 10px; }
    .t-btn { width: 32px; height: 32px; }
    .t-btn .icon { font-size: 18px; }

    /* Tiles become near-square on mobile */
    .speaker-tile {
      width: 100px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 10px 8px 16px;
      gap: 3px;
    }
    .spk-icon-wrap {
      grid-row: unset;
      width: 32px; height: 32px; border-radius: 8px;
    }
    .spk-icon-wrap .icon { font-size: 18px; }
    .spk-name { font-size: 12px; text-align: center; align-self: unset; }
    .spk-vol { font-size: 10px; text-align: center; align-self: unset; }
    .spk-vol-track { left: 10px; right: 10px; bottom: 6px; }
  }
`;
var TUNET_SONOS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${PLAYER_HEADER_STYLES}
  ${SOURCE_DROPDOWN_STYLES}
  ${SPEAKER_TILE_STYLES}
  ${VOLUME_OVERLAY_STYLES}
  ${RESPONSIVE_STYLES}
  ${REDUCED_MOTION}
`;
var TUNET_SONOS_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Compact Player Header -->
      <div class="player-header">
        <div class="album-art" id="albumArt">
          <span class="icon filled" id="albumIcon">music_note</span>
        </div>
        <div class="track-info">
          <div class="track-name" id="trackName">Nothing playing</div>
          <div class="track-artist" id="trackArtist">Select a source to play</div>
        </div>
        <div class="transport">
          <button class="t-btn" id="prevBtn" title="Previous">
            <span class="icon" style="font-size:20px">skip_previous</span>
          </button>
          <button class="t-btn" id="playBtn" title="Play/Pause">
            <span class="icon" style="font-size:20px" id="playIcon">play_arrow</span>
          </button>
          <button class="t-btn" id="nextBtn" title="Next">
            <span class="icon" style="font-size:20px">skip_next</span>
          </button>
          <button class="t-btn" id="volBtn" title="Volume">
            <span class="icon" style="font-size:20px" id="volBtnIcon">volume_up</span>
          </button>
        </div>
        <div class="source-wrap" id="sourceWrap">
          <button class="source-btn" id="sourceBtn" aria-expanded="false">
            <span class="icon" id="sourceIcon">speaker</span>
            <span id="sourceLabel">Speaker</span>
            <span class="icon chevron">expand_more</span>
          </button>
          <div class="source-dd" id="sourceDd"></div>
        </div>
      </div>

      <!-- Speaker Tiles (horizontal scroll) -->
      <div class="speakers-scroll" id="speakersScroll"></div>

      <!-- Volume Overlay -->
      <div class="vol-overlay" id="volOverlay">
        <button class="vol-icon" id="muteBtn">volume_off</button>
        <div class="vol-slider-track" id="volTrack">
          <div class="vol-slider-fill" id="volFill" style="width:0%"></div>
          <div class="vol-slider-thumb" id="volThumb" style="left:0%"></div>
        </div>
        <div class="vol-pct" id="volPct">0%</div>
        <button class="vol-icon" id="volClose">close</button>
      </div>

    </div>
  </div>
`;
var DRAG_THRESHOLD = 6;
var DRAG_SCALE = 1.2;
var LONG_PRESS_MS = 500;
var TunetSonosCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._activeEntity = null;
    this._cachedSpeakers = null;
    this._tileRefs = /* @__PURE__ */ new Map();
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._ddDragRefs = null;
    this._ddDragFired = false;
    this._volDebounce = null;
    this._longPressTimer = null;
    this._longPressFired = false;
    this._volDragging = false;
    this._volOverlayDebounce = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    injectFonts();
    this._onDocClick = this._onDocClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }
  /* ── Config ───────────────────────────────────────── */
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { filter: [{ domain: "media_player" }] } } },
        { name: "name", selector: { text: {} } },
        {
          name: "speakers",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              description_field: "entity",
              fields: {
                entity: { label: "Speaker", required: true, selector: { entity: { filter: [{ domain: "media_player" }] } } },
                name: { label: "Name", selector: { text: {} } },
                icon: { label: "Icon", selector: { text: {} } }
              }
            }
          }
        },
        {
          type: "expandable",
          title: "Advanced",
          icon: "mdi:tune",
          schema: [
            { name: "coordinator_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } },
            { name: "active_group_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } },
            { name: "playing_status_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } }
          ]
        }
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || "";
        return {
          entity: "Media Player",
          name: "Card Name",
          speakers: "Speakers",
          coordinator_sensor: "Coordinator Sensor",
          active_group_sensor: "Active Group Sensor",
          playing_status_sensor: "Playing Status Sensor"
        }[s.name] || s.name;
      },
      computeHelper: (s) => ({
        speakers: "Optional explicit speaker list. If empty, speakers are auto-discovered from Sonos binary sensors.",
        coordinator_sensor: "Default: sensor.sonos_smart_coordinator"
      })[s.name] || ""
    };
  }
  static getStubConfig() {
    return {
      entity: "",
      name: "Sonos",
      speakers: []
    };
  }
  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Select a media player entity", "Sonos");
      return;
    }
    this._config = {
      entity: config.entity,
      name: config.name || "Sonos",
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || "sensor.sonos_smart_coordinator",
      active_group_sensor: config.active_group_sensor || "sensor.sonos_active_group_coordinator",
      playing_status_sensor: config.playing_status_sensor || "sensor.sonos_playing_status"
    };
    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildTiles();
      this._updateAll();
    }
  }
  /* ── HA State ─────────────────────────────────────── */
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildTiles();
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    if (!this._activeEntity) {
      this._activeEntity = this._coordinator;
    }
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildTiles();
    }
    let changed = !oldHass;
    if (!changed) {
      const watchList = [
        this._config.entity,
        this._activeEntity,
        this._config.coordinator_sensor,
        this._config.active_group_sensor,
        this._config.playing_status_sensor
      ];
      for (const spk of this._cachedSpeakers || []) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity, true));
        watchList.push(this._binarySensorFor(spk.entity, false));
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
    return 3;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 2
    };
  }
  /* ── Lifecycle ────────────────────────────────────── */
  connectedCallback() {
    document.addEventListener("click", this._onDocClick);
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
    document.addEventListener("pointercancel", this._onPointerUp);
    window.addEventListener("resize", this._onViewportChange, { passive: true });
    window.addEventListener("scroll", this._onViewportChange, { passive: true });
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
    document.removeEventListener("pointercancel", this._onPointerUp);
    window.removeEventListener("resize", this._onViewportChange);
    window.removeEventListener("scroll", this._onViewportChange);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._volOverlayDebounce);
    clearTimeout(this._cooldownTimer);
  }
  /* ── Helpers ──────────────────────────────────────── */
  _binarySensorFor(entityId, active = true) {
    const room = entityId.replace("media_player.", "");
    return active ? `binary_sensor.sonos_${room}_in_active_group` : `binary_sensor.sonos_${room}_in_playing_group`;
  }
  get _coordinator() {
    if (!this._hass) return this._activeEntity || this._config.entity;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    if (sensor && sensor.state && !["unknown", "unavailable", "none"].includes(sensor.state)) {
      if (this._hass.states[sensor.state]) return sensor.state;
    }
    return this._activeEntity || this._config.entity;
  }
  /**
   * Transport target = whatever the user selected in the dropdown.
   * Sonos handles group routing internally — sending play/pause to any
   * group member routes to the coordinator automatically.
   */
  get _transportTarget() {
    return this._activeEntity || this._coordinator;
  }
  _callTransport(service) {
    if (!this._hass) return;
    this._hass.callService("media_player", service, { entity_id: this._transportTarget });
  }
  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }
  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService("script", name, data);
  }
  _activeGroupMembers() {
    if (!this._hass) return [];
    const sensor = this._hass.states[this._config.active_group_sensor];
    if (!sensor) return [];
    const fromAttr = sensor.attributes && sensor.attributes.group_members;
    if (Array.isArray(fromAttr)) return fromAttr;
    if (typeof fromAttr === "string") {
      try {
        const parsed = JSON.parse(fromAttr);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {
      }
    }
    return [];
  }
  _isSpeakerInActiveGroup(entityId) {
    const activeMembers = this._activeGroupMembers();
    if (activeMembers.length > 0) return activeMembers.includes(entityId);
    if (!this._hass) return false;
    const activeBinary = this._hass.states[this._binarySensorFor(entityId, true)];
    if (activeBinary) return activeBinary.state === "on";
    const legacyBinary = this._hass.states[this._binarySensorFor(entityId, false)];
    return !!legacyBinary && legacyBinary.state === "on";
  }
  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    const seen = /* @__PURE__ */ new Set();
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_(active|playing)_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        if (seen.has(playerEntity)) continue;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          seen.add(playerEntity);
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, " "),
            icon: "speaker"
          });
        }
      }
    }
    return speakers;
  }
  _getSpeakerStateLabel(entityId) {
    if (!this._hass) return "Idle";
    const entity = this._hass.states[entityId];
    if (!entity) return "Idle";
    if (entity.state === "playing") {
      const title = entity.attributes.media_title;
      return title || "Playing";
    }
    if (entity.state === "paused") return "Paused";
    return "Idle";
  }
  _getSpeakerShortName(entityId) {
    if (!this._hass) return entityId;
    const entity = this._hass.states[entityId];
    if (!entity) return entityId;
    let name = entity.attributes.friendly_name || "";
    name = name.replace(/\s+Sonos\s+Soundbar$/i, "").replace(/\s+Sonos$/i, "").replace(/\s+Soundbar$/i, "").replace(/\s+Speaker$/i, "").replace(/\s+Credenza\s+Speaker$/i, "").replace(/^Sonos\s+/i, "").replace(/\s+TV$/i, "").replace(/\s+Room$/i, "");
    return name || entityId.replace("media_player.", "");
  }
  /* ── Rendering ────────────────────────────────────── */
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_SONOS_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = TUNET_SONOS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {};
    const ids = [
      "card",
      "albumArt",
      "albumIcon",
      "trackName",
      "trackArtist",
      "prevBtn",
      "playBtn",
      "playIcon",
      "nextBtn",
      "volBtn",
      "volBtnIcon",
      "sourceWrap",
      "sourceBtn",
      "sourceIcon",
      "sourceLabel",
      "sourceDd",
      "speakersScroll",
      "volOverlay",
      "muteBtn",
      "volTrack",
      "volFill",
      "volThumb",
      "volPct",
      "volClose"
    ];
    ids.forEach((id) => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }
  /* ── Event Listeners ──────────────────────────────── */
  _setupListeners() {
    const $ = this.$;
    $.albumArt.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: this._transportTarget }
      }));
    });
    $.albumArt.style.cursor = "pointer";
    $.prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_previous_track");
    });
    $.playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_play_pause");
    });
    $.nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_next_track");
    });
    $.volBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      $.volOverlay.classList.toggle("active");
    });
    $.volClose.addEventListener("click", (e) => {
      e.stopPropagation();
      $.volOverlay.classList.remove("active");
    });
    $.muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const entity = this._hass && this._hass.states[this._activeEntity];
      if (entity) {
        this._callService("media_player", "volume_mute", {
          entity_id: this._activeEntity,
          is_volume_muted: !entity.attributes.is_volume_muted
        });
      }
    });
    this._setupVolOverlayDrag();
    $.sourceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = $.sourceDd.classList.contains("open");
      if (isOpen) {
        this._closeSourceMenu();
      } else {
        this._buildSourceMenu();
        this._openSourceMenu();
      }
    });
  }
  _setupVolOverlayDrag() {
    const track = this.$.volTrack;
    let dragging = false;
    const setVol = (e) => {
      const rect = track.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const pct = clamp(Math.round((cx - rect.left) / rect.width * 100), 0, 100);
      this.$.volFill.style.width = pct + "%";
      this.$.volThumb.style.left = pct + "%";
      this.$.volPct.textContent = pct + "%";
      clearTimeout(this._volOverlayDebounce);
      this._volOverlayDebounce = setTimeout(() => {
        this._callService("media_player", "volume_set", {
          entity_id: this._activeEntity,
          volume_level: pct / 100
        });
        this._serviceCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => {
          this._serviceCooldown = false;
        }, 1500);
      }, 200);
    };
    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      this._volDragging = true;
      track.setPointerCapture(e.pointerId);
      setVol(e);
    });
    track.addEventListener("pointermove", (e) => {
      if (dragging) setVol(e);
    });
    track.addEventListener("pointerup", () => {
      dragging = false;
      this._volDragging = false;
    });
    track.addEventListener("pointercancel", () => {
      dragging = false;
      this._volDragging = false;
    });
  }
  /* ── Source Dropdown ──────────────────────────────── */
  _buildSourceMenu() {
    const dd = this.$.sourceDd;
    if (!dd || !this._hass) return;
    dd.innerHTML = "";
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const entity = this._hass.states[spk.entity];
      if (!entity) continue;
      const isActive = spk.entity === this._activeEntity;
      const stateLabel = this._getSpeakerStateLabel(spk.entity);
      const opt = document.createElement("button");
      opt.className = `source-opt${isActive ? " active" : ""}`;
      const iconEl = document.createElement("span");
      iconEl.className = "icon";
      iconEl.style.fontSize = "18px";
      iconEl.textContent = spk.icon || "speaker";
      opt.appendChild(iconEl);
      const nameSpan = document.createTextNode(
        " " + (spk.name || this._getSpeakerShortName(spk.entity)) + " "
      );
      opt.appendChild(nameSpan);
      const subSpan = document.createElement("span");
      subSpan.className = "opt-sub";
      subSpan.textContent = stateLabel;
      opt.appendChild(subSpan);
      opt.addEventListener("click", (e) => {
        if (this._ddDragFired) {
          this._ddDragFired = false;
          return;
        }
        e.stopPropagation();
        this._activeEntity = spk.entity;
        this._closeSourceMenu();
        this._updateAll();
      });
      opt.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        const playerState = this._hass && this._hass.states[spk.entity];
        this._dragEntity = spk.entity;
        this._dragStartX = e.clientX;
        this._dragActive = false;
        this._ddDragFired = false;
        this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;
        this._ddDragRefs = { el: opt, subEl: subSpan, entity: spk.entity };
        clearTimeout(this._longPressTimer);
      });
      dd.appendChild(opt);
    }
  }
  _openSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.add("open");
    sourceBtn.setAttribute("aria-expanded", "true");
    this.style.position = "relative";
    this.style.zIndex = "10";
  }
  _closeSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.remove("open");
    sourceBtn.setAttribute("aria-expanded", "false");
    this.style.position = "";
    this.style.zIndex = "";
  }
  _onDocClick(e) {
    if (!this.$ || !this.$.sourceDd) return;
    if (!this.$.sourceDd.classList.contains("open")) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector(".source-wrap"))) {
      this._closeSourceMenu();
    }
  }
  _onViewportChange() {
  }
  /* ── Build Speaker Tiles ─────────────────────────── */
  _buildTiles() {
    const scroll = this.$.speakersScroll;
    if (!scroll) return;
    scroll.innerHTML = "";
    this._tileRefs.clear();
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const tile = document.createElement("div");
      tile.className = "speaker-tile";
      tile.dataset.entity = spk.entity;
      const dot = document.createElement("div");
      dot.className = "group-dot";
      tile.appendChild(dot);
      const pill = document.createElement("div");
      pill.className = "spk-floating-pill";
      pill.textContent = "0%";
      tile.appendChild(pill);
      const iconWrap = document.createElement("div");
      iconWrap.className = "spk-icon-wrap";
      const icon = document.createElement("span");
      icon.className = "icon";
      icon.style.fontSize = "20px";
      icon.textContent = spk.icon || "speaker";
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);
      const nameEl = document.createElement("div");
      nameEl.className = "spk-name";
      nameEl.textContent = spk.name || this._getSpeakerShortName(spk.entity);
      tile.appendChild(nameEl);
      const volEl = document.createElement("div");
      volEl.className = "spk-vol";
      volEl.textContent = "0%";
      tile.appendChild(volEl);
      const volTrack = document.createElement("div");
      volTrack.className = "spk-vol-track";
      const volFill = document.createElement("div");
      volFill.className = "spk-vol-fill";
      volFill.style.width = "0%";
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);
      tile.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });
      scroll.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, iconWrap, icon, nameEl, volEl, volFill, pill });
    }
  }
  /* ── Tile Pointer Handling ───────────────────────── */
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
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: entity }
        }));
        this._dragEntity = null;
      }
    }, LONG_PRESS_MS);
  }
  _onPointerMove(e) {
    if (!this._dragEntity) return;
    const dx = e.clientX - this._dragStartX;
    const isDdDrag = !!this._ddDragRefs && this._ddDragRefs.entity === this._dragEntity;
    if (!this._dragActive) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      if (isDdDrag) this._ddDragFired = true;
      clearTimeout(this._longPressTimer);
      const refs2 = this._tileRefs.get(this._dragEntity);
      if (refs2) refs2.tile.classList.add("sliding");
    }
    const newVol = clamp(Math.round(this._dragVol + dx / DRAG_SCALE), 0, 100);
    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volEl.textContent = newVol + "%";
      refs.pill.textContent = newVol + "%";
      refs.volFill.style.width = newVol + "%";
    }
    if (isDdDrag && this._ddDragRefs.subEl) {
      this._ddDragRefs.subEl.textContent = newVol + "%";
    }
    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._callService("media_player", "volume_set", {
        entity_id: this._dragEntity,
        volume_level: newVol / 100
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => {
        this._serviceCooldown = false;
      }, 1500);
    }, 200);
  }
  _onPointerUp() {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);
    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);
    const isDdDrag = !!this._ddDragRefs && this._ddDragRefs.entity === entity;
    if (refs) refs.tile.classList.remove("sliding");
    if (!this._dragActive && !this._longPressFired && !isDdDrag) {
      this._callScript("sonos_toggle_group_membership", {
        target_speaker: entity
      });
    }
    this._dragEntity = null;
    this._dragActive = false;
    this._ddDragRefs = null;
  }
  /* ── Full Update ─────────────────────────────────── */
  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._volDragging || this._serviceCooldown) return;
    const coordId = this._coordinator;
    const coordEntity = this._hass.states[coordId];
    const activeEntity = this._hass.states[this._activeEntity];
    if (!coordEntity && !activeEntity) {
      $.card.dataset.state = "unavailable";
      $.trackName.textContent = "Unavailable";
      $.trackArtist.textContent = "";
      return;
    }
    const transportEntity = this._hass.states[this._transportTarget];
    const source = transportEntity || coordEntity || activeEntity;
    const state = source.state;
    const a = source.attributes;
    $.card.dataset.state = state;
    const isActive = state === "playing" || state === "paused";
    $.trackName.textContent = a.media_title || (isActive ? "Unknown" : "Not Playing");
    $.trackName.style.color = isActive ? "" : "var(--text-muted)";
    $.trackArtist.textContent = a.media_artist || (isActive ? "" : "Tap a speaker to start");
    const artUrl = a.entity_picture;
    const existingImg = $.albumArt.querySelector("img");
    if (artUrl) {
      const normalizedUrl = artUrl.startsWith("/") ? `${location.origin}${artUrl}` : artUrl;
      if (existingImg) {
        if (existingImg.src !== normalizedUrl) existingImg.src = normalizedUrl;
      } else {
        const img = document.createElement("img");
        img.src = normalizedUrl;
        img.alt = "";
        img.onerror = () => img.remove();
        $.albumArt.appendChild(img);
      }
    } else if (existingImg) {
      existingImg.remove();
    }
    $.playIcon.textContent = state === "playing" ? "pause" : "play_arrow";
    if (state === "playing") {
      $.playIcon.classList.add("filled");
    } else {
      $.playIcon.classList.remove("filled");
    }
    $.prevBtn.disabled = !isActive;
    $.nextBtn.disabled = !isActive;
    if (!this._volDragging && activeEntity) {
      const vol = Math.round((activeEntity.attributes.volume_level || 0) * 100);
      const muted = activeEntity.attributes.is_volume_muted;
      const volIcon = muted ? "volume_off" : vol < 40 ? "volume_down" : "volume_up";
      $.volBtnIcon.textContent = volIcon;
      $.volFill.style.width = vol + "%";
      $.volThumb.style.left = vol + "%";
      $.volPct.textContent = vol + "%";
    }
    const activeSpk = (this._cachedSpeakers || []).find((s) => s.entity === this._activeEntity);
    if (activeSpk) {
      $.sourceLabel.textContent = activeSpk.name || this._getSpeakerShortName(this._activeEntity);
      $.sourceIcon.textContent = activeSpk.icon || "speaker";
    } else if (activeEntity) {
      $.sourceLabel.textContent = this._getSpeakerShortName(this._activeEntity);
    }
    this._updateTiles();
  }
  _updateTiles() {
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;
      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const playerState = this._hass.states[spk.entity];
      refs.tile.classList.toggle("grouped", inGroup);
      if (inGroup) {
        refs.icon.classList.add("filled");
      } else {
        refs.icon.classList.remove("filled");
      }
      if (playerState && this._dragEntity !== spk.entity) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + "%";
        refs.volFill.style.width = vol + "%";
        refs.pill.textContent = vol + "%";
      }
    }
  }
};
registerCard("tunet-sonos-card", TunetSonosCard, {
  name: "Tunet Sonos Card",
  description: "Unified Sonos player with speaker tiles, volume control, and group management",
  preview: true,
  documentationURL: "https://github.com/tunet/tunet-sonos-card"
});
logCardVersion("TUNET-SONOS", CARD_VERSION, "#007AFF");
//# sourceMappingURL=tunet_sonos_card.js.map

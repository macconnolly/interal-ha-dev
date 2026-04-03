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
var SECTION_SURFACE = `
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

// Dashboard/Tunet/Cards/v3/tunet_sensor_card.js
var CARD_VERSION = "3.0.0";
var CARD_OVERRIDES = `
  /* Card-specific token additions */
  :host {
    display: block;
    font-size: 16px; /* em anchor */
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    --r-icon: var(--_tunet-tile-radius, 0.875em);
    --type-label: var(--_tunet-name-font, 0.8125em);
    --type-sub: var(--_tunet-sub-font, 0.6875em);
    --type-value: var(--_tunet-value-font, 1.25em);
    --type-unit: var(--_tunet-unit-font, 0.6875em);
  }

  /* Section container overrides */
  .section-container {
    gap: var(--_tunet-section-gap, 1em);
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
var CARD_STYLES = `
  /* \u2500\u2500 Icon size utilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .icon-20 { font-size: 1.25em; }
  .icon-18 { font-size: 1.125em; }
  .icon-16 { font-size: 1em; }
  .icon-14 { font-size: 0.875em; }

  /* \u2500\u2500 Section Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .section-hdr {
    display: flex; align-items: center; gap: 0.625em;
    position: relative; z-index: 1;
  }
  .section-title {
    font-size: var(--_tunet-section-font, 0.9375em);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
    display: flex; align-items: center; gap: 0.5em;
  }
  .section-title .icon {
    font-size: var(--_tunet-icon-glyph, 1.25em);
  }
  .section-spacer { flex: 1; }
  .section-action {
    font-size: var(--_tunet-sub-font, 0.6875em);
    font-weight: 700;
    color: var(--text-sub); cursor: pointer;
    padding: 0 calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.85);
    min-height: calc(var(--_tunet-ctrl-min-h, 2.625em) * 0.78);
    border-radius: var(--r-pill);
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all 0.15s ease;
    display: flex; align-items: center; gap: 4px;
  }
  .section-action:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .section-action:active { transform: scale(0.97); }

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     SENSOR ROWS
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
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
    gap: var(--_tunet-row-gap, 0.75em);
    padding: var(--_tunet-row-pad-y, 0.75em) var(--_tunet-row-pad-x, 0.25em);
    min-height: var(--_tunet-row-min-h, 3.5em);
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: calc(var(--r-icon) * 0.72);
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
    top: 0;
    left: calc(var(--_tunet-row-pad-x, 0.25em) + var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.25em)) + var(--_tunet-row-gap, 0.75em));
    right: var(--_tunet-row-pad-x, 0.25em);
    height: 1px;
    background: var(--divider);
  }

  /* \u2500\u2500 Icon Wrap \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sensor-icon {
    width: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.25em));
    height: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.25em));
    border-radius: calc(var(--r-icon) * 0.7);
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .sensor-icon .icon {
    font-size: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.25em));
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

  /* \u2500\u2500 Sensor Info (label + sublabel) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sensor-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 0.125em;
  }
  .sensor-label {
    font-size: var(--_tunet-display-name-font, var(--type-label)); font-weight: 600;
    color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sensor-sub {
    font-size: var(--type-sub); font-weight: 500;
    color: var(--text-muted); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 0.25em;
  }
  .sensor-sub .range-sep {
    opacity: 0.5;
  }

  /* \u2500\u2500 Value + Unit \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sensor-val-wrap {
    display: flex; align-items: baseline; gap: 0.125em;
    flex-shrink: 0;
  }
  .sensor-val {
    font-size: var(--_tunet-display-value-font, var(--type-value));
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }
  .sensor-unit {
    font-size: var(--type-unit);
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.02em;
  }

  /* \u2500\u2500 Trend Arrow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sensor-trend {
    width: var(--_tunet-trend-box, 1.25em);
    height: var(--_tunet-trend-box, 1.25em);
    display: grid; place-items: center;
    flex-shrink: 0;
    margin-left: 0.125em;
  }
  .sensor-trend .icon {
    font-size: var(--_tunet-trend-glyph, 1em);
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
    transition: color 0.2s, transform 0.2s;
  }
  .sensor-trend[data-trend="rising"] .icon { color: var(--red); transform: rotate(0deg); }
  .sensor-trend[data-trend="falling"] .icon { color: var(--blue); transform: rotate(180deg); }
  .sensor-trend[data-trend="stable"] .icon { color: var(--text-muted); transform: rotate(90deg); }

  /* \u2500\u2500 Sparkline (optional inline mini-chart) \u2500\u2500\u2500\u2500\u2500 */
  .sensor-spark {
    width: var(--_tunet-sparkline-w, 3em);
    height: var(--_tunet-sparkline-h, 1.5em);
    flex-shrink: 0;
    margin-left: auto;
  }
  .sensor-spark svg {
    width: 100%; height: 100%;
    overflow: visible;
  }
  .spark-line {
    fill: none;
    stroke-width: var(--_tunet-spark-stroke, 0.09375em);
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

  /* \u2500\u2500 Empty State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sensor-empty {
    padding: calc(var(--_tunet-section-pad, 1em) * 1.2);
    text-align: center;
    color: var(--text-muted);
    font-size: var(--type-label);
    font-weight: 500;
  }

  /* \u2500\u2500 Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  @media (max-width: 440px) {
    :host(:not([use-profiles])) .sensor-row {
      gap: 0.625em;
      padding: 0.625em 0.125em;
    }
    :host(:not([use-profiles])) .sensor-spark {
      width: 2.5em;
      height: 1.25em;
    }
  }
`;
var SENSOR_ALL_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${SECTION_SURFACE} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;
var SENSOR_TEMPLATE = `
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
var SensorStyleCompiler = class {
  static evaluate(value, thresholds) {
    if (!thresholds || !thresholds.length) return null;
    if (value === null || value === void 0 || isNaN(value)) return null;
    const num = Number(value);
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      const tv = Number(t.value);
      const cond = t.condition || "gte";
      let match = false;
      switch (cond) {
        case "gte":
          match = num >= tv;
          break;
        case "gt":
          match = num > tv;
          break;
        case "lte":
          match = num <= tv;
          break;
        case "lt":
          match = num < tv;
          break;
        case "eq":
          match = num === tv;
          break;
        case "neq":
          match = num !== tv;
          break;
      }
      if (match) return t.style || "warning";
    }
    return null;
  }
  static evaluateState(state, stateStyles) {
    if (!stateStyles || !stateStyles.length || !state) return null;
    for (const ss of stateStyles) {
      if (ss.state === state) return ss.style || "warning";
    }
    return null;
  }
};
var TrendComputer = class {
  static compute(history, threshold = 0.5) {
    if (!history || history.length < 2) return "stable";
    const recent = history.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const delta = last - first;
    if (delta > threshold) return "rising";
    if (delta < -threshold) return "falling";
    return "stable";
  }
  static sparklinePath(data, width = 48, height = 24, padding = 3) {
    if (!data || data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const usableH = height - padding * 2;
    const step = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * step;
      const y = padding + usableH - (v - min) / range * usableH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return "M" + points.join(" L");
  }
};
var VALID_SIZES2 = /* @__PURE__ */ new Set(["compact", "standard", "large"]);
var TunetSensorCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._rowRefs = [];
    this._prevValues = {};
    this._historyCache = {};
    this._throttleTimer = null;
    this._historyTimer = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._profileSelection = null;
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
    injectFonts();
  }
  /* ── Config ─────────────────────────────────── */
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "icon_color", selector: { select: { options: ["amber", "blue", "green", "purple", "red", "muted"] } } },
        { name: "show_sparkline", selector: { boolean: {} } },
        { name: "show_trend", selector: { boolean: {} } },
        { name: "history_hours", selector: { number: { min: 1, max: 48, step: 1, mode: "box" } } },
        { name: "tile_size", selector: { select: { options: ["compact", "standard", "large"] } } },
        { name: "use_profiles", selector: { boolean: {} } },
        {
          name: "sensors",
          selector: {
            object: {
              multiple: true,
              label_field: "label",
              description_field: "entity",
              fields: {
                entity: { label: "Entity", required: true, selector: { entity: {} } },
                label: { label: "Label", selector: { text: {} } },
                icon: { label: "Icon (Material Symbol)", selector: { text: {} } },
                accent: { label: "Accent", selector: { select: { options: ["amber", "blue", "green", "purple", "red", "muted"] } } },
                unit: { label: "Unit", selector: { text: {} } },
                precision: { label: "Decimal Places", selector: { number: { min: 0, max: 4, step: 1, mode: "box" } } }
              }
            }
          }
        }
      ],
      computeLabel: (s) => ({
        title: "Section Title",
        icon: "Section Icon",
        icon_color: "Icon Color",
        show_sparkline: "Show Sparkline",
        show_trend: "Show Trend Indicator",
        history_hours: "History Hours",
        tile_size: "Tile Size",
        use_profiles: "Use Profile Sizing",
        sensors: "Sensors"
      })[s.name] || s.name,
      computeHelper: (s) => ({
        sensors: "Add sensor entities. For per-sensor thresholds, value_attribute, or state_styles, use YAML.",
        history_hours: "Hours of history for sparkline (default: 6)",
        icon: "Section header icon (MDI format)"
      })[s.name] || ""
    };
  }
  static getStubConfig() {
    return {
      title: "Environment",
      icon: "sensors",
      icon_color: "blue",
      show_sparkline: true,
      show_trend: true,
      tile_size: "standard",
      sensors: [
        { entity: "sensor.living_room_temperature", label: "Temperature", icon: "thermostat", accent: "amber", unit: "\xB0F", precision: 0 },
        { entity: "sensor.living_room_humidity", label: "Humidity", icon: "water_drop", accent: "blue", unit: "%", precision: 0 }
      ]
    };
  }
  setConfig(config) {
    if (!config.sensors || !Array.isArray(config.sensors) || config.sensors.length === 0) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Add sensor entities to get started", "Sensor");
      return;
    }
    const tileSizeRaw = String(config.tile_size || "standard").toLowerCase();
    const tileSize = VALID_SIZES2.has(tileSizeRaw) ? tileSizeRaw : "standard";
    const useProfiles = config.use_profiles !== false;
    this._config = {
      title: config.title || "Environment",
      icon: config.icon || "sensors",
      icon_color: config.icon_color || "blue",
      show_sparkline: config.show_sparkline !== false,
      show_trend: config.show_trend !== false,
      tile_size: tileSize,
      use_profiles: useProfiles,
      history_hours: config.history_hours || 6,
      sensors: config.sensors
    };
    if (this._rendered && this._hass) {
      this._applyProfile(this._getHostWidth());
      this._buildRows();
      this._updateAll(true);
      this._fetchAllHistory();
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
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 2,
      max_rows: 12
    };
  }
  connectedCallback() {
    this._setupResizeObserver();
    if (typeof ResizeObserver === "undefined") {
      this._usingWindowResizeFallback = true;
      window.addEventListener("resize", this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
    this._historyTimer = setInterval(() => {
      if (this._hass) this._fetchAllHistory();
    }, 5 * 60 * 1e3);
  }
  disconnectedCallback() {
    if (this._throttleTimer) clearTimeout(this._throttleTimer);
    if (this._historyTimer) clearInterval(this._historyTimer);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener("resize", this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
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
  _onWindowResize() {
    this._onHostResize(this.getBoundingClientRect?.().width);
  }
  _onHostResize(widthHint) {
    if (!this._rendered) return;
    this._applyProfile(widthHint);
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
    const useProfiles = this._config.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute("profile-family");
      this.removeAttribute("profile-size");
      this.removeAttribute("use-profiles");
      this._setLegacyTileSizeAttr(this._config.tile_size || "standard");
      return;
    }
    const width = this._getHostWidth(widthHint);
    const selection = selectProfileSize({
      preset: "environment",
      layout: "row",
      widthHint: width,
      userSize: this._config.tile_size
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute("profile-family", selection.family);
    this.setAttribute("profile-size", selection.size);
    this.setAttribute("use-profiles", "");
    this._setLegacyTileSizeAttr(selection.size);
  }
  /* ── Render ─────────────────────────────────── */
  _render() {
    const style = document.createElement("style");
    style.textContent = SENSOR_ALL_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = SENSOR_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      sectionTitle: this.shadowRoot.getElementById("sectionTitle"),
      sectionText: this.shadowRoot.getElementById("sectionText"),
      sectionIcon: this.shadowRoot.getElementById("sectionIcon"),
      sensorList: this.shadowRoot.getElementById("sensorList")
    };
    this._applyProfile(this._getHostWidth());
  }
  _buildRows() {
    const list = this.$.sensorList;
    list.innerHTML = "";
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
      const row = document.createElement("div");
      row.className = "sensor-row";
      row.dataset.accent = sensorCfg.accent || "muted";
      row.dataset.entity = sensorCfg.entity || "";
      const interactionType = sensorCfg.interaction && sensorCfg.interaction.type || "more_info";
      row.dataset.interaction = interactionType;
      if (interactionType !== "none") {
        row.setAttribute("role", "button");
        row.setAttribute("tabindex", "0");
      } else {
        row.setAttribute("tabindex", "-1");
      }
      const sparkHtml = this._config.show_sparkline ? `
        <div class="sensor-spark" id="spark-${this._rowRefs.length}">
          <svg viewBox="0 0 48 24" preserveAspectRatio="none">
            <path class="spark-line" d="" />
          </svg>
        </div>
      ` : "";
      const trendHtml = this._config.show_trend ? `
        <div class="sensor-trend" data-trend="stable">
          <span class="icon">arrow_upward</span>
        </div>
      ` : "";
      row.innerHTML = `
        <div class="sensor-icon">
          <span class="icon filled">${sensorCfg.icon || "sensors"}</span>
        </div>
        <div class="sensor-info">
          <span class="sensor-label">${sensorCfg.label || sensorCfg.entity || ""}</span>
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
        valEl: row.querySelector(".sensor-val"),
        unitEl: row.querySelector(".sensor-unit"),
        subEl: row.querySelector(".sensor-sub"),
        trendEl: row.querySelector(".sensor-trend"),
        sparkEl: row.querySelector(".sensor-spark"),
        sparkPath: row.querySelector(".spark-line")
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
      const interaction = cfg.interaction || { type: "more_info" };
      switch (interaction.type) {
        case "navigate":
          this.dispatchEvent(new CustomEvent("tunet-navigate", {
            bubbles: true,
            composed: true,
            detail: { card: interaction.target_card || "", entity: cfg.entity }
          }));
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent("hass-more-info", {
              bubbles: true,
              composed: true,
              detail: { entityId: cfg.entity }
            }));
          }
          break;
        case "more_info":
          if (cfg.entity) {
            this.dispatchEvent(new CustomEvent("hass-more-info", {
              bubbles: true,
              composed: true,
              detail: { entityId: cfg.entity }
            }));
          }
          break;
        case "none":
        default:
          break;
      }
    };
    this.$.sensorList.addEventListener("click", (e) => {
      const row = e.target.closest(".sensor-row");
      if (!row) return;
      activateRow(row);
    });
    this.$.sensorList.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const row = e.target.closest(".sensor-row");
      if (!row || row.dataset.interaction === "none") return;
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
      if (cached && Date.now() - cached.lastFetch < 12e4) continue;
      try {
        const hours = this._config.history_hours || 6;
        const end = /* @__PURE__ */ new Date();
        const start = new Date(end.getTime() - hours * 36e5);
        const wantsAttributeHistory = !!cfg.value_attribute;
        const url = wantsAttributeHistory ? `history/period/${start.toISOString()}?filter_entity_id=${cfg.entity}&end_time=${end.toISOString()}` : `history/period/${start.toISOString()}?filter_entity_id=${cfg.entity}&end_time=${end.toISOString()}&minimal_response&no_attributes`;
        const result = await this._hass.callApi("GET", url);
        if (result && result[0] && result[0].length > 0) {
          const points = result[0].map((s) => {
            const sourceVal = cfg.value_attribute ? s.attributes ? s.attributes[cfg.value_attribute] : void 0 : s.state;
            return { t: new Date(s.last_changed).getTime(), v: parseFloat(sourceVal) };
          }).filter((p) => !isNaN(p.v));
          this._historyCache[cfg.entity] = {
            data: points,
            lastFetch: Date.now()
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
    const values = cached.data.map((p) => p.v);
    if (ref.sparkPath && values.length >= 2) {
      const width = Number(ref.sparkEl?.clientWidth) || 48;
      const height = Number(ref.sparkEl?.clientHeight) || 24;
      const path = TrendComputer.sparklinePath(values, width, height);
      ref.sparkPath.setAttribute("d", path);
    }
    if (ref.trendEl) {
      const trend = TrendComputer.compute(values, cfg.trend_threshold || 0.5);
      ref.trendEl.dataset.trend = trend;
    }
    if (cfg.show_range && ref.subEl && values.length >= 2) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const prec = cfg.precision != null ? cfg.precision : 1;
      const unit = cfg.unit || "";
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
          val = "--";
          rawVal = null;
          unit = cfg.unit || "";
        } else {
          rawVal = cfg.value_attribute ? entity.attributes?.[cfg.value_attribute] : entity.state;
          unit = cfg.unit || entity.attributes.unit_of_measurement || "";
          if (!isNaN(rawVal) && rawVal !== "") {
            const prec = cfg.precision != null ? cfg.precision : 1;
            val = Number(rawVal).toFixed(prec);
            if (prec === 0) val = Math.round(Number(rawVal));
          } else {
            val = rawVal;
          }
        }
      } else {
        val = "--";
        rawVal = null;
        unit = cfg.unit || "";
      }
      const cacheKey = `row_${i}`;
      const prevRaw = this._prevValues[cacheKey];
      if (!force && prevRaw === rawVal) continue;
      this._prevValues[cacheKey] = rawVal;
      const display = val !== null && val !== void 0 ? val : "--";
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
};
registerCard("tunet-sensor-card", TunetSensorCard, {
  name: "Tunet Sensor Card",
  description: "Glassmorphism environment sensor panel - row-based readings, sparklines, trend arrows, threshold styling, min/max ranges",
  preview: true,
  documentationURL: "https://github.com/tunet/tunet-sensor-card"
});
logCardVersion("TUNET-SENSOR", CARD_VERSION, "#34C759");
//# sourceMappingURL=tunet_sensor_card.js.map

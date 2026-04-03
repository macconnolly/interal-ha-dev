/**
 * Tunet Scenes Card (v2 – ES Module)
 * Quick scene/script/automation chips in a compact strip layout.
 * Version 0.1.2
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CARD_SURFACE,
  CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '0.1.2';

const ACCENTS = ['amber', 'blue', 'green', 'purple', 'red'];
const OPERATORS = ['equals', 'contains', 'not_equals'];

const ICON_ALIASES = {
  auto_awesome: 'auto_awesome',
  bedtime: 'bedtime',
  floor_lamp: 'lamp',
  lightbulb_on: 'lightbulb',
  moon_stars: 'bedtime',
  power: 'power_settings_new',
  table_lamp: 'lamp',
};

const DEFAULT_SCENES = [
  { entity: '', name: 'All On', icon: 'lightbulb', accent: 'amber' },
  { entity: '', name: 'All Off', icon: 'power_settings_new', accent: 'amber' },
  { entity: '', name: 'Bedtime', icon: 'bedtime', accent: 'purple' },
];

function normalizeAccent(value) {
  return ACCENTS.includes(value) ? value : 'amber';
}

function normalizeOperator(value) {
  return OPERATORS.includes(value) ? value : 'equals';
}

function normalizeIcon(icon, fallback = 'auto_awesome') {
  if (!icon) return fallback;
  const raw = String(icon).replace(/^mdi:/, '').trim();
  if (!raw) return fallback;
  const underscored = raw.replace(/-/g, '_');
  return ICON_ALIASES[underscored] || ICON_ALIASES[raw] || underscored;
}

function fallbackIconForEntity(entityId) {
  const domain = String(entityId || '').split('.')[0];
  switch (domain) {
    case 'scene':
      return 'auto_awesome';
    case 'script':
      return 'play_arrow';
    case 'automation':
      return 'auto_mode';
    default:
      return 'auto_awesome';
  }
}

function coerceScenes(input) {
  if (!Array.isArray(input)) return [];
  return input.map((scene) => {
    const entity = String(scene?.entity || '').trim();
    const iconFallback = fallbackIconForEntity(entity);
    return {
      entity,
      name: String(scene?.name || '').trim(),
      icon: normalizeIcon(scene?.icon, iconFallback),
      accent: normalizeAccent(scene?.accent),
      state_entity: String(scene?.state_entity || '').trim(),
      active_when: String(scene?.active_when ?? 'on'),
      active_when_operator: normalizeOperator(scene?.active_when_operator),
    };
  }).filter((scene) => scene.entity);
}

const CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.07);
    --tile-shadow-lift: 0 8px 20px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06);
    display: block;
  }

  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
  }

  .card.compact {
    padding: 10px;
    border-radius: 20px;
  }
`;

const CARD_STYLES = `
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .hdr.hidden {
    display: none;
  }

  .hdr-icon {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--ctrl-bg);
    border: 1px solid var(--ctrl-border);
    color: var(--text-muted);
    box-shadow: var(--ctrl-sh);
    flex: 0 0 auto;
  }

  .hdr-title {
    font-size: var(--type-label, 12.5px);
    font-weight: 700;
    letter-spacing: 0.2px;
    color: var(--text-sub);
  }

  .scene-row {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .scene-row.wrap {
    overflow-x: visible;
    flex-wrap: wrap;
  }

  .scene-row::-webkit-scrollbar {
    display: none;
  }

  .scene-chip {
    flex: 0 0 auto;
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--tile-bg);
    box-shadow: var(--tile-shadow-rest);
    color: var(--text-sub);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 6px 12px 6px 9px;
    font-family: inherit;
    font-size: var(--type-chip, 12.5px);
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
    transition: transform var(--motion-fast) var(--ease-standard), box-shadow var(--motion-ui) var(--ease-standard), border-color var(--motion-ui) var(--ease-standard), color var(--motion-ui) var(--ease-standard), background var(--motion-ui) var(--ease-standard);
    -webkit-tap-highlight-color: transparent;
  }

  .card.compact .scene-chip {
    min-height: 34px;
    padding: 6px 11px 6px 8px;
    font-size: var(--type-chip, 13px);
    gap: 5px;
  }

  .scene-chip:hover {
    box-shadow: var(--tile-shadow-lift);
  }

  .scene-chip:active {
    transform: scale(0.96);
  }

  .scene-chip:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  .scene-chip .icon-wrap {
    width: 21px;
    height: 21px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: var(--gray-ghost);
    color: var(--text-muted);
    flex: 0 0 auto;
  }

  .card.compact .scene-chip .icon-wrap {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }

  .scene-chip .icon {
    font-size: 15px;
    width: 15px;
    height: 15px;
  }

  .card.compact .scene-chip .icon {
    font-size: 15px;
    width: 15px;
    height: 15px;
  }

  .scene-chip.active {
    font-weight: 700;
  }

  .scene-chip[data-accent="amber"].active {
    border-color: var(--amber-border);
    color: var(--amber);
    background: var(--amber-fill);
  }
  .scene-chip[data-accent="amber"].active .icon-wrap {
    border: 1px solid var(--amber-border);
    background: var(--amber-fill);
    color: var(--amber);
  }

  .scene-chip[data-accent="blue"].active {
    border-color: var(--blue-border);
    color: var(--blue);
    background: var(--blue-fill);
  }
  .scene-chip[data-accent="blue"].active .icon-wrap {
    border: 1px solid var(--blue-border);
    background: var(--blue-fill);
    color: var(--blue);
  }

  .scene-chip[data-accent="green"].active {
    border-color: var(--green-border);
    color: var(--green);
    background: var(--green-fill);
  }
  .scene-chip[data-accent="green"].active .icon-wrap {
    border: 1px solid var(--green-border);
    background: var(--green-fill);
    color: var(--green);
  }

  .scene-chip[data-accent="purple"].active {
    border-color: var(--purple-border);
    color: var(--purple);
    background: var(--purple-fill);
  }
  .scene-chip[data-accent="purple"].active .icon-wrap {
    border: 1px solid var(--purple-border);
    background: var(--purple-fill);
    color: var(--purple);
  }

  .scene-chip[data-accent="red"].active {
    border-color: var(--red-border);
    color: var(--red);
    background: var(--red-fill);
  }
  .scene-chip[data-accent="red"].active .icon-wrap {
    border: 1px solid var(--red-border);
    background: var(--red-fill);
    color: var(--red);
  }

  .scene-chip.is-unavailable {
    opacity: 0.5;
  }

  .scene-chip:disabled {
    cursor: default;
  }

  .empty {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    padding: 4px 2px 0;
  }

  .empty.hidden {
    display: none;
  }
`;

const TUNET_SCENES_STYLES = `
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

class TunetScenesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._chipRefs = [];
    this._recentEntity = '';
    this._recentUntil = 0;
    injectFonts();
  }

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'show_header', selector: { boolean: {} } },
        { name: 'name', selector: { text: {} } },
        { name: 'compact', selector: { boolean: {} } },
        { name: 'allow_wrap', selector: { boolean: {} } },
        {
          name: 'scenes',
          selector: {
            object: {
              multiple: true,
              label_field: 'name',
              description_field: 'entity',
              fields: {
                entity: { label: 'Entity', required: true, selector: { entity: { domain: ['scene', 'script', 'automation'] } } },
                name: { label: 'Name', selector: { text: {} } },
                icon: { label: 'Icon', selector: { icon: {} } },
                accent: { label: 'Accent', selector: { select: { options: ACCENTS } } },
                state_entity: { label: 'Active State Entity', selector: { entity: {} } },
                active_when: { label: 'Active When Value', selector: { text: {} } },
                active_when_operator: { label: 'Active Operator', selector: { select: { options: OPERATORS } } },
              },
            },
          },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          show_header: 'Show Header',
          name: 'Card Name',
          compact: 'Compact Layout',
          allow_wrap: 'Allow Wrap (multi-row)',
          scenes: 'Scenes',
          entity: 'Entity',
          icon: 'Icon',
          accent: 'Accent',
          state_entity: 'Active State Entity (optional)',
          active_when: 'Active When Value',
          active_when_operator: 'Active Operator',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      show_header: false,
      name: 'Scenes',
      compact: true,
      allow_wrap: false,
      scenes: DEFAULT_SCENES,
    };
  }

  setConfig(config) {
    this._config = {
      show_header: config.show_header === true,
      name: String(config.name || 'Scenes').trim() || 'Scenes',
      compact: config.compact !== false,
      allow_wrap: config.allow_wrap === true,
      scenes: coerceScenes(config.scenes),
    };

    if (this._rendered) {
      this._applyConfigToDom();
      this._buildChips();
      this._updateStates();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._buildChips();
      this._rendered = true;
    }

    applyDarkClass(this, detectDarkMode(hass));

    if (!oldHass || this._hasRelevantStateChange(oldHass, hass)) {
      this._updateStates();
    }
  }

  getCardSize() {
    if (!this._config.allow_wrap) return this._config.show_header ? 2 : 1;
    const rows = Math.max(1, Math.ceil((this._config.scenes?.length || 1) / 4));
    return (this._config.show_header ? 1 : 0) + rows;
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 1,
    };
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SCENES_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card" id="card">
          <div class="hdr" id="hdr">
            <div class="hdr-icon"><span class="icon filled">auto_awesome</span></div>
            <div class="hdr-title" id="title">Scenes</div>
          </div>
          <div class="scene-row" id="row"></div>
          <div class="empty hidden" id="empty">No scenes configured.</div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._els = {
      card: this.shadowRoot.getElementById('card'),
      hdr: this.shadowRoot.getElementById('hdr'),
      title: this.shadowRoot.getElementById('title'),
      row: this.shadowRoot.getElementById('row'),
      empty: this.shadowRoot.getElementById('empty'),
    };

    this._applyConfigToDom();
  }

  _applyConfigToDom() {
    if (!this._els) return;
    this._els.card.classList.toggle('compact', !!this._config.compact);
    this._els.hdr.classList.toggle('hidden', !this._config.show_header);
    this._els.row.classList.toggle('wrap', !!this._config.allow_wrap);
    this._els.title.textContent = this._config.name || 'Scenes';
  }

  _hasRelevantStateChange(oldHass, newHass) {
    for (const scene of this._config.scenes || []) {
      if (scene.entity && oldHass.states[scene.entity] !== newHass.states[scene.entity]) return true;
      if (scene.state_entity && oldHass.states[scene.state_entity] !== newHass.states[scene.state_entity]) return true;
    }
    return false;
  }

  _buildChips() {
    if (!this._els?.row) return;
    this._els.row.innerHTML = '';
    this._chipRefs = [];

    const scenes = this._config.scenes || [];
    this._els.empty.classList.toggle('hidden', scenes.length > 0);
    if (!scenes.length) return;

    for (const scene of scenes) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'scene-chip';
      chip.dataset.accent = scene.accent;
      chip.innerHTML = `
        <span class="icon-wrap"><span class="icon">${normalizeIcon(scene.icon, 'auto_awesome')}</span></span>
        <span class="label">${this._getSceneLabel(scene)}</span>
      `;

      chip.addEventListener('click', () => this._activate(scene, chip));
      this._els.row.appendChild(chip);
      this._chipRefs.push({ chip, scene });
    }
  }

  _getSceneLabel(scene) {
    if (scene.name) return scene.name;
    if (!this._hass || !scene.entity) {
      return scene.entity ? scene.entity.split('.').slice(1).join('.') : 'Scene';
    }
    const stateObj = this._hass.states[scene.entity];
    if (stateObj?.attributes?.friendly_name) return String(stateObj.attributes.friendly_name);
    return scene.entity.split('.').slice(1).join('.') || 'Scene';
  }

  async _activate(scene, chip) {
    if (!this._hass || !scene?.entity) return;

    const domain = String(scene.entity).split('.')[0];
    let serviceDomain = 'homeassistant';
    let serviceName = 'turn_on';

    if (domain === 'scene') {
      serviceDomain = 'scene';
      serviceName = 'turn_on';
    } else if (domain === 'script') {
      serviceDomain = 'script';
      serviceName = 'turn_on';
    } else if (domain === 'automation') {
      serviceDomain = 'automation';
      serviceName = 'trigger';
    }

    try {
      await this._hass.callService(serviceDomain, serviceName, { entity_id: scene.entity });
    } catch (error) {
      console.error('[tunet-scenes-card] action failed', serviceDomain, serviceName, scene.entity, error);
    }

    this._recentEntity = scene.entity;
    this._recentUntil = Date.now() + 1300;

    chip.classList.add('active');
    setTimeout(() => this._updateStates(), 160);
  }

  _updateStates() {
    if (!this._hass || !this._chipRefs.length) return;

    const now = Date.now();
    for (const ref of this._chipRefs) {
      const { chip, scene } = ref;
      const baseEntity = scene.entity ? this._hass.states[scene.entity] : null;
      const unavailable = !baseEntity || baseEntity.state === 'unavailable';

      chip.disabled = unavailable;
      chip.classList.toggle('is-unavailable', unavailable);

      let active = false;
      if (!unavailable && scene.state_entity) {
        const stateObj = this._hass.states[scene.state_entity];
        if (stateObj) {
          const actual = String(stateObj.state ?? '');
          const expected = String(scene.active_when ?? '');
          if (scene.active_when_operator === 'contains') {
            active = actual.includes(expected);
          } else if (scene.active_when_operator === 'not_equals') {
            active = actual !== expected;
          } else {
            active = actual === expected;
          }
        }
      } else if (!unavailable) {
        active = scene.entity === this._recentEntity && now < this._recentUntil;
      }

      chip.classList.toggle('active', active);
    }
  }
}

registerCard('tunet-scenes-card', TunetScenesCard, {
  name: 'Tunet Scenes Card',
  description: 'Quick scene chips for scene/script/automation entities',
  preview: true,
});

logCardVersion('TUNET-SCENES', CARD_VERSION, '#AF52DE');

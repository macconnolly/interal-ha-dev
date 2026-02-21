/**
 * Tunet Scene Row (composer)
 * Thin flex-row shell over tunet-scene-chip primitives.
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
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_scene_chip.js';

const TAG = 'tunet-scene-row';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}
${REDUCED_MOTION}

:host {
  display: block;
}

.card {
  padding: 12px;
  gap: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.row tunet-scene-chip {
  flex: 1 1 110px;
}
`;

class TunetSceneRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = { scenes: [] };
    this._hass = null;
    this._chips = [];
    this._rendered = false;
    injectFonts();
  }

  static getStubConfig() {
    return { scenes: [] };
  }

  setConfig(config) {
    const scenes = Array.isArray(config?.scenes) ? config.scenes : [];
    this._config = {
      compact: config?.compact !== false,
      scenes: scenes.filter(Boolean).map((scene) => ({
        entity: scene.entity || '',
        label: scene.label || scene.name || '',
        icon: scene.icon || 'movie',
        active_when: scene.active_when || null,
        show_when: scene.show_when || null,
        tap_action: scene.tap_action || null,
        hold_action: scene.hold_action || null,
      })),
    };

    if (this._rendered) {
      this._build();
      this._update();
    }
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    applyDarkClass(this, detectDarkMode(hass));
    this._update();
  }

  getCardSize() {
    return this._config.compact ? 1 : 2;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = CSS;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = `${FONT_LINKS}<div class="wrap"><div class="card"><div class="row" id="row"></div></div></div>`;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._row = this.shadowRoot.getElementById('row');
    this._row.addEventListener('tunet:action', (e) => {
      const action = e.detail?.action;
      const entityId = e.detail?.entity_id || action?.entity_id || '';
      if (!action) return;
      dispatchAction(this._hass, this, action, entityId).catch(() => this._update());
    });

    this._build();
  }

  _build() {
    if (!this._row) return;
    this._row.innerHTML = '';
    this._chips = [];

    for (const scene of this._config.scenes) {
      const chip = document.createElement('tunet-scene-chip');
      chip.setConfig(scene);
      if (this._hass) chip.hass = this._hass;
      this._row.appendChild(chip);
      this._chips.push(chip);
    }
  }

  _update() {
    if (!this._hass) return;
    for (const chip of this._chips) {
      chip.hass = this._hass;
    }
  }
}

registerCard(TAG, TunetSceneRow, {
  name: 'Tunet Scene Row',
  description: 'Thin scene-chip composer row',
  preview: true,
});

logCardVersion('TUNET-SCENE-ROW', VERSION, '#007AFF');

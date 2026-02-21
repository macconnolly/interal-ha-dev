/**
 * Tunet Runtime — Shared Logic Layer
 * ──────────────────────────────────────────────────────────────
 * Action dispatching, show_when evaluation, value formatting,
 * icon normalization, and entity helpers shared across all
 * Tunet primitives and composers.
 *
 * Sits between tunet_base.js (design system) and primitives.
 * ──────────────────────────────────────────────────────────────
 */

import { normalizeIcon, callServiceSafe } from './tunet_base.js';

export const TUNET_RUNTIME_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   ICON NORMALIZATION — Lighting domain aliases
   ═══════════════════════════════════════════════════════════════ */

const LIGHT_ICON_ALIASES = {
  light_group: 'lightbulb',
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  table_lamp: 'lamp',
  floor_lamp: 'lamp',
};

const MDI_TO_MATERIAL = {
  'mdi:ceiling-light': 'light',
  'mdi:lamp': 'lamp',
  'mdi:floor-lamp': 'lamp',
  'mdi:floor-lamp-outline': 'lamp',
  'mdi:desk-lamp': 'desk',
  'mdi:lightbulb': 'lightbulb',
  'mdi:lightbulb-group': 'lightbulb',
  'mdi:led-strip': 'highlight',
  'mdi:light-recessed': 'fluorescent',
  'mdi:wall-sconce': 'wall_lamp',
  'mdi:wall-sconce-round-variant': 'wall_lamp',
  'mdi:chandelier': 'lightbulb',
  'mdi:track-light': 'highlight',
  'mdi:outdoor-lamp': 'deck',
  'mdi:heat-wave': 'highlight',
};

/**
 * Normalize a light icon. Handles mdi: prefix, aliases, and HA entity icons.
 * @param {string} icon - Raw icon string
 * @param {string} [fallback='lightbulb']
 * @returns {string} Valid Material Symbols Rounded ligature
 */
export function normalizeLightIcon(icon, fallback = 'lightbulb') {
  return normalizeIcon(icon, { aliases: LIGHT_ICON_ALIASES, fallback });
}

/**
 * Resolve icon from an HA entity's attributes.icon field (mdi: format).
 * @param {object} entity - HA entity state object
 * @returns {string} Material Symbols ligature
 */
export function resolveEntityIcon(entity) {
  if (!entity || !entity.attributes || !entity.attributes.icon) return 'lightbulb';
  const mdiIcon = entity.attributes.icon;
  if (MDI_TO_MATERIAL[mdiIcon]) return MDI_TO_MATERIAL[mdiIcon];
  return normalizeLightIcon(mdiIcon);
}

/* ═══════════════════════════════════════════════════════════════
   SHOW_WHEN EVALUATOR — Conditional visibility
   ═══════════════════════════════════════════════════════════════ */

/**
 * Evaluate a show_when condition against current HA state.
 * @param {object} hass - HA hass object
 * @param {object|null} condition - { entity, state, operator?, attribute? }
 * @returns {boolean} Whether the condition is met
 */
export function evaluateShowWhen(hass, condition) {
  if (!condition) return true;
  if (!hass) return false;

  const entity = hass.states[condition.entity];
  if (!entity) return false;

  const operator = condition.operator || 'equals';
  const expected = condition.state;
  const sourceValue = condition.attribute
    ? entity.attributes?.[condition.attribute]
    : entity.state;
  const actual = String(sourceValue ?? '');
  const target = String(expected ?? '');

  switch (operator) {
    case 'contains': return actual.includes(target);
    case 'not_contains': return !actual.includes(target);
    case 'not_equals': return actual !== target;
    case 'gt': return Number(actual) > Number(target);
    case 'lt': return Number(actual) < Number(target);
    case 'gte': return Number(actual) >= Number(target);
    case 'lte': return Number(actual) <= Number(target);
    case 'equals':
    default: return actual === target;
  }
}

/* ═══════════════════════════════════════════════════════════════
   ACTION DISPATCHER — Unified action handling
   Event protocol:
     tunet:action         — generic action request
     tunet:value-preview  — optimistic drag/slide preview
     tunet:value-commit   — final committed value
     tunet:request-more-info — info/hold interactions
   ═══════════════════════════════════════════════════════════════ */

/**
 * Normalize an action config into a consistent shape.
 * @param {object|string|null} action - Raw action config
 * @param {string} fallbackEntity - Default entity for more-info
 * @returns {object} Normalized action: { action, entity, ... }
 */
export function normalizeAction(action, fallbackEntity) {
  if (!action) return { action: 'none' };
  if (typeof action === 'string') return { action, entity: fallbackEntity };
  return {
    action: action.action || 'more-info',
    entity: action.entity || fallbackEntity,
    navigation_path: action.navigation_path || null,
    url_path: action.url_path || null,
    new_tab: action.new_tab || false,
    service: action.service || null,
    service_data: action.service_data || null,
    target: action.target || null,
  };
}

/**
 * Dispatch an action from a primitive or composer.
 * Handles: toggle, more-info, navigate, url, call-service, none.
 * @param {object} hass - HA hass object
 * @param {HTMLElement} hostEl - Element dispatching the event
 * @param {object} action - Normalized action config
 * @param {string} fallbackEntity - Default entity ID
 */
export function dispatchAction(hass, hostEl, action, fallbackEntity) {
  if (!action || !hass) return;
  const act = typeof action === 'string' ? { action } : action;
  const type = act.action || 'more-info';
  const entityId = act.entity || fallbackEntity;

  switch (type) {
    case 'none':
      return;

    case 'more-info':
      if (!entityId) return;
      hostEl.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId },
      }));
      return;

    case 'toggle':
      if (!entityId) return;
      callServiceSafe(hass, 'homeassistant', 'toggle', { entity_id: entityId });
      return;

    case 'navigate':
      if (!act.navigation_path) return;
      window.history.pushState(null, '', act.navigation_path);
      window.dispatchEvent(new Event('location-changed'));
      return;

    case 'url':
      if (!act.url_path) return;
      window.open(act.url_path, act.new_tab ? '_blank' : '_self');
      return;

    case 'call-service': {
      const svc = act.service || '';
      const [domain, serviceName] = svc.split('.');
      if (!domain || !serviceName) return;
      const data = { ...(act.service_data || {}) };
      if (act.target && act.target.entity_id) {
        data.entity_id = act.target.entity_id;
      }
      callServiceSafe(hass, domain, serviceName, data);
      return;
    }

    default:
      // Fallback to more-info
      if (entityId) {
        hostEl.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId },
        }));
      }
  }
}

/* ═══════════════════════════════════════════════════════════════
   VALUE FORMATTING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Format a value with optional format and unit.
 * @param {*} value - Raw value
 * @param {string} [format='state'] - 'state', 'integer', 'float1', 'percent'
 * @param {string} [unit=''] - Unit string ('°F', '%', etc.)
 * @returns {string} Formatted display string
 */
export function formatValueWithUnit(value, format = 'state', unit = '') {
  let formatted = String(value ?? '--');

  switch (format) {
    case 'integer':
      formatted = String(Math.round(Number(value)));
      break;
    case 'float1':
      formatted = Number(value).toFixed(1);
      break;
    case 'percent':
      formatted = Math.round(Number(value)) + '%';
      break;
    case 'state':
    default:
      break;
  }

  if (unit) return formatted + unit;
  return formatted;
}

/* ═══════════════════════════════════════════════════════════════
   ENTITY HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Read brightness as 0-100% from a light entity.
 * Returns 0 for off, 100 if on but no brightness attribute.
 */
export function readBrightnessPercent(hass, entityId) {
  if (!hass || !entityId) return 0;
  const entity = hass.states[entityId];
  if (!entity || entity.state !== 'on') return 0;
  const b = entity.attributes.brightness;
  if (b == null) return 100;
  return Math.max(1, Math.min(100, Math.round((Number(b) / 255) * 100)));
}

/**
 * Get the friendly name of an entity, with fallback to formatted entity ID.
 */
export function friendlyName(hass, entityId) {
  if (!hass || !entityId) return '';
  const entity = hass.states[entityId];
  if (entity && entity.attributes && entity.attributes.friendly_name) {
    return entity.attributes.friendly_name;
  }
  const raw = entityId.split('.').pop().replace(/_/g, ' ');
  return raw.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Check if an entity state equals a given value.
 */
export function entityStateEquals(hass, entityId, state) {
  if (!hass || !entityId) return false;
  const entity = hass.states[entityId];
  return entity && String(entity.state) === String(state);
}

/**
 * Check if an entity supports brightness control.
 */
export function supportsBrightness(hass, entityId) {
  if (!hass || !entityId) return false;
  const entity = hass.states[entityId];
  if (!entity || entity.state === 'unavailable') return false;
  if (entity.attributes && entity.attributes.brightness != null) return true;
  const modes = entity.attributes && entity.attributes.supported_color_modes;
  if (!Array.isArray(modes)) return false;
  return !modes.includes('onoff') || modes.length > 1;
}

/**
 * Expand a group entity into its member entity IDs.
 * Returns [entityId] if not a group.
 */
export function expandGroup(hass, entityId) {
  if (!hass || !entityId) return [entityId];
  const entity = hass.states[entityId];
  if (entity && entity.attributes && Array.isArray(entity.attributes.entity_id) &&
      entity.attributes.entity_id.length > 0) {
    return entity.attributes.entity_id;
  }
  return [entityId];
}

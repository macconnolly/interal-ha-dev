/**
 * Tunet Runtime Helpers
 * Shared non-visual logic for tile primitives and card composers.
 * Version 1.0.0
 */

import { fireEvent, clamp } from './tunet_base.js';

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  table_lamp: 'lamp',
  floor_lamp: 'lamp',
  light_group: 'lightbulb',
};

function getEntity(hass, entityId) {
  if (!hass || !entityId) return null;
  return hass.states?.[entityId] || null;
}

function getComparableValue(entity, attribute) {
  if (!entity) return undefined;
  if (attribute) return entity.attributes?.[attribute];
  return entity.state;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function compareValues(left, right, operator) {
  const leftStr = String(left ?? '');
  const rightStr = String(right ?? '');

  switch (operator) {
    case 'not_equals':
      return leftStr !== rightStr;
    case 'contains':
      return leftStr.includes(rightStr);
    case 'not_contains':
      return !leftStr.includes(rightStr);
    case 'gt': {
      const l = toNumber(left);
      const r = toNumber(right);
      return Number.isFinite(l) && Number.isFinite(r) && l > r;
    }
    case 'lt': {
      const l = toNumber(left);
      const r = toNumber(right);
      return Number.isFinite(l) && Number.isFinite(r) && l < r;
    }
    case 'exists':
      return left !== undefined && left !== null;
    case 'not_exists':
      return left === undefined || left === null;
    case 'in': {
      const list = Array.isArray(right) ? right : [right];
      return list.map(v => String(v)).includes(leftStr);
    }
    case 'not_in': {
      const list = Array.isArray(right) ? right : [right];
      return !list.map(v => String(v)).includes(leftStr);
    }
    case 'equals':
    default:
      return leftStr === rightStr;
  }
}

/**
 * Evaluate a show_when condition object.
 * Supports string shorthand: "on" -> equals(defaultEntity, "on").
 */
export function evaluateShowWhen(hass, condition, defaultEntity = '') {
  if (!condition) return true;

  if (typeof condition === 'string') {
    if (!defaultEntity) return true;
    const entity = getEntity(hass, defaultEntity);
    return compareValues(entity?.state, condition, 'equals');
  }

  if (typeof condition !== 'object') return true;

  const entityId = condition.entity || defaultEntity;
  if (!entityId) return true;

  const entity = getEntity(hass, entityId);
  const left = getComparableValue(entity, condition.attribute);
  const operator = condition.operator || 'equals';
  const right = Object.prototype.hasOwnProperty.call(condition, 'state')
    ? condition.state
    : condition.value;

  return compareValues(left, right, operator);
}

/**
 * Normalize Material Symbols ligature string.
 */
export function normalizeTunetIcon(icon, fallback = 'lightbulb') {
  if (!icon) return fallback;
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/i.test(resolved)) return fallback;
  return resolved;
}

/**
 * Format a state value with a lightweight value format contract.
 */
export function formatValueWithUnit(value, format = 'state', unit = '') {
  const raw = value;
  if (raw === null || raw === undefined) return '?';

  let out;
  switch (format) {
    case 'integer': {
      const n = toNumber(raw);
      out = Number.isFinite(n) ? String(Math.round(n)) : String(raw);
      break;
    }
    case 'float1': {
      const n = toNumber(raw);
      out = Number.isFinite(n) ? n.toFixed(1) : String(raw);
      break;
    }
    case 'state':
    default:
      out = String(raw);
      break;
  }

  if (!unit) return out;

  if (unit === '°' || unit === '°F' || unit === '°C') {
    const suffix = unit === '°' ? '' : unit.slice(1);
    return `${out}\u00b0${suffix}`;
  }

  return `${out}${unit}`;
}

/**
 * Return brightness in percentage for a light-like entity.
 */
export function readBrightnessPercent(hass, entityId) {
  const entity = getEntity(hass, entityId);
  if (!entity || entity.state !== 'on') return 0;

  const b = entity.attributes?.brightness;
  if (b == null) return 100;

  const n = toNumber(b);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round((n / 255) * 100), 0, 100);
}

/**
 * Check state equality against one state or an array of states.
 */
export function entityStateEquals(hass, entityId, expected) {
  const entity = getEntity(hass, entityId);
  if (!entity) return false;

  if (Array.isArray(expected)) {
    return expected.map(s => String(s)).includes(String(entity.state));
  }

  return String(entity.state) === String(expected);
}

function cloneObject(value) {
  if (!value || typeof value !== 'object') return {};
  return Array.isArray(value) ? [...value] : { ...value };
}

/**
 * Normalize a tunet action object.
 */
export function normalizeAction(action, fallbackEntity = '') {
  if (!action) return { action: 'none' };

  if (typeof action === 'string') {
    return { action };
  }

  if (typeof action !== 'object') {
    return { action: 'none' };
  }

  const normalized = { ...action };
  normalized.action = normalized.action || 'none';

  if (!normalized.entity && fallbackEntity) normalized.entity = fallbackEntity;

  return normalized;
}

async function callServiceFromAction(hass, action, fallbackEntity = '') {
  const serviceRef = action.service || '';
  const [domain, service] = serviceRef.split('.');
  if (!domain || !service) return;

  const data = cloneObject(action.data || action.service_data);
  const target = cloneObject(action.target);
  const entity = action.entity || fallbackEntity;

  if (target.entity_id && !data.entity_id) {
    data.entity_id = target.entity_id;
  } else if (!target.entity_id && entity && !data.entity_id) {
    data.entity_id = entity;
  }

  return hass.callService(domain, service, data);
}

async function callToggle(hass, action, fallbackEntity = '') {
  const entity = action.entity || fallbackEntity;
  if (!entity) return;
  return hass.callService('homeassistant', 'toggle', { entity_id: entity });
}

/**
 * Execute a normalized action.
 */
export async function dispatchAction(hass, hostEl, actionInput, fallbackEntity = '') {
  const action = normalizeAction(actionInput, fallbackEntity);
  const type = action.action;

  if (type === 'none') return;

  if (type === 'more-info') {
    const entityId = action.entity || fallbackEntity;
    if (!entityId) return;
    fireEvent(hostEl, 'hass-more-info', { entityId });
    fireEvent(hostEl, 'tunet:request-more-info', { entity: entityId, source: 'runtime' });
    return;
  }

  if (type === 'navigate') {
    const path = action.navigation_path || action.path;
    if (!path) return;
    history.pushState(null, '', path);
    fireEvent(window, 'location-changed');
    return;
  }

  if (type === 'url') {
    if (!action.url_path && !action.url) return;
    const url = action.url_path || action.url;
    const target = action.new_tab ? '_blank' : '_self';
    window.open(url, target);
    return;
  }

  if (!hass) return;

  if (type === 'call-service') {
    await callServiceFromAction(hass, action, fallbackEntity);
    return;
  }

  if (type === 'toggle') {
    await callToggle(hass, action, fallbackEntity);
    return;
  }

  // Safe fallback mirrors previous card behavior
  const entityId = action.entity || fallbackEntity;
  if (entityId) {
    fireEvent(hostEl, 'hass-more-info', { entityId });
  }
}

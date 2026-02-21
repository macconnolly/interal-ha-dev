/**
 * Tunet Runtime Helpers
 * Shared behavior helpers for event routing, conditional visibility,
 * formatting, and lightweight entity state reads.
 */

import { fireEvent } from './tunet_base.js';

export function normalizeTunetIcon(icon, fallback = 'info') {
  if (!icon) return fallback;
  const raw = String(icon).replace(/^mdi:/, '').trim();
  if (!raw) return fallback;
  return /^[a-z0-9_]+$/i.test(raw) ? raw : fallback;
}

export function formatValueWithUnit(value, format = 'state', unit = '') {
  if (value === null || value === undefined || value === '') return '?';

  let out = value;
  const num = Number(value);
  const isNum = Number.isFinite(num);

  if (format === 'integer' && isNum) {
    out = Math.round(num);
  } else if (format === 'float1' && isNum) {
    out = num.toFixed(1);
  }

  const text = String(out);
  if (!unit) return text;
  if (unit === 'deg' || unit === 'degree' || unit === 'degrees') return `${text}°`;
  return `${text}${unit}`;
}

function _conditionValue(entity, attribute) {
  if (!entity) return undefined;
  if (attribute) return entity.attributes ? entity.attributes[attribute] : undefined;
  return entity.state;
}

function _stringify(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function _toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function _matchesOperator(actual, expected, operator) {
  const op = operator || 'equals';
  const actualStr = _stringify(actual);
  const expectedStr = _stringify(expected);

  if (op === 'equals') return actualStr === expectedStr;
  if (op === 'not_equals') return actualStr !== expectedStr;
  if (op === 'contains') return actualStr.includes(expectedStr);
  if (op === 'not_contains') return !actualStr.includes(expectedStr);
  if (op === 'in') {
    if (Array.isArray(expected)) return expected.map(_stringify).includes(actualStr);
    return expectedStr.split(',').map(s => s.trim()).filter(Boolean).includes(actualStr);
  }
  if (op === 'not_in') {
    if (Array.isArray(expected)) return !expected.map(_stringify).includes(actualStr);
    return !expectedStr.split(',').map(s => s.trim()).filter(Boolean).includes(actualStr);
  }
  if (op === 'exists') {
    return actual !== null && actual !== undefined && actual !== '';
  }

  const actualNum = _toNumber(actual);
  const expectedNum = _toNumber(expected);
  if (actualNum === null || expectedNum === null) return false;

  if (op === 'gt') return actualNum > expectedNum;
  if (op === 'gte') return actualNum >= expectedNum;
  if (op === 'lt') return actualNum < expectedNum;
  if (op === 'lte') return actualNum <= expectedNum;
  return actualStr === expectedStr;
}

/**
 * Evaluate show_when conditions.
 * Supports:
 * - string shorthand: "on" (uses fallback entity state equals value)
 * - object: {entity, attribute, state|value, operator}
 * - nested logic: {and:[...]}, {or:[...]}
 */
export function evaluateShowWhen(hass, condition, fallbackEntity = '') {
  if (!condition) return true;
  if (!hass || !hass.states) return false;

  if (typeof condition === 'string') {
    if (!fallbackEntity) return false;
    const entity = hass.states[fallbackEntity];
    return _matchesOperator(entity ? entity.state : undefined, condition, 'equals');
  }

  if (Array.isArray(condition)) {
    return condition.every(item => evaluateShowWhen(hass, item, fallbackEntity));
  }

  if (typeof condition !== 'object') return true;

  if (Array.isArray(condition.and)) {
    return condition.and.every(item => evaluateShowWhen(hass, item, fallbackEntity));
  }
  if (Array.isArray(condition.or)) {
    return condition.or.some(item => evaluateShowWhen(hass, item, fallbackEntity));
  }

  const entityId = condition.entity || fallbackEntity;
  if (!entityId) return false;

  const entity = hass.states[entityId];
  const actual = _conditionValue(entity, condition.attribute);

  let expected = condition.state;
  if (expected === undefined) expected = condition.value;
  if (expected === undefined) expected = condition.equals;

  return _matchesOperator(actual, expected, condition.operator || 'equals');
}

export function entityStateEquals(hass, entityId, state) {
  if (!hass || !hass.states || !entityId) return false;
  return _stringify(hass.states[entityId]?.state) === _stringify(state);
}

export function readBrightnessPercent(hass, entityId) {
  if (!hass || !hass.states || !entityId) return 0;
  const entity = hass.states[entityId];
  if (!entity || entity.state !== 'on') return 0;
  const raw = entity.attributes ? entity.attributes.brightness : null;
  if (!Number.isFinite(Number(raw))) return 100;
  return Math.max(0, Math.min(100, Math.round((Number(raw) / 255) * 100)));
}

export function normalizeAction(action, fallbackEntity = '') {
  if (!action) {
    return { action: 'more-info', entity_id: fallbackEntity || '' };
  }

  let normalized;
  if (typeof action === 'string') {
    normalized = { action };
  } else {
    normalized = { ...action };
  }

  const type = normalized.action || 'more-info';
  const entityId =
    normalized.entity_id ||
    normalized.entity ||
    normalized.target?.entity_id ||
    fallbackEntity ||
    '';

  return {
    ...normalized,
    action: type,
    entity_id: entityId,
  };
}

function _callHassService(hass, domain, service, data) {
  if (!hass || typeof hass.callService !== 'function') return Promise.resolve();
  try {
    const maybe = hass.callService(domain, service, data || {});
    if (maybe && typeof maybe.then === 'function') return maybe;
    return Promise.resolve(maybe);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Dispatch standardized Tunet actions.
 */
export function dispatchAction(hass, hostEl, action, fallbackEntity = '') {
  const resolved = normalizeAction(action, fallbackEntity);
  const type = resolved.action;

  if (type === 'none') return Promise.resolve();

  if (type === 'more-info') {
    if (resolved.entity_id) {
      fireEvent(hostEl, 'hass-more-info', { entityId: resolved.entity_id });
    }
    return Promise.resolve();
  }

  if (type === 'navigate') {
    const path = resolved.navigation_path || resolved.path || resolved.url_path || '';
    if (path) {
      window.history.pushState(null, '', path);
      fireEvent(window, 'location-changed');
    }
    return Promise.resolve();
  }

  if (type === 'url') {
    const url = resolved.url || '';
    if (url) {
      const target = resolved.new_tab ? '_blank' : '_self';
      window.open(url, target);
    }
    return Promise.resolve();
  }

  if (type === 'toggle') {
    if (!resolved.entity_id) return Promise.resolve();
    return _callHassService(hass, 'homeassistant', 'toggle', { entity_id: resolved.entity_id });
  }

  if (type === 'call-service') {
    const service = resolved.service || '';
    if (!service || service.indexOf('.') === -1) return Promise.resolve();
    const [domain, svc] = service.split('.');
    const payload = {
      ...(resolved.service_data || resolved.data || {}),
    };

    if (resolved.target && payload.target == null) payload.target = resolved.target;

    if (!payload.entity_id && !payload.target?.entity_id && resolved.entity_id) {
      payload.entity_id = resolved.entity_id;
    }

    return _callHassService(hass, domain, svc, payload);
  }

  // Unknown action type: fallback to more-info for parity with prior cards.
  if (resolved.entity_id) {
    fireEvent(hostEl, 'hass-more-info', { entityId: resolved.entity_id });
  }
  return Promise.resolve();
}

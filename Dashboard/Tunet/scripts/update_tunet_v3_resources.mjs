#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_MANIFEST = 'Dashboard/Tunet/Cards/v3/dist/manifest.json';
const RESOURCE_ROOT = '/local/tunet/v3/';
const DEFAULT_BASE_URL = 'http://10.0.0.21:8123';
const ENTRY_POINTS = [
  'tunet_actions_card.js',
  'tunet_scenes_card.js',
  'tunet_light_tile.js',
  'tunet_lighting_card.js',
  'tunet_rooms_card.js',
  'tunet_climate_card.js',
  'tunet_sensor_card.js',
  'tunet_weather_card.js',
  'tunet_media_card.js',
  'tunet_sonos_card.js',
  'tunet_speaker_grid_card.js',
  'tunet_nav_card.js',
  'tunet_status_card.js',
];

export function readDotEnv(filePath = '.env') {
  const vars = {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
  } catch {
    // .env is optional when env vars are already set
  }
  return vars;
}

function normalizeBaseUrl(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed);
    if (!url.port) {
      url.port = url.protocol === 'https:' ? '443' : '8123';
    }
    url.pathname = '';
    return url.toString().replace(/\/$/, '');
  }
  const host = trimmed.replace(/\/+$/, '');
  return /:\d+$/.test(host) ? `http://${host}` : `http://${host}:8123`;
}

function toWebSocketUrl(baseUrl) {
  return `${baseUrl.replace(/^http/i, 'ws')}/api/websocket`;
}

function parseArgs(argv) {
  const options = {
    manifestPath: DEFAULT_MANIFEST,
    versionToken: '',
    baseUrl: '',
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--manifest') {
      options.manifestPath = argv[i + 1] || '';
      i += 1;
    } else if (arg === '--version') {
      options.versionToken = argv[i + 1] || '';
      i += 1;
    } else if (arg === '--base-url') {
      options.baseUrl = argv[i + 1] || '';
      i += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readManifest(manifestPath) {
  const resolved = path.resolve(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  const files = Array.isArray(manifest.entries)
    ? manifest.entries
        .map((entry) => path.basename(entry.output || entry.source || ''))
        .filter(Boolean)
    : ENTRY_POINTS;

  return {
    manifestPath: resolved,
    versionToken: manifest.versionToken,
    files,
  };
}

function buildDesiredResources(cardFiles, versionToken) {
  return cardFiles.map((fileName) => ({
    fileName,
    expectedUrl: `${RESOURCE_ROOT}${fileName}?v=${versionToken}`,
  }));
}

async function withHomeAssistantSocket({ baseUrl, token }, run) {
  return await new Promise((resolve, reject) => {
    const ws = new WebSocket(toWebSocketUrl(baseUrl));
    let nextId = 1;
    let settled = false;
    const pending = new Map();

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      try {
        ws.close();
      } catch {
        // ignore close failures
      }
      fn(value);
    };

    const call = (type, payload = {}) =>
      new Promise((res, rej) => {
        const id = nextId;
        nextId += 1;
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, type, ...payload }));
      });

    ws.onerror = (event) => {
      finish(reject, event?.message ? new Error(event.message) : new Error('WebSocket error'));
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'auth_required') {
        ws.send(JSON.stringify({ type: 'auth', access_token: token }));
        return;
      }

      if (msg.type === 'auth_invalid') {
        finish(reject, new Error(`Home Assistant auth failed: ${msg.message || 'invalid token'}`));
        return;
      }

      if (msg.type === 'auth_ok') {
        try {
          const value = await run(call);
          finish(resolve, value);
        } catch (error) {
          finish(reject, error);
        }
        return;
      }

      if (typeof msg.id !== 'number') return;
      const pendingCall = pending.get(msg.id);
      if (!pendingCall) return;
      pending.delete(msg.id);
      if (msg.success === false) {
        pendingCall.rej(new Error(msg.error?.message || 'Home Assistant command failed'));
        return;
      }
      pendingCall.res(msg.result);
    };
  });
}

export async function updateTunetV3Resources({
  manifestPath = DEFAULT_MANIFEST,
  versionToken = '',
  baseUrl = '',
  envPath = '.env',
  dryRun = false,
} = {}) {
  const env = { ...readDotEnv(envPath), ...process.env };
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl || env.HA_LOCAL_URL || env.HA_URL || DEFAULT_BASE_URL);
  const token = env.HA_LONG_LIVED_ACCESS_TOKEN || env.HA_TOKEN;

  if (!token) {
    throw new Error('Missing HA_LONG_LIVED_ACCESS_TOKEN or HA_TOKEN for resource sync.');
  }

  let effectiveVersionToken = versionToken;
  let cardFiles = ENTRY_POINTS;

  if (!effectiveVersionToken) {
    const manifest = readManifest(manifestPath);
    effectiveVersionToken = manifest.versionToken;
    cardFiles = manifest.files;
  }

  if (!effectiveVersionToken) {
    throw new Error('No resource version token available.');
  }

  const desiredResources = buildDesiredResources(cardFiles, effectiveVersionToken);
  const results = [];

  await withHomeAssistantSocket({ baseUrl: resolvedBaseUrl, token }, async (call) => {
    const resources = await call('lovelace/resources');
    const byBasePath = new Map();
    for (const resource of resources) {
      const basePath = String(resource.url || '').replace(/\?v=[^&]+$/, '');
      byBasePath.set(basePath, resource);
    }

    for (const desired of desiredResources) {
      const resource = byBasePath.get(`${RESOURCE_ROOT}${desired.fileName}`);
      if (!resource) {
        results.push({ ...desired, status: 'missing' });
        continue;
      }

      if (resource.url === desired.expectedUrl) {
        results.push({ ...desired, status: 'unchanged', id: resource.id });
        continue;
      }

      if (dryRun) {
        results.push({
          ...desired,
          status: 'dry-run',
          id: resource.id,
          previousUrl: resource.url,
        });
        continue;
      }

      const updated = await call('lovelace/resources/update', {
        resource_id: resource.id,
        url: desired.expectedUrl,
        res_type: resource.type || 'module',
      });
      results.push({
        ...desired,
        status: 'updated',
        id: updated.id,
        previousUrl: resource.url,
      });
    }
  });

  return {
    baseUrl: resolvedBaseUrl,
    versionToken: effectiveVersionToken,
    results,
  };
}

function printSummary(summary) {
  console.log(`  Resource sync base: ${summary.baseUrl}`);
  console.log(`  Resource version: ${summary.versionToken}`);
  for (const result of summary.results) {
    if (result.status === 'updated') {
      console.log(`  ✓ ${result.fileName} -> ${result.expectedUrl}`);
    } else if (result.status === 'unchanged') {
      console.log(`  = ${result.fileName} already at ${result.expectedUrl}`);
    } else if (result.status === 'dry-run') {
      console.log(`  ~ ${result.fileName} would update ${result.previousUrl} -> ${result.expectedUrl}`);
    } else {
      console.log(`  ! missing Lovelace resource for ${result.fileName}`);
    }
  }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isCli) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const summary = await updateTunetV3Resources(options);
    printSummary(summary);
  } catch (error) {
    console.error(`Resource sync failed: ${error.message}`);
    process.exit(1);
  }
}

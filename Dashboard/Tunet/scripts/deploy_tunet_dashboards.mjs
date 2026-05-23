#!/usr/bin/env node

/**
 * Tunet dashboard deploy dispatcher.
 *
 * Reads Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs as the single
 * source of truth, then dispatches per-entry:
 *
 *   - mode: 'yaml'    -> sshpass-driven SCP of source YAML to live HA target
 *                       (HA reads it on every dashboard fetch).
 *   - mode: 'storage' -> WebSocket lovelace/config/save into HA's storage
 *                       backend. If the dashboard registration does not
 *                       exist, it is created first via lovelace/dashboards/create.
 *
 * Pre-flight (Item A — best-in-class addition over original plan):
 *   Every targeted source is parsed and validated BEFORE any push. A partial
 *   deploy leaves dashboards out of sync with each other; aborting before
 *   the first push prevents silent divergence. On failure mid-deploy, the
 *   script surfaces "N succeeded; M failed at <url_path>; rerun with
 *   --from <n>" so the operator can resume from the failure point.
 *
 * Credential hardening:
 *   sshpass invoked with `-e` (reads from SSHPASS env var) rather than
 *   `-p '<password>'` argv exposure. WS auth uses HA_LONG_LIVED_ACCESS_TOKEN
 *   read from .env (no argv exposure).
 *
 * Recommended ordering: after a card change, run `tunet:deploy:lab` BEFORE
 * `tunet:deploy:dashboards` so dashboards never reference an undeployed tag.
 *
 * Usage:
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --mode yaml
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --mode storage
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --dashboard tunet-suite
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --from 3
 *   node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --dry-run
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  TUNET_DASHBOARD_REGISTRY,
  TUNET_DASHBOARD_BY_URL_PATH,
} from './tunet_dashboard_registry.mjs';

const DEFAULT_BASE_URL = 'http://10.0.0.21:8123';
const HA_HOST_DEFAULT = '10.0.0.21';
const HA_USER_DEFAULT = 'root';

// ─── .env reader (matches update_tunet_v3_resources.mjs) ────────────────

function readDotEnv(filePath = '.env') {
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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

// ─── CLI ────────────────────────────────────────────────────────────────

function printHelp() {
  process.stdout.write(`Tunet dashboard deploy dispatcher.

Usage:
  node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs [options]

Options:
  --mode <yaml|storage|both>   Restrict to one mode (default: both)
  --dashboard <url_path>       Deploy a single dashboard by url_path
  --from <n>                   Resume from the Nth entry (1-indexed) after
                               a partial failure
  --dry-run                    Pre-flight + plan only; no SCP, no WS push
  --help                       Print this help

Recommended ordering:
  npm run tunet:deploy:lab           # cards first — keeps dashboards from
                                     # referencing undeployed card tags
  npm run tunet:deploy:dashboards    # then dashboards

Environment (read from .env):
  HA_SSH_HOST, HA_SSH_USER, HA_SSH_PASSWORD   (yaml mode SCP)
  HA_LONG_LIVED_ACCESS_TOKEN | HA_TOKEN       (storage mode WS auth)
  HA_LOCAL_URL | HA_URL                       (WS base URL, defaults to
                                               http://10.0.0.21:8123)
`);
}

function parseArgs(argv) {
  const options = {
    mode: 'both',
    dashboard: null,
    fromIndex: 0,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--mode' && next) {
      if (!['yaml', 'storage', 'both'].includes(next)) {
        throw new Error(`Invalid --mode "${next}". Expected yaml|storage|both.`);
      }
      options.mode = next;
      i += 1;
    } else if (arg === '--dashboard' && next) {
      options.dashboard = next;
      i += 1;
    } else if (arg === '--from' && next) {
      const n = parseInt(next, 10);
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`Invalid --from "${next}". Expected positive integer.`);
      }
      options.fromIndex = n - 1;
      i += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

// ─── Selection ──────────────────────────────────────────────────────────

function selectEntries(options) {
  let entries = [...TUNET_DASHBOARD_REGISTRY];

  if (options.dashboard) {
    const single = TUNET_DASHBOARD_BY_URL_PATH[options.dashboard];
    if (!single) {
      const known = TUNET_DASHBOARD_REGISTRY.map((e) => e.url_path).join(', ');
      throw new Error(`Unknown --dashboard "${options.dashboard}". Known: ${known}`);
    }
    entries = [single];
  }

  if (options.mode !== 'both') {
    entries = entries.filter((entry) => entry.mode === options.mode);
  }

  if (options.fromIndex > 0) {
    if (options.fromIndex >= entries.length) {
      throw new Error(
        `--from ${options.fromIndex + 1} exceeds selected entry count (${entries.length}).`
      );
    }
    entries = entries.slice(options.fromIndex);
  }

  if (entries.length === 0) {
    throw new Error('No dashboards matched the current selection.');
  }
  return entries;
}

// ─── Pre-flight ─────────────────────────────────────────────────────────

function preflight(entries) {
  const results = [];
  for (const entry of entries) {
    const result = { entry, ok: false, error: null, parsed: null };
    try {
      if (!fs.existsSync(entry.source)) {
        throw new Error(`Source file does not exist: ${entry.source}`);
      }
      const raw = fs.readFileSync(entry.source, 'utf8');
      const parsed = parseYaml(raw);
      if (parsed === null || typeof parsed !== 'object') {
        throw new Error(`Parsed YAML is not an object (got ${typeof parsed}).`);
      }
      if (!parsed.views && !parsed.title) {
        // Dashboards should have at least a top-level title or views array.
        throw new Error(
          'Parsed YAML lacks both `views:` and `title:` — does not look like a dashboard config.'
        );
      }
      result.ok = true;
      result.parsed = parsed;
    } catch (e) {
      result.error = e.message;
    }
    results.push(result);
  }
  const failed = results.filter((r) => !r.ok);
  return { results, failed };
}

// ─── YAML mode (SCP) ────────────────────────────────────────────────────

function deployYaml(entry, env) {
  const host = env.HA_SSH_HOST || HA_HOST_DEFAULT;
  const user = env.HA_SSH_USER || HA_USER_DEFAULT;
  const password = env.HA_SSH_PASSWORD;
  if (!password) {
    throw new Error(
      'HA_SSH_PASSWORD missing — yaml-mode deploy requires SSH credentials in .env.'
    );
  }
  // sshpass -e reads from SSHPASS env var rather than argv (no password leak).
  const childEnv = { ...process.env, SSHPASS: password };
  execFileSync(
    'sshpass',
    ['-e', 'scp', '-o', 'StrictHostKeyChecking=no', entry.source, `${user}@${host}:${entry.target}`],
    { stdio: 'pipe', env: childEnv }
  );
}

// ─── Storage mode (WS) ──────────────────────────────────────────────────

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
        // ignore
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
        finish(reject, new Error(`HA auth failed: ${msg.message || 'invalid token'}`));
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
        pendingCall.rej(new Error(msg.error?.message || 'HA command failed'));
        return;
      }
      pendingCall.res(msg.result);
    };
  });
}

async function ensureStorageDashboard(call, entry, parsedConfig) {
  // List existing dashboards (yaml + storage). lovelace/dashboards/list is
  // the correct WS command name (lovelace/dashboards returns unknown_command
  // on HA 2026.x — confirmed via direct probe 2026-05-22).
  const dashboards = await call('lovelace/dashboards/list');
  const existing = (dashboards || []).find((d) => d.url_path === entry.url_path);

  if (existing) {
    if (existing.mode !== 'storage') {
      throw new Error(
        `Dashboard url_path "${entry.url_path}" exists with mode "${existing.mode}", not "storage". Refusing to overwrite a yaml-mode dashboard via storage push.`
      );
    }
    return { status: 'exists', dashboard: existing };
  }

  // Pull title/icon from the parsed YAML when present.
  const title = (parsedConfig && parsedConfig.title) || `Tunet ${entry.url_path}`;
  const icon = (parsedConfig && parsedConfig.icon) || 'mdi:view-dashboard';

  await call('lovelace/dashboards/create', {
    url_path: entry.url_path,
    mode: 'storage',
    title,
    icon,
    show_in_sidebar: true,
    require_admin: false,
  });
  return { status: 'created', dashboard: { url_path: entry.url_path, mode: 'storage', title, icon } };
}

async function deployStorageBatch(storageEntries, preflightResults, env, dryRun, log) {
  if (storageEntries.length === 0) return [];

  const baseUrl = normalizeBaseUrl(env.HA_LOCAL_URL || env.HA_URL || DEFAULT_BASE_URL);
  const token = env.HA_LONG_LIVED_ACCESS_TOKEN || env.HA_TOKEN;
  if (!token) {
    throw new Error(
      'HA_LONG_LIVED_ACCESS_TOKEN missing — storage-mode deploy requires a long-lived token in .env.'
    );
  }

  const outcomes = [];
  await withHomeAssistantSocket({ baseUrl, token }, async (call) => {
    for (const entry of storageEntries) {
      const preflightFor = preflightResults.find((r) => r.entry === entry);
      const parsedConfig = preflightFor.parsed;
      try {
        if (dryRun) {
          outcomes.push({ entry, status: 'dry-run', dashboardStatus: 'unknown' });
          log(`  ~ ${entry.url_path} would create+save (dry-run)`);
          continue;
        }
        const ensure = await ensureStorageDashboard(call, entry, parsedConfig);
        await call('lovelace/config/save', {
          url_path: entry.url_path,
          config: parsedConfig,
        });
        outcomes.push({ entry, status: 'pushed', dashboardStatus: ensure.status });
        log(`  ✓ ${entry.url_path} (${ensure.status}) -> config saved`);
      } catch (e) {
        outcomes.push({ entry, status: 'failed', error: e.message });
        log(`  ✗ ${entry.url_path} failed: ${e.message}`);
        throw e; // Stop on first failure so --from can resume cleanly.
      }
    }
  });
  return outcomes;
}

// ─── Driver ─────────────────────────────────────────────────────────────

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const env = { ...readDotEnv('.env'), ...process.env };

  const selected = selectEntries(options);
  const yamlEntries = selected.filter((e) => e.mode === 'yaml');
  const storageEntries = selected.filter((e) => e.mode === 'storage');

  console.log(`Tunet dashboard deploy — ${selected.length} entries selected`);
  console.log(`  mode filter   : ${options.mode}`);
  console.log(`  dashboard     : ${options.dashboard || '(all)'}`);
  console.log(`  from index    : ${options.fromIndex + 1}`);
  console.log(`  dry-run       : ${options.dryRun ? 'yes' : 'no'}`);
  console.log('');

  // Pre-flight ALL targeted entries before any push.
  console.log('Pre-flight (parse + validate all targeted sources)...');
  const { results: preflightResults, failed: preflightFailed } = preflight(selected);
  for (const r of preflightResults) {
    if (r.ok) console.log(`  ✓ ${r.entry.url_path} (${r.entry.mode}) — ${r.entry.source}`);
    else console.log(`  ✗ ${r.entry.url_path} (${r.entry.mode}) — ${r.error}`);
  }
  if (preflightFailed.length > 0) {
    console.error(
      `\nPre-flight blocked: ${preflightFailed.length}/${preflightResults.length} sources failed validation. Nothing was pushed.`
    );
    process.exit(1);
  }
  console.log('Pre-flight clean — all sources parse.');
  console.log('');

  const allOutcomes = [];

  // YAML mode dispatch (SCP).
  if (yamlEntries.length > 0) {
    console.log(`YAML mode: SCP ${yamlEntries.length} dashboard(s)...`);
    for (let i = 0; i < yamlEntries.length; i += 1) {
      const entry = yamlEntries[i];
      try {
        if (options.dryRun) {
          console.log(`  ~ ${entry.url_path} would SCP ${entry.source} -> ${entry.target}`);
          allOutcomes.push({ entry, status: 'dry-run' });
        } else {
          deployYaml(entry, env);
          console.log(`  ✓ ${entry.url_path} -> ${entry.target}`);
          allOutcomes.push({ entry, status: 'pushed' });
        }
      } catch (e) {
        allOutcomes.push({ entry, status: 'failed', error: e.message });
        console.error(`  ✗ ${entry.url_path} failed: ${e.message}`);
        const succeeded = allOutcomes.filter((o) => o.status === 'pushed').length;
        const failedAtIndex = selected.indexOf(entry) + 1;
        console.error(
          `\n${succeeded} succeeded; failed at entry ${failedAtIndex} (${entry.url_path}). Rerun with --from ${failedAtIndex}.`
        );
        process.exit(1);
      }
    }
    console.log('');
  }

  // Storage mode dispatch (WS).
  if (storageEntries.length > 0) {
    console.log(`Storage mode: WS lovelace/config/save for ${storageEntries.length} dashboard(s)...`);
    try {
      const storageOutcomes = await deployStorageBatch(
        storageEntries,
        preflightResults,
        env,
        options.dryRun,
        (msg) => console.log(msg)
      );
      allOutcomes.push(...storageOutcomes);
    } catch (e) {
      const succeeded = allOutcomes.filter((o) => o.status === 'pushed').length;
      const failedOutcome = allOutcomes[allOutcomes.length - 1];
      const failedAtIndex = failedOutcome ? selected.indexOf(failedOutcome.entry) + 1 : selected.length;
      console.error(
        `\n${succeeded} succeeded across yaml+storage; failed at entry ${failedAtIndex}. Rerun with --from ${failedAtIndex}.`
      );
      process.exit(1);
    }
    console.log('');
  }

  const pushed = allOutcomes.filter((o) => o.status === 'pushed').length;
  const dryRun = allOutcomes.filter((o) => o.status === 'dry-run').length;
  console.log(`Deploy complete: ${pushed} pushed, ${dryRun} dry-run, 0 failed.`);
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isCli) {
  main().catch((e) => {
    console.error(`\nDeploy failed: ${e.message}`);
    process.exit(1);
  });
}

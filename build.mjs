#!/usr/bin/env node

/**
 * Tunet V3 Card Build System
 *
 * Bundles each card with its tunet_base.js dependency into a standalone file.
 * Handles the ?v= query string stripping on import paths.
 *
 * Usage:
 *   node build.mjs           # one-shot build
 *   node build.mjs --watch   # watch + rebuild
 *   node build.mjs --deploy  # build + SCP to HA server
 */

import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { updateTunetV3Resources } from './Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs';

// ─── Configuration ──────────────────────────────────────────────────────

const SOURCE_ROOT = 'Dashboard/Tunet/Cards/v3';
const DIST_ROOT = path.join(SOURCE_ROOT, 'dist');
const HA_DEPLOY_TARGET = '/config/www/tunet/v3/';
const HA_HOST_DEFAULT = '10.0.0.21';
const HA_USER_DEFAULT = 'root';
const HA_PASSWORD_DEFAULT = 'password';

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

// ─── Query string stripping plugin ──────────────────────────────────────
// Cards import tunet_base.js?v=20260309g7 — esbuild can't resolve the ?v=
// query string. This plugin strips it so esbuild finds the real file.

const stripQueryPlugin = {
  name: 'strip-query-string',
  setup(build) {
    build.onResolve({ filter: /\?v=/ }, (args) => {
      const cleanPath = args.path.replace(/\?v=[^'"]*$/, '');
      return {
        path: path.resolve(path.dirname(args.importer), cleanPath),
      };
    });
  },
};

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
  } catch {
    // .env is optional for non-deploy operations
  }
  return vars;
}

function buildVersionToken(buildTimeIso) {
  if (process.env.TUNET_RESOURCE_VERSION) return process.env.TUNET_RESOURCE_VERSION;
  const normalized = buildTimeIso
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z$/, 'Z')
    .replace('T', '_');
  return `build_${normalized}`;
}

// ─── Build ──────────────────────────────────────────────────────────────

async function buildAllCards({ watch = false } = {}) {
  const entryPoints = ENTRY_POINTS.map((f) => path.join(SOURCE_ROOT, f));

  const buildOptions = {
    entryPoints,
    bundle: true,
    format: 'esm',
    outdir: DIST_ROOT,
    sourcemap: true,
    plugins: [stripQueryPlugin],
    logLevel: 'info',
  };

  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log(`\n  Watching ${SOURCE_ROOT} for changes...\n`);
    return ctx;
  }

  const result = await esbuild.build(buildOptions);
  return result;
}

// ─── Manifest ───────────────────────────────────────────────────────────

function writeManifest(result) {
  const buildTime = new Date().toISOString();
  const manifest = {
    buildTime,
    versionToken: buildVersionToken(buildTime),
    sourceRoot: SOURCE_ROOT,
    distRoot: DIST_ROOT,
    entries: ENTRY_POINTS.map((name) => ({
      source: path.join(SOURCE_ROOT, name),
      output: path.join(DIST_ROOT, name),
      exists: fs.existsSync(path.join(DIST_ROOT, name)),
    })),
  };

  const manifestPath = path.join(DIST_ROOT, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest written: ${manifestPath}`);
  return manifest;
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateBundleOutputs() {
  let allPassed = true;

  for (const name of ENTRY_POINTS) {
    const filePath = path.join(DIST_ROOT, name);
    if (!fs.existsSync(filePath)) {
      console.error(`  MISSING: ${filePath}`);
      allPassed = false;
      continue;
    }

    try {
      execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
      console.log(`  ✓ ${name}`);
    } catch {
      console.error(`  ✗ ${name} — syntax error`);
      allPassed = false;
    }
  }

  return allPassed;
}

// ─── Deploy ─────────────────────────────────────────────────────────────

async function deployToHA(manifest) {
  const env = readDotEnv('.env');
  const host = env.HA_SSH_HOST || HA_HOST_DEFAULT;
  const user = env.HA_SSH_USER || HA_USER_DEFAULT;
  const password = env.HA_SSH_PASSWORD || HA_PASSWORD_DEFAULT;

  console.log(`\n  Deploying to ${user}@${host}:${HA_DEPLOY_TARGET}...`);

  for (const name of ENTRY_POINTS) {
    const src = path.join(DIST_ROOT, name);
    if (!fs.existsSync(src)) {
      console.error(`  SKIP (missing): ${name}`);
      continue;
    }

    try {
      execSync(
        `sshpass -p '${password}' scp -o StrictHostKeyChecking=no "${src}" ${user}@${host}:${HA_DEPLOY_TARGET}${name}`,
        { stdio: 'pipe' }
      );
      console.log(`  ✓ deployed ${name}`);
    } catch (e) {
      console.error(`  ✗ deploy failed: ${name} — ${e.message}`);
    }
  }

  console.log('  Deploy complete.\n');

  try {
    console.log(`  Syncing Lovelace resources to ?v=${manifest.versionToken}...`);
    const summary = await updateTunetV3Resources({
      manifestPath: path.join(DIST_ROOT, 'manifest.json'),
      versionToken: manifest.versionToken,
      envPath: '.env',
    });
    const updatedCount = summary.results.filter((result) => result.status === 'updated').length;
    const missingCount = summary.results.filter((result) => result.status === 'missing').length;
    console.log(`  Resource sync complete (${updatedCount} updated, ${missingCount} missing).\n`);
  } catch (e) {
    console.error(`  ✗ resource sync failed — ${e.message}`);
    throw e;
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isDeploy = args.includes('--deploy');

fs.mkdirSync(DIST_ROOT, { recursive: true });

try {
  const result = await buildAllCards({ watch: isWatch });

  if (!isWatch) {
    const manifest = writeManifest(result);
    const valid = validateBundleOutputs();

    if (isDeploy && valid) {
      await deployToHA(manifest);
    }

    if (!valid) {
      console.error('\n  Build validation failed.\n');
      process.exit(1);
    }

    console.log(`\n  Build complete: ${ENTRY_POINTS.length} cards → ${DIST_ROOT}/\n`);
  }
} catch (e) {
  console.error('Build failed:', e.message);
  process.exit(1);
}

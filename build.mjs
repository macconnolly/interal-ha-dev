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

// ─── Configuration ──────────────────────────────────────────────────────

const SOURCE_ROOT = 'Dashboard/Tunet/Cards/v3';
const DIST_ROOT = path.join(SOURCE_ROOT, 'dist');
const HA_DEPLOY_TARGET = '/config/www/tunet/v3/';
const HA_HOST = '10.0.0.21';

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
  const manifest = {
    buildTime: new Date().toISOString(),
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

function deployToHA() {
  // Read credentials from .env
  let password = 'password';
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const match = envFile.match(/HA_SSH_PASSWORD=(.+)/);
    if (match) password = match[1].trim();
  } catch { /* use default */ }

  console.log(`\n  Deploying to ${HA_HOST}:${HA_DEPLOY_TARGET}...`);

  for (const name of ENTRY_POINTS) {
    const src = path.join(DIST_ROOT, name);
    if (!fs.existsSync(src)) {
      console.error(`  SKIP (missing): ${name}`);
      continue;
    }

    try {
      execSync(
        `sshpass -p '${password}' scp -o StrictHostKeyChecking=no "${src}" root@${HA_HOST}:${HA_DEPLOY_TARGET}${name}`,
        { stdio: 'pipe' }
      );
      console.log(`  ✓ deployed ${name}`);
    } catch (e) {
      console.error(`  ✗ deploy failed: ${name} — ${e.message}`);
    }
  }

  console.log('  Deploy complete.\n');
}

// ─── CLI ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isDeploy = args.includes('--deploy');

fs.mkdirSync(DIST_ROOT, { recursive: true });

try {
  const result = await buildAllCards({ watch: isWatch });

  if (!isWatch) {
    writeManifest(result);
    const valid = validateBundleOutputs();

    if (isDeploy && valid) {
      deployToHA();
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

#!/usr/bin/env node
/**
 * Tunet v2 Card Bundler
 * ─────────────────────────────────────────────────────────────
 * Inlines tunet_base.js exports into each v2 card, producing
 * standalone .js files that Home Assistant can load directly
 * (no ES module imports needed).
 *
 * Usage:  node bundle.js
 * Output: ../dist/tunet_<card>_card.js  (one per card)
 *
 * What it does:
 *   1. Reads tunet_base.js and extracts all exported symbols
 *   2. For each card file, strips the import block
 *   3. Prepends the base module code (exports → const/function)
 *   4. Wraps in an IIFE to avoid global scope pollution
 *   5. Writes to ../dist/
 */

const fs = require('fs');
const path = require('path');

const V2_DIR = __dirname;
const DIST_DIR = path.join(V2_DIR, '..', 'dist');
const BASE_FILE = path.join(V2_DIR, 'tunet_base.js');

// Cards to bundle
const CARDS = [
  'tunet_actions_card.js',
  'tunet_climate_card.js',
  'tunet_lighting_card.js',
  'tunet_media_card.js',
  'tunet_rooms_card.js',
  'tunet_sensor_card.js',
  'tunet_speaker_grid_card.js',
  'tunet_status_card.js',
  'tunet_weather_card.js',
];

// ── Step 1: Read and transform tunet_base.js ──────────────────

let baseSource = fs.readFileSync(BASE_FILE, 'utf-8');

// Convert `export const X = ...` → `const X = ...`
// Convert `export function X(...)` → `function X(...)`
// Convert `export let X = ...` → `let X = ...`
baseSource = baseSource
  .replace(/^export\s+const\s+/gm, 'const ')
  .replace(/^export\s+function\s+/gm, 'function ')
  .replace(/^export\s+let\s+/gm, 'let ');

// ── Step 2: Create dist directory ─────────────────────────────

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// ── Step 3: Bundle each card ──────────────────────────────────

let successCount = 0;

for (const cardFile of CARDS) {
  const cardPath = path.join(V2_DIR, cardFile);
  if (!fs.existsSync(cardPath)) {
    console.warn(`⚠ Skipping ${cardFile} (not found)`);
    continue;
  }

  let cardSource = fs.readFileSync(cardPath, 'utf-8');

  // Strip the import block: `import { ... } from './tunet_base.js';`
  // This handles both single-line and multi-line import statements
  cardSource = cardSource.replace(
    /import\s*\{[^}]*\}\s*from\s*['"]\.\/tunet_base\.js['"];?\s*\n?/gs,
    ''
  );

  // Build the bundled file
  const timestamp = new Date().toISOString();
  const bundled = [
    `/**`,
    ` * ${cardFile} — Bundled standalone build`,
    ` * Generated: ${timestamp}`,
    ` * Source: v2/${cardFile} + v2/tunet_base.js`,
    ` * This file is auto-generated. Edit v2/ sources, then re-run: node v2/bundle.js`,
    ` */`,
    ``,
    `(function() {`,
    `'use strict';`,
    ``,
    `// ═══════════════════════════════════════════════════════════`,
    `// TUNET BASE MODULE (inlined from tunet_base.js)`,
    `// ═══════════════════════════════════════════════════════════`,
    ``,
    baseSource,
    ``,
    `// ═══════════════════════════════════════════════════════════`,
    `// CARD: ${cardFile}`,
    `// ═══════════════════════════════════════════════════════════`,
    ``,
    cardSource,
    ``,
    `})();`,
  ].join('\n');

  const outPath = path.join(DIST_DIR, cardFile);
  fs.writeFileSync(outPath, bundled, 'utf-8');
  const sizeKB = (Buffer.byteLength(bundled) / 1024).toFixed(1);
  console.log(`✓ ${cardFile} → dist/${cardFile} (${sizeKB} KB)`);
  successCount++;
}

console.log(`\n${successCount}/${CARDS.length} cards bundled to ${DIST_DIR}`);

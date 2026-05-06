#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const primaryRoot = '/home/mac/HA/implementation_10';

function readDotEnv(filePath) {
  const vars = {};
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function resolveEnvPath() {
  const local = path.join(repoRoot, '.env');
  if (fs.existsSync(local)) return local;
  const primary = path.join(primaryRoot, '.env');
  if (fs.existsSync(primary)) return primary;
  throw new Error('No .env found in worktree or primary root');
}

const envPath = resolveEnvPath();
const env = readDotEnv(envPath);
const host = env.HA_SSH_HOST || '10.0.0.21';
const baseUrl = env.HA_URL || `http://${host}:8123`;
const token = env.HA_LONG_LIVED_ACCESS_TOKEN || env.HA_TOKEN;

if (!token) {
  throw new Error('HA_LONG_LIVED_ACCESS_TOKEN or HA_TOKEN is required');
}

const response = await fetch(`${baseUrl}/api/services`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

if (!response.ok) {
  throw new Error(`Failed to fetch /api/services: ${response.status} ${response.statusText}`);
}

const services = await response.json();
const tunetInboxDomain = services.find((entry) => entry.domain === 'tunet_inbox');

if (!tunetInboxDomain) {
  throw new Error('tunet_inbox domain is not registered in Home Assistant');
}

const required = ['post', 'respond', 'resolve', 'fail', 'dismiss', 'list_items'];
const missing = required.filter((serviceName) => !(serviceName in tunetInboxDomain.services));

if (missing.length) {
  throw new Error(`Missing tunet_inbox services: ${missing.join(', ')}`);
}

console.log(`tunet_inbox smoke ok via ${baseUrl}`);

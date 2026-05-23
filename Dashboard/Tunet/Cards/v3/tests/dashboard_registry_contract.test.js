import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import {
  TUNET_DASHBOARD_REGISTRY,
  TUNET_DASHBOARD_SOURCES,
  TUNET_DASHBOARD_YAML_TARGETS,
  TUNET_DASHBOARD_STORAGE_URL_PATHS,
  TUNET_DASHBOARD_ALL_URL_PATHS,
  TUNET_DASHBOARD_PRODUCTION_URL_PATHS,
  TUNET_DASHBOARD_BY_URL_PATH,
} from '../../../scripts/tunet_dashboard_registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../..');

function readRepoFile(repoPath) {
  return fs.readFileSync(path.join(REPO_ROOT, repoPath), 'utf8');
}

const CONFIG_PATH = 'Configuration/configuration.yaml';

describe('Tunet dashboard registry contract', () => {
  it('declares at least one yaml entry and one storage entry', () => {
    const modes = new Set(TUNET_DASHBOARD_REGISTRY.map((e) => e.mode));
    expect(modes.has('yaml'), 'registry should include at least one yaml-mode dashboard').toBe(true);
    expect(modes.has('storage'), 'registry should include at least one storage-mode dashboard').toBe(true);
  });

  it('has unique url_path and unique source per entry', () => {
    const urlPaths = TUNET_DASHBOARD_ALL_URL_PATHS;
    expect(new Set(urlPaths).size).toBe(urlPaths.length);
    const sources = TUNET_DASHBOARD_SOURCES;
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('has a source YAML on disk for every entry that parses cleanly', () => {
    for (const entry of TUNET_DASHBOARD_REGISTRY) {
      const sourceAbs = path.join(REPO_ROOT, entry.source);
      expect(fs.existsSync(sourceAbs), `${entry.url_path}: source ${entry.source} must exist`).toBe(true);
      const raw = fs.readFileSync(sourceAbs, 'utf8');
      let parsed;
      expect(() => {
        parsed = parseYaml(raw);
      }, `${entry.url_path}: source YAML must parse`).not.toThrow();
      expect(parsed, `${entry.url_path}: parsed YAML should be a non-null object`).toBeTruthy();
      expect(typeof parsed).toBe('object');
      // Dashboards declare at least a title OR views; otherwise the file
      // isn't a usable dashboard config.
      expect(
        parsed.title || parsed.views,
        `${entry.url_path}: source must declare title or views`
      ).toBeTruthy();
    }
  });

  it('yaml-mode entries declare target paths under /config/dashboards/', () => {
    const yamlEntries = TUNET_DASHBOARD_REGISTRY.filter((e) => e.mode === 'yaml');
    for (const entry of yamlEntries) {
      expect(entry.target, `${entry.url_path}: yaml-mode entry must declare target`).toBeTruthy();
      expect(
        entry.target.startsWith('/config/dashboards/'),
        `${entry.url_path}: target ${entry.target} should start with /config/dashboards/`
      ).toBe(true);
    }
    // Cross-check derived export matches.
    const derivedTargets = yamlEntries.map((e) => e.target);
    expect([...TUNET_DASHBOARD_YAML_TARGETS]).toEqual(derivedTargets);
  });

  it('storage-mode entries declare url_path (no target needed)', () => {
    const storageEntries = TUNET_DASHBOARD_REGISTRY.filter((e) => e.mode === 'storage');
    for (const entry of storageEntries) {
      expect(entry.url_path, `${entry.url_path}: storage entry must have url_path`).toBeTruthy();
      expect(entry.target, `${entry.url_path}: storage entry must NOT have target`).toBeFalsy();
    }
    const derivedStorage = storageEntries.map((e) => e.url_path);
    expect([...TUNET_DASHBOARD_STORAGE_URL_PATHS]).toEqual(derivedStorage);
  });

  it('TUNET_DASHBOARD_BY_URL_PATH maps every entry', () => {
    for (const entry of TUNET_DASHBOARD_REGISTRY) {
      expect(TUNET_DASHBOARD_BY_URL_PATH[entry.url_path]).toBe(entry);
    }
  });

  it('production flag identifies at least one user-facing dashboard', () => {
    expect(TUNET_DASHBOARD_PRODUCTION_URL_PATHS.length).toBeGreaterThan(0);
    for (const urlPath of TUNET_DASHBOARD_PRODUCTION_URL_PATHS) {
      const entry = TUNET_DASHBOARD_BY_URL_PATH[urlPath];
      expect(entry.production).toBe(true);
    }
  });

  it('every yaml-mode url_path is registered in live HA configuration.yaml', () => {
    // Item B beyond plan: read Configuration/configuration.yaml from the
    // repo and assert that every yaml-mode dashboard's url_path appears
    // in the HA dashboards: block. If the config file is absent, we emit
    // a VISIBLE warning rather than silently passing — making absence a
    // noticeable signal in CI output, not a hidden gap.
    const configAbs = path.join(REPO_ROOT, CONFIG_PATH);
    if (!fs.existsSync(configAbs)) {
      console.warn(
        `\n[dashboard_registry_contract] WARNING: ${CONFIG_PATH} not in repo. ` +
          `Skipping live-HA registration check. ` +
          `If HA's configuration.yaml is intentionally outside the repo, ` +
          `document the alternative source-of-truth in tunet_build_and_deploy.md.\n`
      );
      return;
    }
    const raw = readRepoFile(CONFIG_PATH);
    // Use a YAML parse rather than a regex so registration is checked
    // structurally, not by string match.
    const parsed = parseYaml(raw);
    const registeredPaths = new Set();
    const lovelaceBlock = parsed?.lovelace;
    if (lovelaceBlock && typeof lovelaceBlock.dashboards === 'object' && lovelaceBlock.dashboards !== null) {
      for (const urlPath of Object.keys(lovelaceBlock.dashboards)) {
        registeredPaths.add(urlPath);
      }
    }
    const yamlEntries = TUNET_DASHBOARD_REGISTRY.filter((e) => e.mode === 'yaml');
    const missing = [];
    for (const entry of yamlEntries) {
      if (!registeredPaths.has(entry.url_path)) missing.push(entry.url_path);
    }
    expect(
      missing,
      `yaml-mode entries not registered in ${CONFIG_PATH}: ${missing.join(', ')}\n` +
        `Either register them in configuration.yaml or remove from the registry.`
    ).toEqual([]);
  });

  it('storage-mode entries are NOT in configuration.yaml dashboards block', () => {
    // Storage-mode dashboards live in HA's storage backend, not in
    // configuration.yaml. If a storage entry's url_path also appears in
    // configuration.yaml, that means a yaml-mode registration shadows it
    // and the deploy dispatcher will refuse to overwrite — fail loudly here.
    const configAbs = path.join(REPO_ROOT, CONFIG_PATH);
    if (!fs.existsSync(configAbs)) return;
    const parsed = parseYaml(readRepoFile(CONFIG_PATH));
    const registeredPaths = new Set(Object.keys(parsed?.lovelace?.dashboards || {}));
    const storageEntries = TUNET_DASHBOARD_REGISTRY.filter((e) => e.mode === 'storage');
    const conflicts = storageEntries.filter((e) => registeredPaths.has(e.url_path)).map((e) => e.url_path);
    expect(
      conflicts,
      `storage-mode entries shadow yaml-mode registrations in ${CONFIG_PATH}: ${conflicts.join(', ')}\n` +
        `Storage-mode dashboards live in HA storage; remove the yaml-mode entry from configuration.yaml.`
    ).toEqual([]);
  });

  it('exposes the same data to shell consumers', () => {
    // CLI surface contract: the modes consumed by shell scripts.
    const json = execFileSync(
      process.execPath,
      ['Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs', '--json'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    );
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(TUNET_DASHBOARD_REGISTRY.length);

    const yamlTargetsCli = execFileSync(
      process.execPath,
      ['Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs', '--yaml-targets'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
      .trim()
      .split('\n');
    expect(yamlTargetsCli).toEqual([...TUNET_DASHBOARD_YAML_TARGETS]);

    const storagePathsCli = execFileSync(
      process.execPath,
      ['Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs', '--storage-url-paths'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
      .trim()
      .split('\n');
    expect(storagePathsCli).toEqual([...TUNET_DASHBOARD_STORAGE_URL_PATHS]);

    const productionPathsCli = execFileSync(
      process.execPath,
      ['Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs', '--production-url-paths'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
      .trim()
      .split('\n');
    expect(productionPathsCli).toEqual([...TUNET_DASHBOARD_PRODUCTION_URL_PATHS]);
  });

  it('is imported by deploy dispatcher and visual review (drift guard)', () => {
    // If a future change removes the registry import from either consumer,
    // the failure mode reappears: changes drift between the registry and
    // its consumers and dashboards stop deploying or get captured against
    // the wrong target. This test catches that drift at test time.
    const consumers = [
      'Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs',
      'Dashboard/Tunet/scripts/tunet_playwright_review.mjs',
    ];
    for (const consumerPath of consumers) {
      const consumerSrc = readRepoFile(consumerPath);
      expect(
        consumerSrc,
        `${consumerPath} must import tunet_dashboard_registry.mjs`
      ).toContain('tunet_dashboard_registry.mjs');
    }
  });
});

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  TUNET_CARD_FILES,
  TUNET_CARD_REGISTRY,
  TUNET_CARD_SOURCE_PATHS,
  TUNET_CARD_SOURCE_ROOT,
  TUNET_CARD_TAGS,
} from '../../../scripts/tunet_card_registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../..');

function readRepoFile(repoPath) {
  return fs.readFileSync(path.join(REPO_ROOT, repoPath), 'utf8');
}

describe('Tunet card registry contract', () => {
  it('is the complete 15-card v3 release inventory', () => {
    expect(TUNET_CARD_FILES).toHaveLength(15);
    expect(TUNET_CARD_FILES).toContain('tunet_inbox_card.js');
    expect(TUNET_CARD_FILES).toContain('tunet_alarm_card.js');
    expect(TUNET_CARD_TAGS).toContain('tunet-inbox-card');
    expect(TUNET_CARD_TAGS).toContain('tunet-alarm-card');
  });

  it('has one source file and one custom element tag for every registry entry', () => {
    expect(new Set(TUNET_CARD_FILES).size).toBe(TUNET_CARD_FILES.length);
    expect(new Set(TUNET_CARD_TAGS).size).toBe(TUNET_CARD_TAGS.length);

    for (const entry of TUNET_CARD_REGISTRY) {
      const sourcePath = path.join(REPO_ROOT, TUNET_CARD_SOURCE_ROOT, entry.file);
      expect(fs.existsSync(sourcePath), `${entry.file} should exist`).toBe(true);
      expect(TUNET_CARD_SOURCE_PATHS[entry.tag]).toBe(`${TUNET_CARD_SOURCE_ROOT}/${entry.file}`);
      expect(readRepoFile(TUNET_CARD_SOURCE_PATHS[entry.tag])).toContain(entry.tag);
    }
  });

  it('exposes the same file list to shell deploy helpers', () => {
    const output = execFileSync(
      process.execPath,
      ['Dashboard/Tunet/scripts/tunet_card_registry.mjs', '--files'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
      .trim()
      .split('\n');

    expect(output).toEqual([...TUNET_CARD_FILES]);
  });

  it('is imported by build, resource sync, deploy, and review tooling', () => {
    const registryImportConsumers = [
      'build.mjs',
      'Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs',
      'Dashboard/Tunet/scripts/tunet_playwright_review.mjs',
    ];

    for (const repoPath of registryImportConsumers) {
      expect(readRepoFile(repoPath), `${repoPath} should consume the shared registry`).toContain(
        'tunet_card_registry.mjs'
      );
    }

    expect(readRepoFile('Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh')).toContain(
      'tunet_card_registry.mjs" --files'
    );
  });
});

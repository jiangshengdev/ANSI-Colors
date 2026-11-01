import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadTheme } from '../src/theme-loader';

test('YAML merge does not change the loaded theme prototype', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ansi-theme-'));
  const path = join(directory, 'theme.yaml');
  try {
    writeFileSync(path, 'base: &base\n  __proto__:\n    polluted: true\n<<: *base\nbackground: "#ffffff"\n');
    const theme = loadTheme(path);
    assert.equal(Object.getPrototypeOf(theme), Object.prototype);
    assert.equal((theme as unknown as Record<string, unknown>).polluted, undefined);
    assert.equal(theme.background, '#ffffff');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import plugin from '../plugin.js';

const RULES_DIRECTORY = path.join(import.meta.dirname, '..', 'rules');

describe('plugin', () => {
  it('should name the plugin opendatacapture, so its rule ids are opendatacapture/<rule>', () => {
    expect(plugin.meta?.name).toBe('opendatacapture');
  });

  it('should register the rule each rules/ file exports under that file name', async () => {
    const files = fs
      .readdirSync(RULES_DIRECTORY)
      .filter((file) => file.endsWith('.js'))
      .toSorted();
    const rules = await Promise.all(
      files.map(async (file) => {
        const ruleModule: { [name: string]: unknown } = await import(path.join(RULES_DIRECTORY, file));
        return [path.basename(file, '.js'), ...Object.values(ruleModule)];
      })
    );
    expect(Object.entries(plugin.rules)).toStrictEqual(rules);
  });
});

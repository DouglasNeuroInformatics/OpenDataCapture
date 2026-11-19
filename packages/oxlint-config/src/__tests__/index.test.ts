import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import { config, playwrightRecommendedRules } from '../index.js';
import plugin from '../plugin.js';

const CUSTOM_RULE_PREFIX = 'opendatacapture/';

describe('config', () => {
  it('should name every JS plugin by the absolute path of a file, so oxlint loads it from any working directory', () => {
    const specifiers = config.jsPlugins?.map((entry) => (typeof entry === 'string' ? entry : entry.specifier));
    expect(specifiers).toHaveLength(3);
    expect(specifiers?.every((specifier) => path.isAbsolute(specifier) && fs.existsSync(specifier))).toBe(true);
  });

  it('should enable only custom rules that the plugin defines, so a renamed rule cannot be silently dropped', () => {
    const enabledRules = config.overrides?.flatMap((override) => Object.keys(override.rules ?? {})) ?? [];
    const customRules = enabledRules
      .filter((rule) => rule.startsWith(CUSTOM_RULE_PREFIX))
      .map((rule) => rule.slice(CUSTOM_RULE_PREFIX.length));
    expect(customRules.length).toBeGreaterThan(0);
    expect(customRules.filter((rule) => !(rule in plugin.rules))).toStrictEqual([]);
  });
});

describe('playwrightRecommendedRules', () => {
  it('should make every rule the plugin enables an error, so a violation fails lint', () => {
    const severities = new Set(Object.values(playwrightRecommendedRules));
    expect([...severities].toSorted()).toStrictEqual(['error', 'off']);
  });

  it('should leave off a rule the plugin turns off', () => {
    expect(playwrightRecommendedRules['no-empty-pattern']).toBe('off');
  });
});

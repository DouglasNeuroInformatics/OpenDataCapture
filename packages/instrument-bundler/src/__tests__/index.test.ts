import * as fs from 'node:fs';
import * as path from 'node:path';

import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { InstrumentBundler } from '../index.js';

describe('InstrumentBundler', () => {
  const bundler = new InstrumentBundler();
  const outdir = path.join(import.meta.dirname, '__TEST__');

  beforeAll(async () => {
    await fs.promises.mkdir(outdir);
  });

  afterAll(async () => {
    await fs.promises.rm(outdir, { force: true, recursive: true });
  });

  describe('generateBundle', () => {
    it('should successfully transpile the click task', async () => {
      await expect(bundler.generateBundle({ source: interactiveInstrument.source })).resolves.toBeTypeOf('string');
    });
    it('should successfully transpile the happiness questionnaire', async () => {
      await expect(bundler.generateBundle({ source: unilingualFormInstrument.source })).resolves.toBeTypeOf('string');
    });
    it('should fail to transpile syntactically invalid code', async () => {
      const source = unilingualFormInstrument.source + 'INVALID SYNTAX!!';
      await expect(bundler.generateBundle({ source })).rejects.toThrow();
    });
    it('should reject source including a static import', async () => {
      const source = ["import _ from 'lodash';", unilingualFormInstrument.source].join('\n');
      await expect(bundler.generateBundle({ source })).rejects.toThrow();
    });
    it('should reject source including a named export', async () => {
      const source = [unilingualFormInstrument.source, 'export const __foo__ = 5'].join('\n');
      await expect(bundler.generateBundle({ source })).rejects.toThrow();
    });
    it('should reject source including multiple default exports', async () => {
      const source = [unilingualFormInstrument.source, 'export default __foo__ = 5'].join('\n');
      await expect(bundler.generateBundle({ source })).rejects.toThrow();
    });
  });
});

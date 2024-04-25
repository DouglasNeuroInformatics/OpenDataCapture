import * as path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { InstrumentBundler } from '../index.js';
import { loadDirectory } from '../node.js';

const inputs = {
  form: await loadDirectory(path.resolve(import.meta.dirname, 'repositories/form'))
};

describe('InstrumentBundler', () => {
  let instrumentBundler: InstrumentBundler;

  beforeAll(() => {
    instrumentBundler = new InstrumentBundler();
  });

  describe('bundle', () => {
    it('should throw an error if the file contains relative dynamic imports', async () => {
      await expect(() =>
        instrumentBundler.bundle({
          inputs: [
            { content: 'const { foo } = await import("./foo.js");', name: 'index.js' },
            { content: 'export const foo = 5;', name: 'foo.js' }
          ]
        })
      ).rejects.toThrowError("Invalid dynamic import './foo.js': must start with '/'");
    });
    it('should include valid dynamic imports', async () => {
      const bundle = await instrumentBundler.bundle({ inputs: inputs.form });
      expect(bundle).toMatch('import("/runtime/v1/zod.js")');
    });
    // it('should generate a bundle that can be executed', async () => {
    //   const bundle = await instrumentBundler.bundle({ inputs: inputs.form });
    //   expect((0, eval)(bundle)).toBeTruthy();
    // });
  });
});

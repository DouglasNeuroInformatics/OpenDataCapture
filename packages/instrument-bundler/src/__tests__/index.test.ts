import * as path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { InstrumentBundler } from '../index.js';
import { loadDirectory } from '../node.js';

const inputs = {
  form: await loadDirectory(path.resolve(import.meta.dirname, 'repositories/form')),
  interactive: await loadDirectory(path.resolve(import.meta.dirname, 'repositories/interactive'))
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
      expect(bundle).toMatch('import("/runtime/v1/zod@3.23.6/index.js")');
    });
    it('should bundle css', async () => {
      await expect(instrumentBundler.bundle({ inputs: inputs.interactive })).resolves.toBeTypeOf('string');
    });
    it('should throw an error if the file contains non-side-effect css import ', async () => {
      await expect(() =>
        instrumentBundler.bundle({
          inputs: [
            {
              content: 'import styles from "./styles.css"; var __exports = null; export default null;',
              name: 'index.js'
            },
            { content: '', name: 'styles.css' }
          ]
        })
      ).rejects.toThrowError("Invalid dynamic import './foo.js': must start with '/'");
    });

    // it('should generate a bundle that can be executed', async () => {
    //   const bundle = await instrumentBundler.bundle({ inputs: inputs.form });
    //   expect((0, eval)(bundle)).toBeTruthy();
    // });
  });
});

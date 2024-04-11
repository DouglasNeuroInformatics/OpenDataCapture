import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentTransformer } from '../browser.js';

describe('InstrumentTransformer', () => {
  let transformer: InstrumentTransformer;

  beforeEach(() => {
    transformer = new InstrumentTransformer();
  });

  describe('generateBundle', () => {
    it('should successfully transpile the click task', async () => {
      await expect(transformer.generateBundle(interactiveInstrument.source)).resolves.toBeTypeOf('string');
    });
    it('should successfully transpile the happiness questionnaire', async () => {
      await expect(transformer.generateBundle(unilingualFormInstrument.source)).resolves.toBeTypeOf('string');
    });
    it('should fail to transpile syntactically invalid code', async () => {
      const source = unilingualFormInstrument.source + 'INVALID SYNTAX!!';
      await expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a static import', async () => {
      const source = ["import _ from 'lodash';", unilingualFormInstrument.source].join('\n');
      await expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a named export', async () => {
      const source = [unilingualFormInstrument.source, 'export const __foo__ = 5'].join('\n');
      await expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including multiple default exports', async () => {
      const source = [unilingualFormInstrument.source, 'export default __foo__ = 5'].join('\n');
      await expect(transformer.generateBundle(source)).rejects.toThrow();
    });
  });

  describe('transformRuntimeImports', () => {
    it('should transform imports', async () => {
      const input = 'import("/runtime/v1/react.js");\n';
      const output = 'import("./runtime/v1/react.js");\n';
      await expect(transformer.transformRuntimeImports(input)).resolves.toBe(output);
    });
  });
});

import { describe, expect, it } from 'vitest';

import { bundle, createBundle } from '../bundle.js';
import { repositories } from './repositories/index.js';

describe('createBundle', () => {
  it('should wrap the build output in an IIFE that returns __exports, with no injected head when there is no css or legacy script', async () => {
    const code = await createBundle({ js: 'const __exports = { kind: "FORM" };' }, { minify: false });
    expect(code).not.toContain('__injectHead');
    await expect((0, eval)(code)).resolves.toEqual({ kind: 'FORM' });
  });

  it('should inject the encoded style when the build produced css', async () => {
    const code = await createBundle(
      { css: 'body { color: red; }', js: 'const __exports = { content: {} };' },
      { minify: false }
    );
    const result = await (0, eval)(code);
    expect(result.content.__injectHead.style).toBeTypeOf('string');
    expect(result.content.__injectHead.scripts).toBeUndefined();
  });

  it('should inject the encoded legacy scripts when the build produced any', async () => {
    const code = await createBundle(
      { js: 'const __exports = { content: {} };', legacyScripts: ['console.log(1)'] },
      { minify: false }
    );
    const result = await (0, eval)(code);
    expect(result.content.__injectHead.scripts).toHaveLength(1);
    expect(result.content.__injectHead.style).toBeUndefined();
  });

  it('should minify the output when minify is true', async () => {
    const verbose = 'const __exports = { kind: "FORM", padding: 1 + 1 };';
    const minified = await createBundle({ js: verbose }, { minify: true });
    const unminified = await createBundle({ js: verbose }, { minify: false });
    expect(minified.length).toBeLessThan(unminified.length);
  });
});

// The produced bundle rewrites every import into a call to `globalThis.__import`, which invokes a
// real dynamic `import()` — unsupported by indirect `eval` in this test environment (Node throws
// `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`), so `bundle()`'s output is asserted on as a string here
// rather than executed; `InstrumentInterpreter`, which runs a bundle for real, is covered under
// `packages/instrument-interpreter`.
describe('bundle', () => {
  it('should preprocess, build and wrap a form source into an executable-shaped IIFE', async () => {
    const code = await bundle({ inputs: repositories.get('form')! });
    expect(code).toContain('FORM_INSTRUMENT_STUB');
    expect(code.trimStart().startsWith('(async()=>{')).toBe(true);
  });

  it('should inject the built css when bundling an interactive source', async () => {
    const code = await bundle({ inputs: repositories.get('interactive')! });
    expect(code).toContain('__injectHead');
  });
});

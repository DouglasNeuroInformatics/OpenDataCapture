import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';

import { InstrumentInterpreter } from '../index.js';

/** A bundle is an async IIFE that resolves to the instrument, with the imports of its source rewritten */
function createBundle({ imports, kind }: { imports: string[]; kind: InstrumentKind }) {
  return `(async () => {
    globalThis.__import = async () => ({});
    ${imports.map((specifier) => `await __import("${specifier}");`).join('\n')}
    return { kind: "${kind}" };
  })()`;
}

describe('interpret', () => {
  const interpreter = new InstrumentInterpreter();

  it('should reject a form that imports react, so that upgrading the react of an application cannot break a stored instrument', async () => {
    const bundle = createBundle({ imports: ['/runtime/v1/react@19.x/index.js'], kind: 'FORM' });
    await expect(interpreter.interpret(bundle)).rejects.toThrow(/only to interactive instruments/);
  });

  it('should name the offending module when it rejects, since an author reads the message rather than the bundle', async () => {
    const bundle = createBundle({ imports: ['/runtime/v1/react-dom@19.x/client.js'], kind: 'SERIES' });
    await expect(interpreter.interpret(bundle)).rejects.toThrow("Cannot import '/runtime/v1/react-dom@19.x/client.js'");
  });

  it('should accept a form that imports the jsx runtime, which is what the JSX of a block compiles to', async () => {
    const bundle = createBundle({ imports: ['/runtime/v1/react@19.x/jsx-runtime.js'], kind: 'FORM' });
    await expect(interpreter.interpret(bundle)).resolves.toMatchObject({ kind: 'FORM' });
  });

  it('should accept an interactive instrument that imports react, since it renders in a document of its own', async () => {
    const bundle = createBundle({ imports: ['/runtime/v1/react@19.x/index.js'], kind: 'INTERACTIVE' });
    await expect(interpreter.interpret(bundle)).resolves.toMatchObject({ kind: 'INTERACTIVE' });
  });
});

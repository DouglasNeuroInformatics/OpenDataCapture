import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { describe, expect, it, vi } from 'vitest';

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

  it('should assign the given id to the interpreted instrument', async () => {
    const bundle = createBundle({ imports: [], kind: 'FORM' });
    await expect(interpreter.interpret(bundle, { id: 'instrument-1' })).resolves.toMatchObject({
      id: 'instrument-1'
    });
  });

  describe('validate', () => {
    it.each(['FORM', 'INTERACTIVE', 'SERIES', undefined] as const)(
      "should reject a bundle that fails the schema for kind '%s'",
      async (kind) => {
        const bundle = createBundle({ imports: [], kind: 'FORM' });
        await expect(interpreter.interpret(bundle, { kind, validate: true })).rejects.toThrow(
          'Failed to evaluate instrument bundle'
        );
      }
    );

    it('should reject with an unexpected-kind error when kind is not one this class validates', async () => {
      const bundle = createBundle({ imports: [], kind: 'FILE' });
      await expect(interpreter.interpret(bundle, { kind: 'FILE', validate: true })).rejects.toThrow(
        'Failed to evaluate instrument bundle'
      );
    });

    it('should not log the evaluated value when the bundle throws before producing one', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(interpreter.interpret("(() => { throw new Error('boom'); })()")).rejects.toThrow(
        'Failed to evaluate instrument bundle'
      );
      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});

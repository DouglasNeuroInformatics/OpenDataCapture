import { describe, expect, it } from 'vitest';

import { findReactImport } from '../imports.js';

/** The specifiers the bundler emits, copied from a built bundle */
const REACT = '/runtime/v1/react@19.x/index.js';
const REACT_DOM_CLIENT = '/runtime/v1/react-dom@19.x/client.js';
const JSX_RUNTIME = '/runtime/v1/react@19.x/jsx-runtime.js';

function createImport(specifier: string) {
  return `await __import("${specifier}");`;
}

describe('findReactImport', () => {
  it('should find an import of react, which the bundler resolves to the index of the package', () => {
    expect(findReactImport(createImport(REACT))).toBe(REACT);
  });

  it('should find an import of any subpath of react-dom, since mounting a root belongs to an interactive instrument', () => {
    expect(findReactImport(createImport(REACT_DOM_CLIENT))).toBe(REACT_DOM_CLIENT);
  });

  it('should find an import of react served under another major version', () => {
    expect(findReactImport(createImport('/runtime/v1/react@18.x/index.js'))).toBe('/runtime/v1/react@18.x/index.js');
  });

  it('should ignore the jsx runtime, which is what the JSX of a form block compiles to', () => {
    expect(findReactImport(createImport(JSX_RUNTIME))).toBeNull();
  });

  it('should ignore a runtime module belonging to another package', () => {
    expect(findReactImport(createImport('/runtime/v1/zod@3.x/index.js'))).toBeNull();
  });

  it('should look past the jsx runtime, which a bundle importing react emits alongside it', () => {
    expect(findReactImport([createImport(JSX_RUNTIME), createImport(REACT)].join('\n'))).toBe(REACT);
  });
});

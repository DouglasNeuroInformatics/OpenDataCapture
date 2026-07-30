import * as path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

declare global {
  // eslint-disable-next-line no-var
  var __ODC_HOST_REACT: undefined | { [key: string]: unknown; version: string };
}

/**
 * The served copy of react is a different module instance than the one a host application bundles,
 * so a hook called through it inside that application's tree reaches a null dispatcher. These are
 * the terms on which `vendor/react@19.x/src/index.js` hands over to the host instead, and on which
 * `vendor/react-dom@19.x/src/client.js` refuses to mount a root of its own. Both read the built
 * output rather than the source, because the `__ODC_RUNTIME_BUILD__` define that tells the served
 * copy apart from the bundled one exists only after `runtime-bundler` has run.
 */

const REACT = path.resolve(import.meta.dirname, '../dist/react@19.x/index.js');
const REACT_DOM_CLIENT = path.resolve(import.meta.dirname, '../dist/react-dom@19.x/client.js');

const HOST_VERSION = '19.99.0';

function hostReact(version: string) {
  return { useState: () => [null, () => {}], version };
}

afterEach(() => {
  delete globalThis.__ODC_HOST_REACT;
  vi.resetModules();
});

describe('react', () => {
  it('should re-export the React registered by the host application, so a form block shares its dispatcher', async () => {
    const host = hostReact(HOST_VERSION);
    globalThis.__ODC_HOST_REACT = host;
    const react = await import(REACT);
    expect(react.useState).toBe(host.useState);
  });

  it('should keep its own React when nothing is registered, as in the iframe of an interactive instrument', async () => {
    const react = await import(REACT);
    expect(typeof react.useState).toBe('function');
    expect(react.version).not.toBe(HOST_VERSION);
  });

  it('should reject a host React of another major version rather than silently mixing the two', async () => {
    globalThis.__ODC_HOST_REACT = hostReact('20.0.0');
    await expect(import(REACT)).rejects.toThrow(/uses React 20\.0\.0, which is incompatible/);
  });
});

describe('react-dom/client', () => {
  it('should refuse to mount a root while a host application owns the React tree', async () => {
    globalThis.__ODC_HOST_REACT = hostReact(HOST_VERSION);
    const { createRoot } = await import(REACT_DOM_CLIENT);
    expect(() => createRoot(null)).toThrow(/react-dom can only be used in an interactive instrument/);
  });

  it('should leave the mount to react-dom when nothing is registered, as in the iframe of an interactive instrument', async () => {
    const { createRoot } = await import(REACT_DOM_CLIENT);
    expect(() => createRoot(null)).not.toThrow(/interactive instrument/);
  });
});

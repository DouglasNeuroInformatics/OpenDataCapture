import type { OnLoadArgs, OnResolveArgs, PluginBuild } from 'esbuild';
import { describe, expect, it } from 'vitest';

import { plugin } from '../plugin.js';

import type { BundlerInput } from '../schemas.js';

/** Captures the callbacks a plugin registers, so a test can invoke them directly with crafted args. */
function setupPlugin(inputs: BundlerInput[]) {
  const onResolveCallbacks: ((args: OnResolveArgs) => unknown)[] = [];
  const onLoadCallbacks: ((args: OnLoadArgs) => unknown)[] = [];
  let onEndCallback: ((result: any) => unknown) | undefined;
  const fakeBuild = {
    onEnd: (cb: (result: any) => unknown) => {
      onEndCallback = cb;
    },
    onLoad: (_filter: unknown, cb: (args: OnLoadArgs) => unknown) => onLoadCallbacks.push(cb),
    onResolve: (_filter: unknown, cb: (args: OnResolveArgs) => unknown) => onResolveCallbacks.push(cb)
  } as unknown as PluginBuild;
  void plugin({ inputs }).setup(fakeBuild);
  return { onEndCallback: onEndCallback!, onLoadCallbacks, onResolveCallbacks };
}

describe('plugin — onResolve', () => {
  const { onResolveCallbacks } = setupPlugin([]);
  const resolve = onResolveCallbacks[0]!;

  it('should mark a css @import statement as external', () => {
    expect(resolve({ kind: 'import-rule', path: 'normalize.css' } as OnResolveArgs)).toEqual({
      external: true,
      path: 'normalize.css'
    });
  });

  it('should mark an http dynamic import as external', () => {
    expect(resolve({ kind: 'dynamic-import', path: 'https://example.org/module.js' } as OnResolveArgs)).toEqual({
      external: true
    });
  });

  it('should error on a non-http dynamic import', () => {
    expect(resolve({ kind: 'dynamic-import', path: './local.js' } as OnResolveArgs)).toMatchObject({
      errors: [{ text: expect.stringContaining('must be http import') }]
    });
  });

  it('should route a runtime css import to the bundle namespace unresolved', () => {
    expect(
      resolve({ kind: 'import-statement', path: '/runtime/v1/normalize.css@8.x/normalize.css' } as OnResolveArgs)
    ).toEqual({
      namespace: 'bundle',
      path: '/runtime/v1/normalize.css@8.x/normalize.css'
    });
  });

  it('should mark a bare runtime package as external, appending index.js', () => {
    expect(resolve({ kind: 'import-statement', path: '/runtime/v1/react@19.x' } as OnResolveArgs)).toEqual({
      external: true,
      path: '/runtime/v1/react@19.x/index.js'
    });
  });

  it('should mark a scoped bare runtime package as external, appending index.js', () => {
    expect(
      resolve({ kind: 'import-statement', path: '/runtime/v1/@opendatacapture/runtime-core' } as OnResolveArgs)
    ).toEqual({ external: true, path: '/runtime/v1/@opendatacapture/runtime-core/index.js' });
  });

  it('should mark a runtime subpath already ending in .js as external unchanged', () => {
    expect(
      resolve({ kind: 'import-statement', path: '/runtime/v1/react@19.x/jsx-runtime.js' } as OnResolveArgs)
    ).toEqual({ external: true, path: '/runtime/v1/react@19.x/jsx-runtime.js' });
  });

  it('should mark a runtime subpath with no extension as external, appending .js', () => {
    expect(resolve({ kind: 'import-statement', path: '/runtime/v1/react@19.x/jsx-runtime' } as OnResolveArgs)).toEqual({
      external: true,
      path: '/runtime/v1/react@19.x/jsx-runtime.js'
    });
  });

  it('should route anything else to the bundle namespace unresolved', () => {
    expect(resolve({ kind: 'import-statement', path: './sibling.ts' } as OnResolveArgs)).toEqual({
      namespace: 'bundle',
      path: './sibling.ts'
    });
  });
});

describe('plugin — onLoad ?raw', () => {
  const inputs: BundlerInput[] = [{ content: 'raw content', name: 'data.txt' }];
  const { onLoadCallbacks } = setupPlugin(inputs);
  const loadRaw = onLoadCallbacks[0]!;

  it('should load a resolved ?raw input as text', () => {
    expect(loadRaw({ path: './data.txt?raw' } as OnLoadArgs)).toEqual({ contents: 'raw content', loader: 'text' });
  });

  it('should error when a ?raw input cannot be resolved', () => {
    expect(loadRaw({ path: './missing.txt?raw' } as OnLoadArgs)).toMatchObject({
      errors: [{ text: expect.stringContaining("Failed to resolve './missing.txt?raw'") }]
    });
  });
});

describe('plugin — onLoad ?legacy', () => {
  const inputs: BundlerInput[] = [{ content: 'console.log(1);', name: 'legacy.js' }];
  const { onEndCallback, onLoadCallbacks } = setupPlugin(inputs);
  const loadLegacy = onLoadCallbacks[1]!;

  it('should load a resolved ?legacy input as an empty module and record its source', () => {
    expect(loadLegacy({ path: './legacy.js?legacy' } as OnLoadArgs)).toEqual({
      contents: 'console.log(1);',
      loader: 'empty'
    });
  });

  it('should error when a ?legacy input cannot be resolved', () => {
    expect(loadLegacy({ path: './missing.js?legacy' } as OnLoadArgs)).toMatchObject({
      errors: [{ text: expect.stringContaining("Failed to resolve './missing.js?legacy'") }]
    });
  });

  it('should attach the recorded legacy scripts to the build result on end, skipping inputs with none', () => {
    const result: any = { metafile: { inputs: { 'bundle:./legacy.js?legacy': {}, 'bundle:other.js': {} } } };
    onEndCallback(result);
    expect(result.legacyScripts).toEqual(['console.log(1);']);
  });
});

describe('plugin — onLoad runtime css', () => {
  const { onLoadCallbacks } = setupPlugin([]);
  const loadRuntimeCss = onLoadCallbacks[2]!;

  it('should inline a runtime css import as an @import statement', () => {
    expect(loadRuntimeCss({ path: '/runtime/v1/normalize.css@8.x/normalize.css' } as OnLoadArgs)).toEqual({
      contents: '@import "/runtime/v1/normalize.css@8.x/normalize.css";',
      loader: 'css'
    });
  });
});

describe('plugin — onLoad default', () => {
  const inputs: BundlerInput[] = [
    { content: 'export default {};', name: 'index.ts' },
    { content: 'body { color: red; }', name: 'styles.css' }
  ];
  const { onLoadCallbacks } = setupPlugin(inputs);
  const loadDefault = onLoadCallbacks[3]!;

  it('should prefix a js/jsx/ts/tsx input with the error-context assignment', () => {
    expect(loadDefault({ path: './index.ts' } as OnLoadArgs)).toEqual({
      contents: 'globalThis.__ODC_BUNDLER_ERROR_CONTEXT = "index.ts";\nexport default {};',
      loader: 'ts'
    });
  });

  it('should load a non-script input unprefixed, with its inferred loader', () => {
    expect(loadDefault({ path: './styles.css' } as OnLoadArgs)).toEqual({
      contents: 'body { color: red; }',
      loader: 'css'
    });
  });

  it('should error when the default loader cannot resolve the input', () => {
    expect(loadDefault({ path: './missing.ts' } as OnLoadArgs)).toMatchObject({
      errors: [{ text: expect.stringContaining("Failed to resolve './missing.ts'") }]
    });
  });
});

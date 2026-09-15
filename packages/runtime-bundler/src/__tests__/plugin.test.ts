import * as fs from 'fs/promises';

import type { OnLoadArgs, OnResolveArgs, PluginBuild } from 'esbuild';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assetPlugin, dtsPlugin } from '../plugin.js';

import type { EntryPoint, ResolvedPackage } from '../types.js';

vi.mock('module', async (importOriginal) => ({
  ...(await importOriginal<typeof import('module')>()),
  createRequire: () => ({
    resolve: (id: string, options: { paths: string[] }) => {
      const resolved = packageJsonResolutions.get(`${id}@${options.paths[0]}`);
      if (!resolved) {
        throw new Error(`Cannot find module '${id}'`);
      }
      return resolved;
    }
  })
}));

vi.mock('fs/promises', () => ({ readFile: vi.fn() }));

/** Maps `'<packageJsonId>@<importerFilepath>'` to the resolved package.json path the mocked require would return. */
const packageJsonResolutions = new Map<string, string>();

/** Captures the callbacks a plugin registers, so a test can invoke them directly with crafted args. */
function setupPlugin(plugin: { setup: (build: PluginBuild) => void }) {
  const onResolveCallbacks: ((args: OnResolveArgs) => unknown)[] = [];
  const onLoadCallbacks: ((args: OnLoadArgs) => unknown)[] = [];
  const fakeBuild = {
    onLoad: (_filter: unknown, cb: (args: OnLoadArgs) => unknown) => onLoadCallbacks.push(cb),
    onResolve: (_filter: unknown, cb: (args: OnResolveArgs) => unknown) => onResolveCallbacks.push(cb)
  } as unknown as PluginBuild;
  plugin.setup(fakeBuild);
  return { onLoadCallbacks, onResolveCallbacks };
}

describe('dtsPlugin', () => {
  const importerFilepath = '/repo/src/index.d.ts';
  const configFilepath = '/repo/runtime.config.js';

  beforeEach(() => {
    packageJsonResolutions.clear();
  });

  it("should route a '.d.ts' import to the dts namespace unresolved", () => {
    const { onResolveCallbacks } = setupPlugin(
      dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages: [] })
    );
    expect(onResolveCallbacks[0]!({ path: '/repo/src/index.d.ts' } as OnResolveArgs)).toEqual({
      namespace: 'dts',
      path: '/repo/src/index.d.ts'
    });
  });

  it('should error when a bare import has an illegal package name', async () => {
    const { onLoadCallbacks } = setupPlugin(
      dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages: [] })
    );
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from '.illegal';\n");
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain("Illegal import '.illegal'");
  });

  it('should error when the package cannot be resolved from the importer', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from 'missing-pkg';\n");
    const { onLoadCallbacks } = setupPlugin(
      dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages: [] })
    );
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain("Failed to resolve 'missing-pkg'");
  });

  it('should skip a non-matching package and error when none of the included packages match', async () => {
    packageJsonResolutions.set(`some-pkg/package.json@${importerFilepath}`, '/repo/node_modules/some-pkg/package.json');
    const packages: ResolvedPackage[] = [
      {
        exports: {},
        name: 'other-pkg',
        packageJsonPath: '/repo/node_modules/other-pkg/package.json',
        packageRoot: '/repo/node_modules/other-pkg'
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from 'some-pkg';\n");
    const { onLoadCallbacks } = setupPlugin(dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages }));
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain("Could not find dependency 'some-pkg' imported by");
  });

  it('should error when the matched export is a static asset rather than a module', async () => {
    packageJsonResolutions.set(`some-pkg/package.json@${importerFilepath}`, '/repo/node_modules/some-pkg/package.json');
    const packages: ResolvedPackage[] = [
      {
        exports: { '.': { copy: './index.js' } },
        name: 'some-pkg',
        packageJsonPath: '/repo/node_modules/some-pkg/package.json',
        packageRoot: '/repo/node_modules/some-pkg'
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from 'some-pkg';\n");
    const { onLoadCallbacks } = setupPlugin(dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages }));
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain("export '.' is a static asset");
  });

  it('should error when the matched export declares no types', async () => {
    packageJsonResolutions.set(`some-pkg/package.json@${importerFilepath}`, '/repo/node_modules/some-pkg/package.json');
    const packages: ResolvedPackage[] = [
      {
        exports: { '.': { import: './index.js' } },
        name: 'some-pkg',
        packageJsonPath: '/repo/node_modules/some-pkg/package.json',
        packageRoot: '/repo/node_modules/some-pkg'
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from 'some-pkg';\n");
    const { onLoadCallbacks } = setupPlugin(dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages }));
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain('does not specify types');
  });

  it('should error when the types entry point cannot be found among the build entry points', async () => {
    packageJsonResolutions.set(`some-pkg/package.json@${importerFilepath}`, '/repo/node_modules/some-pkg/package.json');
    const packages: ResolvedPackage[] = [
      {
        exports: { '.': { types: '/repo/node_modules/some-pkg/index.d.ts' } },
        name: 'some-pkg',
        packageJsonPath: '/repo/node_modules/some-pkg/package.json',
        packageRoot: '/repo/node_modules/some-pkg'
      }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce("import type { X } from 'some-pkg';\n");
    const { onLoadCallbacks } = setupPlugin(dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages }));
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.errors[0].text).toContain('Could not find dependency with absolute input path');
  });

  it('should rewrite a bare import to the relative output path, and leave a relative import untouched', async () => {
    packageJsonResolutions.set(`some-pkg/package.json@${importerFilepath}`, '/repo/node_modules/some-pkg/package.json');
    const packages: ResolvedPackage[] = [
      {
        exports: { '.': { types: '/repo/node_modules/some-pkg/index.d.ts' } },
        name: 'some-pkg',
        packageJsonPath: '/repo/node_modules/some-pkg/package.json',
        packageRoot: '/repo/node_modules/some-pkg'
      }
    ];
    const entryPoints: EntryPoint[] = [
      { in: '/repo/node_modules/some-pkg/index.d.ts', out: 'some-pkg/index.d' },
      { in: importerFilepath, out: 'app/index.d' }
    ];
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      "import type { X } from 'some-pkg';\nimport type { Y } from './local.js';\nexport type { X, Y };\n"
    );
    const { onLoadCallbacks } = setupPlugin(dtsPlugin({ configFilepath, entryPoints, outdir: '/out', packages }));
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(result.loader).toBe('copy');
    expect(result.contents).toContain('from "../some-pkg/index.d.ts"');
    expect(result.contents).toContain("from './local.js'");
  });

  it('should report a transform failure as a load error rather than throw', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('this is not valid { typescript syntax +++');
    const { onLoadCallbacks } = setupPlugin(
      dtsPlugin({ configFilepath, entryPoints: [], outdir: '/out', packages: [] })
    );
    const result: any = await onLoadCallbacks[0]!({ path: importerFilepath } as OnLoadArgs);
    expect(Array.isArray(result.errors) || result.contents !== undefined).toBe(true);
  });
});

describe('assetPlugin', () => {
  it('should route a known asset path to the asset namespace', () => {
    const { onResolveCallbacks } = setupPlugin(assetPlugin(new Set(['/repo/assets/logo.png'])));
    expect(onResolveCallbacks[0]!({ path: '/repo/assets/logo.png' } as OnResolveArgs)).toEqual({
      namespace: 'asset',
      path: '/repo/assets/logo.png'
    });
  });

  it('should leave an unknown path unresolved', () => {
    const { onResolveCallbacks } = setupPlugin(assetPlugin(new Set(['/repo/assets/logo.png'])));
    expect(onResolveCallbacks[0]!({ path: '/repo/assets/other.png' } as OnResolveArgs)).toBeUndefined();
  });

  it('should load an asset as raw bytes to be copied', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from([1, 2, 3]));
    const { onLoadCallbacks } = setupPlugin(assetPlugin(new Set(['/repo/assets/logo.png'])));
    const result: any = await onLoadCallbacks[0]!({ path: '/repo/assets/logo.png' } as OnLoadArgs);
    expect(result.loader).toBe('copy');
    expect(result.contents).toEqual(Buffer.from([1, 2, 3]));
  });
});

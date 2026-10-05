import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import esbuild from 'esbuild';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import { Bundler } from '../bundler.js';
import * as resolverModule from '../resolver.js';

import type { BundlerOptions, ResolvedPackage } from '../types.js';

const BUNDLER_OPTIONS: BundlerOptions = {
  configFilepath: '/root/package.json',
  include: ['jquery__1.0.0'],
  mode: 'production',
  outdir: 'dist'
};

const RESOLVED_PACKAGE: ResolvedPackage = {
  exports: {
    '.': {
      import: './dist/index.js',
      types: './dist/index.d.ts'
    }
  },
  name: 'jquery',
  packageJsonPath: '/root/node_modules/jquery/package.json',
  packageRoot: '/root/node_modules/jquery'
};

vi.mock('esbuild', () => ({
  default: {
    build: vi.fn()
  }
}));

describe('Bundler', () => {
  let bundler: Bundler;
  let resolver: { resolve: MockedFunction<resolverModule.Resolver['resolve']> };

  beforeAll(() => {
    resolver = { resolve: vi.fn() };
    vi.spyOn(resolverModule, 'Resolver').mockImplementationOnce(function () {
      Object.setPrototypeOf(this, resolver);
    });
    vi.spyOn(fs, 'rmdir').mockImplementation(vi.fn());
    bundler = new Bundler(BUNDLER_OPTIONS);
  });

  describe('bundle', () => {
    it('should throw the error thrown by the resolver', async () => {
      const error = { name: 'ResolverError' };
      resolver.resolve.mockRejectedValueOnce(error);
      await expect(bundler.bundle()).rejects.toMatchObject(error);
    });
    it('should resolve if there are no errors', async () => {
      resolver.resolve.mockResolvedValueOnce({ ...RESOLVED_PACKAGE });
      await expect(bundler.bundle()).resolves.toBe(undefined);
    });
  });

  describe('entry points', () => {
    it('should build module, declaration and asset entry points named after the versioned package, skipping package.json', async () => {
      vi.spyOn(resolverModule, 'Resolver').mockImplementationOnce(function () {
        Object.setPrototypeOf(this, resolver);
      });
      resolver.resolve.mockResolvedValueOnce({
        ...RESOLVED_PACKAGE,
        exports: {
          '.': { import: '/pkg/index.js', types: '/pkg/index.d.ts' },
          './legacy': { default: '/pkg/legacy.js' },
          './package.json': { default: '/pkg/package.json' },
          './style.css': { copy: '/pkg/style.css' }
        },
        name: 'jquery__1.0.0'
      });
      const outdir = path.join(os.tmpdir(), 'runtime-bundler-entry-points');
      await new Bundler({ ...BUNDLER_OPTIONS, outdir }).bundle();
      expect(vi.mocked(esbuild.build).mock.lastCall![0].entryPoints).toEqual([
        { in: '/pkg/index.js', out: 'jquery@1.0.0/index' },
        { in: '/pkg/index.d.ts', out: 'jquery@1.0.0/index.d' },
        { in: '/pkg/legacy.js', out: 'jquery@1.0.0/legacy' },
        { in: '/pkg/style.css', out: 'jquery@1.0.0/style' }
      ]);
    });
  });

  describe('verbose logging', () => {
    const createBundler = (verbose: boolean) => {
      vi.spyOn(resolverModule, 'Resolver').mockImplementationOnce(function () {
        Object.setPrototypeOf(this, resolver);
      });
      resolver.resolve.mockResolvedValueOnce({ ...RESOLVED_PACKAGE });
      return new Bundler({ ...BUNDLER_OPTIONS, outdir: path.join(os.tmpdir(), 'runtime-bundler-verbose'), verbose });
    };

    it('should log the resolved packages when verbose is enabled, so a misconfigured include can be diagnosed', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      await createBundler(true).bundle();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Found packages:'));
      logSpy.mockRestore();
    });

    it('should not log anything when verbose is disabled', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      await createBundler(false).bundle();
      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });
});

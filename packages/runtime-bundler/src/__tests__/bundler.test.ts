import fs from 'fs/promises';

import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import { Bundler } from '../bundler.js';
import * as resolverModule from '../resolver.js';

import type { BundlerOptions, ResolvedPackage } from '../types.js';

const BUNDLER_OPTIONS: BundlerOptions = {
  configFilepath: '/root/package.json',
  include: ['jquery__1.0.0'],
  minify: true,
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
    vi.spyOn(resolverModule, 'Resolver').mockImplementationOnce(
      () => resolver satisfies Pick<resolverModule.Resolver, 'resolve'> as any
    );
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
});

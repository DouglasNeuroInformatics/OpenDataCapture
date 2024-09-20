import fs from 'fs/promises';
import path from 'path';

import { deepFreeze, range } from '@douglasneuroinformatics/libjs';
import { afterEach, beforeEach, describe, expect, it, type Mock, type MockInstance } from 'vitest';
import { vi } from 'vitest';

import { runtime } from '../index.js';
import * as resolve from '../resolve.js';

import type { RuntimeVersionInfo } from '../index.d.ts';

const runtimeVersionInfoStub: RuntimeVersionInfo = deepFreeze(
  {
    baseDir: '',
    importPaths: [],
    manifest: {
      declarations: [],
      sources: [],
      styles: []
    },
    version: ''
  },
  {
    readonlyType: false
  }
);

describe('runtime', () => {
  let resolvePackages: MockInstance<() => Promise<RuntimeVersionInfo[]>>;

  beforeEach(() => {
    resolvePackages = vi.spyOn(resolve, 'resolvePackages').mockResolvedValue([runtimeVersionInfoStub]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false if disabled', () => {
    expect(runtime({ disabled: true })).toBe(false);
  });

  it('should return an object by default', () => {
    expect(runtime()).not.toBeNull();
    expect(runtime()).toBeTypeOf('object');
  });

  describe('buildStart', () => {
    it('should invoke fs.cp and fs.writeFile for each item returned by resolvePackages', async () => {
      vi.spyOn(fs, 'cp').mockImplementation(vi.fn());
      vi.spyOn(fs, 'writeFile').mockImplementation(vi.fn());
      resolvePackages.mockResolvedValueOnce(range(3).map(() => structuredClone(runtimeVersionInfoStub)));
      const plugin: any = runtime();
      await plugin.buildStart();
      expect(fs.cp).toHaveBeenCalledTimes(3);
      expect(fs.writeFile).toHaveBeenCalledTimes(3);
    });
    it('should invoke path.resolve from the packageRoot, if produced', async () => {
      vi.spyOn(fs, 'cp').mockImplementation(vi.fn());
      vi.spyOn(fs, 'writeFile').mockImplementation(vi.fn());
      vi.spyOn(path, 'resolve');
      resolvePackages.mockResolvedValueOnce(
        range(3).map(() => ({ ...structuredClone(runtimeVersionInfoStub), version: 'v0' }))
      );
      const plugin: any = runtime({ packageRoot: '/home/dev/test' });
      await plugin.buildStart();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(path.resolve).toHaveBeenCalledWith('/home/dev/test', 'dist/runtime/v0');
    });
  });
  describe('config', () => {
    it('should exclude the import paths resolved', async () => {
      resolvePackages.mockResolvedValueOnce([
        { ...structuredClone(runtimeVersionInfoStub), importPaths: ['/path1', '/path2'] },
        { ...structuredClone(runtimeVersionInfoStub), importPaths: ['/path3', '/path4'] }
      ]);
      const plugin: any = runtime();
      await expect(plugin.config()).resolves.toMatchObject({
        optimizeDeps: {
          exclude: ['/path1', '/path2', '/path3', '/path4']
        }
      });
    });
  });
  describe('configureServer', () => {
    let server: { middlewares: { use: Mock } };

    beforeEach(() => {
      server = { middlewares: { use: vi.fn() } };
    });

    it('should call the server.middlewares.use method', () => {
      const plugin: any = runtime();
      plugin.configureServer(server);
      expect(server.middlewares.use).toHaveBeenCalledOnce();
      const [route, handler] = server.middlewares.use.mock.lastCall!;
      expect(route).toBeTypeOf('string');
      expect(handler).toBeTypeOf('function');
    });
  });
});

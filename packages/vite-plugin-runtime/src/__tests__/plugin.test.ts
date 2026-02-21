import * as path from 'path';

import { MANIFEST_FILENAME } from '@opendatacapture/runtime-meta';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { plugin } from '../plugin';

const MOCK_RUNTIME_BASE_DIR = '/mock/runtime-v1/dist';

const moduleMock = vi.hoisted(() => ({
  createRequire: vi.fn().mockReturnValue({
    resolve: vi.fn().mockReturnValue('/mock/runtime-v1/package.json')
  })
}));

vi.mock('module', () => moduleMock);

const fs = vi.hoisted(() => ({
  existsSync: vi.fn().mockReturnValue(true),
  lstatSync: vi.fn().mockImplementation((filepath: string) => ({
    isDirectory: () => !filepath.split('/').at(-1)!.includes('.')
  })),
  promises: {
    cp: vi.fn(),
    readdir: vi.fn().mockImplementation((filepath: string) => {
      if (filepath === MOCK_RUNTIME_BASE_DIR) {
        return ['@opendatacapture'];
      } else if (filepath.endsWith('@opendatacapture')) {
        return ['runtime-core'];
      } else if (filepath.endsWith('runtime-core')) {
        return ['index.js', 'index.d.ts', 'styles'];
      } else if (filepath.endsWith('styles')) {
        return ['index.css'];
      }
      throw new Error(`Unexpected filepath for test mock: ${filepath}`);
    }),
    readFile: vi.fn(),
    writeFile: vi.fn()
  }
}));

vi.mock('fs', () => fs);

describe('plugin', () => {
  let result: any;

  beforeAll(async () => {
    result = await plugin({ rootDir: process.cwd() });
  });

  it('should return false if disabled', async () => {
    await expect(plugin({ disabled: true, rootDir: process.cwd() })).resolves.toBe(false);
  });

  describe('buildStart', () => {
    it('should copy the runtime dist and the manifest to the output dir', async () => {
      await result.buildStart();
      const destination = path.join(process.cwd(), 'dist/runtime/v1');
      expect(fs.promises.cp).toHaveBeenCalledOnce();
      expect(fs.promises.cp).toHaveBeenLastCalledWith(MOCK_RUNTIME_BASE_DIR, destination, {
        recursive: true
      });
      expect(fs.promises.writeFile).toHaveBeenCalledOnce();
      expect(fs.promises.writeFile).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), 'utf-8');
      const manifest = JSON.parse(fs.promises.writeFile.mock.lastCall![1] as string);
      expect(manifest).toStrictEqual({
        declarations: ['@opendatacapture/runtime-core/index.d.ts'],
        html: [],
        sources: ['@opendatacapture/runtime-core/index.js'],
        styles: ['@opendatacapture/runtime-core/styles/index.css']
      });
    });
  });

  describe('config', () => {
    it('should exclude the runtime import paths for optimizeDeps', () => {
      const config = result.config();
      expect(config).toMatchObject({
        optimizeDeps: {
          exclude: expect.any(Array)
        }
      });
      expect(config.optimizeDeps.exclude.every((s: any) => typeof s === 'string' && s.startsWith('/runtime')));
    });
  });

  describe('configureServer', () => {
    let middleware: any;

    const res = {
      end: vi.fn(),
      writeHead: vi.fn()
    };

    const next = vi.fn();

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should configure a middleware function for /runtime', () => {
      const server = {
        middlewares: {
          use: vi.fn()
        }
      };
      result.configureServer(server);
      expect(server.middlewares.use).toHaveBeenCalledWith('/runtime', expect.any(Function));
      middleware = server.middlewares.use.mock.lastCall![1];
    });

    it('should invoke next if the request url is null', async () => {
      await middleware({ url: null } as any, {} as any, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should invoke next if the request is for an unknown version', async () => {
      await middleware({ url: `/v0/${MANIFEST_FILENAME}` } as any, {} as any, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should correctly handle the manifest', async () => {
      await middleware({ url: `/v1/${MANIFEST_FILENAME}` } as any, res, next);
      expect(res.writeHead).toHaveBeenLastCalledWith(200, { 'Content-Type': 'application/json' });
      expect(res.end).toHaveBeenCalledOnce();
    });

    it('should correctly handle declaration files', async () => {
      await middleware({ url: '/v1/@opendatacapture/runtime-core/index.d.ts' } as any, res, next);
      expect(res.writeHead).toHaveBeenLastCalledWith(200, { 'Content-Type': 'text/plain' });
      expect(res.end).toHaveBeenCalledOnce();
    });

    it('should correctly handle source files', async () => {
      await middleware({ url: '/v1/@opendatacapture/runtime-core/index.js' } as any, res, next);
      expect(res.writeHead).toHaveBeenLastCalledWith(200, { 'Content-Type': 'text/javascript' });
      expect(res.end).toHaveBeenCalledOnce();
    });

    it('should correctly handle css files', async () => {
      await middleware({ url: '/v1/@opendatacapture/runtime-core/styles/index.css' } as any, res, next);
      expect(res.writeHead).toHaveBeenLastCalledWith(200, { 'Content-Type': 'text/css' });
      expect(res.end).toHaveBeenCalledOnce();
    });

    it('should invoke next for unknown files', async () => {
      await middleware({ url: '/v1/@opendatacapture/runtime-core/foo/index.js' } as any, {} as any, next);
      expect(next).toHaveBeenCalledOnce();
      expect(res.end).not.toHaveBeenCalled();
    });
  });
});

// @ts-nocheck

import fs from 'fs';
import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RUNTIME_DIR, RUNTIME_DIST_DIRNAME, resolvePackages, resolveVersion } from './index.js';

describe('resolveVersion', () => {
  beforeEach(() => {
    vi.spyOn(fs.promises, 'readdir').mockResolvedValueOnce(['index.js', 'index.d.ts']);
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'lstat').mockImplementation((filepath) => {
      return Promise.resolve({ isDirectory: () => !path.extname(filepath) });
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should throw if the resolved baseDir does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    expect(() => resolveVersion('v0')).rejects.toThrow('Not a directory');
  });
  it('should throw if the resolved baseDir is not a directory', () => {
    vi.spyOn(fs.promises, 'lstat').mockResolvedValueOnce({ isDirectory: () => false });
    expect(() => resolveVersion('v0')).rejects.toThrow('Not a directory');
  });
  it('should sort the manifest files appropriately', () => {
    expect(resolveVersion('v0')).resolves.toMatchObject({
      manifest: {
        declarations: ['index.d.ts'],
        sources: ['index.js']
      }
    });
  });
  it('should recurse into directories', () => {
    vi.spyOn(fs.promises, 'readdir')
      .mockResolvedValueOnce(['index.js', 'index.d.ts', 'utils'])
      .mockResolvedValueOnce(['foo.js']);
    expect(resolveVersion('v0')).resolves.toMatchObject({
      importPaths: ['/runtime/v0/index.js', '/runtime/v0/utils/foo.js'],
      manifest: {
        declarations: ['index.d.ts'],
        sources: ['index.js', 'utils/foo.js']
      },
      version: 'v0'
    });
  });
});

describe('resolvePackages', () => {
  it('should return the info for all version in the runtime directory', async () => {
    vi.spyOn(fs.promises, 'readdir').mockImplementation((filepath) => {
      if (filepath === RUNTIME_DIR) {
        return ['v0', 'v1', 'v2'];
      } else if (filepath === path.resolve(RUNTIME_DIR, 'v0', RUNTIME_DIST_DIRNAME)) {
        return ['index.js', 'index.d.ts', 'utils'];
      }
      return ['index.js', 'index.d.ts'];
    });
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'lstat').mockImplementation((filepath) => {
      return Promise.resolve({ isDirectory: () => !path.extname(filepath) });
    });
    expect(resolvePackages()).resolves.toMatchObject([
      {
        importPaths: ['/runtime/v0/index.js', '/runtime/v0/utils/index.js'],
        manifest: {
          declarations: ['index.d.ts', 'utils/index.d.ts'],
          sources: ['index.js', 'utils/index.js']
        },
        version: 'v0'
      },
      {
        importPaths: ['/runtime/v1/index.js'],
        manifest: {
          declarations: ['index.d.ts'],
          sources: ['index.js']
        },
        version: 'v1'
      },
      {
        importPaths: ['/runtime/v2/index.js'],
        manifest: {
          declarations: ['index.d.ts'],
          sources: ['index.js']
        },
        version: 'v2'
      }
    ]);
  });
});

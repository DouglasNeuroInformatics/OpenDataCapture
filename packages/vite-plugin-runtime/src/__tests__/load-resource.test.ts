import fs from 'fs/promises';

import { deepFreeze } from '@douglasneuroinformatics/libjs';
import { afterEach, beforeEach, describe, expect, it, type MockInstance } from 'vitest';
import { vi } from 'vitest';

import { loadResource } from '../load-resource.js';
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

describe('loadResource', () => {
  let resolveVersion: MockInstance<() => Promise<RuntimeVersionInfo>>;

  beforeEach(() => {
    resolveVersion = vi.spyOn(resolve, 'resolveVersion').mockResolvedValue(runtimeVersionInfoStub);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call resolveVersion with the provided version', async () => {
    await loadResource('v0', resolve.MANIFEST_FILENAME);
    expect(resolveVersion).toHaveBeenCalledOnce();
  });
  it('should return the runtime manifest as application/json, if the filename matches MANIFEST_FILENAME', async () => {
    await expect(loadResource('v0', resolve.MANIFEST_FILENAME)).resolves.toMatchObject({
      contentType: 'application/json'
    });
  });
  it('should return the content type as text/plain, if the filename is in listed in the manifest declarations', async () => {
    const mockFileContent = '__content__';
    vi.spyOn(fs, 'readFile').mockResolvedValueOnce(mockFileContent);
    resolveVersion.mockResolvedValueOnce({
      ...runtimeVersionInfoStub,
      manifest: {
        declarations: ['foo.d.ts'],
        sources: [],
        styles: []
      }
    });
    await expect(loadResource('v0', 'foo.d.ts')).resolves.toMatchObject({
      content: mockFileContent,
      contentType: 'text/plain'
    });
  });
  it('should return the content type as test/javascript, if the filename is in listed in the manifest sources', async () => {
    const mockFileContent = '__content__';
    vi.spyOn(fs, 'readFile').mockResolvedValueOnce(mockFileContent);
    resolveVersion.mockResolvedValueOnce({
      ...runtimeVersionInfoStub,
      manifest: {
        declarations: [],
        sources: ['foo.ts'],
        styles: []
      }
    });
    await expect(loadResource('v0', 'foo.ts')).resolves.toMatchObject({
      content: mockFileContent,
      contentType: 'text/javascript'
    });
  });
  it('should return null if the file is not the MANIFEST_FILENAME, nor listed in the sources or declarations', async () => {
    await expect(loadResource('v0', 'foo.ts')).resolves.toBe(null);
  });
});

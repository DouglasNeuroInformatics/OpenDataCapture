import fs from 'fs/promises';

import { deepFreeze } from '@douglasneuroinformatics/libjs';
import * as runtimeResolve from '@opendatacapture/runtime-resolve';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { loadResource } from '../load-resource.js';

/** @type {runtimeResolve.RuntimeVersionInfo} */
const runtimeVersionInfoStub = deepFreeze(
  {
    baseDir: '',
    importPaths: [],
    manifest: {
      declarations: [],
      sources: []
    },
    version: ''
  },
  {
    readonlyType: false
  }
);

describe('loadResource', () => {
  /** @type {import('vitest').MockInstance<any[], Promise<runtimeResolve.RuntimeVersionInfo>>} */
  let resolveVersion;

  beforeEach(() => {
    resolveVersion = vi.spyOn(runtimeResolve, 'resolveVersion').mockResolvedValue(runtimeVersionInfoStub);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call resolveVersion with the provided version', async () => {
    await loadResource('v0', runtimeResolve.MANIFEST_FILENAME);
    expect(resolveVersion).toHaveBeenCalledOnce();
  });
  it('should return the runtime manifest as application/json, if the filename matches MANIFEST_FILENAME', () => {
    expect(loadResource('v0', runtimeResolve.MANIFEST_FILENAME)).resolves.toMatchObject({
      contentType: 'application/json'
    });
  });
  it('should return the content type as text/plain, if the filename is in listed in the manifest declarations', () => {
    const mockFileContent = '__content__';
    vi.spyOn(fs, 'readFile').mockResolvedValueOnce(mockFileContent);
    resolveVersion.mockResolvedValueOnce({
      ...runtimeVersionInfoStub,
      manifest: {
        declarations: ['foo.d.ts'],
        sources: []
      }
    });
    expect(loadResource('v0', 'foo.d.ts')).resolves.toMatchObject({
      content: mockFileContent,
      contentType: 'text/plain'
    });
  });
  it('should return the content type as test/javascript, if the filename is in listed in the manifest sources', () => {
    const mockFileContent = '__content__';
    vi.spyOn(fs, 'readFile').mockResolvedValueOnce(mockFileContent);
    resolveVersion.mockResolvedValueOnce({
      ...runtimeVersionInfoStub,
      manifest: {
        declarations: [],
        sources: ['foo.ts']
      }
    });
    expect(loadResource('v0', 'foo.ts')).resolves.toMatchObject({
      content: mockFileContent,
      contentType: 'text/javascript'
    });
  });
  it('should return null if the file is not the MANIFEST_FILENAME, nor listed in the sources or declarations', () => {
    expect(loadResource('v0', 'foo.ts')).resolves.toBe(null);
  });
});

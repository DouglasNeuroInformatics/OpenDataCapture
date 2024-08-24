import { beforeAll, describe, expect, it, vi } from 'vitest';

import { build } from '../build.js';
import * as esbuild from '../vendor/esbuild.js';
import { repositories } from './repositories/index.js';

import type { BundleOptions } from '../schemas.js';

describe('build', () => {
  describe('interactive instrument', () => {
    let options: BundleOptions;
    beforeAll(() => {
      options = { inputs: repositories.get('interactive')! };
    });
    it('should throw if the esbuild output does not include bundle.js', async () => {
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({ outputFiles: [] } as any);
      await expect(() => build(options)).rejects.toThrowError("Expected JavaScript bundle 'bundle.js' is not defined");
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({
        outputFiles: [{ path: 'index.js', text: 'export {}' }]
      } as any);
      await expect(() => build(options)).rejects.toThrowError("Expected JavaScript bundle 'bundle.js' is not defined");
    });
    it('should throw if the esbuild output includes additional files', async () => {
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({
        outputFiles: [{ path: 'bundle.js' }, { path: 'other.js' }]
      } as any);
      await expect(() => build(options)).rejects.toThrowError(
        "Unexpected number of output files: expected '1', found '2'"
      );
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({
        outputFiles: [{ path: 'bundle.js' }, { path: 'other.css' }]
      } as any);
      await expect(() => build(options)).rejects.toThrowError(
        "Unexpected number of output files: expected '1', found '2'"
      );
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({
        outputFiles: [{ path: 'bundle.js' }, { path: 'bundle.css' }, { path: 'other.css' }]
      } as any);
      await expect(() => build(options)).rejects.toThrowError(
        "Unexpected number of output files: expected '2', found '3'"
      );
    });
    it('should throw if the esbuild bundle output includes exports', async () => {
      vi.spyOn(esbuild, 'build').mockResolvedValueOnce({
        metafile: { outputs: { ['bundle.js']: { exports: ['a', 'b'] } } },
        outputFiles: [{ path: 'bundle.js' }]
      } as any);
      await expect(build(options)).rejects.toThrowError(
        "Unexpected number of exports in output file: expected '0', found '2'"
      );
    });
    it('should return the build output containing the bundled css and js', async () => {
      await expect(build(options)).resolves.toMatchObject({ css: expect.any(String), js: expect.any(String) });
    });

    // it('should return javascript that can be executed with no further transformation', () => {
    //   const result = bundle(options);
    //   expect((0, eval)(result.js)).toMatchObject({ kind: 'INTERACTIVE' });
    // });
  });
});

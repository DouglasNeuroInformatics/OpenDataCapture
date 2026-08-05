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

    it('should compile its JSX against the react it imports, whose elements another major cannot render', async () => {
      const { js } = await build({ inputs: repositories.get('interactive-react18')! });
      expect(js).toContain('/runtime/v1/react@18.x/jsx-runtime');
      expect(js).not.toContain('/runtime/v1/react@19.x');
    });

    it('should default to react 19 when the source imports no react, as a form with a JSX block does', async () => {
      const inputs = [{ content: `export default { content: <div>Block</div> };`, name: 'index.tsx' }];
      const { js } = await build({ inputs });
      expect(js).toContain('/runtime/v1/react@19.x/jsx-runtime');
    });

    it('should refuse to guess when the source imports two versions of react', async () => {
      const inputs = [
        { content: `import '/runtime/v1/react@18.x';\nimport '/runtime/v1/react@19.x';`, name: 'index.tsx' }
      ];
      await expect(build({ inputs })).rejects.toThrowError('expected at most one version of react');
    });

    // These two branches shipped inverted, which relabelled every real compile failure and meant
    // `CodeErrorBlock` never rendered. Both the message and the kind are asserted because each is
    // load-bearing: the kind gates the error UI, and the message is what reaches the API log.
    it('should report a BuildFailure as a compile failure, so the error UI can render it', async () => {
      const buildFailure = {
        cause: undefined,
        errors: [
          {
            detail: undefined,
            id: '',
            location: null,
            notes: [],
            pluginName: '',
            text: 'Could not resolve "missing"'
          }
        ],
        message: 'Build failed with 1 error',
        name: 'BuildFailure',
        warnings: []
      };
      vi.spyOn(esbuild, 'build').mockRejectedValueOnce(buildFailure);
      await expect(build(options)).rejects.toSatisfy((err: any) => {
        return (
          err.name === 'InstrumentBundlerError' &&
          err.message === 'Failed to Compile' &&
          err.kind === 'ESBUILD_FAILURE' &&
          err.cause.errors[0].text === 'Could not resolve "missing"'
        );
      });
    });

    it('should report anything that is not a BuildFailure as an unknown error, preserving the cause', async () => {
      const error = new TypeError('something broke');
      vi.spyOn(esbuild, 'build').mockRejectedValueOnce(error);
      await expect(build(options)).rejects.toSatisfy((err: any) => {
        return (
          err.name === 'InstrumentBundlerError' &&
          err.message === 'Unknown Error' &&
          err.kind === undefined &&
          err.cause === error
        );
      });
    });

    // it('should return javascript that can be executed with no further transformation', () => {
    //   const result = bundle(options);
    //   expect((0, eval)(result.js)).toMatchObject({ kind: 'INTERACTIVE' });
    // });
  });
});

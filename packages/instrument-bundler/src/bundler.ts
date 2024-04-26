import {
  InstrumentBundlerBuildError,
  InstrumentBundlerBuildValidationError,
  InstrumentBundlerError,
  InstrumentBundlerInputValidationError
} from './error.js';
import { resolvePlugin } from './plugin.js';
import { resolveIndexInput } from './resolve.js';
import { $BuildFailure } from './schema.js';
import { inferLoader } from './utils.js';
import esbuild from './vendor/esbuild.js';

import type { BuildOutput, BundleOptions, BundlerInput } from './types.js';

export class InstrumentBundler {
  async bundle({ debug, inputs }: BundleOptions) {
    this.validateInputs(inputs);
    const index = resolveIndexInput(inputs);
    const output = await this.build({ index, inputs });
    return this.transformBundle(output, { debug });
  }

  private async build({ index, inputs }: { index: BundlerInput; inputs: BundlerInput[] }): Promise<BuildOutput> {
    let output: BuildOutput;
    try {
      const result = await esbuild.build({
        bundle: true,
        charset: 'ascii',
        format: 'esm',
        keepNames: true,
        metafile: true,
        minify: false,
        outfile: 'bundle.js',
        platform: 'browser',
        plugins: [resolvePlugin({ inputs })],
        stdin: {
          contents: `import instrument from './${index.name}'; var __exports = instrument;`,
          loader: inferLoader(index.name)
        },
        target: 'es2022',
        treeShaking: false,
        write: false
      });
      const cssBundle = result.outputFiles.find((output) => output.path.endsWith('bundle.css'));
      const jsBundle = result.outputFiles.find((output) => output.path.endsWith('bundle.js'));
      if (!jsBundle) {
        throw new InstrumentBundlerBuildValidationError("Expected JavaScript bundle 'bundle.js' is not defined");
      }
      const actualOutputFiles = result.outputFiles.length;
      const expectedOutputFiles = cssBundle ? 2 : 1;
      if (actualOutputFiles !== expectedOutputFiles) {
        throw new InstrumentBundlerBuildValidationError(
          `Unexpected number of output files: expected '${expectedOutputFiles}', found '${actualOutputFiles}'`
        );
      }
      const exportsCount = result.metafile?.outputs['bundle.js'].exports.length;
      if (exportsCount !== 0) {
        throw new InstrumentBundlerBuildValidationError(
          `Unexpected number of exports in output file: expected '0', found '${exportsCount}'`
        );
      }
      const nonDynamicImportCount = result.metafile?.outputs['bundle.js'].imports.reduce((count, current) => {
        if (current.kind !== 'dynamic-import') {
          return count + 1;
        }
        return count;
      }, 0);
      if (nonDynamicImportCount !== 0) {
        throw new InstrumentBundlerBuildValidationError(
          `Unexpected number of non-dynamic imports in output file: expected '0', found '${nonDynamicImportCount}'`
        );
      }
      output = { css: cssBundle?.text, js: jsBundle.text };
    } catch (err) {
      if (!(err instanceof InstrumentBundlerError)) {
        const parseResult = await $BuildFailure.safeParseAsync(err);
        if (parseResult.success) {
          throw InstrumentBundlerBuildError.fromBuildFailure(parseResult.data);
        }
      }
      throw err;
    }
    return output;
  }

  /**
   * Converts the bundle into an an immediately invoked function expression (IIFE) that returns the value of
   * a top-level variable '__exports'. The result is subject to tree shaking and minification.
   *
   * @param input - the bundle with no static imports and exports,
   * @returns the minified bundle wrapped in an IIFE
   */
  private async transformBundle(output: BuildOutput, { debug }: { debug?: boolean }) {
    let inject = '';
    if (output.css) {
      inject = `Object.defineProperty(__exports.content, '__injectHead', { value: Object.freeze({ style: "${btoa(output.css)}" }), writable: false });`;
    }
    const bundle = `(async () => {
      ${output.js}
      ${inject}
      return __exports;
    } )()`;
    const result = await esbuild.transform(bundle, {
      charset: 'ascii',
      format: 'esm',
      minify: !debug,
      platform: 'browser',
      target: 'es2022',
      treeShaking: true
    });
    return result.code;
  }

  /**
   * Checks that the provided inputs contain at least one element, and that no input contains
   * illegal characters in it's name (i.e., it is a shallow, relative path)
   *
   * @param inputs - the inputs to be used to generate a bundle
   */
  private validateInputs(inputs: BundlerInput[]): void {
    if (inputs.length === 0) {
      throw new InstrumentBundlerInputValidationError('Received empty array for inputs');
    }
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[0];
      if (input.name.includes('/')) {
        throw new InstrumentBundlerInputValidationError(
          `Illegal character '/' in name '${input.name}' of input in position '${i}': expected shallow relative path (e.g., './foo.js')`
        );
      }
    }
  }
}

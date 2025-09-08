import { InstrumentBundlerError } from './error.js';
import { plugin } from './plugin.js';
import { resolveIndexInput } from './resolve.js';
import { $BuildFailure } from './schemas.js';
import { inferLoader } from './utils.js';
import * as esbuild from './vendor/esbuild.js';

import type { BundlerInput } from './schemas.js';
import type { BuildOutput } from './types.js';
import type { BuildResult } from './vendor/esbuild.js';

function parseBuildResult(result: BuildResult): BuildOutput {
  const cssOutput = result.outputFiles?.find((output) => output.path.endsWith('bundle.css'));
  const jsOutput = result.outputFiles?.find((output) => output.path.endsWith('bundle.js'));
  if (!jsOutput) {
    throw new InstrumentBundlerError("Expected JavaScript bundle 'bundle.js' is not defined");
  }
  const actualOutputFiles = result.outputFiles!.length;
  const expectedOutputFiles = cssOutput ? 2 : 1;
  if (actualOutputFiles !== expectedOutputFiles) {
    throw new InstrumentBundlerError(
      `Unexpected number of output files: expected '${expectedOutputFiles}', found '${actualOutputFiles}'`
    );
  }
  const exportsCount = result.metafile!.outputs['bundle.js']!.exports.length;
  if (exportsCount !== 0) {
    throw new InstrumentBundlerError(
      `Unexpected number of exports in output file: expected '0', found '${exportsCount}'`
    );
  }
  return { css: cssOutput?.text, js: jsOutput.text, legacyScripts: result.legacyScripts };
}

export async function build({ inputs }: { inputs: BundlerInput[] }): Promise<BuildOutput> {
  const index = resolveIndexInput(inputs);
  let result: BuildResult;
  try {
    result = await esbuild.build({
      bundle: true,
      charset: 'ascii',
      format: 'esm',
      jsx: 'automatic',
      jsxImportSource: '/runtime/v1/react@19.x',
      keepNames: true,
      metafile: true,
      minify: false,
      outfile: 'bundle.js',
      platform: 'browser',
      plugins: [plugin({ inputs })],
      stdin: {
        contents: `import instrument from './${index.name}'; var __exports = instrument;`,
        loader: inferLoader(index.name)
      },
      target: 'es2022',
      treeShaking: false,
      write: false
    });
  } catch (err) {
    const parseResult = await $BuildFailure.safeParseAsync(err);
    if (parseResult.success) {
      throw new InstrumentBundlerError('Unknown Error', { cause: err });
    }
    throw new InstrumentBundlerError('Failed to Compile', { cause: parseResult.error, kind: 'ESBUILD_FAILURE' });
  }
  return parseBuildResult(result);
}

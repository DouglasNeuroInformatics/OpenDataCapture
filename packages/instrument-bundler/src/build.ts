import type { LogLevel } from 'esbuild';

import { InstrumentBundlerError } from './error.js';
import { plugin } from './plugin.js';
import { resolveIndexInput } from './resolve.js';
import { $BuildFailure } from './schemas.js';
import { inferLoader } from './utils.js';
import * as esbuild from './vendor/esbuild.js';

import type { BundlerInput } from './schemas.js';
import type { BuildOutput } from './types.js';
import type { BuildFailure, BuildResult } from './vendor/esbuild.js';

const DEFAULT_REACT_PACKAGE = 'react@19.x';

const REACT_PACKAGE_PATTERN = /['"]\/runtime\/v1\/(react@[^'"/]+)/g;

/**
 * JSX compiles to the JSX runtime of one react, and elements of one major are not renderable by
 * another, so the runtime has to be the react the source itself imports rather than a fixed version.
 */
function resolveJsxImportSource(inputs: BundlerInput[]): string {
  const packages = new Set<string>();
  for (const { content } of inputs) {
    if (typeof content !== 'string') {
      continue;
    }
    for (const [, name] of content.matchAll(REACT_PACKAGE_PATTERN)) {
      packages.add(name!);
    }
  }
  if (packages.size > 1) {
    throw new InstrumentBundlerError(
      `Cannot resolve the JSX runtime: expected at most one version of react, found ${[...packages].join(', ')}`
    );
  }
  return `/runtime/v1/${packages.values().next().value ?? DEFAULT_REACT_PACKAGE}`;
}

function describeError(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : `${typeof err}: ${String(err)}`;
}

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

export async function build({
  inputs,
  logLevel
}: {
  inputs: BundlerInput[];
  logLevel?: LogLevel;
}): Promise<BuildOutput> {
  const index = resolveIndexInput(inputs);
  // outside the try, whose catch rewrites anything it sees into an esbuild failure
  const jsxImportSource = resolveJsxImportSource(inputs);
  let result: BuildResult;
  try {
    result = await esbuild.build({
      bundle: true,
      charset: 'ascii',
      format: 'esm',
      jsx: 'automatic',
      jsxImportSource,
      keepNames: true,
      logLevel,
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
      // the original error, rather than the parsed copy, so that `cause instanceof Error` holds downstream
      throw new InstrumentBundlerError('Failed to Compile', { cause: err as BuildFailure, kind: 'ESBUILD_FAILURE' });
    }
    // anything esbuild did not report as a compilation failure is a fault in the bundler itself, not in the
    // instrument, so name it here rather than leaving the reader with 'Unknown Error' and a stack
    throw new InstrumentBundlerError(`Unexpected error while invoking esbuild: ${describeError(err)}`, { cause: err });
  }
  return parseBuildResult(result);
}

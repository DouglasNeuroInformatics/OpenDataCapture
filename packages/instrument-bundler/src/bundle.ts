import { build } from './build.js';
import { preprocess } from './preprocess.js';
import { transformStaticImports } from './transform.js';
import * as esbuild from './vendor/esbuild.js';

import type { BundleOptions } from './schemas.js';
import type { BuildOutput } from './types.js';

/**
 * Converts the bundle into an an immediately invoked function expression (IIFE) that returns the value of
 * a top-level variable '__exports'. The result is subject to tree shaking and minification.
 *
 * @param input - the bundle with no static imports and exports,
 * @returns the minified bundle wrapped in an IIFE
 */
export async function createBundle(output: BuildOutput, options: { minify: boolean }) {
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
    minify: options.minify,
    platform: 'browser',
    target: 'es2022',
    treeShaking: true
  });
  return result.code;
}

export async function bundle({ inputs, minify = true }: BundleOptions): Promise<string> {
  preprocess(inputs);
  const result = await build({ inputs });
  result.js = transformStaticImports(result.js);
  return createBundle(result, { minify });
}

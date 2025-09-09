import { build } from './build.js';
import { preprocess } from './preprocess.js';
import { transformImports } from './transform.js';
import * as esbuild from './vendor/esbuild.js';

import type { BundleOptions } from './schemas.js';
import type { BuildOutput } from './types.js';

const GLOBALS = `
  globalThis.__import = async (moduleName) => {
    try {
      return import(typeof globalThis.__resolveImport === 'function' ? globalThis.__resolveImport(moduleName) : moduleName);
    } catch (err) {
      throw new Error('Failed to import module: ' + moduleName, { cause: err });
    }
  };
  const __createProxy = (name) => {
    const formatErrorMessage = (method, propertyName, targetName) => {
      const contextName = globalThis.__ODC_BUNDLER_ERROR_CONTEXT ?? 'UNKNOWN'
      return "Cannot " + method + " property '" + propertyName + "' of object '" + targetName + "' in global scope of file '" + contextName + "'" 
    }
    return new Proxy({ name }, {
      get(target, property) {
        throw new Error(formatErrorMessage('get', property.toString(), target.name))
      },
      set(target, property) {
        throw new Error(formatErrorMessage('set', property.toString(), target.name))
      }
    });
  };
  const document = globalThis.document ?? __createProxy('document');
  const self = globalThis.self ?? __createProxy('self');
  const window = globalThis.window ?? __createProxy('window');
`;

/**
 * Converts the bundle into an an immediately invoked function expression (IIFE) that returns the value of
 * a top-level variable '__exports'. The result is subject to tree shaking and minification.
 *
 * @param input - the bundle with no static imports and exports,
 * @returns the minified bundle wrapped in an IIFE
 */
export async function createBundle(output: BuildOutput, options: { minify: boolean }) {
  let inject = '';
  const style = output.css ? `"${btoa(output.css)}"` : undefined;
  const scripts = output.legacyScripts?.length
    ? `[${output.legacyScripts.map((content) => `"${btoa(content)}"`).join(', ')}]`
    : undefined;
  if (style || scripts) {
    inject = `Object.defineProperty(__exports.content, '__injectHead', { value: Object.freeze({ scripts: ${scripts}, style: ${style} }), writable: false });`;
  }
  const bundle = `(async () => {
    ${GLOBALS}
    ${output.js}
    ${inject}
    return __exports;
  } )()`;
  const result = await esbuild.transform(bundle, {
    charset: 'ascii',
    format: 'esm',
    minifyIdentifiers: false,
    minifySyntax: options.minify,
    minifyWhitespace: options.minify,
    platform: 'browser',
    target: 'es2022',
    treeShaking: true
  });
  return result.code;
}

export async function bundle({ inputs, minify = true }: BundleOptions): Promise<string> {
  preprocess(inputs);
  const result = await build({ inputs });
  result.js = transformImports(result.js);
  return createBundle(result, { minify });
}

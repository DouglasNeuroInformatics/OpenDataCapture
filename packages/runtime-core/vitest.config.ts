import * as path from 'node:path';

import { transform } from 'esbuild';
import { defineProject, mergeConfig } from 'vitest/config';
import type { Plugin } from 'vitest/config';

import { baseConfig } from '../../vitest.config.js';

const sourceRoot = path.join(import.meta.dirname, 'src') + path.sep;

const decoratorPattern = /^\s*@[A-Za-z_$]/m;

/**
 * Oxc, which transforms TypeScript under Vite 8, cannot lower TC39 decorators, and Node cannot run
 * them. esbuild, which builds `dist`, lowers them first in every project that runs this source.
 */
export const lowerDecorators: Plugin = {
  enforce: 'pre',
  name: 'lower-decorators',
  async transform(code, id) {
    if (!id.startsWith(sourceRoot) || !decoratorPattern.test(code)) {
      return null;
    }
    const result = await transform(code, { loader: 'ts', sourcefile: id, sourcemap: true, target: 'es2022' });
    return { code: result.code, map: result.map };
  }
};

export default mergeConfig(
  baseConfig,
  defineProject({
    plugins: [lowerDecorators],
    test: {
      name: 'runtime-core',
      root: import.meta.dirname
    }
  })
);

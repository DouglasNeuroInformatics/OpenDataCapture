import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import * as esbuild from '../vendor/esbuild.js';

const VENDOR_DIR = path.resolve(import.meta.dirname, '../vendor');

describe('vendor/esbuild', () => {
  it('should keep initializing its exports when tree shaken, so a bundled API does not lose the build binding', async () => {
    const result = await esbuild.build({
      bundle: true,
      external: ['esbuild', 'esbuild-wasm'],
      format: 'esm',
      keepNames: true,
      platform: 'node',
      stdin: {
        contents: "import * as vendor from './esbuild.js'; export default vendor.build;",
        loader: 'ts',
        resolveDir: VENDOR_DIR
      },
      target: ['node22', 'es2022'],
      treeShaking: true,
      write: false
    });
    expect(result.outputFiles[0]!.text).toContain('await import("esbuild")');
  });
});

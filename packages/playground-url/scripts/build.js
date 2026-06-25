import * as fs from 'node:fs';
import * as path from 'node:path';

import * as esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };
const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

// Bundle dependencies into a self-contained CLI so it runs via `npx` without a
// node_modules resolution step, and so esbuild handles the CJS/ESM interop of
// dependencies like lz-string. Node built-ins are left external automatically.
await esbuild.build({
  banner: {
    // Shim `require`/`__dirname`/`__filename` so bundled CommonJS dependencies
    // (e.g. commander) work in the ESM output.
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __createRequire } from "node:module";',
      'Object.defineProperties(globalThis, {',
      '  __dirname: { value: import.meta.dirname, writable: false },',
      '  __filename: { value: import.meta.filename, writable: false },',
      '  require: { value: __createRequire(import.meta.url), writable: false }',
      '});'
    ].join('\n')
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: Object.keys(pkg.dependencies),
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node',
  target: ['node22', 'es2022']
});

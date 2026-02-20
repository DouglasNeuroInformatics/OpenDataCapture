import * as fs from 'fs';
import * as path from 'path';

import * as esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: {
    js: '#!/usr/bin/env node'
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: [...Object.keys(pkg.dependencies), 'esbuild-wasm'],
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node',
  target: 'es2022'
});

await fs.promises.cp(path.resolve(import.meta.dirname, '../src/client'), path.resolve(outdir, 'client'), {
  recursive: true
});

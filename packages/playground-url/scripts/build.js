import * as fs from 'node:fs';
import * as path from 'node:path';

import * as esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };
const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: { js: '#!/usr/bin/env node' },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: Object.keys(pkg.dependencies),
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node',
  target: ['node22', 'es2022']
});

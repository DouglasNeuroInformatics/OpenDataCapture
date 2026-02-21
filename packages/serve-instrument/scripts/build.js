import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import tailwind from '@tailwindcss/postcss';
import * as esbuild from 'esbuild';
import postcss from 'postcss';

import pkg from '../package.json' with { type: 'json' };

const outdir = path.resolve(import.meta.dirname, '../dist');

async function buildStyles() {
  const filepath = url.fileURLToPath(import.meta.resolve('@opendatacapture/react-core/globals.css'));
  const content = await fs.promises.readFile(filepath, 'utf-8');
  const result = await postcss([tailwind()]).process(content, {
    from: filepath
  });
  return result.css;
}

async function buildCli() {
  await esbuild.build({
    banner: {
      js: [
        '#!/usr/bin/env node',
        'Object.defineProperties(globalThis, {',
        '  __dirname: { value: import.meta.dirname, writable: false },',
        '  __filename: { value: import.meta.filename, writable: false },',
        '  require: { value: (await import("module")).createRequire(import.meta.url), writable: false }',
        '});'
      ].join('\n')
    },
    bundle: true,
    define: {
      __TAILWIND_STYLES__: `"${btoa(await buildStyles())}"`,
      'process.env.NODE_ENV': "'production'",
      window: 'undefined'
    },
    entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
    external: Object.keys(pkg.dependencies),
    format: 'esm',
    jsx: 'automatic',
    minify: false,
    outdir,
    platform: 'node',
    target: ['node22', 'es2022']
  });
}

async function buildClient() {
  await esbuild.build({
    bundle: true,
    define: {
      'process.env.NODE_ENV': "'production'"
    },
    entryPoints: [path.resolve(import.meta.dirname, '../src/client.tsx')],
    external: ['esbuild'],
    format: 'esm',
    jsx: 'automatic',
    minify: true,
    outdir,
    platform: 'browser',
    target: 'es2022'
  });
}

await fs.promises.rm(outdir, { force: true, recursive: true });
await fs.promises.mkdir(outdir);

await Promise.all([buildCli(), buildClient(), buildStyles()]);

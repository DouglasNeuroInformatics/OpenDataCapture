#!/usr/bin/env tsx

/* eslint-disable no-console */

import fs from 'fs/promises';
import module from 'module';
import path from 'path';

import { prismaPlugin } from '@douglasneuroinformatics/esbuild-plugin-prisma';
import esbuild from 'esbuild';
import type { BuildOptions } from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
const require = module.createRequire(import.meta.url);

import { getReleaseInfo } from '@opendatacapture/release-info';

const entryFile = path.resolve(import.meta.dirname, '../src/main.ts');
const outdir = path.resolve(import.meta.dirname, '../dist');
const tsconfig = path.resolve(import.meta.dirname, '../tsconfig.json');

const binDir = path.resolve(outdir, 'bin');

const outfile = path.resolve(outdir, 'app.js');

const runtimeV1Dir = path.dirname(require.resolve('@opendatacapture/runtime-v1/package.json'));

const options: BuildOptions & { external: NonNullable<unknown>; plugins: NonNullable<unknown> } = {
  banner: {
    js: "Object.defineProperties(globalThis, { __dirname: { value: import.meta.dirname, writable: false }, __filename: { value: import.meta.filename, writable: false }, require: { value: (await import('module')).createRequire(import.meta.url), writable: false } });"
  },
  bundle: true,
  define: {
    'import.meta.release': JSON.stringify(await getReleaseInfo())
  },
  entryPoints: [entryFile],
  external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
  format: 'esm',
  keepNames: true,
  loader: {
    '.node': 'copy'
  },
  outfile,
  platform: 'node',
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: tsconfig
    }),
    prismaPlugin({ outdir: path.join(outdir, 'prisma/client') })
  ],
  target: ['node18', 'es2022'],
  tsconfig
};

async function copyEsbuild() {
  const filepath = require.resolve('esbuild/bin/esbuild');
  await fs.copyFile(filepath, path.join(binDir, 'esbuild'));
}

async function clean() {
  await fs.rm(outdir, { force: true, recursive: true });
  await fs.mkdir(outdir);
  await fs.mkdir(binDir);
}

async function build() {
  await clean();
  await copyEsbuild();
  await fs.cp(path.join(runtimeV1Dir, 'dist'), path.join(outdir, 'runtime', 'v1'), { recursive: true });
  await esbuild.build(options);
  console.log('Done!');
}

async function watch() {
  return new Promise((resolve, reject) => {
    esbuild
      .context({
        ...options,
        external: [...options.external, 'esbuild'],
        plugins: [
          ...options.plugins,
          {
            name: 'rebuild',
            setup(build) {
              build.onEnd((result) => {
                console.log(`Done! Build completed with ${result.errors.length} errors`);
                resolve(result);
              });
            }
          }
        ],
        sourcemap: true
      })
      .then((ctx) => {
        void ctx.watch();
        console.log('Watching...');
      })
      .catch((err) => {
        reject(err as Error);
      });
  });
}

const isEntry = process.argv[1] === import.meta.filename;
if (isEntry) {
  await build();
}

export { clean, outfile, watch };

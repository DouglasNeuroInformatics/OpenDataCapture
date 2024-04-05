#!/usr/bin/env node

import fs from 'fs/promises';
import module from 'module';
import path from 'path';

import { nativeModulesPlugin } from '@douglasneuroinformatics/esbuild-plugin-native-modules';
import { prismaPlugin } from '@douglasneuroinformatics/esbuild-plugin-prisma';
import { runtimePlugin } from '@opendatacapture/esbuild-plugin-runtime';
import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const require = module.createRequire(import.meta.url);

const entryFile = path.resolve(import.meta.dirname, '../src/main.ts');
const outdir = path.resolve(import.meta.dirname, '../dist');
const tsconfig = path.resolve(import.meta.dirname, '../tsconfig.json');

const binDir = path.resolve(outdir, 'bin');

const cjsShims = `
const { __dirname, __filename, require } = await (async () => {
  const module = (await import('module')).default;
  const path = (await import('path')).default;
  const url = (await import('url')).default;

  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const require = module.createRequire(__dirname);

  return { __dirname, __filename, require };
})();
`;

/** @type {import('esbuild').BuildOptions & { external: NonNullable<unknown>, plugins: NonNullable<unknown> }} */
const options = {
  banner: {
    js: cjsShims
  },
  bundle: true,
  entryPoints: [entryFile],
  external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
  format: 'esm',
  keepNames: true,
  outfile: path.resolve(outdir, 'app.mjs'),
  platform: 'node',
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: tsconfig
    }),
    runtimePlugin({ outdir }),
    prismaPlugin({ outdir: path.join(outdir, 'core') }),
    nativeModulesPlugin()
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
  await esbuild.build(options);
  console.log('Done!');
}

const isEntry = process.argv[1] === import.meta.filename;
if (isEntry) {
  build();
}

export { build, clean, options };

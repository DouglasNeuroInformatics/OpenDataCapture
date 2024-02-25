// @ts-check

import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import { nativeModulesPlugin } from '@open-data-capture/esbuild-plugin-native-modules';
import { prismaPlugin } from '@open-data-capture/esbuild-plugin-prisma';
import esbuild from 'esbuild';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryFile = path.resolve(__dirname, '../src/main.ts');
const outdir = path.resolve(__dirname, '../dist');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

if (!existsSync(outdir)) {
  await fs.mkdir(outdir);
}

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

await esbuild.build({
  banner: {
    js: cjsShims
  },
  bundle: true,
  entryPoints: [entryFile],
  external: ['lightningcss'],
  format: 'esm',
  keepNames: true,
  outfile: path.resolve(outdir, 'main.mjs'),
  platform: 'node',
  plugins: [nativeModulesPlugin(), prismaPlugin({ outdir: path.join(outdir, 'gateway') })],
  target: ['node18', 'es2022'],
  tsconfig
});

const entryServer = path.join(__dirname, '../dist/server/entry-server.js');

await esbuild.build({
  allowOverwrite: true,
  banner: {
    js: cjsShims
  },
  bundle: true,
  entryPoints: [entryServer],
  format: 'esm',
  outfile: entryServer,
  platform: 'node',
  target: ['node18', 'es2022']
});

console.log('Done!');

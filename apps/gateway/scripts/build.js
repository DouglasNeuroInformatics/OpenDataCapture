// @ts-check

import fs from 'fs/promises';
import module from 'module';
import path from 'path';
import url from 'url';

import { nativeModulesPlugin } from '@open-data-capture/esbuild-plugin-native-modules';
import esbuild from 'esbuild';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = module.createRequire(import.meta.url);

const entryFile = path.resolve(__dirname, '../src/main.ts');
const outdir = path.resolve(__dirname, '../dist');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

const outdirExists = (await fs.lstat(outdir)).isDirectory;
if (!outdirExists) {
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

// Copy Prisma
const databaseLibPath = path.dirname(require.resolve('@open-data-capture/database/gateway'));
const files = await fs.readdir(databaseLibPath);
const engineFilename = files.find((filename) => {
  return filename.startsWith('libquery_engine') && filename.endsWith('.node');
});

if (!engineFilename) {
  throw new Error(`Failed to resolve prisma engine from path: ${databaseLibPath}`);
}
const dbDir = path.join(outdir, 'gateway');
const dbDirExists = (await fs.lstat(dbDir)).isDirectory;
if (!dbDirExists) {
  await fs.mkdir(dbDir);
}
await fs.copyFile(path.join(databaseLibPath, engineFilename), path.join(outdir, 'gateway', engineFilename));

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
  plugins: [nativeModulesPlugin()],
  target: ['node18', 'es2022'],
  tsconfig
});

console.log('Done!');

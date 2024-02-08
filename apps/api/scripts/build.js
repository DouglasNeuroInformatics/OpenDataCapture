import fs from 'fs/promises';
import module from 'module';
import path from 'path';
import url from 'url';

import { nativeModulesPlugin } from '@open-data-capture/esbuild-plugin-native-modules';
import { runtimePlugin } from '@open-data-capture/esbuild-plugin-runtime';
import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = module.createRequire(import.meta.url);

const entryFile = path.resolve(__dirname, '../src/main.ts');
const outdir = path.resolve(__dirname, '../dist');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

const binDir = path.resolve(outdir, 'bin');

await fs.rm(outdir, { force: true, recursive: true });
await fs.mkdir(outdir);
await fs.mkdir(binDir);

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
async function copyPrisma() {
  const coreDatabasePath = path.dirname(require.resolve('@open-data-capture/database/core'));
  const files = await fs.readdir(coreDatabasePath);
  const engineFilename = files.find((filename) => {
    return filename.startsWith('libquery_engine') && filename.endsWith('.node');
  });
  if (!engineFilename) {
    throw new Error(`Failed to resolve prisma engine from path: ${coreDatabasePath}`);
  }
  await fs.mkdir(path.join(outdir, 'core'));
  await fs.copyFile(path.join(coreDatabasePath, engineFilename), path.join(outdir, 'core', engineFilename));
}

// Copy Prisma
async function copyEsbuild() {
  const filepath = require.resolve('esbuild/bin/esbuild');
  await fs.copyFile(filepath, path.join(binDir, 'esbuild'));
}

await copyPrisma();
await copyEsbuild();

await esbuild.build({
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
    nativeModulesPlugin()
  ],
  sourcemap: process.env.DEBUG?.trim().toLowerCase() === 'true',
  target: ['node18', 'es2022'],
  tsconfig
});

console.log('Done!');

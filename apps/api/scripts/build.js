import fs from 'fs/promises';
import module from 'module';
import path from 'path';
import url from 'url';

import { nativeModulesPlugin } from '@douglasneuroinformatics/esbuild-plugin-native-modules';
import { prismaPlugin } from '@douglasneuroinformatics/esbuild-plugin-prisma';
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

// Copy ESBuild
async function copyEsbuild() {
  const filepath = require.resolve('esbuild/bin/esbuild');
  await fs.copyFile(filepath, path.join(binDir, 'esbuild'));
}

/** @type {import('esbuild').BuildOptions} */
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

if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context({
    ...options,
    external: [...(options.external ?? []), 'esbuild'],
    sourcemap: true
  });
  await ctx.watch();
  console.log('Watching...');
} else {
  await copyEsbuild();
  await esbuild.build(options);
  console.log('Done!');
}

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryFile = path.resolve(__dirname, '../src/main.ts');
const outdir = path.resolve(__dirname, '../dist');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

await fs.rm(outdir, {
  force: true,
  recursive: true
});

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
  external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
  format: 'esm',
  keepNames: true,
  outfile: path.resolve(outdir, 'app.mjs'),
  platform: 'node',
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: tsconfig
    })
  ],
  target: ['node18', 'es2022'],
  tsconfig
});

console.log('Done!');

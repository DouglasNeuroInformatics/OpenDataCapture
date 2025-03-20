#!/usr/bin/env tsx

/* eslint-disable no-console */

import fs from 'fs';
import module from 'module';
import path from 'path';

import { getReleaseInfo } from '@opendatacapture/release-info';
import esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');
const tsconfig = path.resolve(import.meta.dirname, '../tsconfig.json');

const require = module.createRequire(import.meta.url);

if (fs.existsSync(outdir)) {
  await fs.promises.rm(outdir, { recursive: true });
}

await fs.promises.mkdir(outdir);

const release = await getReleaseInfo();

const ctx = await esbuild.context({
  banner: {
    js: "var __dirname = import.meta.dirname; var __filename = import.meta.filename; var require = (await import('module')).createRequire(import.meta.url);"
  },
  bundle: true,
  define: {
    __RELEASE__: JSON.stringify(release),
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false'
  },
  entryPoints: [
    path.resolve(import.meta.dirname, '../src/main.ts'),
    path.resolve(import.meta.dirname, '../src/entry-server.tsx')
  ],
  external: ['fsevents', 'lightningcss', 'vite'],
  format: 'esm',
  keepNames: true,
  outdir,
  platform: 'node',
  plugins: [
    {
      name: 'raw',
      setup(build) {
        build.onResolve({ filter: /^.*\?raw$/ }, (args) => {
          return {
            namespace: 'raw',
            path: require.resolve(args.path, { paths: [path.dirname(args.importer)] })
          };
        });
        build.onLoad({ filter: /.*/, namespace: 'raw' }, async (args) => {
          return { contents: await fs.promises.readFile(args.path, 'utf-8'), loader: 'text' };
        });
      }
    },
    {
      name: 'rebuild',
      setup(build) {
        build.onEnd((result) => {
          console.log(`Done! Build completed with ${result.errors.length} errors`);
        });
      }
    }
  ],
  sourcemap: true,
  target: ['node18', 'es2022'],
  treeShaking: true,
  tsconfig
});

await ctx.watch();
console.log('Watching...');
console.log('Temporarily disposing context. HMR is currently broken.');
await ctx.dispose();

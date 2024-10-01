#!/usr/bin/env tsx

import fs from 'fs';
import module from 'module';
import path from 'path';

import { getReleaseInfo } from '@opendatacapture/release-info';
import esbuild from 'esbuild';
import type { BuildResult } from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');
const tsconfig = path.resolve(import.meta.dirname, '../tsconfig.json');

const require = module.createRequire(import.meta.url);

if (fs.existsSync(outdir)) {
  await fs.promises.rm(outdir, { recursive: true });
}

await fs.promises.mkdir(outdir);

const releaseInfo = await getReleaseInfo();

await new Promise<BuildResult>((resolve, reject) => {
  esbuild
    .context({
      banner: {
        js: "var __dirname = import.meta.dirname; var __filename = import.meta.filename; var require = (await import('module')).createRequire(import.meta.url);"
      },
      bundle: true,
      define: {
        'import.meta.env.DEV': 'true',
        'import.meta.env.PROD': 'false',
        'import.meta.env.RELEASE_INFO': JSON.stringify(releaseInfo)
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
              resolve(result);
            });
          }
        }
      ],
      sourcemap: true,
      target: ['node18', 'es2022'],
      treeShaking: true,
      tsconfig
    })
    .then((ctx) => {
      void ctx.watch();
      console.log('Watching...');
      console.log('Temporarily disposing context. HMR is currently broken.');
      return ctx.dispose();
    })
    .catch((err) => {
      reject(err as Error);
    });
});

// nodemon({ script: path.resolve(import.meta.dirname, '../dist/main.js') });

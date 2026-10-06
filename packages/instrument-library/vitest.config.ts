import path from 'node:path';

import { defineProject, mergeConfig } from 'vitest/config';

import { baseConfig } from '../../vitest.config';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

// Instrument source imports the runtime by URL. Resolve each URL to the source it is built from, so
// tests need no prior `runtime/v1` build: `/runtime/v1/<name>@<range>[/<subpath>]` is the
// `vendor/<name>@<range>` wrapper, and runtime-core is its own package.
const PACKAGE_SPECIFIER = String.raw`((?:@[^/]+/)?[^/@]+@[^/]+)`;

export default mergeConfig(
  baseConfig,
  defineProject({
    resolve: {
      alias: [
        {
          find: /^\/runtime\/v1\/@opendatacapture\/runtime-core$/,
          replacement: path.resolve(repositoryRoot, 'packages/runtime-core/src/index.ts')
        },
        {
          find: new RegExp(String.raw`^/runtime/v1/${PACKAGE_SPECIFIER}$`),
          replacement: path.resolve(repositoryRoot, 'vendor/$1/src/index.js')
        },
        {
          find: new RegExp(String.raw`^/runtime/v1/${PACKAGE_SPECIFIER}/(.+?)(?:\.js)?$`),
          replacement: path.resolve(repositoryRoot, 'vendor/$1/src/$2.js')
        }
      ]
    },
    test: {
      environment: 'happy-dom',
      name: 'instrument-library',
      root: import.meta.dirname
    }
  })
);

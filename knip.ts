import type { KnipConfig } from 'knip';

import runtimeConfig from './runtime/v1/runtime.config.js';

const config: KnipConfig = {
  ignoreBinaries: ['env-cmd!'],
  ignoreIssues: {
    // module.exports is the function actions/github-script require()s in .github/workflows
    '.github/scripts/*.cjs': ['exports'],
    // reached through the /runtime/v1/* tsconfig paths; vendor wrappers resolve their peers from runtime/v1
    'vendor/**': ['unlisted']
  },
  // instrument-stubs only serves test and Storybook fixtures
  ignoreWorkspaces: ['vendor/**', 'packages/instrument-stubs!'],
  includeEntryExports: true,
  workspaces: {
    '.': {
      entry: ['scripts/increment-version.ts', '.github/scripts/*.cjs'],
      ignoreBinaries: ['turbo'],
      // the JSDoc type of the arguments actions/github-script injects, not an npm package
      ignoreDependencies: ['github-script', '@astrojs/starlight'],
      // docs/**/*.mdx is outreach content, compiled through the aliases in its astro.config.ts
      paths: { '@/components/*': ['apps/outreach/src/components/*'] },
      project: ['**/*.{cjs,js,ts}', '!.agents/**']
    },
    'apps/api': {
      entry: [
        'libnest.config.ts!',
        // spawned as a worker thread by path
        'src/instrument-records/export-worker.js!',
        // test/app.test.ts imports the suites by reading the directory
        'test/**/*.ts'
      ],
      ignoreIssues: {
        'libnest.config.ts': ['exports'],
        'test/suites/*.suite.ts': ['exports']
      }
    },
    'apps/gateway': {
      // scripts/dev.ts runs behind env-cmd, which knip does not parse past
      entry: ['src/main.ts!', 'src/entry-server.tsx!', 'scripts/*.ts'],
      // generated into node_modules by `prisma generate`
      ignoreDependencies: ['@prisma/generated-client'],
      // `render` is imported at runtime from the SSR build output
      ignoreIssues: { 'src/entry-server.tsx': ['exports'] }
    },
    'apps/outreach': {
      // theme-observer.js is read with fs and starlight.css passed through path.resolve in astro.config.ts
      entry: ['../../docs/**/*.mdx!', 'src/scripts/theme-observer.js!', 'src/styles/starlight.css!'],
      // resolved through runtime-meta's generateMetadata
      ignoreDependencies: ['@opendatacapture/runtime-v1'],
      // src/plugins are Astro build integrations, imported only by astro.config.ts
      project: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts,astro,mdx,css}!', '!src/plugins/**!']
    },
    'apps/playground': {
      // preview.html is a second Vite page; the vite plugin only reads index.html
      entry: ['src/preview/main.tsx!'],
      ignoreIssues: {
        // loaded as raw text through import.meta.glob and compiled by the instrument bundler
        'src/instruments/*/*/*/index.{js,jsx,ts,tsx}': ['exports']
      }
    },
    'apps/web': {
      project: ['**/*.{ts,tsx,css}!', '!src/testing/**!', '!src/**/__tests__/**!'],
      // vite.config.ts passes generatedRouteTree to tanstackRouter() inline; the plugin only reads tsr.config.json
      'tanstack-router': {
        entry: ['src/route-tree.ts']
      }
    },
    'packages/instrument-bundler': {
      // instruments that src/__tests__/repositories/index.ts reads from disk for the tests to bundle
      entry: ['src/__tests__/repositories/*/index.{ts,tsx}'],
      // tsc resolves react/jsx-runtime for the JSX in those instruments
      ignoreDependencies: ['react'],
      ignoreIssues: {
        // vendored from parse-imports, treated as third-party (see AGENTS.md)
        'src/parse.ts': ['exports', 'types']
      },
      includeEntryExports: false,
      project: ['**/*.{js,ts,tsx}!', '!src/**/__tests__/**!']
    },
    'packages/instrument-library': {
      // each instrument directory is compiled by the instrument-bundler CLI into dist/, which apps/api imports
      entry: ['src/{file,forms,interactive,series}/*/index.{js,jsx,ts,tsx}!', 'scripts/*.ts'],
      // `build` runs the bundler CLI by path
      ignoreDependencies: ['@opendatacapture/instrument-bundler'],
      // tsconfig `jsxImportSource`, mapped onto runtime/v1/dist by tsconfig `paths`
      ignoreUnresolved: ['/runtime/v1/react@19.x'],
      includeEntryExports: false
    },
    'packages/licenses': {
      // bundled into runtime/v1, so its whole surface is public API
      includeEntryExports: false
    },
    'packages/playground-url': {
      entry: ['src/cli.ts!', 'scripts/*.js'],
      includeEntryExports: false
    },
    'packages/react-core': {
      // tsconfig `paths` maps /runtime/v1/* onto runtime/v1/dist for the types in zodErrorMap.ts
      ignoreDependencies: ['@opendatacapture/runtime-v1']
    },
    'packages/release-info': {
      // called only from build configs, which --production does not analyse
      includeEntryExports: false
    },
    'packages/runtime-bundler': {
      // npm packages that test/e2e.test.ts copies into a temporary node_modules and bundles
      ignoreFiles: ['test/fixtures/**']
    },
    'packages/runtime-core': {
      // served to instrument authors through runtime/v1
      entry: ['src/index.ts!', 'src/constants.ts!', 'src/**/__tests__/*.test-d.ts'],
      includeEntryExports: false
    },
    'packages/runtime-internal': {
      ignoreIssues: { 'src/index.d.ts': ['exports', 'types'] }
    },
    'packages/runtime-meta': {
      ignoreIssues: { 'src/index.d.ts': ['exports', 'types'] }
    },
    'packages/serve-instrument': {
      // scripts/build.js bundles src/client.tsx into dist/client.js, which the server inlines into each page
      entry: ['src/cli.ts!', 'src/client.tsx!', 'scripts/*.js'],
      // kept external when the CLI is bundled, so it is imported at runtime
      ignoreDependencies: ['esbuild!'],
      includeEntryExports: false
    },
    'packages/vite-plugin-runtime': {
      // its only consumers are Vite configs, which --production does not analyse
      includeEntryExports: false
    },
    'runtime/v1': {
      // the runtime-bundler CLI imports it from the working directory
      entry: ['runtime.config.js!'],
      // runtime-bundler resolves every `include` entry from this package's node_modules
      ignoreDependencies: runtimeConfig.include,
      includeEntryExports: false
    },
    storybook: {
      project: ['**/*.{css,js,mdx,ts}'],
      storybook: {
        config: ['config/main.ts'],
        entry: ['config/preview.ts']
      }
    },
    testing: {
      // generated by scripts/gen-routes.ts
      ignoreIssues: { 'src/generated/route.d.ts': ['types'] },
      project: ['**/*.ts']
    }
  }
};

export default config;

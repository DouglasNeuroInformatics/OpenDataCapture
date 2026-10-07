import path from 'path';

import { defineConfig, mergeConfig } from 'vitest/config';

// Project configs merge this rather than the default export, because Vitest 5 treats a `projects`
// field inside a referenced project config as a nested set of projects.
export const baseConfig = defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false
  }
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          '**/coverage/**',
          '**/dist/**',
          '**/node_modules/**',
          '**/public/**',
          '**/scripts/**',
          '**/*.d.?(c|m)ts',
          '**/*{.,-}{test,test-d,spec}.?(c|m)[jt]s?(x)',
          '**/*.config.?(c|m)[jt]s?(x)',
          '**/*.stories.?(c|m)[jt]s?(x)',
          '**/__tests__/**',
          'apps/gateway/src/entry-client.tsx',
          'apps/gateway/src/main.ts',
          'apps/web/src/main.tsx',
          'apps/web/src/route-tree.ts',
          'apps/web/src/testing/**'
        ],
        include: ['apps/{api,gateway,web}/src/**/*.?(c|m)[jt]s?(x)', 'packages/*/src/**/*.?(c|m)[jt]s?(x)'],
        provider: 'v8',
        reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
        skipFull: true,
        thresholds: {
          100: true
        }
      },
      projects: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts', 'runtime/*/vitest.config.ts']
    }
  })
);

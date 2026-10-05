import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/.storybook/**',
        '**/coverage/**',
        '**/cypress/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/public/**',
        '**/scripts/**',
        '**/*.d.?(c|m)ts',
        '**/*{.,-}{test,test-d,spec}.?(c|m)[jt]s?(x)',
        '**/*.config.?(c|m)[jt]s?(x)',
        '**/*.stories.?(c|m)[jt]s?(x)',
        '**/__mocks__/**',
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
    include: ['**/*/test.?(c|m)[jt]s?(x)', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    projects: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts', 'runtime/*/vitest.config.ts'],
    watch: false
  }
});

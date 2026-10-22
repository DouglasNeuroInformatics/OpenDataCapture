import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/public/**',
        '{apps,packages,runtime}/*/scripts/**',
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
      include: [
        '.github/scripts/release.cjs',
        'apps/{api,gateway,web}/src/**/*.?(c|m)[jt]s?(x)',
        'packages/*/src/**/*.?(c|m)[jt]s?(x)'
      ],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
      skipFull: true,
      thresholds: {
        100: true
      }
    },
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    projects: [
      '.github/vitest.config.ts',
      'apps/*/vitest.config.ts',
      'packages/*/vitest.config.ts',
      'runtime/*/vitest.config.ts'
    ],
    watch: false
  }
});

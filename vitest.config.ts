import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts', 'runtime/*/vitest.config.ts'],
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
        '**/*.stories.?(c|m)[jt]s?(x)'
      ],
      include: ['packages/*/src/**/*.?(c|m)[jt]s?(x)'],
      // include: ['apps/{api,gateway,web}/src/**/*.?(c|m)[jt]s?(x)', 'packages/*/src/**/*.?(c|m)[jt]s?(x)'],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
      skipFull: true
    },
    include: ['**/*/test.?(c|m)[jt]s?(x)', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false
  }
});

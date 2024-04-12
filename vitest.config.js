import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    coverage: {
      exclude: [
        '**/.storybook/**',
        '**/coverage/**',
        '**/cypress/**',
        '**/dist/**',
        '**/public/**',
        '**/scripts/**',
        '**/*.d.?(c|m)ts',
        '**/*{.,-}{test,test-d,spec}.?(c|m)[jt]s?(x)',
        '**/*.config.?(c|m)[jt]s?(x)',
        '**/*.stories.?(c|m)[jt]s?(x)'
      ],
      include: ['apps/**/*', 'packages/**/*'],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
      skipFull: true
    },
    watch: false
  }
});

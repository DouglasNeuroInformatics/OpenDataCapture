import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    coverage: {
      exclude: ['coverage/**', 'cypress/**', 'dist/**', '**/*.d.ts', '**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)'],
      include: ['apps/**/*', 'packages/**/*'],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage')
    },
    watch: false
  }
});

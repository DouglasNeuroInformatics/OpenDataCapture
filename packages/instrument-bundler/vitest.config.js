import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    coverage: {
      exclude: ['**/__tests__/**', 'src/vendor/**/*'],
      include: ['src/**/*'],
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage'),
      skipFull: true
    },
    include: ['src/**/*/test.?(c|m)[jt]s?(x)', 'src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false
  }
});

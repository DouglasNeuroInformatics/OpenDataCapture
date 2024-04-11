import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: path.resolve(import.meta.dirname, 'coverage')
    },
    watch: false
  }
});

import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    watch: false
  }
});

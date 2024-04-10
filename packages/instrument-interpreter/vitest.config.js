import runtime from '@opendatacapture/vite-plugin-runtime';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    runtime({
      packageRoot: import.meta.dirname
    })
  ],
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: 'chrome'
    }
  }
});

import runtime from '@open-data-capture/vite-plugin-runtime';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [runtime()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: 'chrome'
    }
  }
});

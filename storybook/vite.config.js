import * as path from 'node:path';

import { runtime } from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const playgroundSourceRoot = path.resolve(import.meta.dirname, '../apps/playground/src');
const webSourceRoot = path.resolve(import.meta.dirname, '../apps/web/src');

export default defineConfig({
  build: {
    target: 'es2022'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  },
  plugins: [runtime(), tailwindcss()],
  resolve: {
    alias: [
      {
        customResolver: async function (source, importer) {
          if (importer?.startsWith(playgroundSourceRoot)) {
            return this.resolve(source.replace('{{ROOT}}', playgroundSourceRoot));
          } else if (importer?.startsWith(webSourceRoot)) {
            return this.resolve(source.replace('{{ROOT}}', webSourceRoot));
          }
          return null;
        },
        find: '@',
        replacement: '{{ROOT}}'
      }
    ]
  }
});

import * as path from 'node:path';

import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const playgroundSourceRoot = path.resolve(import.meta.dirname, '../apps/playground/src');
const webSourceRoot = path.resolve(import.meta.dirname, '../apps/web/src');

/** @type {import('vite').Plugin} */
const sourceRootAlias = {
  enforce: 'pre',
  name: 'source-root-alias',
  resolveId(source, importer, options) {
    if (source !== '@' && !source.startsWith('@/')) {
      return null;
    }
    const sourceRoot = [playgroundSourceRoot, webSourceRoot].find((root) => importer?.startsWith(root));
    if (!sourceRoot) {
      return null;
    }
    return this.resolve(sourceRoot + source.slice(1), importer, options);
  }
};

export default defineConfig({
  build: {
    target: 'es2022'
  },
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        target: 'es2022'
      }
    }
  },
  plugins: [
    sourceRootAlias,
    runtime({
      rootDir: import.meta.dirname
    }),
    tailwindcss()
  ]
});

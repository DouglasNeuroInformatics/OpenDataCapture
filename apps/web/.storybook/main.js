// @ts-check

import path from 'node:path';

import { defineConfig } from '@open-data-capture/storybook';

const config = defineConfig({
  // eslint-disable-next-line no-undef
  packageRoot: path.resolve(__dirname, '..'),
  vite: {
    resolve: {
      alias: {
        // eslint-disable-next-line no-undef
        '@': path.resolve(__dirname, '..', 'src')
      }
    }
  }
});

export default config;

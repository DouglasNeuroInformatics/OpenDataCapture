import path from 'node:path';

import { defineConfig } from '@open-data-capture/storybook';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        // eslint-disable-next-line no-undef
        '@': path.resolve(__dirname, '..', 'src')
      }
    }
  }
});

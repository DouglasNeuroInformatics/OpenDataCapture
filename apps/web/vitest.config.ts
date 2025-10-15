import * as path from 'node:path';

import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  test: {
    environment: 'happy-dom',
    root: import.meta.dirname
  }
});

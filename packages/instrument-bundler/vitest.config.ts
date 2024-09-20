import path from 'node:path';

import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    alias: {
      '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
    },
    root: import.meta.dirname
  }
});

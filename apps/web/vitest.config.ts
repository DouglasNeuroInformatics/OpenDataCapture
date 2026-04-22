import * as path from 'node:path';

import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    },
    root: import.meta.dirname,
    test: {
      environment: 'happy-dom',
      name: 'web',
      root: import.meta.dirname
    }
  })
);

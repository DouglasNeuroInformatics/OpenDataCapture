import path from 'node:path';

import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      alias: {
        '/runtime/v1': path.resolve(import.meta.dirname, './runtime/v1/dist')
      },
      name: 'instrument-bundler',
      root: import.meta.dirname
    }
  })
);

import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: 'vite-plugin-runtime',
      root: import.meta.dirname
    }
  })
);

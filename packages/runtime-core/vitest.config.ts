import { defineProject, mergeConfig } from 'vitest/config';

import { baseConfig } from '../../vitest.config.js';

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: 'runtime-core',
      root: import.meta.dirname
    }
  })
);

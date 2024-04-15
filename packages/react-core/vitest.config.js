import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      environment: 'happy-dom',
      setupFiles: ['src/testing/setup-tests.ts']
    }
  })
);

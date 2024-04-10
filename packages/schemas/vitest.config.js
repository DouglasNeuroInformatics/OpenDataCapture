import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      include: ['src/**/*'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
    }
  }
});

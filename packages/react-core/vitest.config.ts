import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    root: import.meta.dirname,
    test: {
      environment: 'happy-dom',
      name: 'react-core',
      root: import.meta.dirname
    }
  })
);

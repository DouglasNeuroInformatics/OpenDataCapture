import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    root: import.meta.dirname,
    test: {
      environment: 'happy-dom',
      // Node 25+ defines its own `localStorage` on globalThis, and vitest does not replace globals
      // Node already defines, so happy-dom's storage would never be installed.
      execArgv: ['--no-experimental-webstorage'],
      name: 'react-core',
      root: import.meta.dirname
    }
  })
);

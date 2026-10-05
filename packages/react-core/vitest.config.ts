import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    root: import.meta.dirname,
    test: {
      environment: 'happy-dom',
      // InteractiveContent's iframe points at /runtime/v1, which no server answers under vitest. Without
      // this, happy-dom requests it from whatever is listening on localhost:3000.
      environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
      // Node 25+ defines its own `localStorage` on globalThis, and vitest does not replace globals
      // Node already defines, so happy-dom's storage would never be installed.
      execArgv: ['--no-experimental-webstorage'],
      name: 'react-core',
      root: import.meta.dirname
    }
  })
);

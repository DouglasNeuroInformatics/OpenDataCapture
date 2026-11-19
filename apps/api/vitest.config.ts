import path from 'node:path';

import libnest from '@douglasneuroinformatics/libnest/testing/plugin';
import { defineProject, mergeConfig } from 'vitest/config';
import type { Plugin } from 'vitest/config';

import { baseConfig } from '../../vitest.config';

const [swcPlugin, libnestPlugin] = libnest({
  baseUrl: path.resolve(import.meta.dirname, 'src'),
  paths: {
    '@/*': ['*']
  }
});

const apiFilePattern = new RegExp(`^${(import.meta.dirname + path.sep).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

// libnest exposes no include option and its SWC plugin tries to disable the default transform, so SWC
// would also transform the workspace packages this project imports. SWC source maps place functions
// differently from the Oxc transform every other project uses, which makes merged coverage count each
// of those functions twice, with one copy never hit. SWC is only needed for the decorators in this app.
const apiOnlySwcPlugin: Plugin = {
  ...swcPlugin,
  config: undefined,
  transform(code, id) {
    if (!apiFilePattern.test(id) || typeof swcPlugin.transform !== 'function') {
      return null;
    }
    return swcPlugin.transform.call(this, code, id);
  }
};

export default mergeConfig(
  baseConfig,
  defineProject({
    oxc: {
      exclude: [/\.js$/, apiFilePattern]
    },
    plugins: [apiOnlySwcPlugin, libnestPlugin],
    root: import.meta.dirname,
    test: {
      // The integration suites create users through the real UsersService, which would otherwise ask
      // the Have I Been Pwned API about every password.
      env: { PASSWORD_BREACH_CHECK_ENABLED: 'false' },
      globals: true,
      name: 'api'
    }
  })
);

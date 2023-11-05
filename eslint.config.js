// @ts-check

import path from 'node:path';
import url from 'node:url';

import { createConfig } from '@douglasneuroinformatics/eslint-config';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = createConfig({
  base: {
    env: 'node'
  },
  ts: {
    project: path.resolve(__dirname, 'tsconfig.base.json')
  }
});

const apiConfig = createConfig({
  base: {
    env: 'node',
    filesRoot: 'apps/api/src'
  },
  ts: {
    project: path.resolve(__dirname, 'apps', 'api', 'tsconfig.json')
  }
});

const gatewayConfig = createConfig({
  base: {
    env: 'node',
    filesRoot: 'apps/gateway/src'
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'apps', 'gateway', 'tsconfig.json')
  }
});

// const marketingConfig = createConfig({
//   astro: true,
//   base: {
//     env: 'node',
//     filesRoot: 'apps/marketing/src'
//   },
//   jsx: true,
//   ts: {
//     project: path.resolve(__dirname, 'apps', 'gateway', 'tsconfig.json')
//   }
// });

const webConfig = createConfig({
  base: {
    env: 'browser',
    filesRoot: 'apps/web/src'
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'apps', 'web', 'tsconfig.json')
  }
});

const instrumentsConfig = createConfig({
  base: {
    env: 'browser',
    filesRoot: 'packages/instruments/src'
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'packages', 'instruments', 'tsconfig.json')
  }
});

export default [...baseConfig, ...apiConfig, ...gatewayConfig, ...webConfig, ...instrumentsConfig];

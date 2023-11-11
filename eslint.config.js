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
    fileRoots: ['apps/api/src']
  },
  ts: {
    project: path.resolve(__dirname, 'apps', 'api', 'tsconfig.json')
  }
});

const gatewayConfig = createConfig({
  base: {
    env: 'browser',
    fileRoots: ['apps/gateway-next/src']
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'apps', 'gateway-next', 'tsconfig.json')
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
    fileRoots: ['apps/web/.storybook', 'apps/web/src']
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'apps', 'web', 'tsconfig.json')
  }
});

const reactCoreConfig = createConfig({
  base: {
    env: 'browser',
    fileRoots: ['packages/react-core/.storybook']
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'packages', 'react-core', 'tsconfig.json')
  }
});

const instrumentsConfig = createConfig({
  base: {
    env: 'browser',
    fileRoots: ['packages/instruments/src']
  },
  jsx: true,
  ts: {
    project: path.resolve(__dirname, 'packages', 'instruments', 'tsconfig.json')
  }
});

export default [...baseConfig, ...apiConfig, ...gatewayConfig, ...webConfig, ...reactCoreConfig, ...instrumentsConfig];

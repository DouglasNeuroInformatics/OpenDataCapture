import * as path from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

function getAbsolutePath(value: string): string {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}

const config: StorybookConfig = {
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-themes')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  stories: [
    {
      directory: path.resolve(__dirname, '../../packages/react-core/src/components'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'React Core'
    },
    {
      directory: path.resolve(__dirname, '../../apps/playground/src/components'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Playground Components'
    },
    {
      directory: path.resolve(__dirname, '../../apps/web/src'),
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Web'
    }
  ]
};

export default config;

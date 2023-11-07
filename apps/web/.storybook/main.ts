import path from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    'storybook-react-i18next'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '..', 'src')
        }
      }
    });
  }
};

export default config;

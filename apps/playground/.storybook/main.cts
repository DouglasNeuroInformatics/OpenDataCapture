import type { StorybookConfig } from '@storybook/react-vite';

import path from 'node:path';

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import vite from 'vite';

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes'
  ],
  docs: {
    autodocs: 'tag'
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  viteFinal(config) {
    return vite.mergeConfig(config, {
      css: {
        postcss: {
          plugins: [autoprefixer(), tailwindcss()]
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '..', 'src')
        }
      }
    });
  }
};

export default config;

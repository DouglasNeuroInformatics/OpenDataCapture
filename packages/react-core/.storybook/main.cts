import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { mergeConfig } from 'vite';

import type { StorybookConfig } from '@storybook/react-vite';

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
  viteFinal(config: { [key: string]: any }) {
    return mergeConfig(config, {
      build: {
        target: 'es2022'
      },
      css: {
        postcss: {
          plugins: [autoprefixer(), tailwindcss()]
        }
      },
      optimizeDeps: {
        esbuildOptions: {
          target: 'es2022'
        }
      }
    });
  }
};

export default config;

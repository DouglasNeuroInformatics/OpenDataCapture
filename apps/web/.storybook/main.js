import path from 'node:path';

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { mergeConfig } from 'vite';

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    'storybook-react-i18next'
  ],
  docs: {
    autodocs: 'tag'
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: [
    {
      directory: '../src/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Components'
    },
    {
      directory: '../src/features/auth/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Auth'
    },
    {
      directory: '../src/features/contact/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Contact'
    },
    {
      directory: '../src/features/data-hub/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Data Hub'
    },
    {
      directory: '../src/features/dashboard/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Dashboard'
    },
    {
      directory: '../src/features/instruments/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Instruments'
    },
    {
      directory: '../src/features/session/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Session'
    },
    {
      directory: '../src/features/setup/pages',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'Setup'
    },
    {
      directory: '../src/features/user/components',
      files: '**/*.stories.@(js|jsx|ts|tsx)',
      titlePrefix: 'User'
    }
  ],
  viteFinal(config) {
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [autoprefixer(), tailwindcss()]
        }
      },
      resolve: {
        alias: {
          // eslint-disable-next-line no-undef
          '@': path.resolve(__dirname, '..', 'src')
        }
      }
    });
  }
};

export default config;

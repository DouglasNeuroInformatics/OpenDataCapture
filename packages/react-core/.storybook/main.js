import path from 'path';

import tailwind from '@open-data-capture/vite-plugin-tailwind';
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
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        tailwind({
          content: ['./src/**/*.{js,ts,jsx,tsx}'],
          // eslint-disable-next-line no-undef
          root: path.resolve(__dirname, '..')
        })
      ]
    });
  }
};

export default config;

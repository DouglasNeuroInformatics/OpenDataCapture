const path = require('path');

/** @type {import("@storybook/core-common").StorybookConfig} */
module.exports = {
  stories: [
    {
      directory: path.resolve(__dirname, '..', 'src', 'components'),
      files: '**/*.stories.@(mdx|tsx|ts|jsx|js)'
    }
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite'
  },
  features: {
    storyStoreV7: true
  }
};

const path = require('path');
const { loadConfigFromFile, mergeConfig } = require('vite');

const srcDir = path.resolve(__dirname, '..', 'src');

/** @type {import("@storybook/core-common").StorybookConfig} */
module.exports = {
  stories: [
    {
      directory: path.resolve(srcDir, 'components'),
      files: '**/*.stories.@(mdx|tsx|ts|jsx|js)'
    }
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-react-i18next'
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite'
  },
  features: {
    storyStoreV7: true
  },
  viteFinal: async (config) => {
    const { config: userConfig } = await loadConfigFromFile(path.resolve(__dirname, '../vite.config.js'));

    return mergeConfig(config, {
      ...userConfig,
      // manually specify plugins to avoid conflict
      plugins: []
    });
  }
};

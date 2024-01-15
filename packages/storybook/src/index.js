// @ts-check

import runtime from '@open-data-capture/vite-plugin-runtime';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { mergeConfig } from 'vite';

/**
 * @param {Object} [options]
 * @param {Omit<import('vite').UserConfig, "plugins">} [options.vite]
 * @returns {import('@storybook/react-vite').StorybookConfig}
 */
export function defineConfig(options) {
  return {
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
        plugins: [runtime()],
        ...options?.vite
      });
    }
  };
}

/**
 *
 * @param {Object} [options]
 * @param {import('i18next').i18n} options.i18n
 * @returns {import('@storybook/react').Preview}
 */
export function definePreview(options) {
  return {
    decorators: [
      // @ts-ignore
      withThemeByDataAttribute({
        attributeName: 'data-mode',
        defaultTheme: 'light',
        themes: {
          dark: 'dark',
          light: 'light'
        }
      })
    ],
    globals: {
      locale: 'en',
      locales: {
        en: 'English',
        fr: 'Français'
      }
    },
    parameters: {
      actions: { argTypesRegex: '^on[A-Z].*' },
      controls: {
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/
        }
      },
      i18n: options?.i18n
    }
  };
}

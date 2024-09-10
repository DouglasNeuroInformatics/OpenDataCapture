import { withThemeByDataAttribute } from '@storybook/addon-themes';
import esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import '@douglasneuroinformatics/libui/tailwind/globals.css';
import '../src/services/i18n';

await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

/** @type {import('@storybook/react').Preview} */
const preview = {
  decorators: [
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
    }
  }
};

export default preview;

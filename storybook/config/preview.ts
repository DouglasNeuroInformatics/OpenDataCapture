import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import * as esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

import '@opendatacapture/react-core/globals.css';
import '../../apps/web/src/services/i18n';

await esbuild.initialize({
  wasmURL: esbuildWasmUrl
});

const preview: Preview = {
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
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;

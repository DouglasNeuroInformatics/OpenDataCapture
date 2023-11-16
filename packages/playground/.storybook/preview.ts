import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';

import './tailwind.css';

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

import config from '@douglasneuroinformatics/ui/tailwind.config';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [...config.content, './src/**/*.{js,ts,jsx,tsx}'],
  presets: [config],
  theme: {
    extend: {
      transitionProperty: {
        height: 'height',
        'max-h': 'max-height'
      }
    },
    fontFamily: {
      sans: ['Inter var', ...defaultTheme.fontFamily.sans]
    }
  }
};

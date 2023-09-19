const path = require('path');

const baseConfig = require('@douglasneuroinformatics/ui/tailwind.config.cjs');
const defaultTheme = require('tailwindcss/defaultTheme');

const componentLibraryContent = path.join(
  path.dirname(require.resolve('@douglasneuroinformatics/ui')),
  '**/*.{js,cjs,mjs}'
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', componentLibraryContent],
  presets: [baseConfig],
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
  },
  plugins: [require('@headlessui/tailwindcss'), require('@tailwindcss/container-queries')]
};

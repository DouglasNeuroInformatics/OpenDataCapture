import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      container: {
        center: true
      },
      transitionProperty: {
        mh: 'max-height'
      }
    }
  },
  plugins: [typographyPlugin]
};

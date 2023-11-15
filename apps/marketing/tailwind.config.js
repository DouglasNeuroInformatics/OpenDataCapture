import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  darkMode: 'class',
  plugins: [typographyPlugin],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '4rem',
          sm: '2rem',
          xl: '5rem'
        }
      },
      transitionProperty: {
        mh: 'max-height',
        'opacity-transform': 'opacity, transform'
      }
    }
  }
};

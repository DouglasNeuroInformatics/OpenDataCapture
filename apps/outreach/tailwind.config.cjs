const { createConfig } = require('@open-data-capture/tailwindcss');
const typographyPlugin = require('@tailwindcss/typography');

/** @type {import('tailwindcss').Config} */
module.exports = createConfig({
  content: ['./src/**/*.{astro,html,js,ts}'],
  plugins: [typographyPlugin],
  root: __dirname
});

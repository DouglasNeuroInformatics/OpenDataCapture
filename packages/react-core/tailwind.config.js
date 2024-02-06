// @ts-check

const { createConfig } = require('@open-data-capture/tailwindcss');

export default createConfig({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  root: __dirname
});

// @ts-check

const { createConfig } = require('@open-data-capture/tailwindcss');

module.exports = createConfig({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  include: ['@open-data-capture/react-core'],
  root: __dirname
});

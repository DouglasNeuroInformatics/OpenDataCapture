// @ts-check

const { createConfig } = require('@opendatacapture/tailwindcss');

module.exports = createConfig({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  include: ['@opendatacapture/react-core'],
  root: __dirname
});

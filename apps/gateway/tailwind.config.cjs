const config = require('@open-data-capture/react-core/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ...config.content,
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  presets: [config]
};

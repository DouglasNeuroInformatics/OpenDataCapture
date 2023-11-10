import config from '@open-data-capture/react-core/tailwind.config';

/** @type {import('tailwindcss').Config} */
export default {
  content: [...config.content, './src/**/*.{js,ts,jsx,tsx}'],
  presets: [config]
};

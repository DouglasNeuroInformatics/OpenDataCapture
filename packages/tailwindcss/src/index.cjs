const path = require('path');

const baseConfig = require('@douglasneuroinformatics/ui/tailwind.config.cjs');
const defaultTheme = require('tailwindcss/defaultTheme.js');

/**
 * @param {Object} [options]
 * @param {string[]} [options.content]
 * @param {string[]} [options.include]
 * @param {any[]} [options.plugins]
 * @param {string} [options.root]
 * @returns {import('tailwindcss').Config}
 */
module.exports = function createConfig(options) {
  const content = options?.content ?? [];
  const include = options?.include ?? [];

  /** @type {string[]} */
  const libraryContent = [];
  for (const id of include) {
    try {
      const baseDir = path.dirname(
        require.resolve(`${id}/package.json`, { paths: options?.root ? [options?.root] : undefined })
      );
      libraryContent.push(path.resolve(baseDir, 'src/**/*.{js,ts,jsx,tsx}'));
    } catch (err) {
      console.error(err);
      continue;
    }
  }

  return {
    content: [...baseConfig.content, ...libraryContent, ...content],
    plugins: options?.plugins,
    presets: [baseConfig],
    theme: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans]
      }
    }
  };
};

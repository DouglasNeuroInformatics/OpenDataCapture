const path = require('path');

const baseConfig = require('@douglasneuroinformatics/libui/tailwind.config.cjs');
const defaultTheme = require('tailwindcss/defaultTheme.js');

/** @type {import('./index.d.cts').ConfigFactory} */
exports.createConfig = (options) => {
  const content = options?.content ?? [];
  const include = options?.include ?? [];

  /** @type {string[]} */
  const libraryContent = [];
  for (const id of include) {
    const baseDir = path.dirname(
      require.resolve(`${id}/package.json`, { paths: options?.root ? [options?.root] : undefined })
    );
    libraryContent.push(path.resolve(baseDir, 'src/**/*.{js,ts,jsx,tsx}'));
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

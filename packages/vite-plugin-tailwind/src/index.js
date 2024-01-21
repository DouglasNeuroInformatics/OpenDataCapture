import module from 'module';
import path from 'path';
import process from 'process';

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @ts-ignore @type {import('tailwindcss').Config & { content: string[] }} */
const baseConfig = (await import('@douglasneuroinformatics/ui/tailwind.config')).default;

/**
 * @param {Object} [options]
 * @param {string[]} options.content
 * @param {string[]} options.include
 * @param {string | URL} options.root
 * @returns {import('vite').PluginOption}
 */
const tailwind = ({ content, include, root } = { content: [], include: [], root: process.cwd() }) => {
  const require = module.createRequire(root);
  
  /** @type {string[]} */
  const libraryContent = [];
  for (const id of include) {
    try {
      const baseDir = path.dirname(require.resolve(`${id}/package.json`));
      libraryContent.push(path.resolve(baseDir, 'src/**/*.{js,ts,jsx,tsx}'));
    } catch (err) {
      console.error(err);
      continue;
    }
  }

  return {
    config() {
      return {
        css: {
          postcss: {
            plugins: [
              tailwindcss({
                content: [...baseConfig.content, ...libraryContent, ...content],
                presets: [baseConfig],
                theme: {
                  fontFamily: {
                    sans: ['Inter var', ...defaultTheme.fontFamily.sans]
                  }
                }
              }),
              autoprefixer
            ]
          }
        }
      };
    },
    name: 'vite-plugin-tailwind'
  };
};

export default tailwind;

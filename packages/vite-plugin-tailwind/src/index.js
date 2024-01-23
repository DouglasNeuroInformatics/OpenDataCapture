import module from 'module';
import path from 'path';
import process from 'process';

// @ts-ignore
import _baseConfig from '@douglasneuroinformatics/ui/tailwind.config';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme.js';

/** @type {import('tailwindcss').Config & { content: string[] }} */
const baseConfig = _baseConfig;

/**
 * @param {Object} [options]
 * @param {string[]} [options.content]
 * @param {string[]} [options.include]
 * @param {string | URL} [options.root]
 * @returns {import('vite').PluginOption}
 */
const tailwind = (options) => {
  const content = options?.content ?? [];
  const include = options?.include ?? [];
  const root = options?.root ?? process.cwd();

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

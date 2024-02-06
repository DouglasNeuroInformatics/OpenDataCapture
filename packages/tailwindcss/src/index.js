import module from 'module';
import path from 'path';
import process from 'process';

import baseConfig from '@douglasneuroinformatics/ui/tailwind.config.cjs';
import defaultTheme from 'tailwindcss/defaultTheme.js';

/**
 * @param {Object} [options]
 * @param {string[]} [options.content]
 * @param {string[]} [options.include]
 * @param {string | URL} [options.root]
 * @returns {import('tailwindcss').Config}
 */
export function createConfig(options) {
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
    content: [...baseConfig.content, ...libraryContent, ...content],
    presets: [baseConfig],
    theme: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans]
      }
    }
  };
}

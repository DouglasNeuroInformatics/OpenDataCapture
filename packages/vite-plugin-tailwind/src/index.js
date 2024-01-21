import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @ts-ignore @type {import('tailwindcss').Config & { content: string[] }} */
const baseConfig = (await import('@douglasneuroinformatics/ui/tailwind.config')).default;

/**
 * @param {Object} [options]
 * @param {string[]} options.content
 * @returns {import('vite').PluginOption}
 */
const tailwind = ({ content } = { content: [] }) => {
  return {
    config() {
      return {
        css: {
          postcss: {
            plugins: [
              tailwindcss({
                content: [...baseConfig.content, ...content],
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

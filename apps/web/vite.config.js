// @ts-check

import path from 'path';
import url from 'url';

import importMetaEnv from '@import-meta-env/unplugin';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import copy from 'rollup-plugin-copy';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Recurse through the combined translations and include only the provided locale
 * @param {Record<string, any>} translations
 * @param {string} locale
 * @returns {Record<string, any>}
 */
const transformTranslations = (translations, locale) => {
  const isPlainObject = Object.getPrototypeOf(translations) === Object.prototype;
  if (!isPlainObject) {
    throw new Error('Invalid format of translations: must be plain object');
  }
  const result = {};
  for (const key in translations) {
    if (Object.hasOwn(translations[key], locale)) {
      result[key] = translations[key][locale];
    } else {
      result[key] = transformTranslations(translations[key], locale);
    }
  }
  return result;
};

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  },
  plugins: [
    react(),
    viteCompression(),
    importMetaEnv.vite({
      example: path.resolve(projectDir, '.env.public')
    }),
    copy({
      copySync: true,
      hook: 'buildStart',
      targets: [
        {
          dest: 'dist/locales/en',
          src: 'src/translations/*',
          transform: (contents) => {
            const translations = JSON.parse(contents.toString());
            return JSON.stringify(transformTranslations(translations, 'en'), null, 2);
          }
        }
      ]
    }),
    {
      apply: 'build',
      name: 'inject-analytics-script',
      transformIndexHtml: () => {
        if (!(process.env.PLAUSIBLE_BASE_URL && process.env.PLAUSIBLE_DATA_DOMAIN)) {
          return;
        }
        return [
          {
            attrs: {
              'data-api': process.env.PLAUSIBLE_BASE_URL + '/api/event',
              'data-domain': process.env.PLAUSIBLE_DATA_DOMAIN,
              defer: true,
              src: process.env.PLAUSIBLE_BASE_URL + '/js/script.js'
            },
            tag: 'script'
          }
        ];
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectDir, 'src')
    }
  },
  server: {
    port: parseInt(process.env.WEB_DEV_SERVER_PORT ?? '3000'),
    proxy: {
      '/api/': {
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: {
          host: 'localhost',
          port: parseInt(process.env.API_DEV_SERVER_PORT ?? '5500')
        }
      }
    }
  }
});

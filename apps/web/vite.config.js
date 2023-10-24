// @ts-check

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import { transformTranslations } from '@douglasneuroinformatics/ui';
import importMetaEnv from '@import-meta-env/unplugin';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import copy from 'rollup-plugin-copy';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

/** @returns {import('vite').Plugin} */
const analyticsPlugin = () => ({
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
});

/** @returns {import('vite').Plugin} */
const translationsPlugin = () => ({
  ...copy({
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
  configureServer(server) {
    server.middlewares.use('/locales', (req, res, next) => {
      const [locale, namespace] = req.url?.split('/').filter(Boolean) ?? [];
      if (locale && namespace) {
        const translationsFile = path.resolve(projectDir, 'src', 'translations', namespace);
        fs.readFile(translationsFile, 'utf8')
          .then((text) => JSON.parse(text))
          .then((translations) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(transformTranslations(translations, locale)));
          })
          .catch((error) => {
            console.error(error);
            next(new Error(`Failed to read file: ${translationsFile}`));
          });
      } else {
        next();
      }
    });
  }
});

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
  optimizeDeps: {
    exclude: ['@douglasneuroinformatics/ui']
  },
  plugins: [
    react(),
    viteCompression(),
    importMetaEnv.vite({
      example: path.resolve(projectDir, '.env.public')
    }),
    analyticsPlugin(),
    translationsPlugin()
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

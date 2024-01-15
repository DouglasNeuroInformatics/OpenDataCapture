// @ts-check

import path from 'path';
import url from 'url';

import importMetaEnv from '@import-meta-env/unplugin';
import plausible from '@open-data-capture/vite-plugin-plausible';
import runtime from '@open-data-capture/vite-plugin-runtime';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

import { translations } from './config/translations';

const projectDir = path.dirname(url.fileURLToPath(import.meta.url));

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
    plausible({
      baseUrl: process.env.PLAUSIBLE_BASE_URL,
      dataDomain: process.env.PLAUSIBLE_DATA_DOMAIN
    }),
    react(),
    viteCompression(),
    importMetaEnv.vite({
      example: path.resolve(projectDir, '.env.public')
    }),
    translations(),
    runtime()
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

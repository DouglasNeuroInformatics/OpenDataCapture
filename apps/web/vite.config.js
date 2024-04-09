import module from 'module';
import path from 'path';

import importMetaEnv from '@import-meta-env/unplugin';
import plausible from '@opendatacapture/vite-plugin-plausible';
import runtime from '@opendatacapture/vite-plugin-runtime';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

import { translations } from './config/translations';

const require = module.createRequire(import.meta.url);

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    target: 'es2022'
  },
  css: {
    postcss: {
      plugins: [autoprefixer(), tailwindcss()]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    },
    force: true
  },
  plugins: [
    plausible({
      baseUrl: process.env.PLAUSIBLE_BASE_URL,
      dataDomain: process.env.PLAUSIBLE_DATA_DOMAIN
    }),
    react(),
    viteCompression(),
    importMetaEnv.vite({
      example: path.resolve(import.meta.dirname, '.env.public')
    }),
    translations(),
    runtime()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      react: path.dirname(require.resolve('react/package.json')),
      'react-dom': path.dirname(require.resolve('react-dom/package.json'))
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

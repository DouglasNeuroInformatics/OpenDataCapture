import path from 'path';
import url from 'url';

import runtime from '@open-data-capture/vite-plugin-runtime';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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
    exclude: ['@swc/wasm-web']
  },
  plugins: [react(), runtime()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: parseInt(process.env.PLAYGROUND_DEV_SERVER_PORT ?? '3750')
  }
});

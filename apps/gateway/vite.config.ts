import path from 'path';

import { runtime } from '@opendatacapture/vite-plugin-runtime';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    sourcemap: true,
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
    include: ['react/*', 'react-dom/*']
  },
  plugins: [
    react(),
    runtime({
      disabled: mode === 'test'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  ssr: {
    noExternal: true
  }
}));

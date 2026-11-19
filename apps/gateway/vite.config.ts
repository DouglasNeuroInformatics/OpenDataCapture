import path from 'node:path';

import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    sourcemap: true,
    target: 'es2022'
  },
  optimizeDeps: {
    include: ['react/*', 'react-dom/*'],
    rolldownOptions: {
      transform: {
        target: 'es2022'
      }
    }
  },
  plugins: [
    react(),
    runtime({
      disabled: mode === 'test',
      rootDir: import.meta.dirname
    }) as any,
    tailwindcss()
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

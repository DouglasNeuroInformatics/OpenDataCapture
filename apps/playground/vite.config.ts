import path from 'path';

import runtime from '@opendatacapture/vite-plugin-runtime';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    rollupOptions: {
      external: ['esbuild']
    },
    sourcemap: true,
    target: 'es2022'
  },
  define: {
    __GITHUB_REPO_URL__: `'${process.env.GITHUB_REPO_URL ?? '#'}'`
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    },
    exclude: ['@swc/wasm-web'],
    include: ['react/*', 'react-dom/*']
  },
  plugins: [
    react(),
    runtime({
      disabled: mode === 'test',
      rootDir: import.meta.dirname
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  },
  server: {
    port: parseInt(process.env.PLAYGROUND_DEV_SERVER_PORT ?? '3750')
  }
}));

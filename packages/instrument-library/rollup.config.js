// @ts-check

import path from 'path';
import url from 'url';

import raw from '@open-data-capture/rollup-plugin-raw';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  external: [/^\/runtime\/.*$/],
  input: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    dir: path.resolve(__dirname, 'dist'),
    format: 'es',
    generatedCode: 'es2015'
  },
  plugins: [
    raw(),
    resolve({
      browser: true,
      extensions: ['.js', '.ts']
    }),
    typescript()
  ]
});

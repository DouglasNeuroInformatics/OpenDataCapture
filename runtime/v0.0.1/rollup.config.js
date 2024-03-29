import path from 'path';
import url from 'url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const OUT_DIR = path.resolve(__dirname, 'dist');
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const MODE = /** @type {'development' | 'production'} */ ('development');

export default defineConfig([
  {
    input: {
      '_internal/bootstrap': path.resolve(__dirname, 'src', '_internal', 'bootstrap.ts'),
      core: path.resolve(__dirname, 'src', 'core.ts'),
      jspsych: path.resolve(__dirname, 'src', 'jspsych.ts'),
      react: path.resolve(__dirname, 'src', 'react.ts'),
      'react-dom/client': path.resolve(__dirname, 'src', 'react-dom', 'client.ts'),
      zod: path.resolve(__dirname, 'src', 'zod.ts')
    },
    output: {
      dir: OUT_DIR,
      format: 'es',
      generatedCode: 'es2015',
      interop: 'auto',
      plugins: MODE === 'production' ? [terser()] : undefined
    },
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        extensions: ['.js', '.ts'],
        rootDir: ROOT_DIR
      }),
      replace({
        preventAssignment: false,
        'process.env.NODE_ENV': `"${MODE}"`
      }),
      json(),
      typescript()
    ]
  },
  {
    input: {
      core: path.resolve(__dirname, 'src', 'core.ts'),
      jspsych: path.resolve(__dirname, 'src', 'jspsych.ts'),
      react: path.resolve(__dirname, 'src', 'react.ts'),
      'react-dom/client': path.resolve(__dirname, 'src', 'react-dom', 'client.ts'),
      zod: path.resolve(__dirname, 'src', 'zod.ts')
    },
    output: [
      {
        dir: OUT_DIR,
        format: 'es'
      }
    ],
    plugins: [
      resolve({
        browser: true,
        extensions: ['.js', '.ts'],
        rootDir: ROOT_DIR
      }),
      json(),
      dts({
        respectExternal: true
      })
    ]
  }
]);

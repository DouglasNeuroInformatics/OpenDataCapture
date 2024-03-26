import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const OUT_DIR = path.resolve(import.meta.dirname, 'dist');
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');

const MODE = /** @type {'development' | 'production'} */ ('development');

export default defineConfig([
  {
    input: {
      '_internal/bootstrap': path.resolve(import.meta.dirname, 'src', '_internal', 'bootstrap.ts'),
      '_legacy/jquery-1.12.4': path.resolve(import.meta.dirname, 'src', '_legacy', 'jquery-1.12.4.js'),
      core: path.resolve(import.meta.dirname, 'src', 'core.ts'),
      jspsych: path.resolve(import.meta.dirname, 'src', 'jspsych.ts'),
      react: path.resolve(import.meta.dirname, 'src', 'react.ts'),
      'react-dom/client': path.resolve(import.meta.dirname, 'src', 'react-dom', 'client.ts'),
      zod: path.resolve(import.meta.dirname, 'src', 'zod.ts')
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
      core: path.resolve(import.meta.dirname, 'src', 'core.ts'),
      jspsych: path.resolve(import.meta.dirname, 'src', 'jspsych.ts'),
      react: path.resolve(import.meta.dirname, 'src', 'react.ts'),
      'react-dom/client': path.resolve(import.meta.dirname, 'src', 'react-dom', 'client.ts'),
      zod: path.resolve(import.meta.dirname, 'src', 'zod.ts')
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

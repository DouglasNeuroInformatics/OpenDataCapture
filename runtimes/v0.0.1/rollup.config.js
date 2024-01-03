import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const OUT_DIR = path.resolve(import.meta.dir, 'dist');
const ROOT_DIR = path.resolve(import.meta.dir, '..', '..');
const SRC_DIR = path.resolve(import.meta.dir, 'src');

export default defineConfig([
  {
    input: {
      index: path.resolve(SRC_DIR, 'index.ts'),
    },
    output: {
      dir: OUT_DIR,
      format: 'es',
      generatedCode: 'es2015',
      plugins: [terser()]
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
        'process.env.NODE_ENV': '"production"'
      }),
      typescript()
    ]
  },
  {
    input: {
      index: path.resolve(SRC_DIR, 'index.ts'),
    },
    output: [
      {
        dir: OUT_DIR,
        format: 'es'
      }
    ],
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  }
]);

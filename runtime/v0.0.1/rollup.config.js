// @ts-check

import path from 'path';
import url from 'url';

import commonjs from '@rollup/plugin-commonjs';
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
      core: path.resolve(__dirname, 'src', 'core.ts'),
      react: path.resolve(__dirname, 'src', 'react.ts'),
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
      typescript()
    ]
  },
  {
    input: {
      core: path.resolve(__dirname, 'src', 'core.ts'),
      react: path.resolve(__dirname, 'src', 'react.ts'),
      zod: path.resolve(__dirname, 'src', 'zod.ts')
    },
    output: [
      {
        dir: OUT_DIR,
        format: 'es'
      }
    ],
    plugins: [
      dts({
        compilerOptions: {
          paths: {
            '@open-data-capture/common/*': [path.resolve(ROOT_DIR, 'packages/common/src/*')]
          }
        },
        respectExternal: true
      })
    ]
  }
]);

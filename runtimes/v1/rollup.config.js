// @ts-check

import path from 'path';
import url from 'url';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: path.resolve(__dirname, 'index.ts'),
    output: [
      {
        file: path.resolve(__dirname, 'dist', 'index.js'),
        format: 'es',
        generatedCode: 'es2015'
      }
    ],
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        extensions: ['.js', '.ts'],
        rootDir
      }),
      replace({
        preventAssignment: false,
        'process.env.NODE_ENV': '"production"'
      }),
      terser(),
      typescript()
    ]
  },
  {
    input: path.resolve(__dirname, 'index.ts'),
    output: [
      {
        file: path.resolve(__dirname, 'dist', 'index.d.ts'),
        format: 'esm'
      }
    ],
    plugins: [
      dts({
        compilerOptions: {
          paths: {
            '@open-data-capture/common/*': [path.resolve(rootDir, 'packages/common/src/*')]
          }
        },
        respectExternal: true
      })
    ]
  }
];

export default config;

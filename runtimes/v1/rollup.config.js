// @ts-check

import path from 'path';
import url from 'url';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: path.resolve(__dirname, 'index.ts'),
    output: [
      {
        file: path.resolve(__dirname, 'dist', 'index.js'),
        format: 'es',
        generatedCode: 'es2015'
        // name: 'Runtime'
      }
    ],
    plugins: [
      commonjs(),
      resolve({
        browser: true,
        rootDir: path.resolve(__dirname, '..', '..')
      }),
      replace({
        preventAssignment: false,
        'process.env.NODE_ENV': '"production"'
      }),
      terser()
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
    plugins: [dts({ respectExternal: true })]
  }
];

export default config;

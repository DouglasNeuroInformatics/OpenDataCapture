// @ts-check

import path from 'path';
import url from 'url';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dts } from 'rollup-plugin-dts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: path.resolve(__dirname, 'index.ts'),
    output: [
      {
        file: path.resolve(__dirname, 'dist', 'index.js'),
        format: 'iife',
        generatedCode: 'es2015',
        name: 'Runtime'
      }
    ],
    plugins: [
      nodeResolve({
        browser: true,
        rootDir: path.resolve(__dirname, '..', '..')
      })
    ]
  },
  {
    input: path.resolve(__dirname, 'index.ts'),
    output: [
      {
        file: path.resolve(__dirname, 'dist', 'index.d.ts'),
        format: 'es'
      }
    ],
    plugins: [dts({ respectExternal: true })]
  }
];

export default config;

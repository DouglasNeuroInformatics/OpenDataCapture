// @ts-check

import fs from 'fs/promises';
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
const SRC_DIR = path.resolve(import.meta.dirname, 'src');
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');

const MODE = /** @type {'development' | 'production'} */ ('development');

/** @typedef {import('rollup').RollupOptions & { input: Record<string, string> }} RollupOptions */

/** @type {RollupOptions} */
const sourceOptions = {
  input: {},
  output: {
    dir: OUT_DIR,
    format: 'es',
    generatedCode: 'es2015',
    interop: 'auto',
    plugins: MODE === 'production' ? [terser()] : [],
    sourcemap: true
  },
  plugins: [
    commonjs({
      exclude: ['**/*/jquery.js']
    }),
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
};

/** @type {RollupOptions} */
const declarationOptions = {
  input: {},
  output: {
    dir: OUT_DIR,
    format: 'es'
  },
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
};

/** @type {(dir: string) => AsyncGenerator<string>} */
async function* walk(dir) {
  for await (const dirent of await fs.opendir(dir)) {
    const entry = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walk(entry);
    } else if (dirent.isFile()) {
      yield entry;
    }
  }
}

/** @type {(filepath: string, suffixes: string[]) => string} */
function createInputKey(filepath, suffixes) {
  for (const suffix of suffixes) {
    if (filepath.endsWith(suffix)) {
      // SRC_DIR.length + 1 is to include the trailing slash
      return filepath.slice(SRC_DIR.length + 1, filepath.length - suffix.length);
    }
  }
  throw new Error(`Failed to match any target suffixes '${suffixes.join(', ')}' for target: ${filepath}`);
}

for await (const filepath of walk(SRC_DIR)) {
  if (filepath.endsWith('.d.ts')) {
    declarationOptions.input[createInputKey(filepath, ['.d.ts'])] = filepath;
  } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
    declarationOptions.input[createInputKey(filepath, ['.ts', '.tsx'])] = filepath;
    sourceOptions.input[createInputKey(filepath, ['.ts', '.tsx'])] = filepath;
  } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
    sourceOptions.input[createInputKey(filepath, ['.js', '.jsx'])] = filepath;
  } else {
    throw new Error(`Unexpected file extension '${path.extname(filepath)}' for file: ${filepath}`);
  }
}

export default defineConfig([sourceOptions, declarationOptions]);

#!/usr/bin/env node

import path from 'path';

import esbuild from 'esbuild';

const entryFile = path.resolve(import.meta.dirname, '../src/index.ts');

/**
 * Parse a command line argument in the format --name=value
 * @template {(value: string) => any} T
 * @param {string} name
 * @param {T} transform
 * @returns {ReturnType<T>}
 */
function parseOption(name, transform) {
  const prefix = `--${name}=`;
  for (const arg of process.argv) {
    if (arg.startsWith(prefix)) {
      return transform(arg.slice(prefix.length));
    }
  }
  throw new Error(`Missing required option '${name}'`);
}

/** @type {import('../src/client.js').ClientParams} */
const clientParams = {
  baseUrl: parseOption('base-url', (value) => value)
};

/** @type {import('../src/config.js').ConfigParams} */
const configParams = {
  type: parseOption('type', (value) => {
    if (value === 'average' || value === 'smoke' || value === 'stress') {
      return value;
    }
    throw new Error(`Invalid test type '${value}'`);
  })
};

/** @type {import('esbuild').BuildOptions} */
const options = {
  banner: {
    js: [
      `const __CLIENT_PARAMS = JSON.parse('${JSON.stringify(clientParams)}')`,
      `const __CONFIG_PARAMS = JSON.parse('${JSON.stringify(configParams)}')`
    ].join('\n')
  },
  bundle: true,
  entryPoints: [entryFile],
  external: ['k6'],
  format: 'esm',
  target: 'es2015'
};

await esbuild.build(options);

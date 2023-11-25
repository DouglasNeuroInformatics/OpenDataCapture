// @ts-check

import fs from 'fs';
import module from 'module';
import path from 'path';
import url from 'url';

import { dts } from 'rollup-plugin-dts';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const require = module.createRequire(__dirname);

/**
 * Returns the absolute path to the types file for the provided package, or throws
 * @param {string} packageName
 */
const resolveTypeEntry = (packageName) => {
  const pkgJSONFile = require.resolve(`${packageName}/package.json`);
  if (!pkgJSONFile) {
    throw new Error(`Failed to resolve package: ${packageName}`);
  }
  const libDir = path.dirname(pkgJSONFile);
  /** @type {import('type-fest').PackageJson} */
  const pkg = JSON.parse(fs.readFileSync(pkgJSONFile, 'utf-8'));
  const inputFilename = pkg.types || pkg.typings;
  if (!inputFilename) {
    throw new Error(`File 'package.json' for package '${packageName}' does not contain key 'types' or 'typings'`);
  }
  return path.resolve(libDir, inputFilename);
};

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: path.resolve(__dirname, 'src', 'env.d.ts'),
    output: [{ file: path.resolve(__dirname, 'dist', 'lib.d.ts'), format: 'es' }],
    plugins: [dts({ respectExternal: true })]
  },
  {
    input: resolveTypeEntry('@types/react'),
    output: [{ file: path.resolve(__dirname, 'dist', 'react.d.ts'), format: 'es' }],
    plugins: [dts({ respectExternal: true })]
  }
];

export default config;

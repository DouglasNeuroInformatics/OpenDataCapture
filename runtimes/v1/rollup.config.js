// @ts-check

import { resolveSync } from 'bun';
import fs from 'fs';
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const OUT_DIR = path.resolve(import.meta.dir, 'dist');
const ROOT_DIR = path.resolve(import.meta.dir, '..', '..');

/**
 * Returns whether `exports` is a plain object, and therefore matches `ExportConditions`
 * @param {import('type-fest').PackageJson.Exports} [exports]
 * @returns {exports is import('type-fest').PackageJson.ExportConditions}
 */
function isExportConditions(exports) {
  if (typeof exports !== 'object' || exports === null) {
    return false;
  }
  return Object.getPrototypeOf(exports) === Object.prototype;
}

/**
 * Returns `exports['.'].types` if it is a string, otherwise returns null
 * @param {import('type-fest').PackageJson} pkg
 * @returns
 */
function parseExportConditions(pkg) {
  if (isExportConditions(pkg.exports) && isExportConditions(pkg.exports['.'])) {
    const value = pkg.exports['.'].types;
    return typeof value === 'string' ? value : null;
  }
  return null;
}

/**
 * Attempts to resolve the entry point for the type declarations for `id` in the package.json. If
 * no type declarations are found, returns null.
 * @param {string} id
 * @returns {string | null}
 */
function parseTypesEntry(id) {
  let pkgJsonFilepath;
  try {
    pkgJsonFilepath = resolveSync(`${id}/package.json`, import.meta.dir);
  } catch (err) {
    return null;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgJsonFilepath, 'utf-8'));
  const pkgDir = path.dirname(pkgJsonFilepath);
  if (!pkg) {
    return null;
  }
  const filename = parseExportConditions(pkg) ?? pkg.types ?? pkg.typings;
  if (!filename) {
    return null;
  }
  return path.resolve(pkgDir, filename);
}

/**
 *  Returns the relative paths for all referenced paths in the file content
 * @param {string} filepath - the absolute path to the entry type declarations
 * @returns {Record<string, string>}
 */
function getReferenceEntries(filepath) {
  /** @type {Record<string, string>} */
  const matches = {};
  const content = fs.readFileSync(filepath, 'utf-8');
  const regex = /<reference\s+path="([^"]+)"/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const relPath = match[1];
    const absPath = path.resolve(path.dirname(filepath), relPath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Resolved path for referenced file does not exist: ${absPath}`);
    }
    matches[relPath.replace(/\.d\.ts$/, '')] = absPath;
  }
  return matches;
}

/**
 * Attempt to parse the entry points for the module. If they cannot be resolved, throws an exception.
 * @param {string} id
 */
function resolveModule(id) {
  const mainEntry = resolveSync(id, import.meta.dir);
  const typesEntry = parseTypesEntry(id) ?? parseTypesEntry(`@types/${id}`);
  if (!typesEntry) {
    throw new Error(`Failed to resolve types for module: ${id}`);
  }
  return {
    main: {
      [id]: mainEntry
    },
    types: {
      [id]: typesEntry,
      ...getReferenceEntries(typesEntry)
    }
  };
}

/**
 * @param {{ main?: string | Record<string, string>, types?: string | Record<string, string> }} args
 * @returns {import('rollup').RollupOptions[]}
 */
function createModuleConfig({ main, types }) {
  /** @type {import('rollup').RollupOptions[]} */
  const items = [];
  main &&
    items.push({
      input: main,
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
    });
  types &&
    items.push({
      input: types,
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
    });
  return items;
}

/**
 * Returns the config for the entry point to the module and the type declarations
 * @param {string} id
 * @returns {import('rollup').RollupOptions[]}
 */
function createExternalModuleConfig(id) {
  return createModuleConfig(resolveModule(id));
}

const externalPackages = ['react', 'zod'];

/** @type {import('rollup').RollupOptions[]} */
export default externalPackages.flatMap(createExternalModuleConfig).concat(
  createModuleConfig({
    main: path.resolve(import.meta.dir, 'core.ts'),
    types: path.resolve(import.meta.dir, 'core.ts')
  })
);

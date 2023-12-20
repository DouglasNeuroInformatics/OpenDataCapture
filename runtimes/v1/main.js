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
 * @param {import('type-fest').PackageJson.Exports} [exports ]
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
 * Attempt to parse the entry points for the module. If they cannot be resolved, throws an exception.
 * @param {string} id
 * @returns {{ main: string, types: string }}
 */
function resolveModule(id) {
  const main = resolveSync(id, import.meta.dir);
  const types = parseTypesEntry(id) ?? parseTypesEntry(`@types/${id}`);
  if (!types) {
    throw new Error(`Failed to resolve types for module: ${id}`);
  }
  return { main, types };
}

/**
 *  Returns the relative paths for all referenced paths in the file content
 * @param {string} filepath - the absolute path to the entry type declarations
 * @returns {Record<string, string>}
 */
function getReferencePaths(filepath) {
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
    matches[relPath] = absPath;
  }
  return matches;
}

const { types } = resolveModule('react');

console.log(getReferencePaths(types));

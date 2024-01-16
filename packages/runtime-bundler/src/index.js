import fs from 'fs';
import module from 'module';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const require = module.createRequire(__dirname);

/** @typedef {import('type-fest').PackageJson} PackageJson */
/** @typedef {import('type-fest').PackageJson.ExportConditions} ExportConditions */

/**
 * @param {PackageJson['exports']} [exports]
 * @returns {exports is ExportConditions}
 */
function isExportConditions(exports) {
  if (typeof exports !== 'object' || exports === null) {
    return false;
  }
  return Object.getPrototypeOf(exports) === Object.prototype;
}

/**
 * Returns `exports['.'].types` if it is a string, otherwise returns null
 * @param {PackageJson} pkg
 * @returns {string | null}
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
    pkgJsonFilepath = require.resolve(`${id}/package.json`);
  } catch (err) {
    return null;
  }
  /** @type {PackageJson} */
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
 * Returns the relative paths for all referenced paths in the file content
 * @param {string} filepath
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
 * @returns {{ main: Record<string, string>, types: Record<string, string> }}
 */
export function resolveModule(id) {
  const mainEntry = require.resolve(id);
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

import { resolveSync } from 'bun';
import fs from 'fs';
import path from 'path';

import type { PackageJson } from 'type-fest';

function isExportConditions(exports?: PackageJson.Exports): exports is PackageJson.ExportConditions {
  if (typeof exports !== 'object' || exports === null) {
    return false;
  }
  return Object.getPrototypeOf(exports) === Object.prototype;
}

/** Returns `exports['.'].types` if it is a string, otherwise returns null */
function parseExportConditions(pkg: PackageJson) {
  if (isExportConditions(pkg.exports) && isExportConditions(pkg.exports['.'])) {
    const value = pkg.exports['.'].types;
    return typeof value === 'string' ? value : null;
  }
  return null;
}

/**
 * Attempts to resolve the entry point for the type declarations for `id` in the package.json. If
 * no type declarations are found, returns null.
 */
function parseTypesEntry(id: string) {
  let pkgJsonFilepath;
  try {
    pkgJsonFilepath = resolveSync(`${id}/package.json`, import.meta.dir);
  } catch (err) {
    return null;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgJsonFilepath, 'utf-8')) as PackageJson;
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

/** Returns the relative paths for all referenced paths in the file content */
function getReferenceEntries(filepath: string) {
  /** @type {Record<string, string>} */
  const matches: Record<string, string> = {};
  const content = fs.readFileSync(filepath, 'utf-8');
  const regex = /<reference\s+path="([^"]+)"/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const relPath = match[1]!;
    const absPath = path.resolve(path.dirname(filepath), relPath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Resolved path for referenced file does not exist: ${absPath}`);
    }
    matches[relPath.replace(/\.d\.ts$/, '')] = absPath;
  }
  return matches;
}

/** Attempt to parse the entry points for the module. If they cannot be resolved, throws an exception. */
export function resolveModule(id: string) {
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

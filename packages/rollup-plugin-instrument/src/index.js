/// @ts-check
/// <reference lib="es2022" />

import { lstatSync, readFileSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import mime from 'mime/lite';

/**
 * Returns the directory containing parent if it is a file, parent if it is a dir, otherwise throws
 * @param {string} parent
 */
async function resolveBaseDir(parent) {
  const stats = await fs.lstat(parent);
  if (stats.isDirectory()) {
    return parent;
  } else if (stats.isFile()) {
    return path.dirname(parent);
  }
  throw new Error(`Invalid path ${parent}: must be valid file or directory`);
}

/**
 * Throw an error if the filepath does not exist or is not a file
 * @param {string} filepath
 * @param {Object} options
 * @param {string} options.fnName - the name of the function calling
 * @param {string} options.relpath - the relative path for error message
 */
function checkIsFile(filepath, { fnName, relpath }) {
  const stats = lstatSync(filepath);
  if (stats.isDirectory()) {
    throw new Error(`Invalid argument "${relpath}" for ${fnName}: resolved filepath "${filepath}" is a directory`);
  } else if (!stats.isFile()) {
    throw new Error(`Invalid argument "${relpath}" for ${fnName} resolved filepath "${filepath}" is not a file`);
  }
}

/**
 * Replace all import.meta.encodeImage(filepath) calls with the base64-encoded string
 * @param {string} source - the source code
 * @param {string} parent - the directory from which all relative paths should be resolved (or a file, in which case the directory name where the file is located will be used)
 * @returns {Promise<string>} the source code with import.meta.encodeImage calls replaced with file contents, encoded according as base64 in the following format: data:[<mediatype>][;base64],<data>
 */
async function encodeImages(source, parent) {
  const baseDir = await resolveBaseDir(parent);
  const regex = /import\.meta\.encodeImage\((.*?)\)/g;
  return source.replaceAll(regex, (substring) => {
    const relpath = substring.match(/import\.meta\.encodeImage\((['"`])(.*?)\1\)/)?.at(2);
    if (!relpath) {
      throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
    }
    const filepath = path.resolve(baseDir, relpath);
    checkIsFile(filepath, { fnName: 'import.meta.encodeImage', relpath });
    const data = readFileSync(filepath, 'base64');
    const mimeType = mime.getType(filepath);
    return `'data:${mimeType};base64,${data}'`;
  });
}

/**
 * Replace all import.meta.injectStyles(filepath) calls with the resolved styles
 * @param {string} source - the source code
 * @param {string} parent - the directory from which all relative paths should be resolved (or a file, in which case the directory name where the file is located will be used)
 * @returns {Promise<string>}
 */
async function injectStylesheets(source, parent) {
  const baseDir = await resolveBaseDir(parent);
  const regex = /import\.meta\.injectStylesheet\((.*?)\)/g;
  return source.replaceAll(regex, (substring) => {
    const relpath = substring.match(/import\.meta\.injectStylesheet\((['"`])(.*?)\1\)/)?.at(2);
    if (!relpath) {
      throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
    }
    const filepath = path.resolve(baseDir, relpath);
    checkIsFile(filepath, { fnName: 'import.meta.injectStylesheet', relpath });
    const styles = readFileSync(filepath, 'utf-8');
    const mimeType = mime.getType(filepath);
    console.log(mimeType);
    return styles;
  });
}

/**
 * Encode all static assets to be injected via import.meta calls
 * @param {string} source - the source code
 * @param {string} parent - the directory from which all relative paths should be resolved (or a file, in which case the directory name where the file is located will be used)
 * @returns {Promise<string>}
 */
async function encodeAssets(source, parent) {
  const withImages = await encodeImages(source, parent);
  const withStyles = await injectStylesheets(withImages, parent);
  return withStyles;
}

/** @returns {import('rollup').Plugin} */
const instrument = () => {
  const transformer = new InstrumentTransformer();
  const suffix = '?instrument';
  /** @param {string} filename */
  const removeSuffix = (filename) => filename.slice(0, filename.length - suffix.length);
  return {
    async load(id) {
      if (id.endsWith(suffix)) {
        const filepath = removeSuffix(id);
        const source = await fs.readFile(filepath, 'utf-8');
        const encoded = await encodeAssets(source, filepath);
        const bundle = await transformer.generateBundle(encoded);
        this.addWatchFile(filepath);
        return { code: `export default { bundle: ${JSON.stringify(bundle)}, source: ${JSON.stringify(source)} }` };
      }
      return null;
    },
    name: 'instrument',
    async resolveId(source, importer) {
      if (source.endsWith(suffix)) {
        const realSource = removeSuffix(source);
        const abspath = await this.resolve(realSource, importer);
        if (!abspath) {
          throw new Error(`Failed to resolve file: ${realSource}`);
        }
        return abspath.id + suffix;
      }
      return null;
    }
  };
};

export default instrument;

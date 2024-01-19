import { lstatSync, readFileSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import mime from 'mime/lite';

/**
 * Replace all import.meta.encode(filepath) calls with the base64-encoded string
 * @param {string} source - the source code
 * @param {string} parent - the directory from which all relative paths should be resolved (or a file, in which case the directory name where the file is located will be used)
 * @returns {Promise<string>} the file contents encoded according as base64 in the following format: data:[<mediatype>][;base64],<data>
 */
async function encodeAssets(source, parent) {
  const parentStats = await fs.lstat(parent);

  /** @type {string} */
  let baseDir;
  if (parentStats.isDirectory()) {
    baseDir = parent;
  } else if (parentStats.isFile()) {
    baseDir = path.dirname(parent);
  }

  const regex = /import\.meta\.encode\((.*?)\)/g;
  return source.replaceAll(regex, (substring) => {
    const relPath = substring.match(/import\.meta\.encode\((['"`])(.*?)\1\)/)?.at(2);
    if (!relPath) {
      throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
    }
    const filepath = path.resolve(baseDir, relPath);
    const stats = lstatSync(filepath);
    if (stats.isDirectory()) {
      throw new Error(
        `Invalid argument "${relPath}" for import.meta.encode: resolved filepath "${filepath}" is a directory`
      );
    } else if (!stats.isFile()) {
      throw new Error(
        `Invalid argument "${relPath}" for import.meta.encode: resolved filepath "${filepath}" is not a file`
      );
    }
    const data = readFileSync(filepath, 'base64');
    const mimeType = mime.getType(filepath);
    return `'data:${mimeType};base64,${data}'`;
  });
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

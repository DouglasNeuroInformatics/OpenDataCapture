/// @ts-check
/// <reference lib="es2022" />

import { readFileSync } from 'fs';
import fs from 'fs/promises';
import module from 'module';

import { InstrumentTransformer } from '@opendatacapture/instrument-transformer';
import { minify } from 'csso';
import mime from 'mime/lite';

/**
 * Replace all import.meta.encodeImage calls with the base64-encoded string
 * @param {string} source - the source code
 * @param {string} parent - the directory from which to resolve files
 * @returns {Promise<string>} the transformed source code
 */
async function encodeImages(source, parent) {
  const require = module.createRequire(parent);
  const regex = /import\.meta\.encodeImage\((.*?)\)/g;
  return source.replaceAll(regex, (substring) => {
    const id = substring.match(/import\.meta\.encodeImage\((['"`])(.*?)\1\)/)?.at(2);
    if (!id) {
      throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
    }
    const filepath = require.resolve(id);
    const data = readFileSync(filepath, 'base64');
    const mimeType = mime.getType(filepath);
    return `'data:${mimeType};base64,${data}'`;
  });
}

/**
 * Replace all import.meta.injectStyles calls with the resolved styles
 * @param {string} source - the source code
 * @param {string} parent - the directory from which to resolve files
 * @returns {Promise<string>} the transformed source code
 */
async function injectStylesheets(source, parent) {
  const require = module.createRequire(parent);
  const regex = /import\.meta\.injectStylesheet\((.*?)\)/g;
  return source.replaceAll(regex, (substring) => {
    const id = substring.match(/import\.meta\.injectStylesheet\((['"`])(.*?)\1\)/)?.at(2);
    if (!id) {
      throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
    }
    const filepath = require.resolve(id);
    const styles = readFileSync(filepath, 'utf-8');
    const mimeType = mime.getType(filepath);
    if (mimeType !== 'text/css') {
      throw new Error(`Unexpected media type '${mimeType}' for file: ${filepath}`);
    }
    const result = minify(styles);
    return `String.raw\`${result.css}\``;
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

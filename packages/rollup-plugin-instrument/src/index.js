// @ts-check

import fs from 'fs/promises';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

/** @returns {import('rollup').Plugin} */
const instrument = () => {
  const transformer = new InstrumentTransformer();
  const suffix = '?instrument';
  /** @param {string} filename */
  const removeSuffix = (filename) => filename.slice(0, filename.length - suffix.length);
  return {
    async load(id) {
      if (id.endsWith(suffix)) {
        const source = await fs.readFile(removeSuffix(id), 'utf-8');
        const bundle = await transformer.generateBundle(source);
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

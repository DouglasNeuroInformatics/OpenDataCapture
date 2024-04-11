import fs from 'fs/promises';
import path from 'path';

import { MANIFEST_FILENAME, resolveVersion } from '@opendatacapture/runtime-resolve';

/**
 * Returns the content and MIME type for a file in a given version
 * @param {string} version
 * @param {string} filename
 * @returns {Promise<{ content: string; contentType: string; } | null>}
 */
export const loadResource = async (version, filename) => {
  const { baseDir, manifest } = await resolveVersion(version);
  if (filename === MANIFEST_FILENAME) {
    return {
      content: JSON.stringify(manifest),
      contentType: 'application/json'
    };
  } else if (manifest.declarations.includes(filename)) {
    return {
      content: await fs.readFile(path.resolve(baseDir, filename), 'utf-8'),
      contentType: 'text/plain'
    };
  } else if (manifest.sources.includes(filename)) {
    return {
      content: await fs.readFile(path.resolve(baseDir, filename), 'utf-8'),
      contentType: 'text/javascript'
    };
  }
  return null;
};

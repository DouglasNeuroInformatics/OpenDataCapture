import fs from 'fs';
import path from 'path';

/** @public */
const MANIFEST_FILENAME = 'runtime.json';

/** @private */
const RUNTIME_DIR = path.resolve(import.meta.dirname, '../../../runtime');

/** @private */
const RUNTIME_DIST_DIRNAME = 'dist';

/**
 * @typedef  {Object}    RuntimeManifest
 * @property {string[]}  declarations
 * @property {string[]}  sources
 */

/**
 * @typedef {object} RuntimeVersionInfo
 * @property {string} baseDir
 * @property {RuntimeManifest} manifest
 * @property {string[]} importPaths
 * @property {string} version
 */

/**
 * Return whether the path is a directory
 * @private
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const isDirectory = async (path) => fs.existsSync(path) && fs.promises.lstat(path).then((stat) => stat.isDirectory());

/**
 * Recursively get a list of files relative to the base directory
 * @private
 * @param {string} baseDir
 * @returns {Promise<RuntimeManifest>}
 */
async function resolveManifest(baseDir) {
  /** @type {{ declarations: string[], sources: string[] }} */
  const results = { declarations: [], sources: [] };
  /** @param {string} dir */
  await (async function resolveDir(dir) {
    const files = await fs.promises.readdir(dir, 'utf-8');
    for (const file of files) {
      const abspath = path.join(dir, file);
      if (await isDirectory(abspath)) {
        await resolveDir(abspath);
      } else if (abspath.endsWith('.js')) {
        results.sources.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.d.ts')) {
        results.declarations.push(abspath.replace(`${baseDir}/`, ''));
      }
    }
  })(baseDir);
  return results;
}

/**
 * Returns the manifest for a given version of the runtime
 * @param {string} version
 * @returns {Promise<RuntimeVersionInfo>}
 */
export async function resolveVersion(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, RUNTIME_DIST_DIRNAME);
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, sources } = await resolveManifest(baseDir);
  return {
    baseDir,
    importPaths: sources.map((filename) => `/runtime/${version}/${filename}`),
    manifest: {
      declarations,
      sources
    },
    version
  };
}

/** @returns {Promise<RuntimeVersionInfo[]>} */
export async function resolvePackages() {
  const versions = await fs.promises.readdir(RUNTIME_DIR, 'utf-8');
  return await Promise.all(versions.map((version) => resolveVersion(version)));
}

export { MANIFEST_FILENAME, RUNTIME_DIR, RUNTIME_DIST_DIRNAME };

import fs from 'fs';
import path from 'path';

/** @type {string} */
let dirname;
if (typeof module === 'undefined') {
  dirname = import.meta.dirname;
} else {
  console.warn('CommonJS is considered deprecated in this project and any support for it should be removed ASAP');
  dirname = __dirname;
}

/** @public */
const MANIFEST_FILENAME = 'runtime.json';

/** @private */
const RUNTIME_DIR = path.resolve(dirname, '../../../runtime');

/** @private */
const RUNTIME_DIST_DIRNAME = 'dist';

/** @type {(path: string) => Promise<boolean>} */
const isDirectory = async (path) => fs.existsSync(path) && fs.promises.lstat(path).then((stat) => stat.isDirectory());

/**
 * Recursively get a list of files relative to the base directory
 * @private
 * @param {string} baseDir
 * @returns {Promise<import('./index.d.ts').RuntimeManifest>}
 */
async function resolveManifest(baseDir) {
  /** @type {{ declarations: string[], sources: string[], styles: string[] }} */
  const results = { declarations: [], sources: [], styles: [] };
  /** @param {string} dir */
  await (async function resolveDir(dir) {
    const files = await fs.promises.readdir(dir, 'utf-8');
    for (const file of files) {
      const abspath = path.join(dir, file);
      if (await isDirectory(abspath)) {
        await resolveDir(abspath);
      } else if (abspath.endsWith('.css')) {
        results.styles.push(abspath.replace(`${baseDir}/`, ''));
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
 * @returns {Promise<import('./index.d.ts').RuntimeVersionInfo>}
 */
export async function resolveVersion(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, RUNTIME_DIST_DIRNAME);
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, sources, styles } = await resolveManifest(baseDir);
  return {
    baseDir,
    importPaths: sources.map((filename) => `/runtime/${version}/${filename}`),
    manifest: {
      declarations,
      sources,
      styles
    },
    version
  };
}

/** @returns {Promise<import('./index.d.ts').RuntimeVersionInfo[]>} */
export async function resolvePackages() {
  const versions = await fs.promises
    .readdir(RUNTIME_DIR, 'utf-8')
    .then((entries) => entries.filter((entry) => entry.match(/^v\d/)));
  return await Promise.all(versions.map((version) => resolveVersion(version)));
}

export { MANIFEST_FILENAME, RUNTIME_DIR, RUNTIME_DIST_DIRNAME };

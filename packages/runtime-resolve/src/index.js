import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const RUNTIME_DIR = path.resolve(__dirname, '../../../runtime');

/**
 * @typedef  {Object}    RuntimeManifest
 * @property {string[]}  declarations
 * @property {string[]}  sources
 */

/**
 * Return whether the path is a directory
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const isDirectory = async (path) => existsSync(path) && fs.lstat(path).then((stat) => stat.isDirectory());

/**
 * Recursively get a list of files relative to the base directory
 * @param {string} baseDir
 */
export async function resolveFiles(baseDir) {
  /** @type {{ declarations: string[], sources: string[] }} */
  const results = { declarations: [], sources: [] };
  /** @param {string} dir */
  await (async function resolveDir(dir) {
    const files = await fs.readdir(dir);
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
 * @returns {Promise<{ baseDir: string, manifest: RuntimeManifest, importPaths: string[], version: string }>}
 */
export async function resolveVersion(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, 'dist');
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, sources } = await resolveFiles(baseDir);
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

export async function resolvePackages() {
  const versions = await fs.readdir(RUNTIME_DIR, 'utf-8');
  return await Promise.all(versions.map((version) => resolveVersion(version)));
}

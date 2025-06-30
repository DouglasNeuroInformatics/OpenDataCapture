import * as fs from 'fs';
import * as path from 'path';

/**
 * Contains the relative paths of assets for a given runtime version.
 *
 * @typedef {Object} RuntimeManifest
 * @property {string[]} declarations - Relative paths to TypeScript declaration files (.d.ts).
 * @property {string[]} sources - Relative paths to JavaScript source files (.js).
 * @property {string[]} styles - Relative paths to CSS stylesheets (.css).
 */

/**
 * Metadata for a given runtime version.
 *
 * @typedef {Object} RuntimeVersionMetadata
 * @property {string} baseDir - Absolute path to the root directory where runtime files are located.
 * @property {string[]} importPaths - List of fully-qualified import paths available at runtime.
 * @property {RuntimeManifest} manifest - Manifest containing relative paths to declarations, sources, and styles.
 *
 * @example
 * {
 *   baseDir: "/root/OpenDataCapture/runtime/v1/dist",
 *   importPaths: [
 *     "/runtime/v1/@opendatacapture/runtime-core/index.js",
 *     ...
 *   ],
 *   manifest: {
 *     declarations: [
 *       "@opendatacapture/runtime-core/index.d.ts",
 *       ...
 *     ],
 *     sources: [
 *       "@opendatacapture/runtime-core/index.js",
 *       ...
 *     ],
 *     styles: [
 *       "normalize.css@8.x/normalize.css",
 *       ...
 *     ]
 *   }
 * }
 */

/**
 * @typedef {Object} RuntimeOptions
 * @property {boolean} [disabled]
 */

const MANIFEST_FILENAME = 'runtime.json';

const RUNTIME_DIR = path.resolve(import.meta.dirname, '../../../runtime');

const RUNTIME_DIST_DIRNAME = 'dist';

/** @type {(path: string) => Promise<boolean>} */
const isDirectory = async (path) => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

/**
 * Generate the `RuntimeManifest` from a given directory
 * @private
 * @param {string} baseDir
 * @returns {Promise<RuntimeManifest>}
 */
export async function generateManifest(baseDir) {
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
 * Generate the `RuntimeVersionMetadata` for a given RuntimeVersion
 * @param {string} version
 * @returns {Promise<RuntimeVersionMetadata>}
 */
export async function generateMetadataForVersion(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, RUNTIME_DIST_DIRNAME);
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, sources, styles } = await generateManifest(baseDir);
  return {
    baseDir,
    importPaths: sources.map((filename) => `/runtime/${version}/${filename}`),
    manifest: {
      declarations,
      sources,
      styles
    }
  };
}

/** @returns {Promise<Map<string, RuntimeVersionMetadata>>} */
export async function generateMetadata() {
  const metadata = new Map();
  const versions = await fs.promises.readdir(RUNTIME_DIR, 'utf-8');
  for (const version of versions) {
    if (!version.match(/^v\d+$/)) {
      continue;
    }
    metadata.set(version, await generateMetadataForVersion(version));
  }
  return metadata;
}

/**
 * @param {RuntimeOptions} [options]
 * @returns {Promise<import('vite').Plugin | false>}
 */
export async function plugin(options) {
  if (options?.disabled) {
    return false;
  }
  const metadata = await generateMetadata();
  return {
    buildStart: async () => {
      for (const [version, { baseDir, manifest }] of metadata) {
        const destination = path.resolve(`dist/runtime/${version}`);
        await fs.promises.cp(baseDir, destination, { recursive: true });
        await fs.promises.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    config: () => ({
      optimizeDeps: {
        exclude: Array.from(metadata.values().flatMap((pkg) => pkg.importPaths))
      }
    }),
    configureServer: (server) => {
      server.middlewares.use('/runtime', async (req, res, next) => {
        const [version, ...paths] = req.url?.split('/').filter(Boolean) ?? [];
        const filepath = paths.join('/');
        if (!(version && filepath) || !metadata.has(version)) {
          return next();
        }

        const { baseDir, manifest } = /** @type {RuntimeVersionMetadata} */ (metadata.get(version));

        /** @type {{ content: string; contentType: string; }} */
        let resource;
        if (filepath === MANIFEST_FILENAME) {
          resource = {
            content: JSON.stringify(manifest),
            contentType: 'application/json'
          };
        } else if (manifest.declarations.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/plain'
          };
        } else if (manifest.styles.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/css'
          };
        } else if (manifest.sources.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/javascript'
          };
        } else {
          return next();
        }
        res.writeHead(200, { 'Content-Type': resource.contentType });
        res.end(resource.content);
      });
    },
    name: 'vite-plugin-runtime'
  };
}

export { MANIFEST_FILENAME, RUNTIME_DIR, RUNTIME_DIST_DIRNAME };

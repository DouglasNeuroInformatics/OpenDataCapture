import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const MANIFEST_FILENAME = 'runtime.json';

const PACKAGE_DIR = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const RUNTIME_DIR = path.resolve(PACKAGE_DIR, '..', '..', 'runtime');

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
const isDirectory = (path) => fs.lstat(path).then((stat) => stat.isDirectory());

/**
 * Recursively get a list of files relative to the base directory
 * @param {string} baseDir
 */
const resolveFiles = async (baseDir) => {
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
};

/**
 * Returns the manifest for a given version of the runtime
 * @param {string} version
 * @returns {Promise<{ baseDir: string, manifest: RuntimeManifest, importPaths: string[], version: string }>}
 */
const resolveVersion = async (version) => {
  const baseDir = path.resolve(RUNTIME_DIR, version, 'lib');
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
};

/**
 * Returns the content and MIME type for a file in a given version
 * @param {string} version
 * @param {string} filename
 * @returns {Promise<{ content: string; contentType: string; } | null>}
 */
const loadResource = async (version, filename) => {
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

async function resolvePackages() {
  const versions = await fs.readdir(RUNTIME_DIR, 'utf-8');
  return await Promise.all(versions.map((version) => resolveVersion(version)));
}

/**
 * @param {Object} [options]
 * @param {string} [options.packageRoot]
 * @returns {Promise<import('vite').PluginOption>}
 */
const runtime = async (options) => {
  const packages = await resolvePackages();
  return {
    async buildStart() {
      for (const { baseDir, manifest, version } of packages) {
        const destination = path.resolve(options?.packageRoot ?? '', `lib/runtime/${version}`);
        await fs.cp(baseDir, destination, { recursive: true });
        await fs.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    async config() {
      return {
        optimizeDeps: {
          exclude: packages.flatMap((pkg) => pkg.importPaths)
        }
      };
    },
    configureServer(server) {
      server.middlewares.use('/runtime', (req, res, next) => {
        const [version, ...paths] = req.url?.split('/').filter(Boolean) ?? [];
        const filepath = paths.join('/');
        if (!(version && filepath)) {
          return next();
        }
        loadResource(version, filepath)
          .then((resource) => {
            if (!resource) {
              return next();
            }
            res.writeHead(200, { 'Content-Type': resource.contentType });
            res.end(resource.content);
          })
          .catch(next);
      });
    },
    name: 'vite-plugin-runtime'
  };
};

export default runtime;

// @ts-check

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
 * Returns the manifest for a given version of the runtime
 * @param {string} version
 * @returns {Promise<{ baseDir: string, manifest: RuntimeManifest }>}
 */
const resolveVersion = async (version) => {
  const baseDir = path.resolve(RUNTIME_DIR, version, 'dist');
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const files = await fs.readdir(baseDir, 'utf-8');
  return {
    baseDir,
    manifest: {
      declarations: files.filter((filename) => filename.endsWith('.d.ts')),
      sources: files.filter((filename) => filename.endsWith('.js'))
    }
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

/**
 * @param {Object} [options]
 * @param {string} [options.packageRoot]
 * @returns {import('vite').PluginOption}
 */
const runtime = (options) => {
  return {
    async buildStart() {
      const versions = await fs.readdir(RUNTIME_DIR, 'utf-8');
      for (const version of versions) {
        const { baseDir, manifest } = await resolveVersion(version);
        const destination = path.resolve(options?.packageRoot ?? '', `dist/runtime/${version}`);
        await fs.cp(baseDir, destination, { recursive: true });
        await fs.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    configureServer(server) {
      server.middlewares.use('/runtime', (req, res, next) => {
        const [version, filename] = req.url?.split('/').filter(Boolean) ?? [];
        if (!(version && filename)) {
          return next();
        }
        loadResource(version, filename)
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

import fs from 'fs/promises';
import path from 'path';

import { MANIFEST_FILENAME, resolvePackages, resolveVersion } from '@opendatacapture/runtime-resolve';

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
 * @param {boolean} [options.disabled]
 * @param {string} [options.packageRoot]
 * @returns {import('vite').PluginOption}
 */
const runtime = (options) => {
  if (options?.disabled) {
    return false;
  }
  return {
    async buildStart() {
      const packages = await resolvePackages();
      for (const { baseDir, manifest, version } of packages) {
        const destination = path.resolve(options?.packageRoot ?? '', `dist/runtime/${version}`);
        await fs.cp(baseDir, destination, { recursive: true });
        await fs.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    async config() {
      const packages = await resolvePackages();
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

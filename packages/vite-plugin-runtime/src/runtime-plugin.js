import fs from 'fs/promises';
import path from 'path';

import { MANIFEST_FILENAME, resolvePackages } from '@opendatacapture/runtime-resolve';

import { runtimeMiddleware } from './runtime-middleware.js';

/**
 * @param {Object} [options]
 * @param {boolean} [options.disabled]
 * @param {string} [options.packageRoot]
 * @returns {import('vite').PluginOption}
 */
export const runtimePlugin = (options) => {
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
      server.middlewares.use('/runtime', runtimeMiddleware);
    },
    name: 'vite-plugin-runtime'
  };
};

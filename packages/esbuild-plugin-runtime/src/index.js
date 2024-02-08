import fs from 'fs/promises';
import path from 'path';

import { MANIFEST_FILENAME, resolvePackages } from '@open-data-capture/runtime-resolve';

/**
 * Adds support to esbuild for copying runtime assets to the build directory
 * @param {Object} [options]
 * @param {string} [options.outdir] - the base output directory for esbuild (required if outdir not specified in esbuild config)
 * @returns {import('esbuild').Plugin}
 */
export function runtimePlugin(options) {
  return {
    name: 'runtime',
    setup(build) {
      build.onEnd(async () => {
        const outdir = options?.outdir ?? build.initialOptions.outdir;
        if (!outdir) {
          throw new Error("Invalid config: option 'outdir' must be specified in either esbuild or plugin config");
        }
        const packages = await resolvePackages();
        for (const { baseDir, manifest, version } of packages) {
          const destination = path.resolve(outdir, `runtime/${version}`);
          await fs.cp(baseDir, destination, { recursive: true });
          await fs.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
        }
      });
    }
  };
}

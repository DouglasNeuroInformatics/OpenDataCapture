import * as fs from 'fs';
import * as path from 'path';

import { generateMetadata, MANIFEST_FILENAME, resolveRuntimeAsset } from '@opendatacapture/runtime-meta';

/**
 * @param {import('@opendatacapture/runtime-meta').RuntimeOptions} options
 * @returns {Promise<import('vite').Plugin | false>}
 */
export async function plugin(options) {
  if (options?.disabled) {
    return false;
  }
  const metadata = await generateMetadata(options);

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
        const asset = await resolveRuntimeAsset(req.url, metadata);
        if (!asset) {
          return next();
        }

        res.writeHead(200, { 'Content-Type': asset.contentType });
        res.end(asset.content);
      });
    },
    name: 'vite-plugin-runtime'
  };
}

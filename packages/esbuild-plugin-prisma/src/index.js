import fs from 'fs';
import path from 'path';

/**
 * Copy the Prisma query engine to the specified directory
 * @param {Object} options
 * @param {string} options.outdir - the location where the engine should be copied
 * @returns {import('esbuild').Plugin}
 */
export function prismaPlugin(options) {
  return {
    name: 'prisma',
    setup(build) {
      build.onEnd(async () => {
        const { getEnginesPath } = (await import('@prisma/engines')).default;
        const { getBinaryTargetForCurrentPlatform } = (await import('@prisma/get-platform')).default;

        const binaryTarget = await getBinaryTargetForCurrentPlatform();
        const enginesDir = getEnginesPath();
        const engineFile = (await fs.promises.readdir(enginesDir)).find((filename) => {
          return filename.startsWith(`libquery_engine-${binaryTarget}`) && filename.endsWith('.node');
        });
        if (!engineFile) {
          throw new Error(`Failed to find prisma query engine '${engineFile}' in directory: ${enginesDir}`);
        }
        fs.promises.stat(options.outdir);
        if (!fs.existsSync(options.outdir)) {
          await fs.promises.mkdir(options.outdir, { recursive: true });
        }
        await fs.promises.copyFile(path.join(enginesDir, engineFile), path.join(options.outdir, engineFile));
      });
    }
  };
}

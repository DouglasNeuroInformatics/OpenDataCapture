import * as fs from 'fs/promises';
import * as path from 'path';

import esbuild from 'esbuild';

import { assetPlugin, dtsPlugin } from './plugin.js';
import { Resolver } from './resolver.js';

import type { BundlerOptions, EntryPoint, ExportCondition, ResolvedPackage } from './types.js';

export class Bundler {
  private logger = {
    verbose: (message: string) => {
      if (this.options.verbose) {
        // eslint-disable-next-line no-console
        console.log(message);
      }
    }
  };
  private resolver: Resolver;

  constructor(private options: BundlerOptions) {
    this.resolver = new Resolver(options.configFilepath);
  }

  async bundle(): Promise<void> {
    const packages = await this.findPackages();
    this.logger.verbose(`Found packages: ${JSON.stringify(packages, null, 2)}`);
    const { assetEntryPoints, moduleEntryPoints } = this.getEntryPoints(packages);
    this.logger.verbose(`Found entry points: ${JSON.stringify({ assetEntryPoints, moduleEntryPoints }, null, 2)}`);

    await fs.rm(this.options.outdir, { force: true, recursive: true });
    await esbuild.build({
      bundle: true,
      // an underscore prefix cannot collide with a served package: npm forbids it in package names
      chunkNames: '_chunks/[hash]',
      entryPoints: [...moduleEntryPoints, ...assetEntryPoints],
      format: 'esm',
      keepNames: true,
      minify: this.options.mode === 'production',
      outdir: this.options.outdir,
      platform: 'browser',
      plugins: [
        dtsPlugin({
          configFilepath: this.options.configFilepath,
          entryPoints: moduleEntryPoints,
          outdir: this.options.outdir,
          packages
        }),
        assetPlugin(new Set(assetEntryPoints.map((entryPoint) => entryPoint.in)))
      ],
      sourcemap: 'linked',
      sourcesContent: true,
      splitting: true,
      target: 'es2022'
    });
  }

  private async findPackages(): Promise<ResolvedPackage[]> {
    const packages: ResolvedPackage[] = [];
    for (const packageName of this.options.include) {
      const pkg = await this.resolver.resolve(packageName);
      packages.push(pkg);
    }
    return packages;
  }

  private getEntryPoints(packages: ResolvedPackage[]): {
    assetEntryPoints: EntryPoint[];
    moduleEntryPoints: EntryPoint[];
  } {
    const assetEntryPoints: EntryPoint[] = [];
    const moduleEntryPoints: EntryPoint[] = [];
    for (const pkg of packages) {
      for (const key in pkg.exports) {
        if (key === './package.json') {
          continue;
        }
        const packageExport = pkg.exports[key]!;
        const runtimePackageName = pkg.name.split('__').join('@');
        const parsedOutPath = path.parse(key === '.' ? 'index' : key);
        const out = path.join(runtimePackageName, parsedOutPath.dir, parsedOutPath.name);
        if ('copy' in packageExport) {
          assetEntryPoints.push({
            in: packageExport.copy,
            out
          });
          continue;
        }
        for (const condition of ['import', 'default'] satisfies ExportCondition[]) {
          if (packageExport[condition]) {
            moduleEntryPoints.push({
              in: packageExport[condition],
              out
            });
            break;
          }
        }
        if (packageExport.types) {
          moduleEntryPoints.push({
            in: packageExport.types,
            out: out + '.d'
          });
        }
      }
    }
    return { assetEntryPoints, moduleEntryPoints };
  }
}

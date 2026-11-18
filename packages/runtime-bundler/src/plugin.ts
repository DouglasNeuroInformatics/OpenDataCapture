import * as fs from 'node:fs/promises';
import * as module from 'node:module';
import * as path from 'node:path';

import type { Plugin } from 'esbuild';
import { parseSync, Visitor } from 'oxc-parser';
import type { ImportDeclaration } from 'oxc-parser';

import { validatePackageName } from './utils.js';

import type { EntryPoint, ResolvedPackage } from './types.js';

type DtsPluginOptions = {
  configFilepath: string;
  entryPoints: EntryPoint[];
  outdir: string;
  packages: ResolvedPackage[];
};

type DependencyResolution = { issue: string; success: false } | { relativePath: string; success: true };

function parseImportPath(importPath: string) {
  const segments = importPath.split('/');
  const sliceIndex = importPath.startsWith('@') ? 2 : 1;
  const relpath = segments.slice(sliceIndex).join('/');
  return {
    exportKey: relpath ? `./${relpath}` : '.',
    packageId: segments.slice(0, sliceIndex).join('/')
  };
}

export function dtsPlugin(options: DtsPluginOptions): Plugin {
  const require = module.createRequire(options.configFilepath);

  const resolveDependency = (importPath: string, importerFilepath: string): DependencyResolution => {
    const { exportKey, packageId } = parseImportPath(importPath);
    const validationResult = validatePackageName(packageId);
    if (!validationResult.success) {
      return { issue: `Illegal import '${importPath}': ${validationResult.issue}`, success: false };
    }
    const packageJsonId = `${packageId}/package.json`;

    let packageJsonFilepath: string;
    try {
      packageJsonFilepath = require.resolve(packageJsonId, { paths: [importerFilepath] });
    } catch {
      return {
        issue: `Failed to resolve '${packageId}' from '${importerFilepath}' via '${packageJsonId}'`,
        success: false
      };
    }
    for (const pkg of options.packages) {
      if (pkg.packageJsonPath !== packageJsonFilepath) {
        continue;
      }
      const packageExport = pkg.exports[exportKey];
      if (packageExport) {
        if ('copy' in packageExport) {
          return {
            issue: `Found dependency '${importPath}' but export '${exportKey}' is a static asset`,
            success: false
          };
        }
        const types = packageExport.types;
        if (types) {
          const outfile = options.entryPoints.find((item) => item.in === types)?.out;
          if (!outfile) {
            return { issue: `Could not find dependency with absolute input path '${types}'`, success: false };
          }
          const outpath = path.resolve(options.outdir, outfile + (outfile.endsWith('.d') ? '.ts' : ''));
          const importerPath = options.entryPoints.find((item) => item.in === importerFilepath)!.out;
          const importer = path.resolve(options.outdir, importerPath + (importerPath.endsWith('.d') ? '.ts' : ''));
          return { relativePath: path.relative(path.dirname(importer), outpath), success: true };
        }
        return {
          issue: `Found dependency '${importPath}' but export '${exportKey}' does not specify types`,
          success: false
        };
      }
    }
    return { issue: `Could not find dependency '${importPath}' imported by '${importerFilepath}'`, success: false };
  };

  return {
    name: 'dts-plugin',
    setup: (build) => {
      const namespace = 'dts';
      build.onResolve({ filter: /\.d\.ts$/ }, (args) => ({
        namespace,
        path: args.path
      }));
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const sourceText = await fs.readFile(args.path, 'utf-8');
        const parseResult = parseSync(args.path, sourceText, { lang: 'dts', sourceType: 'module' });
        if (parseResult.errors.length) {
          return {
            errors: parseResult.errors.map((error) => ({ location: { file: args.path }, text: error.message }))
          };
        }
        // every import declaration, including those nested in `declare module` blocks, in source order
        const importDeclarations: ImportDeclaration[] = [];
        new Visitor({
          ImportDeclaration(node) {
            importDeclarations.push(node);
          }
        }).visit(parseResult.program);
        let contents = '';
        let copiedUpTo = 0;
        for (const { source } of importDeclarations) {
          if (source.value.startsWith('./')) {
            continue;
          }
          const resolution = resolveDependency(source.value, args.path);
          if (!resolution.success) {
            return { errors: [{ location: { file: args.path }, text: resolution.issue }] };
          }
          // the specifier's span includes its quotes; splicing between them keeps the source's quote style
          contents += sourceText.slice(copiedUpTo, source.start + 1) + resolution.relativePath;
          copiedUpTo = source.end - 1;
        }
        contents += sourceText.slice(copiedUpTo);
        return {
          contents,
          loader: 'copy'
        };
      });
    }
  };
}

export function assetPlugin(assetFilepaths: Set<string>): Plugin {
  return {
    name: 'asset-plugin',
    setup(build) {
      const namespace = 'asset';
      build.onResolve({ filter: /.*/ }, (args) => {
        if (!assetFilepaths.has(args.path)) {
          return undefined;
        }
        return {
          namespace,
          path: args.path
        };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        return {
          contents: await fs.readFile(args.path),
          loader: 'copy'
        };
      });
    }
  };
}

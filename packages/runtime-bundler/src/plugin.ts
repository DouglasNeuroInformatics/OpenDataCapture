import * as fs from 'fs/promises';
import * as module from 'module';
import * as path from 'path';

import type { Plugin } from 'esbuild';
import ts from 'typescript';

import { validatePackageName } from './utils.js';

import type { EntryPoint, ResolvedPackage } from './types.js';

type DtsPluginOptions = {
  configFilepath: string;
  entryPoints: EntryPoint[];
  outdir: string;
  packages: ResolvedPackage[];
};

function parseImportPath(importPath: string) {
  const segments = importPath.split('/');
  const sliceIndex = importPath.startsWith('@') ? 2 : 1;
  return {
    exportKey: segments.slice(sliceIndex).join('/') || '.',
    packageId: segments.slice(0, sliceIndex).join('/')
  };
}

export function dtsPlugin(options: DtsPluginOptions): Plugin {
  const require = module.createRequire(options.configFilepath);
  const printer = ts.createPrinter();

  const resolveDependency = (importPath: string, importerFilepath: string) => {
    const { exportKey, packageId } = parseImportPath(importPath);
    const validationResult = validatePackageName(packageId);
    if (!validationResult.success) {
      throw new Error(`Illegal import '${importPath}': ${validationResult.issue}`);
    }
    const packageJsonId = `${packageId}/package.json`;

    let packageJsonFilepath: string;
    try {
      packageJsonFilepath = require.resolve(packageJsonId, { paths: [importerFilepath] });
    } catch {
      throw new Error(`Failed to resolve '${packageId}' from '${importerFilepath}' via '${packageJsonId}'`);
    }
    for (const pkg of options.packages) {
      if (pkg.packageJsonPath !== packageJsonFilepath) {
        continue;
      }
      const packageExport = pkg.exports[exportKey];
      if (packageExport) {
        const types = packageExport.types;
        if (types) {
          const outfile = options.entryPoints.find((item) => item.in === types)?.out;
          if (!outfile) {
            throw new Error(`Could not find dependency with absolute input path '${types}'`);
          }
          const outpath = path.resolve(options.outdir, outfile + (outfile.endsWith('.d') ? '.ts' : ''));
          const importerPath = options.entryPoints.find((item) => item.in === importerFilepath)!.out;
          const importer = path.resolve(options.outdir, importerPath + (importerPath.endsWith('.d') ? '.ts' : ''));
          return path.relative(path.dirname(importer), outpath);
        }
        throw new Error(`Found dependency '${importPath}' but export '${exportKey}' does not specify types`);
      }
    }
    throw new Error(`Could not find dependency '${importPath}' imported by '${importerFilepath}'`);
  };

  const factory = <T extends ts.SourceFile>(context: ts.TransformationContext) => {
    return (rootNode: T): T => {
      const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
          const isRelativeImport = importPath.startsWith('./');
          if (isRelativeImport) {
            return ts.visitEachChild(node, visit, context);
          }
          const resolvedImportPath = resolveDependency(importPath, rootNode.fileName);
          return ts.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            ts.factory.createStringLiteral(resolvedImportPath),
            node.attributes
          );
        }
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(rootNode, visit) as T;
    };
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
        const sourceFile = ts.createSourceFile(args.path, sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
        let transformationResult: ts.TransformationResult<ts.SourceFile>;
        try {
          transformationResult = ts.transform(sourceFile, [factory]);
        } catch (err) {
          return {
            errors: [
              {
                location: {
                  file: args.path
                },
                text: err instanceof Error ? err.message : 'Unknown Error'
              }
            ]
          };
        }
        const contents = printer.printFile(transformationResult.transformed[0]!);
        return {
          contents,
          loader: 'copy'
        };
      });
    }
  };
}

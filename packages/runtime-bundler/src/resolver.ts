import fs from 'fs';
import module from 'module';
import path from 'path';

import { isPlainObject } from '@douglasneuroinformatics/libjs';

import type { ExportCondition, PackageExport, ResolvedPackage } from './types.js';

class ResolverError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = ResolverError.name;
  }
  static forPackage(id: string, { explanation, ...options }: ErrorOptions & { explanation: string }) {
    return new this(`Failed to resolve exports for package '${id}': ${explanation}`, options);
  }
}

export class Resolver {
  private require: NodeRequire;

  constructor(filepath: string) {
    this.require = module.createRequire(filepath);
  }

  async resolve(id: string): Promise<ResolvedPackage> {
    let packageJsonPath: string;
    try {
      packageJsonPath = this.require.resolve(`${id}/package.json`);
    } catch {
      throw ResolverError.forPackage(id, {
        explanation: `resolution of '${id}/package.json' was unsuccessful`
      });
    }
    if (!fs.existsSync(packageJsonPath)) {
      throw ResolverError.forPackage(id, {
        explanation: `resolved package.json file '${packageJsonPath}' does not exist`
      });
    } else if (!fs.lstatSync(packageJsonPath).isFile()) {
      throw ResolverError.forPackage(id, {
        explanation: `resolved package.json file '${packageJsonPath}' exists, but is not a file`
      });
    }

    const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf-8');
    const packageRoot = path.dirname(packageJsonPath);

    let packageJson: unknown;
    try {
      packageJson = JSON.parse(packageJsonContent);
    } catch {
      console.error(`Error parsing content: '${packageJsonContent}'`);
      throw ResolverError.forPackage(id, {
        explanation: `failed to parse content of package.json file '${packageJsonPath}'`
      });
    }

    if (!isPlainObject(packageJson)) {
      throw ResolverError.forPackage(id, {
        explanation: `content '${packageJsonContent}' of file '${packageJsonPath}' is not an object`
      });
    } else if (packageJson.exports === undefined) {
      throw ResolverError.forPackage(id, {
        explanation: `file '${packageJsonPath}' does not contain required property 'exports'`
      });
    } else if (!isPlainObject(packageJson.exports)) {
      throw ResolverError.forPackage(id, {
        explanation: `invalid value '${JSON.stringify(packageJson.exports)}' for property 'exports' in file '${packageJsonPath}'`
      });
    } else if (Object.keys(packageJson.exports).length === 0) {
      throw ResolverError.forPackage(id, {
        explanation: `invalid property 'exports' in file '${packageJsonPath}' - cannot be empty object`
      });
    }

    if (typeof packageJson.name !== 'string') {
      throw ResolverError.forPackage(id, {
        explanation: `invalid value '${JSON.stringify(packageJson.name)}' for property 'name' in file '${packageJsonPath}' - expected string`
      });
    }

    const exports: { [key: string]: PackageExport } = {};
    for (const key in packageJson.exports) {
      let result: PackageExport;
      try {
        result = this.parseExport(packageJson.exports[key], packageRoot);
      } catch (err) {
        if (err instanceof ResolverError) {
          throw ResolverError.forPackage(id, { explanation: err.message });
        }
        console.error(err);
        throw ResolverError.forPackage(id, { explanation: err instanceof Error ? err.message : 'Unknown Error' });
      }
      exports[key] = result;
    }

    return {
      exports,
      name: packageJson.name,
      packageJsonPath,
      packageRoot
    };
  }

  private parseExport(exp: unknown, packageRoot: string): PackageExport {
    if (typeof exp === 'string') {
      return { import: this.resolveSourceExport(exp, packageRoot) };
    } else if (isPlainObject(exp)) {
      const exports: PackageExport = {};
      const conditions: ExportCondition[] = ['default', 'import', 'types'];
      for (const condition of conditions) {
        const val = exp[condition];
        if (typeof val === 'string') {
          if (condition === 'types') {
            exports[condition] = this.resolveDeclarationExport(val, packageRoot);
          } else {
            exports[condition] = this.resolveSourceExport(val, packageRoot);
          }
        } else if (typeof val !== 'undefined') {
          throw new ResolverError(
            `unexpected non-string value '${val && typeof val}' for '${condition}' condition in exports`
          );
        }
      }
      return exports;
    }
    throw new ResolverError(`expected plain object or string, got '${JSON.stringify(exp)}'`);
  }

  private resolveDeclarationExport(exp: string, packageRoot: string): string {
    return this.resolveExportFilepath(exp, packageRoot, ['.d.ts', 'd.mts']);
  }

  private resolveExportFilepath(exp: string, packageRoot: string, validExtensions: string[]): string {
    const filepath = path.resolve(packageRoot, exp);
    const isValidExtension = validExtensions.find((ext) => filepath.endsWith(ext));

    let errorMessage: null | string = null;
    if (!isValidExtension) {
      errorMessage = `file '${filepath}' does not have one of the expected extensions: ${validExtensions.join(', ')}`;
    } else if (!fs.existsSync(filepath)) {
      errorMessage = `file '${filepath}' does not exist`;
    } else if (!fs.lstatSync(filepath).isFile()) {
      errorMessage = `file '${filepath}' exists but is not a regular file`;
    }

    if (errorMessage) {
      throw new ResolverError(`invalid export '${exp}' from package root '${packageRoot}' - ${errorMessage}`);
    }

    return filepath;
  }

  private resolveSourceExport(exp: string, packageRoot: string): string {
    return this.resolveExportFilepath(exp, packageRoot, ['.css', '.json', '.js', '.mjs']);
  }
}

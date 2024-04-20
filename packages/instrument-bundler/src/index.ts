import type { BuildOptions, BuildResult, Metafile } from 'esbuild';
import type { ValueOf } from 'type-fest';

import { InstrumentBundlerError } from './error.js';

import type { BundleOptions, InstrumentBundlerOptions, RequireResolve } from './types.js';

let esbuild: typeof import('esbuild');
if (typeof window === 'undefined') {
  ({ default: esbuild } = await import('esbuild'));
} else {
  ({ default: esbuild } = await import('esbuild-wasm'));
}

export class InstrumentBundler {
  /** The variable name that 'export default' is replaced by */
  private defaultExportSub = '__instrument__';
  private resolve?: RequireResolve;

  constructor(options?: InstrumentBundlerOptions) {
    this.resolve = options?.resolve;
  }

  async generateBundle({ source }: BundleOptions) {
    const input = this.preprocess(source);
    const result = await this.build(input);
    const output = result.metafile!.outputs['bundle.js'];
    this.validateOutput(output);
    return this.injectRequire(this.getBuiltCode(result));
  }

  async generateBundleFiles(options: BundleOptions) {
    const bundle = await this.generateBundle(options);
    return {
      declaration: 'declare const bundle: string;\nexport default bundle;\n',
      source: `export default ${JSON.stringify(bundle)}`
    };
  }

  private build(source: string, options: BuildOptions = {}) {
    return esbuild.build({
      format: 'esm',
      metafile: true,
      minify: true,
      outfile: 'bundle.js',
      platform: 'neutral',
      stdin: {
        contents: source,
        loader: 'tsx'
      },
      target: 'es2022',
      write: false,
      ...options
    });
  }

  private getBuiltCode(result: BuildResult) {
    const outputFiles = result.outputFiles;
    if (!outputFiles) {
      throw new InstrumentBundlerError('Output files is undefined');
    } else if (outputFiles?.length !== 1) {
      throw new InstrumentBundlerError(`Unexpected number of output files: ${outputFiles.length}`);
    }
    return outputFiles[0].text;
  }

  /** Return the number of times 'export default' occurs in a string */
  private getDefaultExportCount(source: string) {
    return source.match(/export\s+default/g)?.length ?? 0;
  }

  private injectRequire(source: string) {
    const regex = /import\.meta\.require\((.*?)\)/g;
    return source.replaceAll(regex, (substring) => {
      const id = substring.match(/import\.meta\.require\((['"`])(.*?)\1\)/)?.at(2);
      if (!id) {
        throw new InstrumentBundlerError(
          `Illegal function call \`${substring}\`: expected one argument (a non-empty string)`
        );
      } else if (!this.resolve) {
        throw new InstrumentBundlerError(`Cannot resolve required module '${id}': resolver is undefined`);
      }
      let resolved: unknown;
      try {
        resolved = this.resolve(id);
      } catch (err) {
        throw new InstrumentBundlerError(
          `Failed to import required module '${id}': an unhandled exception was thrown by the resolver`,
          { cause: err }
        );
      }
      return String(resolved);
    });
  }

  /** Ensure that the source has one default export and replace it with the substitution string */
  private preprocess(source: string) {
    const defaultExportCount = this.getDefaultExportCount(source);
    if (defaultExportCount !== 1) {
      throw new InstrumentBundlerError(`Expected one default export, not ${defaultExportCount}`);
    } else if (source.includes(this.defaultExportSub)) {
      throw new InstrumentBundlerError(
        `Variable name '${this.defaultExportSub}' is considered a keyword in instruments`
      );
    }
    source = source.replace('export default', `const ${this.defaultExportSub} =`);
    return `(async () => {
      ${source}
      return ${this.defaultExportSub}
    })()`;
  }

  /** Validate the metafile for the generated bundle */
  private validateOutput(output: ValueOf<Metafile['outputs']>) {
    output.imports.forEach(({ kind, path }) => {
      if (kind !== 'dynamic-import') {
        throw new InstrumentBundlerError(`Unexpected non-dynamic import token '${kind}' at '${path}'`);
      }
    });
  }
}

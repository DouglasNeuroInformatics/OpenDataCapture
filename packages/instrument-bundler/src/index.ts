import type { BuildOptions, BuildResult, Metafile } from 'esbuild';
import type { ValueOf } from 'type-fest';

let esbuild: typeof import('esbuild');
if (typeof window === 'undefined') {
  ({ default: esbuild } = await import('esbuild'));
} else {
  ({ default: esbuild } = await import('esbuild-wasm'));
}

export class InstrumentBundler {
  /** The variable name that 'export default' is replaced by */
  private defaultExportSub = '__instrument__';

  async generateBundle(source: string) {
    const input = this.preprocess(source);
    const result = await this.build(input);
    const output = result.metafile!.outputs['bundle.js'];
    this.validateOutput(output);
    return this.injectRequire(this.getBuiltCode(result));
  }

  async generateBundleFiles(source: string) {
    const bundle = await this.generateBundle(source);
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
      throw new Error('Output files is undefined');
    } else if (outputFiles?.length !== 1) {
      throw new Error(`Unexpected number of output files: ${outputFiles.length}`);
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
        throw new TypeError(`Illegal function call \`${substring}\`: expected one argument (a non-empty string)`);
      }
      return substring;
    });
  }

  /** Ensure that the source has one default export and replace it with the substitution string */
  private preprocess(source: string) {
    const defaultExportCount = this.getDefaultExportCount(source);
    if (defaultExportCount !== 1) {
      throw new Error(`Expected one default export, not ${defaultExportCount}`);
    } else if (source.includes(this.defaultExportSub)) {
      throw new Error(`Variable name '${this.defaultExportSub}' is considered a keyword in instruments`);
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
        throw new Error(`Unexpected non-dynamic import token '${kind}' at '${path}'`);
      }
    });
  }
}

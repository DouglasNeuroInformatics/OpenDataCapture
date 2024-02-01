import type { Options as CoreOptions, Output as CoreOutput, ParseOptions as CoreParseOptions } from '@swc/core';
import type { Module } from '@swc/types';
import type { Options as WebOptions, Output as WebOutput, ParseOptions as WebParseOptions } from '@swc/wasm-web';
import type { Simplify } from 'type-fest';

export type TransformOptions = Simplify<CoreOptions & WebOptions>;

export type TransformOutput = Simplify<CoreOutput & WebOutput>;

export type ModuleItemType = Module['body'][number]['type'];

export type ParseOptions = Simplify<Extract<CoreParseOptions & WebParseOptions, { syntax: 'typescript' }>>;

export type Transpiler = {
  parse(src: string, options: ParseOptions): Promise<Module>;
  parseSync(src: string, options: ParseOptions): Module;
  transform(src: string, options: TransformOptions): Promise<TransformOutput>;
  transformSync(src: string, options: TransformOptions): TransformOutput;
};

export abstract class BaseInstrumentTransformer {
  /** The variable name that 'export default' is replaced by */
  private defaultExportSub = '__instrument__';

  /** Tokens that if encountered will throw an error */
  private illegalItemTypes: ModuleItemType[] = [
    'ImportDeclaration',
    'ExportAllDeclaration',
    'ExportDeclaration',
    'ExportNamedDeclaration'
  ];

  /** The options to use for SWC when parsing the source code */
  private parseOptions: ParseOptions = {
    syntax: 'typescript',
    target: 'es2022',
    tsx: true
  };

  /** The options to use for SWC when transforming the source code */
  private transformOptions: TransformOptions = {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      target: 'es2022',
      transform: {
        optimizer: {
          globals: {
            vars: {
              __React__: 'React'
            }
          }
        },
        react: {
          pragma: '__React__.createElement',
          runtime: 'classic'
        }
      }
    },
    minify: true,
    module: {
      strict: true,
      type: 'es6'
    }
  };

  constructor(public transpiler: Transpiler) {}

  async generateBundle(src: string) {
    const program = await this.transpiler.parse(src, this.parseOptions);
    this.validate(program, src);
    const input = this.transformDefaultExport(src);
    const result = await this.transpiler.transform(input, this.transformOptions);
    return result.code;
  }

  generateBundleSync(src: string) {
    const program = this.transpiler.parseSync(src, this.parseOptions);
    this.validate(program, src);
    const input = this.transformDefaultExport(src);
    const result = this.transpiler.transformSync(input, this.transformOptions);
    return result.code;
  }

  private transformDefaultExport(src: string) {
    let input = src;
    input = src.replace('export default', `const ${this.defaultExportSub} =`);
    return `(async () => {
      ${input}
      return ${this.defaultExportSub}
    })()`;
  }

  private validate(program: Module, src: string) {
    if (src.includes(this.defaultExportSub)) {
      throw new Error(`Variable name '${this.defaultExportSub}' is considered a keyword in instruments`);
    }
    let defaultExportCount = 0;
    for (const item of program.body) {
      if (this.illegalItemTypes.includes(item.type)) {
        const source = src.slice(item.span.start - 1, item.span.end - 1);
        throw new Error(`Unexpected token '${item.type}': ${source}`);
      } else if (item.type === 'ExportDefaultDeclaration' || item.type === 'ExportDefaultExpression') {
        defaultExportCount += 1;
      }
    }
    if (defaultExportCount === 0) {
      throw new Error('Source does not contain required default export');
    } else if (defaultExportCount > 1) {
      throw new Error('Source contains multiple default exports');
    }
  }
}

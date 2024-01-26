/// @ts-check
/// <reference types="./types.d.ts" />

/**
 * @abstract
 * @class
 * @implements {InstrumentTransformer.InstrumentTransformer}
 */
export class BaseInstrumentTransformer {
  /**
   * @description The variable name that 'export default' is replaced by
   * @type {string}
   */
  #defaultExportSub = '__instrument__';

  /**
   * @description Tokens that if encountered will throw an error
   * @type {InstrumentTransformer.InstrumentTransformer.ModuleItemType[]}
   */
  #illegalItemTypes = ['ImportDeclaration', 'ExportAllDeclaration', 'ExportDeclaration', 'ExportNamedDeclaration'];

  /**
   * @description The options to use for SWC when parsing the source code
   * @type {InstrumentTransformer.InstrumentTransformer.ParseOptions}
   */
  #parseOptions = {
    syntax: 'typescript',
    target: 'es2022',
    tsx: true
  };

  /**
   * @description The options to use for SWC when transforming the source code
   * @type {InstrumentTransformer.InstrumentTransformer.TransformOptions}
   */
  #transformOptions = {
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

  /**
   * Create an InstrumentTransformer
   * @param {InstrumentTransformer.InstrumentTransformer.Transpiler} transpiler
   */
  constructor(transpiler) {
    this.transpiler = transpiler;
  }

  /** @param {string} src */
  async generateBundle(src) {
    const program = await this.transpiler.parse(src, this.#parseOptions);
    this.#validate(program, src);
    const input = this.#transformDefaultExport(src);
    const result = await this.transpiler.transform(input, this.#transformOptions);
    return result.code;
  }

  /** @param {string} src */
  generateBundleSync(src) {
    const program = this.transpiler.parseSync(src, this.#parseOptions);
    this.#validate(program, src);
    const input = this.#transformDefaultExport(src);
    const result = this.transpiler.transformSync(input, this.#transformOptions);
    return result.code;
  }

  /** @param {string} src */
  #transformDefaultExport(src) {
    let input = src;
    input = src.replace('export default', `const ${this.#defaultExportSub} =`);
    return `(async () => {
      ${input}
      return ${this.#defaultExportSub}
    })()`;
  }

  /**
   * @param {import('@swc/types').Module} program
   * @param {string} src
   */
  #validate(program, src) {
    if (src.includes(this.#defaultExportSub)) {
      throw new Error(`Variable name '${this.#defaultExportSub}' is considered a keyword in instruments`);
    }
    let defaultExportCount = 0;
    for (const item of program.body) {
      if (this.#illegalItemTypes.includes(item.type)) {
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

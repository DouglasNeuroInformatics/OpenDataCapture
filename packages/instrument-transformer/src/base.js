/**
 * `BaseInstrumentTransformer` and all derived subclasses are responsible for transpiling the source code
 * (including potentially, JSX syntax) to vanilla JavaScript that can run in the browser. Since dynamic import is a
 * requirement of the runtime in general, ES2022 is targeted. Therefore, some kind of fallback/error handling should
 * be implemented for legacy browsers.
 * @abstract
 * @class
 */
export class BaseInstrumentTransformer {
  /** @type {import('./index.d.ts').Transpiler} */
  transpiler;

  /** The variable name that 'export default' is replaced by */
  #defaultExportSub = '__instrument__';

  /**
   * Tokens that if encountered will throw an error
   * @type {import('./index.d.ts').ModuleItemType[]}
   */
  #illegalItemTypes = ['ImportDeclaration', 'ExportAllDeclaration', 'ExportDeclaration', 'ExportNamedDeclaration'];

  /** @type {import('./index.d.ts').ParseOptions} */
  #parseOptions = {
    syntax: 'typescript',
    target: 'es2022',
    tsx: true
  };

  /** @type {import('./index.d.ts').TransformOptions} */
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
   *
   * @param {import('./index.d.ts').Transpiler} transpiler
   */
  constructor(transpiler) {
    this.transpiler = transpiler;
  }

  /**
   * @param {string} src
   * @returns {Promise<string>}
   */
  async generateBundle(src) {
    const program = await this.transpiler.parse(src, this.#parseOptions);
    this.#validate(program, src);
    const input = this.#transformDefaultExport(src);
    const result = await this.transpiler.transform(input, this.#transformOptions);
    return result.code;
  }

  /**
   * @param {string} src
   * @returns {string}
   */
  generateBundleSync(src) {
    const program = this.transpiler.parseSync(src, this.#parseOptions);
    this.#validate(program, src);
    const input = this.#transformDefaultExport(src);
    const result = this.transpiler.transformSync(input, this.#transformOptions);
    return result.code;
  }

  /**
   * @param {string} src
   * @returns {string}
   */
  #transformDefaultExport(src) {
    let input = src;
    input = src.replace('export default', `const ${this.#defaultExportSub} =`);
    return `(async () => {
      ${input}
      return ${this.#defaultExportSub}
    })()`;
  }

  /**
   *
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

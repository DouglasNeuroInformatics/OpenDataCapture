import type { Module } from '@swc/types';

import type { ModuleItemType, ParseOptions, TransformOptions, Transpiler } from './types';

/**
 * `BaseInstrumentTransformer` and all derived subclasses are responsible for transpiling the TypeScript source code
 * (including potentially, JSX syntax) to vanilla JavaScript that can run in the browser. Since dynamic import is a
 * requirement of the runtime in general, ES2022 is targeted. Therefore, some kind of fallback/error handling should
 * be implemented for legacy browsers.
 */
export abstract class BaseInstrumentTransformer {
  /** The variable name that 'export default' is replaced by */
  private readonly defaultExportSub = '__instrument__';

  /** Tokens that if encountered will throw an error */
  private readonly illegalItemTypes: ModuleItemType[] = [
    'ImportDeclaration',
    'ExportAllDeclaration',
    'ExportDeclaration',
    'ExportNamedDeclaration'
  ];

  private readonly parseOptions: ParseOptions = {
    syntax: 'typescript',
    target: 'es2022',
    tsx: true
  };

  private readonly transformOptions: TransformOptions = {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      target: 'es2022',
      transform: {
        react: {
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

  abstract transpiler: Transpiler;

  // eslint-disable-next-line perfectionist/sort-classes
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
    })`;
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

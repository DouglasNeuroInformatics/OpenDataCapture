import type { Options as CoreOptions, Output as CoreOutput, ParseOptions as CoreParseOptions } from '@swc/core';
import type { Module } from '@swc/types';
import type { Options as WebOptions, Output as WebOutput, ParseOptions as WebParseOptions } from '@swc/wasm-web';
import type { Simplify } from 'type-fest';

type TransformOptions = Simplify<CoreOptions & WebOptions>;

type TransformOutput = Simplify<CoreOutput & WebOutput>;

type ModuleItemType = Module['body'][number]['type'];

type ParseOptions = Simplify<Extract<CoreParseOptions & WebParseOptions, { syntax: 'typescript' }>>;

type Transpiler = {
  parse(src: string, options: ParseOptions): Promise<Module>;
  parseSync(src: string, options: ParseOptions): Module;
  transform(src: string, options: TransformOptions): Promise<TransformOutput>;
  transformSync(src: string, options: TransformOptions): TransformOutput;
};

let transpiler: Transpiler;
if (Object.hasOwn(globalThis, 'window')) {
  transpiler = await import('@swc/core');
} else {
  const { default: initSwc, ...rest } = await import('@swc/wasm-web');
  await initSwc();
  transpiler = rest;
}

export class InstrumentTransformer {
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
    target: 'es2020',
    tsx: true
  };

  private readonly transformOptions: TransformOptions = {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      target: 'es2020'
    },
    minify: true,
    module: {
      strict: true,
      type: 'es6'
    }
  };

  private readonly transpiler = transpiler;

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
    return `(({ z }) => {
      ${input}
      return __instrument__
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

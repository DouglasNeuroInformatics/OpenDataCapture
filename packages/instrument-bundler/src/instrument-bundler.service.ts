import { Injectable } from '@nestjs/common';

@Injectable()
export class InstrumentBundlerService {
  private readonly transpiler = new Bun.Transpiler({
    deadCodeElimination: false,
    loader: 'tsx',
    minifyWhitespace: true,
    target: 'browser'
  });

  bundle(source: string) {
    this.scan(source);
    return this.transpile(source);
  }

  /** Throw an error if the source code contains any imports or non-default exports */
  private scan(source: string) {
    const { exports, imports } = this.transpiler.scan(source);
    if (imports.length > 0) {
      throw new Error(`Unexpected import token '${imports[0]!.kind}' with path '${imports[0]!.path}'`);
    } else if (exports.length !== 1 || exports[0] !== 'default') {
      throw new Error(
        `Unexpected non-default exports: ${exports
          .filter((s) => s !== 'default')
          .map((s) => `'${s}'`)
          .join(', ')}`
      );
    }
  }

  private transpile(source: string) {
    let output = source;
    output = output.replace('export default', 'const __instrument__ =');
    output = `(({ z }) => {
        ${output}
        return __instrument__
      })`;
    return this.transpiler.transformSync(output);
  }
}

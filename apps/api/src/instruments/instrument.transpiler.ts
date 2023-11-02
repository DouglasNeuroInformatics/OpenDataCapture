import { Injectable } from '@nestjs/common';

@Injectable()
export class InstrumentTranspiler {
  private transpiler = new Bun.Transpiler({
    deadCodeElimination: false,
    loader: 'tsx',
    minifyWhitespace: true,
    target: 'browser'
  });

  transpile(source: string) {
    let output = source;
    this.validateModules(output);
    output = output.replace('export default', 'const __instrument__ =');
    output = `(({ z }) => {
      "use strict";
      ${output}
      return __instrument__
    })`;
    output = this.transpiler.transformSync(output);
    return output;
  }

  /** Throw an error if the source code contains any imports or non-default exports */
  private validateModules(source: string) {
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
}

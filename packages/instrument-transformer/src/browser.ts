import initSwc, { parse, parseSync, transform, transformSync } from '@swc/wasm-web';

import { BaseInstrumentTransformer } from './base';

await initSwc();

export class BrowserInstrumentTransformer extends BaseInstrumentTransformer {
  transpiler = {
    parse,
    parseSync,
    transform,
    transformSync
  };
}

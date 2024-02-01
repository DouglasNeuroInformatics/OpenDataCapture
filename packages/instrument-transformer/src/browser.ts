import * as esbuild from 'esbuild-wasm';

import { BaseInstrumentTransformer } from './base.js';

export class InstrumentTransformer extends BaseInstrumentTransformer {
  constructor() {
    super(esbuild);
  }

  async init(wasmURL: string) {
    return this.transpiler.initialize({
      wasmURL
    });
  }
}

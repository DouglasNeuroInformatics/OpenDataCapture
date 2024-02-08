import * as esbuild from 'esbuild-wasm';

import { BaseInstrumentTransformer } from './base.js';

export class InstrumentTransformer extends BaseInstrumentTransformer {
  constructor() {
    super(esbuild);
  }
}

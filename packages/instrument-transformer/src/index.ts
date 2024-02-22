import * as esbuild from 'esbuild';

import { BaseInstrumentTransformer } from './base.js.js';

export class InstrumentTransformer extends BaseInstrumentTransformer {
  constructor() {
    super(esbuild);
  }
}

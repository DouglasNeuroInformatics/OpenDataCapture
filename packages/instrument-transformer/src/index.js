import swc from '@swc/core';

import { BaseInstrumentTransformer } from './base.js';

export class InstrumentTransformer extends BaseInstrumentTransformer {
  constructor() {
    super(swc);
  }
}

import vm from 'vm';

import { Injectable } from '@nestjs/common';
import type { WithID } from '@opendatacapture/schemas/core';
import { type AnyInstrument } from '@opendatacapture/schemas/instrument';

type VirtualizationContext = {
  instruments: Map<string, WithID<AnyInstrument>>;
};

@Injectable()
export class VirtualizationService {
  ctx: VirtualizationContext = {
    instruments: new Map()
  };

  constructor() {
    vm.createContext(this.ctx, {
      codeGeneration: {
        strings: false,
        wasm: false
      }
    });
  }

  async getInstrumentInstance(instrument: { bundle: string; id: string }) {
    let instance = this.ctx.instruments.get(instrument.id);
    if (!instance) {
      instance = { ...((await this.runInContext(instrument.bundle)) as AnyInstrument), id: instrument.id };
      this.ctx.instruments.set(instrument.id, instance);
    }
    return instance;
  }

  async runInContext(code: string) {
    const instance: unknown = await vm.runInContext(code, this.ctx, {
      importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    });
    return instance;
  }
}

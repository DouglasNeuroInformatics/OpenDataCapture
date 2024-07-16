import vm from 'vm';

import { Injectable } from '@nestjs/common';
import type { AnyInstrument, InstrumentKind, SomeInstrument } from '@opendatacapture/schemas/instrument';

type VirtualizationContext = {
  instruments: Map<string, AnyInstrument>;
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
      instance = await this.runInContext(instrument.bundle);
      this.ctx.instruments.set(instrument.id, instance);
    }
    return instance;
  }

  async runInContext<TKind extends InstrumentKind = InstrumentKind>(code: string) {
    return Promise.resolve(
      vm.runInContext(code, this.ctx, {
        importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
      })
    ) as Promise<SomeInstrument<TKind>>;
  }
}

import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';
import { NotImplementedException } from '@nestjs/common';

import { type InstrumentDocument, InstrumentEntity } from './entities/instrument.entity';

export class InstrumentsRepository extends EntityRepository(InstrumentEntity) {
  create(): never {
    throw new NotImplementedException();
  }

  createFromSource(source: string) {
    return this.model.create({ source }) as Promise<InstrumentDocument>;
  }
}

import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { InstrumentEntity } from './entities/instrument.entity';

export class InstrumentsRepository extends EntityRepository(InstrumentEntity) {}

import { EntityRepository } from '@/base/entity.repository';

import { InstrumentEntity } from './entities/instrument.entity';

export class InstrumentsRepository extends EntityRepository(InstrumentEntity) {}


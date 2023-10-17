import { EntityRepository } from '@/database/entity.repository';

import { InstrumentEntity } from '../entities/instrument.entity';

export class InstrumentRepository extends EntityRepository(InstrumentEntity) {}


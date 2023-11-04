import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { InstrumentRecordEntity } from './entities/instrument-record.entity';

export class InstrumentRecordsRepository extends EntityRepository(InstrumentRecordEntity) {}

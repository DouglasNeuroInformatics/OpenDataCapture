import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { InstrumentRecordDocument, InstrumentRecordEntity } from '../entities/instrument-record.entity';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class InstrumentRecordsRepository extends EntityRepository<InstrumentRecordEntity, InstrumentRecordDocument> {
  constructor(
    @InjectModel(InstrumentRecordEntity.modelName)
    instrumentRecordModel: Model<InstrumentRecordDocument, AccessibleModel<InstrumentRecordDocument>>
  ) {
    super(instrumentRecordModel);
  }
}

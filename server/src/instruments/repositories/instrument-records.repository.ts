import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { InstrumentRecord, InstrumentRecordDocument } from '../schemas/instrument-record.schema';

import { EntityRepository } from '@/abstract/entity.repository';

@Injectable()
export class InstrumentRecordsRepository extends EntityRepository<InstrumentRecordDocument> {
  constructor(@InjectModel(InstrumentRecord.name) instrumentRecordModel: Model<InstrumentRecordDocument>) {
    super(instrumentRecordModel);
  }
}

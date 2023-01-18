import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Instrument, InstrumentDocument } from '../schemas/instrument.schema';

import { EntityRepository } from '@/abstract/entity.repository';

@Injectable()
export class InstrumentsRepository extends EntityRepository<InstrumentDocument> {
  constructor(@InjectModel(Instrument.name) instrumentModel: Model<InstrumentDocument>) {
    super(instrumentModel);
  }
}

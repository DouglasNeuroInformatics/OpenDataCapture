import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { Instrument, InstrumentDocument } from './entities/instrument.entity';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class InstrumentsRepository extends EntityRepository<Instrument, InstrumentDocument> {
  constructor(
    @InjectModel(Instrument.name) instrumentModel: Model<InstrumentDocument, AccessibleModel<InstrumentDocument>>
  ) {
    super(instrumentModel);
  }
}

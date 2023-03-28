import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { InstrumentDocument, InstrumentEntity } from '../entities/instrument.entity';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class InstrumentsRepository extends EntityRepository<InstrumentEntity, InstrumentDocument> {
  constructor(
    @InjectModel(InstrumentEntity.modelName) instrumentModel: Model<InstrumentDocument, AccessibleModel<InstrumentDocument>>
  ) {
    super(instrumentModel);
  }
}

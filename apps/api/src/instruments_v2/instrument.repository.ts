import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common';
import type { Model } from 'mongoose';

import { InstrumentEntity } from './entities/instrument.entity';

@Injectable()
export class InstrumentRepository {
  constructor(@InjectModel(InstrumentEntity.modelName) private model: Model<InstrumentEntity>) {}

  findAll() {
    return this.model.find();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common';
import type { Model, Types } from 'mongoose';

import { InstrumentEntity } from '../entities/instrument.entity';

@Injectable()
export class InstrumentRepository {
  constructor(@InjectModel(InstrumentEntity.modelName) private model: Model<InstrumentEntity>) {}

  create(entity: InstrumentEntity) {
    return this.model.create(entity);
  }

  findAll() {
    return this.model.find();
  }

  findById(id: Types.ObjectId) {
    return this.model.findById(id);
  }
}

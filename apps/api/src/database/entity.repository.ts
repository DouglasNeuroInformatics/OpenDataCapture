/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import type { Class } from 'type-fest';

type EntityClass<TEntity extends object> = Class<TEntity> & { modelName: string };

export function EntityRepository<TEntity extends object>(entity: EntityClass<TEntity>) {
  class BaseRepository {
    constructor(@InjectModel(entity.modelName) private readonly model: Model<TEntity>) {}

    create(entity: TEntity) {
      return this.model.create(entity);
    }

    findAll() {
      return this.model.find();
    }

    findById(id: Types.ObjectId) {
      return this.model.findById(id);
    }
  }
  return BaseRepository;
}

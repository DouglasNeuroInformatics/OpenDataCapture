import { Logger } from '@nestjs/common';

import mongoose from 'mongoose';

interface FindMethodArgs<Entity, EntityDocument = mongoose.HydratedDocument<Entity>> {
  filter?: mongoose.FilterQuery<EntityDocument>;
  projection?: mongoose.ProjectionType<EntityDocument>;
  options?: mongoose.QueryOptions<EntityDocument>;
}

/**
 * The EntityRepository abstract class is inherited by the repository classes
 * in each module. It defines a core set of behavior common across the application
 * and if mongoose implements breaking changes, or we want to migrate away from mongoose,
 * we can modify this class instead of the code in each module.
 */
export abstract class EntityRepository<Entity, EntityDocument = mongoose.HydratedDocument<Entity>> {
  protected readonly logger: Logger;

  constructor(protected readonly entityModel: mongoose.Model<EntityDocument>) {
    this.logger = new Logger(`${EntityRepository.name}: ${entityModel.modelName}`);
  }

  create(entity: Entity): Promise<EntityDocument> {
    this.logger.verbose(`Creating document with the following data: ${JSON.stringify(entity)}`);
    return this.entityModel.create(entity);
  }

  find(args: FindMethodArgs<Entity> = {}): mongoose.Query<EntityDocument[], EntityDocument> {
    return this.entityModel.find(args.filter ?? {}, args.projection, args.options);
  }

  findOne(args: FindMethodArgs<Entity> = {}): mongoose.Query<EntityDocument | null, EntityDocument> {
    return this.entityModel.findOne(args.filter ?? {}, args.projection, args.options);
  }

  findOneAndUpdate(
    filter: mongoose.FilterQuery<EntityDocument>,
    update: mongoose.UpdateQuery<EntityDocument>,
    options: Omit<mongoose.QueryOptions<EntityDocument>, 'new'> = {}
  ): Promise<EntityDocument | null> {
    return this.entityModel.findOneAndUpdate(filter, update, { ...options, new: true });
  }

  findOneAndDelete(
    filter: mongoose.FilterQuery<EntityDocument>,
    options: Omit<mongoose.QueryOptions<EntityDocument>, 'new'> = {}
  ): Promise<EntityDocument | null> {
    return this.entityModel.findOneAndDelete(filter, { ...options, new: true });
  }

  async exists(filterQuery: mongoose.FilterQuery<Entity>): Promise<boolean> {
    this.logger.verbose(`Checking for document matching the following query: ${JSON.stringify(filterQuery)}`);
    const result = (await this.entityModel.exists(filterQuery).exec()) !== null;
    this.logger.verbose(`Result: ${result}`);
    return result;
  }
}

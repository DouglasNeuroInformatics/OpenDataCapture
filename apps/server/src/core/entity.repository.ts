import { Logger } from '@nestjs/common';

import { FilterQuery, HydratedDocument, Model, ProjectionType, Query, QueryOptions, UpdateQuery } from 'mongoose';

interface FindMethodArgs<Entity, EntityDocument = HydratedDocument<Entity>> {
  filter?: FilterQuery<EntityDocument>;
  projection?: ProjectionType<EntityDocument>;
  options?: QueryOptions<EntityDocument>;
}

/**
 * The EntityRepository abstract class is inherited by the repository classes
 * in each module. It defines a core set of behavior common across the application
 * and if implements breaking changes, or we want to migrate away from
 * we can modify this class instead of the code in each module.
 */
export abstract class EntityRepository<Entity, EntityDocument = HydratedDocument<Entity>> {
  protected readonly logger: Logger;

  constructor(protected readonly entityModel: Model<EntityDocument>) {
    this.logger = new Logger(`${EntityRepository.name}: ${entityModel.modelName}`);
  }

  create(entity: Entity): Promise<EntityDocument> {
    this.logger.verbose(`Creating document with the following data: ${JSON.stringify(entity)}`);
    return this.entityModel.create(entity);
  }

  find(args: FindMethodArgs<Entity> = {}): Query<EntityDocument[], EntityDocument> {
    return this.entityModel.find(args.filter ?? {}, args.projection, args.options);
  }

  findOne(args: FindMethodArgs<Entity> = {}): Query<EntityDocument | null, EntityDocument> {
    return this.entityModel.findOne(args.filter ?? {}, args.projection, args.options);
  }

  findOneAndUpdate(
    filter: FilterQuery<EntityDocument>,
    update: UpdateQuery<EntityDocument>,
    options: Omit<QueryOptions<EntityDocument>, 'new'> = {}
  ): Promise<EntityDocument | null> {
    return this.entityModel.findOneAndUpdate(filter, update, { ...options, new: true });
  }

  findOneAndDelete(
    filter: FilterQuery<EntityDocument>,
    options: Omit<QueryOptions<EntityDocument>, 'new'> = {}
  ): Promise<EntityDocument | null> {
    return this.entityModel.findOneAndDelete(filter, { ...options, new: true });
  }

  async exists(filterQuery: FilterQuery<Entity>): Promise<boolean> {
    this.logger.verbose(`Checking for document matching the following query: ${JSON.stringify(filterQuery)}`);
    const result = (await this.entityModel.exists(filterQuery).exec()) !== null;
    this.logger.verbose(`Result: ${result}`);
    return result;
  }
}

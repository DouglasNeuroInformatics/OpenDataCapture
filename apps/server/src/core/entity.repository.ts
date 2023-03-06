import { Logger } from '@nestjs/common';

import { FilterQuery, HydratedDocument, Model } from 'mongoose';

interface CreateEntityOptions {
  requireUnique: boolean;
}

/**
 * The EntityRepository abstract class is inherited by the repository classes
 * in each module. It defines a core set of behavior common across the application
 * and if mongoose implements breaking changes, or we want to migrate away from mongoose,
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

  async exists(filterQuery: FilterQuery<Entity>): Promise<boolean> {
    this.logger.verbose(`Checking for document matching the following query: ${JSON.stringify(filterQuery)}`);
    const result = (await this.entityModel.exists(filterQuery).exec()) !== null;
    this.logger.verbose(`Result: ${result}`);
    return result;
  }
}

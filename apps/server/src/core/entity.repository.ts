import { Logger } from '@nestjs/common';

import { HydratedDocument, Model } from 'mongoose';

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
}

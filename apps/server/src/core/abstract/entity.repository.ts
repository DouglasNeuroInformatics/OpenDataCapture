import { Logger } from '@nestjs/common';

import { AccessibleModel } from '@casl/mongoose';
import {
  FilterQuery,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  QueryWithHelpers,
  UpdateQuery
} from 'mongoose';

interface FindMethodArgs<T, TDoc = HydratedDocument<T>> {
  filter?: FilterQuery<TDoc>;
  projection?: ProjectionType<TDoc>;
  options?: QueryOptions<TDoc>;
}

/**
 * The EntityRepository abstract class is inherited by the repository classes
 * in each module. It defines a core set of behavior common across the application
 * and if implements breaking changes, or we want to migrate away from
 * we can modify this class instead of the code in each module.
 */
export abstract class EntityRepository<T, TDoc = HydratedDocument<T>> {
  protected readonly logger: Logger;

  constructor(protected readonly model: Model<TDoc, AccessibleModel<TDoc>>) {
    this.logger = new Logger(`${EntityRepository.name}: ${model.modelName}`);
  }

  create(entity: T): Promise<TDoc> {
    this.logger.verbose(`Creating document with the following data: ${JSON.stringify(entity)}`);
    return this.model.create(entity);
  }

  find(args: FindMethodArgs<T> = {}): QueryWithHelpers<TDoc[], TDoc, AccessibleModel<TDoc>> {
    return this.model.find(args.filter ?? {}, args.projection, args.options);
  }

  findOne(args: FindMethodArgs<T> = {}): QueryWithHelpers<TDoc | null, TDoc, AccessibleModel<TDoc>> {
    return this.model.findOne(args.filter ?? {}, args.projection, args.options);
  }

  findOneAndUpdate(
    filter: FilterQuery<TDoc>,
    update: UpdateQuery<TDoc>,
    options: Omit<QueryOptions<TDoc>, 'new'> = {}
  ): Promise<TDoc | null> {
    return this.model.findOneAndUpdate(filter, update, { ...options, new: true });
  }

  findOneAndDelete(filter: FilterQuery<TDoc>, options: Omit<QueryOptions<TDoc>, 'new'> = {}): Promise<TDoc | null> {
    return this.model.findOneAndDelete(filter, { ...options, new: true });
  }

  async exists(filterQuery: FilterQuery<T>): Promise<boolean> {
    this.logger.verbose(`Checking for document matching the following query: ${JSON.stringify(filterQuery)}`);
    const result = (await this.model.exists(filterQuery).exec()) !== null;
    this.logger.verbose(`Result: ${result}`);
    return result;
  }
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Logger } from '@nestjs/common';

import { AccessibleModel } from '@casl/mongoose';
import { Types } from 'mongoose';
import type M from 'mongoose';

/**
 * The EntityRepository abstract class is inherited by the repository classes
 * in each module. It defines a core set of behavior common across the application
 * and if implements breaking changes, or we want to migrate away from
 * we can modify this class instead of the code in each module.
 */
export abstract class EntityRepository<T, TDoc = M.HydratedDocument<T>> {
  protected readonly logger: Logger;

  constructor(protected readonly model: M.Model<TDoc, AccessibleModel<TDoc>>) {
    this.logger = new Logger(`${EntityRepository.name}: ${model.modelName}`);
  }

  create(entity: T) {
    return this.model.create(entity);
  }

  find(filter?: M.FilterQuery<TDoc>, projection?: M.ProjectionType<TDoc>, options?: M.QueryOptions<TDoc>) {
    return this.model.find(filter ?? {}, projection, options);
  }

  findOne(filter: M.FilterQuery<TDoc>, projection?: M.ProjectionType<TDoc>, options?: M.QueryOptions<TDoc>) {
    return this.model.findOne(filter, projection, options);
  }

  findOneAndUpdate(
    filter: M.FilterQuery<TDoc>,
    update: M.UpdateQuery<TDoc>,
    options: Omit<M.QueryOptions<TDoc>, 'new'> = {}
  ) {
    return this.model.findOneAndUpdate(filter, update, { ...options, new: true });
  }

  findOneAndDelete(filter: M.FilterQuery<TDoc>, options: Omit<M.QueryOptions<TDoc>, 'new'> = {}): Promise<TDoc | null> {
    return this.model.findOneAndDelete(filter, { ...options, new: true });
  }

  findById(id: string) {
    if (!this.isObjectId(id)) {
      return null;
    }
    return this.model.findById(id);
  }

  deleteById(id: string) {
    if (!this.isObjectId(id)) {
      return null;
    }
    return this.model.findByIdAndDelete(id);
  }

  async exists(filterQuery: M.FilterQuery<T>): Promise<boolean> {
    this.logger.verbose(`Checking for document matching the following query: ${JSON.stringify(filterQuery)}`);
    const result = (await this.model.exists(filterQuery).exec()) !== null;
    this.logger.verbose(`Result: ${result}`);
    return result;
  }

  private isObjectId(value: string | number): boolean {
    return Types.ObjectId.isValid(value);
  }
}

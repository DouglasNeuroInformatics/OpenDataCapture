import { Logger } from '@nestjs/common';

import { Document, FilterQuery, Model, ProjectionType } from 'mongoose';

export abstract class EntityRepository<T, U extends Document> {
  protected readonly logger: Logger;

  constructor(protected readonly entityModel: Model<U>) {
    this.logger = new Logger(`${EntityRepository.name}: ${entityModel.modelName}`);
  }

  async create(entityDoc: T): Promise<U> {
    this.logger.verbose('create()');
    return this.entityModel.create(entityDoc);
  }

  async find(filterQuery: FilterQuery<T>, projection?: ProjectionType<T>, populate: string[] = []): Promise<U[]> {
    this.logger.verbose('find()');
    return this.entityModel.find(filterQuery, projection).populate(populate).exec();
  }

  async findOne(filterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<U | null> {
    this.logger.verbose('findOne()');
    return this.entityModel.findOne(filterQuery, projection).exec();
  }

  async findAll(): Promise<U[]> {
    this.logger.verbose('findAll()');
    return this.entityModel.find().exec();
  }

  async exists(filterQuery: FilterQuery<T>): Promise<boolean> {
    this.logger.verbose('exists()');
    return (await this.entityModel.exists(filterQuery).exec()) !== null;
  }
}

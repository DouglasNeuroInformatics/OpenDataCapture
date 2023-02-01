import { Document, FilterQuery, Model } from 'mongoose';

export abstract class EntityRepository<T, U extends Document> {
  constructor(protected readonly entityModel: Model<U>) {}

  async create(entityDoc: T): Promise<U> {
    return this.entityModel.create(entityDoc);
  }

  async find(filterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<U[]> {
    return this.entityModel.find(filterQuery, projection).exec();
  }

  async findOne(filterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<U | null> {
    return this.entityModel.findOne(filterQuery, projection).exec();
  }

  async findAll(): Promise<U[]> {
    return this.entityModel.find().exec();
  }

  async exists(filterQuery: FilterQuery<T>): Promise<boolean> {
    return (await this.entityModel.exists(filterQuery).exec()) !== null;
  }
}

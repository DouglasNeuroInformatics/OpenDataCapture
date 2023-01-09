import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class EntityRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async create(entityDoc: unknown): Promise<T> {
    return this.entityModel.create(entityDoc);
  }

  async find(filterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<T[]> {
    return this.entityModel.find(filterQuery, projection).exec();
  }

  async findOne(filterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<T | null> {
    return this.entityModel.findOne(filterQuery, projection).exec();
  }

  async findAll(): Promise<T[]> {
    return this.entityModel.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.entityModel.findById(id);
  }

  async updateById(id: string, updateQuery: UpdateQuery<unknown>): Promise<T | null> {
    return this.entityModel.findByIdAndUpdate(id, updateQuery, {
      new: true
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const deletedEntity = await this.entityModel.findByIdAndDelete(id);
    return deletedEntity !== null;
  }

  async deleteOne(filterQuery: FilterQuery<T>): Promise<boolean> {
    const deletedEntity = await this.entityModel.findOneAndDelete(filterQuery);
    return deletedEntity !== null;
  }

  async exists(filterQuery: FilterQuery<T>): Promise<boolean> {
    return (await this.entityModel.exists(filterQuery).exec()) !== null;
  }
}

import { Document, Model } from 'mongoose';

export class AbstractRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: object): Promise<T> {
    return this.model.create(doc)
  }
}

import type Zod from 'zod';
import { z } from 'zod';

export type ValidatorOptions<T> = {
  schemaFactory: (z: typeof Zod.z) => Zod.ZodType<T>;
};

export class Validator<T> {
  public schema: Zod.ZodType<T>;
  public source: string;

  constructor({ schemaFactory }: ValidatorOptions<T>) {
    this.schema = schemaFactory(z);
    this.source = schemaFactory.toString();
  }

  serialize() {
    return null;
  }
}

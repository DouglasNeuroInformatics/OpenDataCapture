/* eslint-disable @typescript-eslint/no-implied-eval */

import type Zod from 'zod';
import { z } from 'zod';

type SchemaFactory<T> = (z: typeof Zod.z) => Zod.ZodType<T>;

export type ValidatorOptions<T> = {
  schemaFactory: SchemaFactory<T>;
};

export class Validator<T> {
  public schema: Zod.ZodType<T>;
  public source: string;

  constructor({ schemaFactory }: ValidatorOptions<T>) {
    this.schema = schemaFactory(z);
    this.source = schemaFactory.toString();
  }

  static fromSource(source: string) {
    return eval(source) as SchemaFactory<unknown>; //; // new Function('z', `(${source})(z)`);
  }

  serialize() {
    return null;
  }
}

const validator = new Validator({
  schemaFactory: (z) =>
    z.object({
      a: z.any()
    })
});

const x = Validator.fromSource(validator.source);
console.log(x.toString());

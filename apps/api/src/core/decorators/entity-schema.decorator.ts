import { Schema, type SchemaOptions } from '@nestjs/mongoose';
import type { Class, ConditionalExcept } from 'type-fest';

const defaultSchemaOptions = {
  id: true,
  strict: 'throw',
  timestamps: true
} satisfies SchemaOptions;

type EntitySchemaOptions = ConditionalExcept<SchemaOptions, keyof typeof defaultSchemaOptions>;

type EntityConstructor<T> = Class<T> & {
  readonly modelName: string;
};

export function EntitySchema<T>(options: EntitySchemaOptions = {}) {
  return (target: EntityConstructor<Omit<T, 'id'>>) => {
    Schema({ ...defaultSchemaOptions, ...options })(target);
  };
}

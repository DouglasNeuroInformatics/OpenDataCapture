import { Schema, type SchemaOptions } from '@nestjs/mongoose';

const defaultEntitySchemaOptions = {
  id: true,
  strict: 'throw',
  timestamps: true
} satisfies SchemaOptions;

type EntitySchemaOptions = {
  [K in keyof SchemaOptions as K extends keyof typeof defaultEntitySchemaOptions ? never : K]: SchemaOptions[K];
};

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function BaseEntity(name: string, options?: EntitySchemaOptions) {
  @Schema({ ...defaultEntitySchemaOptions, ...options })
  class Base {
    static readonly modelName = name;
    id: string;
  }

  return Base;
}

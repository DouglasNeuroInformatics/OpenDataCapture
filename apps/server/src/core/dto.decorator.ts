import type { JSONSchemaType } from 'ajv';

/**
 * Decorator to define the validation schema for DTO objects. Modifies the default
 * AJV behavior such that if not defined, additional properties are prohibited.
 */
export function Dto<T extends object>(schema: JSONSchemaType<T>) {
  return (target: new (...args: any[]) => T): void => {
    if (!schema.additionalProperties) {
      schema.additionalProperties = false;
    }
    Reflect.defineMetadata('ValidationSchema', schema, target);
  };
}

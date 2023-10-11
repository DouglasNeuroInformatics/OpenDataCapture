import type { JSONSchemaType } from 'ajv';
import type { Class } from 'type-fest';

/**
 * Decorator to define the validation schema for DTO objects. Modifies the default
 * AJV behavior such that if not defined, additional properties are prohibited.
 */
export function ValidationSchema<T extends object>(schema: JSONSchemaType<T>) {
  return (target: Class<T>): void => {
    if (!schema.additionalProperties) {
      schema.additionalProperties = false;
    }
    Reflect.defineMetadata('ValidationSchema', schema, target);
  };
}

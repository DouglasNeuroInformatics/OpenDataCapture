import type { JSONSchemaType, JSONType } from 'ajv';

export type FormFieldDataType = string | number | boolean;

export type FormSchemaDataType = Record<string, FormFieldDataType>;
/**
 * From what I can tell, JSONSchemaType does not work with generic types
 * and the AJV maintainers have no plans to fix this, as of February 2023
 * https://github.com/ajv-validator/ajv/issues/2202
 */
export type FormSchemaType<T extends Record<string, any>> = JSONSchemaType<T> & {
  type: 'object';
  properties: {
    [key: string]: {
      type: JSONType;
    };
  };
};

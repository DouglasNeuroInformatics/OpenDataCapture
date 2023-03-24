import { JSONSchemaType } from 'ajv';

import { FormField } from '../interfaces';

export {};
/*
export const formFieldSchema: JSONSchemaType<FormField> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      pattern: '^S+$'
    },
    label: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['description', 'label', 'name']
};
*/

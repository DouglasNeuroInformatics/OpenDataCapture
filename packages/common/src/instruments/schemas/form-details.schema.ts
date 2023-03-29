import { JSONSchemaType } from 'ajv';

import { FormDetails } from '../interfaces/form/form-details.interface';

export const formDetailsSchema: JSONSchemaType<FormDetails> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1
    },
    language: {
      type: 'string',
      enum: ['en', 'fr']
    },
    instructions: {
      type: 'string',
      minLength: 1
    },
    estimatedDuration: {
      type: 'integer',
      minimum: 1
    }
  },
  required: ['description', 'estimatedDuration', 'instructions', 'language', 'title']
};

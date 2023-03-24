import { JSONSchemaType } from 'ajv';

import { Language } from '../enums';
import { InstrumentDetails } from '../interfaces';

/** Validation schema for an InstrumentDetails object. Refer to the interface for property descriptions. */
export const instrumentDetailsSchema: JSONSchemaType<InstrumentDetails> = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      minLength: 1
    },
    language: {
      type: 'string',
      enum: Object.values(Language)
    },
    instructions: {
      type: 'string',
      minLength: 1
    },
    estimatedDuration: {
      type: 'integer',
      minimum: 1
    },
    version: {
      type: 'number',
      minimum: 0
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      }
    }
  },
  required: ['description', 'estimatedDuration', 'instructions', 'language', 'tags', 'version']
};

import { JSONSchemaType } from 'ajv';

import { FormInstrument } from '../interfaces/form/form-instrument.types';

import { formDetailsSchema } from './form-details.schema';
import { formFieldsGroupSchema, formFieldsSchema } from './form-fields.schema';

export const formInstrumentSchema: JSONSchemaType<FormInstrument> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      const: 'form'
    },
    name: {
      type: 'string',
      minLength: 1
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      }
    },
    version: {
      type: 'number',
      minimum: 1
    },
    details: formDetailsSchema,
    content: {
      oneOf: [
        formFieldsSchema,
        {
          type: 'array',
          items: formFieldsGroupSchema
        }
      ]
    },
    validationSchema: {
      type: 'object'
    },
    computedMeasures: {
      type: 'object',
      nullable: true,
      required: []
    }
  },
  required: ['content', 'details', 'kind', 'name', 'tags', 'version']
};

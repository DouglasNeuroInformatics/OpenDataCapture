import { JSONSchemaType } from 'ajv';

import { InstrumentKind } from '../enums/instrument-kind.enum';
import { FormInstrument } from '../interfaces/form-instrument.interface';

import { formDetailsSchema } from './form-details.schema';
import { formFieldSchema } from './form-field.schema';


export const formInstrumentSchema: JSONSchemaType<FormInstrument> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      const: InstrumentKind.Form
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
      type: 'array',
      items: formFieldSchema
    },
    validationSchema: {
      type: 'object'
    }
  },
  required: ['content', 'details', 'kind', 'name', 'tags', 'version']
};

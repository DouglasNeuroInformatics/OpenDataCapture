import { JSONSchemaType } from 'ajv';

import { InstrumentKind } from '../enums';
import { Instrument } from '../interfaces';

import { instrumentDetailsSchema } from './instrument-details.schema';

/** Validation schema for an Instrument object. Refer to the interface for property descriptions. */
export const instrumentSchema: JSONSchemaType<Instrument> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: Object.values(InstrumentKind)
    },
    title: {
      type: 'string',
      minLength: 1
    },
    details: instrumentDetailsSchema
  }
};

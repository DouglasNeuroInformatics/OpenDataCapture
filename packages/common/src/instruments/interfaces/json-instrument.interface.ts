import { JSONSchemaType } from 'ajv';

import { BaseInstrument } from './base-instrument.interface';

export interface JSONInstrument<TContent, TData> extends BaseInstrument<TContent> {
  /** The validation schema for the content of the instrument */
  validationSchema: JSONSchemaType<TData>;
}

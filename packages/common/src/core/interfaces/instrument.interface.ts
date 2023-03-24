import { InstrumentKind } from '../enums';

import { FormField } from './form-field.interface';
import { InstrumentDetails } from './instrument-details.interface';

/** Defines the base properties common to all instruments */
export interface Instrument {
  /** Discriminator key */
  kind: InstrumentKind;

  /** The title of the instrument which should omit the definite article */
  title: string;

  /** Metadata for the instrument. See InstrumentDetails for more information. */
  details: InstrumentDetails;

  /** The content of the instrument, which defines that the user will complete */
  content: any;
}

export interface Form extends Instrument {
  content: FormField[]
}
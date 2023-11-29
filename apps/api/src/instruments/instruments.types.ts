import type { ObjectIdLike } from '@douglasneuroinformatics/nestjs/modules';
import type { Instrument } from '@open-data-capture/common';

export type PopulatedInstrument<T extends Instrument> = T & {
  _id: ObjectIdLike;
  bundle: string;
  source: string;
};

/* eslint-disable perfectionist/sort-objects */

import type { FormInstrumentFields } from '@open-data-capture/common/instrument';

export type GenericInstrumentData = {
  binaryCheck: boolean;
  binaryRadio: boolean;
  date: Date;
  numericDefault: number;
  numericSlider: number;
  options: 'a' | 'b' | 'c';
  textLong: string;
  textPassword: string;
  textShort: string;
};

type GenericInstrument = FormInstrument<GenericInstrumentData, 'en'>;

type Fields = FormInstrumentFields<GenericInstrumentData, 'en'>;

type T = Fields['textLong'];

const x: T = {
  kind: 'date'
}
export const genericInstrument: GenericInstrument = {
  kind: 'form',
  language: 'en',
  name: 'GenericInstrument',
  tags: ['Example'],
  version: 1.0,
  content: {
    binaryCheck: {
      kind: 'binary',
      label: 'Checkbox',
      variant: 'checkbox'
    },
    binaryRadio: {
      kind: 'binary',
      label: 'Radio',
      variant: 'radio'
    }
  }
};

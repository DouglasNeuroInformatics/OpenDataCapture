import { FormInstrument } from '@douglasneuroinformatics/common';

export type Measurements = Array<{
  [key: string]: any;
  time: number;
}>;

export type SelectedMeasure = {
  key: string;
  label: string;
};

export type SelectedInstrument = FormInstrument & { identifier: string };

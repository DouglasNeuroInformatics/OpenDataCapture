import { FormInstrument } from '@ddcp/types';

export type Measurements = {
  [key: string]: any;
  time: number;
}[];

export type SelectedMeasure = {
  key: string;
  label: string;
};

export type SelectedInstrument = FormInstrument & { identifier: string };

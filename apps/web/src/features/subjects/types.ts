import type { FormInstrument } from '@open-data-capture/common/instrument';

export type Measurements = {
  [key: string]: unknown;
  time: number;
}[];

export type SelectedMeasure = {
  key: string;
  label: string;
};

export type SelectedInstrument = FormInstrument & { identifier: string };

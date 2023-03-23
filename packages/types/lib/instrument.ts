export type InstrumentKind = 'FORM';

export type InstrumentLanguage = 'EN' | 'FR';

export interface InstrumentDetails {
  description: string;
  language: InstrumentLanguage;
  instructions: string;
  estimatedDuration: number;
  version: number;
}

export interface Instrument {
  kind: InstrumentKind;
  title: string;
  details: InstrumentDetails;
  data: any;
}

export type FormFieldVariant = 'TEXT';

import { InstrumentKind } from '../enums/instrument-kind.enum';
import { InstrumentLanguage } from '../enums/instrument-language.enum';

export interface BaseInstrument {
  kind: InstrumentKind;
  title: string;
  details: {
    description: string;
    language: InstrumentLanguage;
    instructions: string;
    estimatedDuration: number;
    version: number;
  };
  data: any;
}

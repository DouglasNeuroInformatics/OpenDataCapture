import { InstrumentKind } from '@/instruments/enums/instrument-kind.enum';

export interface BaseInstrument<TContent = any> {
  kind: InstrumentKind;
  name: string;
  tags: string[];
  version: number;
  content: TContent;
}


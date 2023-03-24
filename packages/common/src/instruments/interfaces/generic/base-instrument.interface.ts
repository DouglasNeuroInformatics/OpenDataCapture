import { InstrumentKind } from '@/instruments/enums/instrument-kind.enum';

export interface BaseInstrument<TContent> {
  kind: InstrumentKind;
  name: string;
  tags: string[];
  version: number;
  content: TContent;
}


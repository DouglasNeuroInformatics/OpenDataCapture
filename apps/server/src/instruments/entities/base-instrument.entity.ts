import { BaseInstrument, InstrumentKind } from '@ddcp/types';

export abstract class BaseInstrumentEntity implements BaseInstrument {
  identifier: string;
  name: string;
  tags: string[];
  version: number;
  abstract kind: InstrumentKind;
  abstract content: any;
}

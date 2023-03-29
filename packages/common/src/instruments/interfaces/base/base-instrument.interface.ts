export type InstrumentKind = 'form';

export interface BaseInstrument<TContent = any> {
  kind: InstrumentKind;
  name: string;
  tags: string[];
  version: number;
  content: TContent;
}

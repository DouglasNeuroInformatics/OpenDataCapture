export type InstrumentKind = 'form';

export type BaseInstrument<TContent = any> = {
  kind: InstrumentKind;
  name: string;
  tags: string[];
  version: number;
  content: TContent;
}

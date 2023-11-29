import type {
  BaseInstrument,
  BaseInstrumentDetails,
  InstrumentKind,
  InstrumentLanguage,
  InstrumentUIOption
} from '@open-data-capture/common/instrument';

export class InstrumentEntity implements Omit<BaseInstrument, 'content' | 'validationSchema'> {
  static readonly modelName = 'InstrumentSource';
  bundle: string;
  details: BaseInstrumentDetails;
  kind: InstrumentKind;
  language: InstrumentLanguage;
  name: string;
  source: string;
  tags: InstrumentUIOption<InstrumentLanguage, string[]>;
  version: number;
}

import type * as Types from '@open-data-capture/common/instrument';
import type Zod from 'zod';

export abstract class BaseInstrumentEntity<
  TData = unknown,
  TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage
> implements Types.BaseInstrument<TData, TLanguage>
{
  details: Types.InstrumentDetails<TLanguage>;
  language: TLanguage;
  name: string;
  tags: Types.InstrumentUIOption<TLanguage, string[]>;
  validationSchema: Zod.ZodType<TData>;
  version: number;
  abstract content: unknown;
  abstract kind: Types.InstrumentKind;
}

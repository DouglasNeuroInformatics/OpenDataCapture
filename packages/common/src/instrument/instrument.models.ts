import type * as Base from '@douglasneuroinformatics/form-types';

import type * as Types from './instrument.types';

export abstract class BaseInstrument<TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage>
  implements Types.BaseInstrumentType<TLanguage>
{
  /** The details of the instrument to be displayed to the user */
  details: Types.InstrumentDetails;

  /** The MongoDB ObjectId represented as a hex string */
  id?: string;

  /** The language(s) in which the instrument is written */
  language: TLanguage;

  /** The name of the instrument, which must be unique for a given version */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: Types.InstrumentUIOption<TLanguage, string[]>;

  /** The version of the instrument */
  version: number;

  constructor({
    details,
    id,
    language,
    name,
    tags,
    version
  }: Omit<Types.BaseInstrumentType<TLanguage>, 'content' | 'kind'>) {
    this.details = details;
    this.id = id;
    this.language = language;
    this.name = name;
    this.tags = tags;
    this.version = version;
  }

  /** The content in the instrument to be rendered to the user */
  abstract content?: unknown;

  /** The discriminator key for the type of instrument */
  abstract kind: Types.InstrumentKind;
}

export class FormInstrument<
    TData extends Base.FormDataType = Base.FormDataType,
    TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage
  >
  extends BaseInstrument<TLanguage>
  implements Types.FormInstrumentType<TData, TLanguage>
{
  content: Types.FormInstrumentContent<TData, TLanguage>;
  kind: 'form';
  measures?: Types.FormInstrumentMeasures<TData, TLanguage>;

  constructor({ content, kind, measures, ...props }: Types.FormInstrumentType<TData, TLanguage>) {
    super(props);
    this.content = content;
    this.kind = kind;
    this.measures = measures;
  }
}

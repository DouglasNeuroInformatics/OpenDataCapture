declare type Language = import('@open-data-capture/common').Core.Language;

declare type FormDataType = import('@douglasneuroinformatics/form-types').FormDataType;

declare type InstrumentLanguage = import('@open-data-capture/common').Instrument.InstrumentLanguage;

declare type FormInstrument<
  TData extends FormDataType,
  TLanguage extends InstrumentLanguage
> = import('@open-data-capture/common').Instrument.FormInstrument<TData, TLanguage>;

declare const z: typeof import('zod').z;

declare global {
  type Language = import('@open-data-capture/common').Language;

  type FormDataType = import('@douglasneuroinformatics/form-types').FormDataType;

  type InstrumentLanguage = import('@open-data-capture/common').InstrumentLanguage;

  type FormInstrument<
    TData extends FormDataType,
    TLanguage extends InstrumentLanguage
  > = import('@open-data-capture/common').FormInstrument<TData, TLanguage>;

  const z: typeof import('zod').z;
}

export {};

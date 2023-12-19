import * as React from 'react';

import * as Zod from 'zod';

declare global {
  type Json = import('@open-data-capture/common/core').Json;

  type Language = import('@open-data-capture/common/core').Language;

  type FormDataType = import('@douglasneuroinformatics/form-types').FormDataType;

  type InstrumentLanguage = import('@open-data-capture/common/instrument').InstrumentLanguage;

  type FormInstrument<
    TData extends FormDataType,
    TLanguage extends InstrumentLanguage
  > = import('@open-data-capture/common/instrument').FormInstrument<TData, TLanguage>;

  type StrictFormInstrument<
    TData extends FormDataType,
    TLanguage extends InstrumentLanguage
  > = import('@open-data-capture/common/instrument').StrictFormInstrument<TData, TLanguage>;

  type InteractiveInstrument<
    TData extends Json = Json,
    TLanguage extends Language = Language
  > = import('@open-data-capture/common/instrument').InteractiveInstrument<TData, TLanguage>;
}

export { React, Zod };

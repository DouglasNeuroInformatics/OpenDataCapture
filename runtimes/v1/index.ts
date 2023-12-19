import * as React from 'react';

import * as Zod from 'zod';

// /**
//  * If these are not aliased, then a bug in `rollup-plugin-dts` causes the
//  * type to reference itself, resulting in any.
//  *
//  * This is because if type T is declared earlier in the bundle, then it
//  * attempts to simplify `import('foo').T` to just T, thereby resulting in
//  * `type T = T`, which causes a circular reference error,
//  *
//  * For a potentially cleaner solution, follow:
//  * https://github.com/microsoft/TypeScript/issues/10187
//  */

type _FormDataType = import('@douglasneuroinformatics/form-types').FormDataType;
type _Json = import('@open-data-capture/common/core').Json;
type _Language = import('@open-data-capture/common/core').Language;
type _InstrumentLanguage = import('@open-data-capture/common/instrument').InstrumentLanguage;
type _FormInstrument<
  TData extends _FormDataType,
  TLanguage extends _InstrumentLanguage
> = import('@open-data-capture/common/instrument').FormInstrument<TData, TLanguage>;
type _StrictFormInstrument<
  TData extends FormDataType,
  TLanguage extends InstrumentLanguage
> = import('@open-data-capture/common/instrument').StrictFormInstrument<TData, TLanguage>;
type _InteractiveInstrument<
  TData extends Json = Json,
  TLanguage extends Language = Language
> = import('@open-data-capture/common/instrument').InteractiveInstrument<TData, TLanguage>;

declare global {
  type FormDataType = _FormDataType;
  type Json = _Json;
  type Language = _Language;
  type InstrumentLanguage = _InstrumentLanguage;
  type FormInstrument<TData extends FormDataType, TLanguage extends InstrumentLanguage> = _FormInstrument<
    TData,
    TLanguage
  >;
  type StrictFormInstrument<TData extends FormDataType, TLanguage extends InstrumentLanguage> = _StrictFormInstrument<
    TData,
    TLanguage
  >;
  type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = _InteractiveInstrument<
    TData,
    TLanguage
  >;
}

export { React, Zod };

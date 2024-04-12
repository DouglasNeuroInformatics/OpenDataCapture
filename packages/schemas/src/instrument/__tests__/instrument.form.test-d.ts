import type { Language } from '@opendatacapture/instrument-stubs/forms';
import { expectTypeOf } from 'expect-type';

import type { InstrumentLanguage } from '../instrument.base.ts';
import type {
  AnyFormInstrumentScalarField,
  FormInstrumentBooleanField,
  FormInstrumentDateField,
  FormInstrumentNumberField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStringField
} from '../instrument.form.ts';

/** FormInstrumentScalarField */
{
  // With no parameters, it should be a union of all scalar types
  expectTypeOf<FormInstrumentScalarField['kind']>().toMatchTypeOf<AnyFormInstrumentScalarField['kind']>();
  expectTypeOf<FormInstrumentScalarField>().toMatchTypeOf<AnyFormInstrumentScalarField>();

  // Default date types passed into FormInstrumentScalarField should resolve the default FormInstrument[Type]Field(s)
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrumentDateField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Set<string>>>().toEqualTypeOf<FormInstrumentSetField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrumentStringField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrumentNumberField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, boolean>>().toEqualTypeOf<FormInstrumentBooleanField>();

  // Union literal keys should resolve correctly
  expectTypeOf<
    keyof Extract<FormInstrumentScalarField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
  >().toEqualTypeOf<'a' | 'b' | 'c'>();
  expectTypeOf<
    keyof Extract<FormInstrumentScalarField<Language, 1 | 2 | 3>, { options: object }>['options']
  >().toEqualTypeOf<1 | 2 | 3>();
  expectTypeOf<keyof FormInstrumentScalarField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
    'a' | 'b' | 'c'
  >();

  // Non-union keys should resolve correctly
  expectTypeOf<
    keyof Extract<FormInstrumentScalarField<Language, string>, { options: object }>['options']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    keyof Extract<FormInstrumentScalarField<Language, number>, { options: object }>['options']
  >().toEqualTypeOf<number>();
  expectTypeOf<keyof FormInstrumentScalarField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
}

/** FormInstrumentStaticField */

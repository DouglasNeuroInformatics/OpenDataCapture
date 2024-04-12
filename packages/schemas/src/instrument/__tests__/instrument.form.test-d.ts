import type {
  NumberRecordFieldValue,
  RecordArrayFieldValue,
  RequiredFieldValue
} from '@douglasneuroinformatics/libui-form-types';
import type { Language } from '@opendatacapture/instrument-stubs/forms';
import { expectTypeOf } from 'expect-type';

import type { InstrumentLanguage } from '../instrument.base.ts';
import type {
  AnyFormInstrumentField,
  AnyFormInstrumentScalarField,
  AnyFormInstrumentStaticField,
  FormInstrumentBooleanField,
  FormInstrumentDateField,
  FormInstrumentNumberField,
  FormInstrumentNumberRecordField,
  FormInstrumentRecordArrayField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStaticField,
  FormInstrumentStringField,
  FormInstrumentUnknownField
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
{
  // With no parameters, it should be a union of all static types
  expectTypeOf<FormInstrumentStaticField>().toEqualTypeOf<AnyFormInstrumentStaticField>();
  expectTypeOf<FormInstrumentStaticField['kind']>().toEqualTypeOf<AnyFormInstrumentStaticField['kind']>();

  // Default date types passed into FormInstrumentStaticField should resolve the default FormInstrument[Type]Field(s)
  expectTypeOf<FormInstrumentStaticField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrumentDateField>();
  expectTypeOf<FormInstrumentStaticField<InstrumentLanguage, Set<string>>>().toEqualTypeOf<FormInstrumentSetField>();
  expectTypeOf<FormInstrumentStaticField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrumentStringField>();
  expectTypeOf<FormInstrumentStaticField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrumentNumberField>();
  expectTypeOf<FormInstrumentStaticField<InstrumentLanguage, boolean>>().toEqualTypeOf<FormInstrumentBooleanField>();
  expectTypeOf<
    FormInstrumentStaticField<InstrumentLanguage, RequiredFieldValue<NumberRecordFieldValue>>
  >().toEqualTypeOf<FormInstrumentNumberRecordField>();
  expectTypeOf<
    FormInstrumentStaticField<InstrumentLanguage, RequiredFieldValue<RecordArrayFieldValue>>
  >().toEqualTypeOf<FormInstrumentRecordArrayField>();

  // Union literal keys should resolve correctly
  expectTypeOf<
    keyof Extract<FormInstrumentStaticField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
  >().toEqualTypeOf<'a' | 'b' | 'c'>();
  expectTypeOf<
    keyof Extract<FormInstrumentStaticField<Language, 1 | 2 | 3>, { options: object }>['options']
  >().toEqualTypeOf<1 | 2 | 3>();
  expectTypeOf<keyof FormInstrumentStaticField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
    'a' | 'b' | 'c'
  >();

  // Non-union keys should resolve correctly
  expectTypeOf<
    keyof Extract<FormInstrumentStaticField<Language, string>, { options: object }>['options']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    keyof Extract<FormInstrumentStaticField<Language, number>, { options: object }>['options']
  >().toEqualTypeOf<number>();
  expectTypeOf<keyof FormInstrumentStaticField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
}

/** FormInstrumentUnknownField */
{
  // With no parameters, it should be a union of all types
  expectTypeOf<FormInstrumentUnknownField>().toEqualTypeOf<AnyFormInstrumentField>();
  expectTypeOf<FormInstrumentUnknownField['kind']>().toEqualTypeOf<AnyFormInstrumentField['kind']>();
  expectTypeOf<FormInstrumentUnknownField<{ _: Date }>['kind']>().toEqualTypeOf<'date' | 'dynamic'>();
  expectTypeOf<FormInstrumentUnknownField<{ _: Set<string> }>['kind']>().toEqualTypeOf<'dynamic' | 'set'>();
  expectTypeOf<FormInstrumentUnknownField<{ _: string }>['kind']>().toEqualTypeOf<'dynamic' | 'string'>();
  expectTypeOf<FormInstrumentUnknownField<{ _: number }>['kind']>().toEqualTypeOf<'dynamic' | 'number'>();
  expectTypeOf<FormInstrumentUnknownField<{ _: boolean }>['kind']>().toEqualTypeOf<'boolean' | 'dynamic'>();
  expectTypeOf<FormInstrumentUnknownField<{ _: RecordArrayFieldValue }>['kind']>().toEqualTypeOf<
    'dynamic' | 'record-array'
  >();
  expectTypeOf<FormInstrumentUnknownField<{ _: NumberRecordFieldValue }>['kind']>().toEqualTypeOf<
    'dynamic' | 'number-record'
  >();
}

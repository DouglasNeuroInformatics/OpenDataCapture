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
  FormInstrumentDynamicField,
  FormInstrumentFields,
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
  /** Default Parameters */
  {
    expectTypeOf<FormInstrumentScalarField['kind']>().toMatchTypeOf<AnyFormInstrumentScalarField['kind']>();
    expectTypeOf<FormInstrumentScalarField>().toMatchTypeOf<AnyFormInstrumentScalarField>();
  }

  /** Value Types */
  {
    expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrumentDateField>();
    expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Set<string>>>().toEqualTypeOf<FormInstrumentSetField>();
    expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrumentStringField>();
    expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrumentNumberField>();
    expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, boolean>>().toEqualTypeOf<FormInstrumentBooleanField>();
  }

  /** Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrumentScalarField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
    >().toEqualTypeOf<'a' | 'b' | 'c'>();
    expectTypeOf<
      keyof Extract<FormInstrumentScalarField<Language, 1 | 2 | 3>, { options: object }>['options']
    >().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf<keyof FormInstrumentScalarField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
      'a' | 'b' | 'c'
    >();
  }

  /** Non-Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrumentScalarField<Language, string>, { options: object }>['options']
    >().toEqualTypeOf<string>();
    expectTypeOf<
      keyof Extract<FormInstrumentScalarField<Language, number>, { options: object }>['options']
    >().toEqualTypeOf<number>();
    expectTypeOf<keyof FormInstrumentScalarField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
  }
}

/** FormInstrumentStaticField */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrumentStaticField>().toEqualTypeOf<AnyFormInstrumentStaticField>();
    expectTypeOf<FormInstrumentStaticField['kind']>().toEqualTypeOf<AnyFormInstrumentStaticField['kind']>();
  }

  /** Value Types */
  {
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
  }

  /** Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrumentStaticField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
    >().toEqualTypeOf<'a' | 'b' | 'c'>();
    expectTypeOf<
      keyof Extract<FormInstrumentStaticField<Language, 1 | 2 | 3>, { options: object }>['options']
    >().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf<keyof FormInstrumentStaticField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
      'a' | 'b' | 'c'
    >();
  }

  /** Non-Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrumentStaticField<Language, string>, { options: object }>['options']
    >().toEqualTypeOf<string>();
    expectTypeOf<
      keyof Extract<FormInstrumentStaticField<Language, number>, { options: object }>['options']
    >().toEqualTypeOf<number>();
    expectTypeOf<keyof FormInstrumentStaticField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
  }
}

/** FormInstrumentUnknownField */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrumentUnknownField>().toEqualTypeOf<AnyFormInstrumentField>();
    expectTypeOf<FormInstrumentUnknownField['kind']>().toEqualTypeOf<AnyFormInstrumentField['kind']>();
  }

  /** Value Types */
  {
    /** Boolean */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: boolean }>['kind']>().toEqualTypeOf<'boolean' | 'dynamic'>();
      expectTypeOf<FormInstrumentUnknownField<{ _: boolean }>>().toEqualTypeOf<
        FormInstrumentBooleanField | FormInstrumentDynamicField<{ _: boolean }, boolean>
      >();
    }

    /** Date */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: Date }>['kind']>().toEqualTypeOf<'date' | 'dynamic'>();
      expectTypeOf<FormInstrumentUnknownField<{ _: Date }>>().toEqualTypeOf<
        FormInstrumentDateField | FormInstrumentDynamicField<{ _: Date }, Date>
      >();
    }

    /** Number */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: number }>['kind']>().toEqualTypeOf<'dynamic' | 'number'>();
      expectTypeOf<FormInstrumentUnknownField<{ _: number }>>().toEqualTypeOf<
        FormInstrumentDynamicField<{ _: number }, number> | FormInstrumentNumberField
      >();
      expectTypeOf<FormInstrumentNumberField<Language, 1 | 2 | 3>>().toMatchTypeOf<
        FormInstrumentUnknownField<{ _: 1 | 2 | 3 }, '_', Language>
      >();
      expectTypeOf<
        keyof Extract<FormInstrumentNumberField<Language, 1 | 2 | 3>, { options: object }>['options']
      >().toEqualTypeOf<1 | 2 | 3>();
      expectTypeOf<
        keyof Extract<FormInstrumentUnknownField<{ _: number }, '_', Language>, { options: object }>['options']
      >().toBeNumber();
    }

    /** Set */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: Set<string> }>['kind']>().toEqualTypeOf<'dynamic' | 'set'>();
      expectTypeOf<FormInstrumentUnknownField<{ _: Set<string> }>>().toEqualTypeOf<
        FormInstrumentDynamicField<{ _: Set<string> }, Set<string>> | FormInstrumentSetField
      >();
      expectTypeOf<FormInstrumentUnknownField<{ _: Set<'a' | 'b' | 'c'> }, '_', Language>>().toEqualTypeOf<
        | FormInstrumentDynamicField<{ _: Set<'a' | 'b' | 'c'> }, Set<'a' | 'b' | 'c'>, Language>
        | FormInstrumentSetField<Language, Set<'a' | 'b' | 'c'>>
      >();
      expectTypeOf<
        keyof Extract<
          FormInstrumentUnknownField<{ _: Set<'a' | 'b' | 'c'> }, '_', Language>,
          { options: object }
        >['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
      expectTypeOf<
        keyof Extract<FormInstrumentUnknownField<{ _: Set<string> }, '_', Language>, { options: object }>['options']
      >().toBeString();
    }

    /** String */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: string }>['kind']>().toEqualTypeOf<'dynamic' | 'string'>();
      expectTypeOf<FormInstrumentUnknownField<{ _: string }>>().toEqualTypeOf<
        FormInstrumentDynamicField<{ _: string }, string> | FormInstrumentStringField
      >();
      expectTypeOf<FormInstrumentUnknownField<{ _: 'a' | 'b' | 'c' }, '_', Language>>().toEqualTypeOf<
        | FormInstrumentDynamicField<{ _: 'a' | 'b' | 'c' }, 'a' | 'b' | 'c', Language>
        | FormInstrumentStringField<Language, 'a' | 'b' | 'c'>
      >();
      expectTypeOf<
        keyof Extract<FormInstrumentUnknownField<{ _: 'a' | 'b' | 'c' }, '_', Language>, { options: object }>['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
      expectTypeOf<
        keyof Extract<FormInstrumentUnknownField<{ _: string }, '_', Language>, { options: object }>['options']
      >().toBeString();
    }

    /** Record Array */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: RecordArrayFieldValue }>['kind']>().toEqualTypeOf<
        'dynamic' | 'record-array'
      >();
      expectTypeOf<FormInstrumentUnknownField<{ _: RecordArrayFieldValue }>>().toEqualTypeOf<
        | FormInstrumentDynamicField<{ _: RecordArrayFieldValue }, RequiredFieldValue<RecordArrayFieldValue>>
        | FormInstrumentRecordArrayField
      >();
    }

    /** Number Record */
    {
      expectTypeOf<FormInstrumentUnknownField<{ _: NumberRecordFieldValue }>['kind']>().toEqualTypeOf<
        'dynamic' | 'number-record'
      >();
      expectTypeOf<FormInstrumentUnknownField<{ _: NumberRecordFieldValue }>>().toEqualTypeOf<
        | FormInstrumentDynamicField<{ _: NumberRecordFieldValue }, RequiredFieldValue<NumberRecordFieldValue>>
        | FormInstrumentNumberRecordField
      >();
    }
  }
}

/** FormInstrumentFields */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrumentFields[string]>().toEqualTypeOf<FormInstrumentUnknownField>();
    expectTypeOf<FormInstrumentFields[string]>().toEqualTypeOf<AnyFormInstrumentField>();
  }

  /** Scalar Value Types */
  {
    type TData = {
      boolean: boolean;
      date: Date;
      number: number;
      numberUnion: 1 | 2 | 3;
      set: Set<string>;
      setUnion: Set<'a' | 'b' | 'c'>;
      string: string;
      stringUnion: 'a' | 'b' | 'c';
    };
    type TLanguage = Language;
    type TFields = FormInstrumentFields<TData, TLanguage>;

    expectTypeOf<Extract<keyof TFields, FormInstrumentScalarField['kind']>>().toEqualTypeOf<
      FormInstrumentScalarField['kind']
    >();

    /** Boolean */
    {
      expectTypeOf<TFields['boolean']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'boolean', TLanguage>>();
      expectTypeOf<Extract<TFields['boolean'], { kind: 'boolean' }>>().toEqualTypeOf<
        FormInstrumentBooleanField<TLanguage>
      >();
    }
    /** Date */
    {
      expectTypeOf<TFields['date']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'date', TLanguage>>();
      expectTypeOf<Extract<TFields['date'], { kind: 'date' }>>().toEqualTypeOf<FormInstrumentDateField<TLanguage>>();
    }

    /** Number */
    {
      expectTypeOf<TFields['number']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'number', TLanguage>>();
      expectTypeOf<Extract<TFields['number'], { kind: 'number' }>>().toEqualTypeOf<
        FormInstrumentNumberField<TLanguage>
      >();
      expectTypeOf<Extract<TFields['number'], { kind: 'number' }>>().toEqualTypeOf<
        FormInstrumentNumberField<TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['number'], { kind: 'number'; options: object }>['options']
      >().toEqualTypeOf<number>();
      expectTypeOf<TFields['numberUnion']>().toEqualTypeOf<
        FormInstrumentUnknownField<TData, 'numberUnion', TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['numberUnion'], { kind: 'number'; options: object }>['options']
      >().toEqualTypeOf<TData['numberUnion']>();
    }

    /** Set */
    {
      expectTypeOf<TFields['set']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'set', TLanguage>>();
      expectTypeOf<Extract<TFields['set'], { kind: 'set' }>>().toEqualTypeOf<FormInstrumentSetField<TLanguage>>();
      expectTypeOf<Extract<TFields['set'], { kind: 'set' }>>().toEqualTypeOf<FormInstrumentSetField<TLanguage>>();
      expectTypeOf<
        keyof Extract<TFields['set'], { kind: 'set'; options: object }>['options']
      >().toEqualTypeOf<string>();
      expectTypeOf<TFields['setUnion']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'setUnion', TLanguage>>();
      expectTypeOf<keyof Extract<TFields['setUnion'], { kind: 'set'; options: object }>['options']>().toEqualTypeOf<
        'a' | 'b' | 'c'
      >();
    }

    /** String */
    {
      expectTypeOf<TFields['string']>().toEqualTypeOf<FormInstrumentUnknownField<TData, 'string', TLanguage>>();
      expectTypeOf<Extract<TFields['string'], { kind: 'string' }>>().toEqualTypeOf<
        FormInstrumentStringField<TLanguage>
      >();
      expectTypeOf<Extract<TFields['string'], { kind: 'string' }>>().toEqualTypeOf<
        FormInstrumentStringField<TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['string'], { kind: 'string'; options: object }>['options']
      >().toEqualTypeOf<string>();
      expectTypeOf<TFields['stringUnion']>().toEqualTypeOf<
        FormInstrumentUnknownField<TData, 'stringUnion', TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['stringUnion'], { kind: 'string'; options: object }>['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
    }
  }

  /** Composite Value Types */

  /** Dynamic */
}

import type FormTypes from '@douglasneuroinformatics/libui-form-types';
import { expectTypeOf } from 'expect-type';

import type { Language } from '../core.js';
import type { InstrumentLanguage } from '../instrument.base.js';
import type { FormInstrument } from '../instrument.form.js';

/** FormInstrument.ScalarField */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrument.ScalarField['kind']>().toMatchTypeOf<FormInstrument.AnyScalarField['kind']>();
    expectTypeOf<FormInstrument.ScalarField>().toMatchTypeOf<FormInstrument.AnyScalarField>();
  }

  /** Value Types */
  {
    expectTypeOf<FormInstrument.ScalarField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrument.DateField>();
    expectTypeOf<
      FormInstrument.ScalarField<InstrumentLanguage, Set<string>>
    >().toEqualTypeOf<FormInstrument.SetField>();
    expectTypeOf<FormInstrument.ScalarField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrument.StringField>();
    expectTypeOf<FormInstrument.ScalarField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrument.NumberField>();
    expectTypeOf<
      FormInstrument.ScalarField<InstrumentLanguage, boolean>
    >().toEqualTypeOf<FormInstrument.BooleanField>();
  }

  /** Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrument.ScalarField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
    >().toEqualTypeOf<'a' | 'b' | 'c'>();
    expectTypeOf<
      keyof Extract<FormInstrument.ScalarField<Language, 1 | 2 | 3>, { options: object }>['options']
    >().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf<keyof FormInstrument.ScalarField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
      'a' | 'b' | 'c'
    >();
  }

  /** Non-Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrument.ScalarField<Language, string>, { options: object }>['options']
    >().toEqualTypeOf<string>();
    expectTypeOf<
      keyof Extract<FormInstrument.ScalarField<Language, number>, { options: object }>['options']
    >().toEqualTypeOf<number>();
    expectTypeOf<keyof FormInstrument.ScalarField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
  }
}

/** FormInstrument.StaticField */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrument.StaticField>().toEqualTypeOf<FormInstrument.AnyStaticField>();
    expectTypeOf<FormInstrument.StaticField['kind']>().toEqualTypeOf<FormInstrument.AnyStaticField['kind']>();
  }

  /** Value Types */
  {
    expectTypeOf<FormInstrument.StaticField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrument.DateField>();
    expectTypeOf<
      FormInstrument.StaticField<InstrumentLanguage, Set<string>>
    >().toEqualTypeOf<FormInstrument.SetField>();
    expectTypeOf<FormInstrument.StaticField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrument.StringField>();
    expectTypeOf<FormInstrument.StaticField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrument.NumberField>();
    expectTypeOf<
      FormInstrument.StaticField<InstrumentLanguage, boolean>
    >().toEqualTypeOf<FormInstrument.BooleanField>();
    expectTypeOf<
      FormInstrument.StaticField<InstrumentLanguage, FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>>
    >().toEqualTypeOf<FormInstrument.NumberRecordField>();
    expectTypeOf<
      FormInstrument.StaticField<InstrumentLanguage, FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>>
    >().toEqualTypeOf<FormInstrument.RecordArrayField>();
  }

  /** Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrument.StaticField<Language, 'a' | 'b' | 'c'>, { options: object }>['options']
    >().toEqualTypeOf<'a' | 'b' | 'c'>();
    expectTypeOf<
      keyof Extract<FormInstrument.StaticField<Language, 1 | 2 | 3>, { options: object }>['options']
    >().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf<keyof FormInstrument.StaticField<Language, Set<'a' | 'b' | 'c'>>['options']>().toEqualTypeOf<
      'a' | 'b' | 'c'
    >();
  }

  /** Non-Literal Keys */
  {
    expectTypeOf<
      keyof Extract<FormInstrument.StaticField<Language, string>, { options: object }>['options']
    >().toEqualTypeOf<string>();
    expectTypeOf<
      keyof Extract<FormInstrument.StaticField<Language, number>, { options: object }>['options']
    >().toEqualTypeOf<number>();
    expectTypeOf<keyof FormInstrument.StaticField<Language, Set<string>>['options']>().toEqualTypeOf<string>();
  }
}

/** FormInstrument.UnknownField */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrument.UnknownField>().toEqualTypeOf<FormInstrument.AnyField>();
    expectTypeOf<FormInstrument.UnknownField['kind']>().toEqualTypeOf<FormInstrument.AnyField['kind']>();
  }

  /** Value Types */
  {
    /** Boolean */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: boolean }>['kind']>().toEqualTypeOf<'boolean' | 'dynamic'>();
      expectTypeOf<FormInstrument.UnknownField<{ _: boolean }>>().toEqualTypeOf<
        FormInstrument.BooleanField | FormInstrument.DynamicField<{ _: boolean }, boolean>
      >();
    }

    /** Date */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: Date }>['kind']>().toEqualTypeOf<'date' | 'dynamic'>();
      expectTypeOf<FormInstrument.UnknownField<{ _: Date }>>().toEqualTypeOf<
        FormInstrument.DateField | FormInstrument.DynamicField<{ _: Date }, Date>
      >();
    }

    /** Number */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: number }>['kind']>().toEqualTypeOf<'dynamic' | 'number'>();
      expectTypeOf<FormInstrument.UnknownField<{ _: number }>>().toEqualTypeOf<
        FormInstrument.DynamicField<{ _: number }, number> | FormInstrument.NumberField
      >();
      expectTypeOf<FormInstrument.NumberField<Language, 1 | 2 | 3>>().toMatchTypeOf<
        FormInstrument.UnknownField<{ _: 1 | 2 | 3 }, '_', Language>
      >();
      expectTypeOf<
        keyof Extract<FormInstrument.NumberField<Language, 1 | 2 | 3>, { options: object }>['options']
      >().toEqualTypeOf<1 | 2 | 3>();
      expectTypeOf<
        keyof Extract<FormInstrument.UnknownField<{ _: number }, '_', Language>, { options: object }>['options']
      >().toBeNumber();
    }

    /** Set */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: Set<string> }>['kind']>().toEqualTypeOf<'dynamic' | 'set'>();
      expectTypeOf<FormInstrument.UnknownField<{ _: Set<string> }>>().toEqualTypeOf<
        FormInstrument.DynamicField<{ _: Set<string> }, Set<string>> | FormInstrument.SetField
      >();
      expectTypeOf<FormInstrument.UnknownField<{ _: Set<'a' | 'b' | 'c'> }, '_', Language>>().toEqualTypeOf<
        | FormInstrument.DynamicField<{ _: Set<'a' | 'b' | 'c'> }, Set<'a' | 'b' | 'c'>, Language>
        | FormInstrument.SetField<Language, Set<'a' | 'b' | 'c'>>
      >();
      expectTypeOf<
        keyof Extract<
          FormInstrument.UnknownField<{ _: Set<'a' | 'b' | 'c'> }, '_', Language>,
          { options: object }
        >['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
      expectTypeOf<
        keyof Extract<FormInstrument.UnknownField<{ _: Set<string> }, '_', Language>, { options: object }>['options']
      >().toBeString();
    }

    /** String */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: string }>['kind']>().toEqualTypeOf<'dynamic' | 'string'>();
      expectTypeOf<FormInstrument.UnknownField<{ _: string }>>().toEqualTypeOf<
        FormInstrument.DynamicField<{ _: string }, string> | FormInstrument.StringField
      >();
      expectTypeOf<FormInstrument.UnknownField<{ _: 'a' | 'b' | 'c' }, '_', Language>>().toEqualTypeOf<
        | FormInstrument.DynamicField<{ _: 'a' | 'b' | 'c' }, 'a' | 'b' | 'c', Language>
        | FormInstrument.StringField<Language, 'a' | 'b' | 'c'>
      >();
      expectTypeOf<
        keyof Extract<
          FormInstrument.UnknownField<{ _: 'a' | 'b' | 'c' }, '_', Language>,
          { options: object }
        >['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
      expectTypeOf<
        keyof Extract<FormInstrument.UnknownField<{ _: string }, '_', Language>, { options: object }>['options']
      >().toBeString();
    }

    /** Record Array */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: FormTypes.RecordArrayFieldValue }>['kind']>().toEqualTypeOf<
        'dynamic' | 'record-array'
      >();
      expectTypeOf<FormInstrument.UnknownField<{ _: FormTypes.RecordArrayFieldValue }>>().toEqualTypeOf<
        | FormInstrument.DynamicField<
            { _: FormTypes.RecordArrayFieldValue },
            FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>
          >
        | FormInstrument.RecordArrayField
      >();
    }

    /** Number Record */
    {
      expectTypeOf<FormInstrument.UnknownField<{ _: FormTypes.NumberRecordFieldValue }>['kind']>().toEqualTypeOf<
        'dynamic' | 'number-record'
      >();
      expectTypeOf<FormInstrument.UnknownField<{ _: FormTypes.NumberRecordFieldValue }>>().toEqualTypeOf<
        | FormInstrument.DynamicField<
            { _: FormTypes.NumberRecordFieldValue },
            FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>
          >
        | FormInstrument.NumberRecordField
      >();
    }
  }
}

/** FormInstrument.Fields */
{
  /** Default Parameters */
  {
    expectTypeOf<FormInstrument.Fields[string]>().toEqualTypeOf<FormInstrument.UnknownField>();
    expectTypeOf<FormInstrument.Fields[string]>().toEqualTypeOf<FormInstrument.AnyField>();
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
    type TFields = FormInstrument.Fields<TData, TLanguage>;

    expectTypeOf<Extract<keyof TFields, FormInstrument.ScalarField['kind']>>().toEqualTypeOf<
      FormInstrument.ScalarField['kind']
    >();

    /** Boolean */
    {
      expectTypeOf<TFields['boolean']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'boolean', TLanguage>>();
      expectTypeOf<Extract<TFields['boolean'], { kind: 'boolean' }>>().toEqualTypeOf<
        FormInstrument.BooleanField<TLanguage>
      >();
    }
    /** Date */
    {
      expectTypeOf<TFields['date']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'date', TLanguage>>();
      expectTypeOf<Extract<TFields['date'], { kind: 'date' }>>().toEqualTypeOf<FormInstrument.DateField<TLanguage>>();
    }

    /** Number */
    {
      expectTypeOf<TFields['number']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'number', TLanguage>>();
      expectTypeOf<Extract<TFields['number'], { kind: 'number' }>>().toEqualTypeOf<
        FormInstrument.NumberField<TLanguage>
      >();
      expectTypeOf<Extract<TFields['number'], { kind: 'number' }>>().toEqualTypeOf<
        FormInstrument.NumberField<TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['number'], { kind: 'number'; options: object }>['options']
      >().toEqualTypeOf<number>();
      expectTypeOf<TFields['numberUnion']>().toEqualTypeOf<
        FormInstrument.UnknownField<TData, 'numberUnion', TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['numberUnion'], { kind: 'number'; options: object }>['options']
      >().toEqualTypeOf<TData['numberUnion']>();
    }

    /** Set */
    {
      expectTypeOf<TFields['set']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'set', TLanguage>>();
      expectTypeOf<Extract<TFields['set'], { kind: 'set' }>>().toEqualTypeOf<FormInstrument.SetField<TLanguage>>();
      expectTypeOf<Extract<TFields['set'], { kind: 'set' }>>().toEqualTypeOf<FormInstrument.SetField<TLanguage>>();
      expectTypeOf<
        keyof Extract<TFields['set'], { kind: 'set'; options: object }>['options']
      >().toEqualTypeOf<string>();
      expectTypeOf<TFields['setUnion']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'setUnion', TLanguage>>();
      expectTypeOf<keyof Extract<TFields['setUnion'], { kind: 'set'; options: object }>['options']>().toEqualTypeOf<
        'a' | 'b' | 'c'
      >();
    }

    /** String */
    {
      expectTypeOf<TFields['string']>().toEqualTypeOf<FormInstrument.UnknownField<TData, 'string', TLanguage>>();
      expectTypeOf<Extract<TFields['string'], { kind: 'string' }>>().toEqualTypeOf<
        FormInstrument.StringField<TLanguage>
      >();
      expectTypeOf<Extract<TFields['string'], { kind: 'string' }>>().toEqualTypeOf<
        FormInstrument.StringField<TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['string'], { kind: 'string'; options: object }>['options']
      >().toEqualTypeOf<string>();
      expectTypeOf<TFields['stringUnion']>().toEqualTypeOf<
        FormInstrument.UnknownField<TData, 'stringUnion', TLanguage>
      >();
      expectTypeOf<
        keyof Extract<TFields['stringUnion'], { kind: 'string'; options: object }>['options']
      >().toEqualTypeOf<'a' | 'b' | 'c'>();
    }
  }

  /** Composite Value Types */

  /** Dynamic */
}

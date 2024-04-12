import { expectTypeOf } from 'expect-type';

import type { InstrumentLanguage } from '../instrument.base.ts';
import type {
  FormInstrumentBooleanField,
  FormInstrumentDateField,
  FormInstrumentNumberField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStringField
} from '../instrument.form.ts';

/** FormInstrumentScalarField */
{
  // Default date types passed into FormInstrumentScalarField should resolve the default FormInstrument[Type]Field(s)
  expectTypeOf<FormInstrumentScalarField['kind']>().toMatchTypeOf<'boolean' | 'date' | 'number' | 'set' | 'string'>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Date>>().toEqualTypeOf<FormInstrumentDateField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, Set<string>>>().toEqualTypeOf<FormInstrumentSetField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, string>>().toEqualTypeOf<FormInstrumentStringField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, number>>().toEqualTypeOf<FormInstrumentNumberField>();
  expectTypeOf<FormInstrumentScalarField<InstrumentLanguage, boolean>>().toEqualTypeOf<FormInstrumentBooleanField>();
}

import type {
  AnyMultilingualFormInstrument,
  AnyScalarInstrument,
  FormInstrument,
  InstrumentKind,
  InstrumentSummary,
  InteractiveInstrument,
  MultilingualInstrumentSummary,
  SomeScalarInstrument,
  SomeUnilingualScalarInstrument,
  UnilingualInstrumentSummary
} from '@opendatacapture/schemas/instrument';

export function isUnilingualInstrument<TKind extends InstrumentKind>(
  instrument: SomeScalarInstrument<TKind>
): instrument is SomeUnilingualScalarInstrument<TKind> {
  return typeof instrument.language === 'string';
}

export function isUnilingualInstrumentSummary(summary: InstrumentSummary): summary is UnilingualInstrumentSummary {
  return typeof summary.language === 'string';
}

export function isMultilingualInstrument(instrument: AnyScalarInstrument): instrument is AnyMultilingualFormInstrument {
  return Array.isArray(instrument.language);
}

export function isMultilingualInstrumentSummary(summary: InstrumentSummary): summary is MultilingualInstrumentSummary {
  return Array.isArray(summary.language);
}

export function isFormInstrument(instrument: AnyScalarInstrument): instrument is FormInstrument {
  return instrument.kind === 'FORM';
}

export function isInteractiveInstrument(instrument: AnyScalarInstrument): instrument is InteractiveInstrument {
  return instrument.kind === 'INTERACTIVE';
}

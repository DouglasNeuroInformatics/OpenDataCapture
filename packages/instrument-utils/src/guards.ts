import type {
  AnyInstrument,
  FormInstrument,
  InstrumentKind,
  InteractiveInstrument,
  SomeInstrument,
  SomeMultilingualInstrument,
  SomeUnilingualInstrument
} from '@open-data-capture/common/instrument';

export function isUnilingualInstrument<TKind extends InstrumentKind>(
  instrument: SomeInstrument<TKind>
): instrument is SomeUnilingualInstrument<TKind> {
  return typeof instrument.language === 'string';
}

export function isMultilingualInstrument<TKind extends InstrumentKind>(
  instrument: SomeInstrument<TKind>
): instrument is SomeMultilingualInstrument<TKind> {
  return Array.isArray(instrument.language);
}

export function isFormInstrument(instrument: AnyInstrument): instrument is FormInstrument {
  return instrument.kind === 'FORM';
}

export function isInteractiveInstrument(instrument: AnyInstrument): instrument is InteractiveInstrument {
  return instrument.kind === 'INTERACTIVE';
}

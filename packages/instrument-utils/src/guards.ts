import type {
  AnyInstrument,
  AnyMultilingualInstrument,
  AnyScalarInstrument,
  AnyUnilingualInstrument,
  FormInstrument,
  InstrumentSummary,
  InteractiveInstrument,
  MultilingualInstrumentSummary,
  SeriesInstrument,
  UnilingualInstrumentSummary
} from '@opendatacapture/schemas/instrument';

export function isUnilingualInstrument(instrument: AnyInstrument): instrument is AnyUnilingualInstrument {
  return typeof instrument.language === 'string';
}

export function isUnilingualInstrumentSummary(summary: InstrumentSummary): summary is UnilingualInstrumentSummary {
  return typeof summary.language === 'string';
}

export function isMultilingualInstrument(instrument: AnyInstrument): instrument is AnyMultilingualInstrument {
  return Array.isArray(instrument.language);
}

export function isMultilingualInstrumentSummary(summary: InstrumentSummary): summary is MultilingualInstrumentSummary {
  return Array.isArray(summary.language);
}

export function isFormInstrument(instrument: AnyInstrument): instrument is FormInstrument {
  return instrument.kind === 'FORM';
}

export function isInteractiveInstrument(instrument: AnyInstrument): instrument is InteractiveInstrument {
  return instrument.kind === 'INTERACTIVE';
}

export function isSeriesInstrument(instrument: AnyInstrument): instrument is SeriesInstrument {
  return instrument.kind === 'SERIES';
}

export function isScalarInstrument(instrument: AnyInstrument): instrument is AnyScalarInstrument {
  return Object.hasOwn(instrument, 'internal');
}

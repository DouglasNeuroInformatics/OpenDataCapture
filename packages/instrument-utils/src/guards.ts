import type {
  AnyInstrument,
  AnyMultilingualInstrument,
  AnyScalarInstrument,
  AnyUnilingualInstrument,
  FormInstrument,
  InteractiveInstrument,
  SeriesInstrument
} from '@opendatacapture/runtime-core';
import type {
  InstrumentInfo,
  MultilingualInstrumentInfo,
  UnilingualInstrumentInfo
} from '@opendatacapture/schemas/instrument';

export function isUnilingualInstrument(instrument: AnyInstrument): instrument is AnyUnilingualInstrument {
  return typeof instrument.language === 'string';
}

export function isUnilingualInstrumentInfo(info: InstrumentInfo): info is UnilingualInstrumentInfo {
  return typeof info.language === 'string';
}

export function isMultilingualInstrument(instrument: AnyInstrument): instrument is AnyMultilingualInstrument {
  return Array.isArray(instrument.language);
}

export function isMultilingualInstrumentInfo(info: InstrumentInfo): info is MultilingualInstrumentInfo {
  return Array.isArray(info.language);
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

import type { InstrumentKind } from '@opendatacapture/runtime-core';

export type InstrumentShowcaseKindOption = {
  key: InstrumentKind;
  label: string;
};

export type InstrumentShowcaseFilters = {
  kind: InstrumentShowcaseKindOption[];
};

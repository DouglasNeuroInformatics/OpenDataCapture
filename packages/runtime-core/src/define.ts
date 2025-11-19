/// <reference types="../../../runtime/v1/global.d.ts" />

import type { ApprovedLicense } from '@opendatacapture/licenses';

import type { InstrumentKind, InstrumentLanguage, InstrumentValidationSchema } from './types/instrument.base.js';
import type { FormInstrument } from './types/instrument.form.js';
import type { InteractiveInstrument } from './types/instrument.interactive.js';
import type { SeriesInstrument } from './types/instrument.series.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type
  interface OpenDataCaptureContext {}
}

type InternalLicensingRequirements = OpenDataCaptureContext extends { isRepo: true }
  ? {
      details: {
        license: ApprovedLicense;
      };
    }
  : unknown;

/** @public */
// prettier-ignore
export type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TData
> = [TKind] extends ['FORM']
  ? TData extends FormInstrument.Data
    ? FormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['INTERACTIVE']
    ? TData extends InteractiveInstrument.Data
      ? InteractiveInstrument<TData, TLanguage>
      : never
    : never;

/** @public */
export type InstrumentDef<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends InstrumentValidationSchema
> = InternalLicensingRequirements &
  Omit<
    DiscriminatedInstrument<TKind, TLanguage, TSchema['_output']>,
    '__runtimeVersion' | 'kind' | 'language' | 'validationSchema'
  > & {
    kind: TKind;
    language: TLanguage;
    validationSchema: TSchema;
  };

/** @public */
export function defineInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends InstrumentValidationSchema
>(def: InstrumentDef<TKind, TLanguage, TSchema>) {
  return Object.assign(def, {
    __runtimeVersion: 1
  }) as unknown as DiscriminatedInstrument<TKind, TLanguage, TSchema['_output']>;
}

/** @public */
export function defineSeriesInstrument<TLanguage extends InstrumentLanguage>(
  def: Omit<SeriesInstrument<TLanguage>, '__runtimeVersion'>
): SeriesInstrument<TLanguage> {
  return Object.assign(def, {
    __runtimeVersion: 1 as const
  });
}

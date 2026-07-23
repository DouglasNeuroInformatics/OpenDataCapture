/* eslint-disable @typescript-eslint/no-namespace */

import type { InstrumentKind, Json } from '@opendatacapture/runtime-core';
import type { Promisable, Simplify } from 'type-fest';

import type { FileInstrumentContentSubmitResult } from '../FileInstrumentContent';
import type { FormContentSubmitResult } from '../FormContent';
import type { InteractiveContentSubmitResult } from '../InteractiveContent';

export type AnyContentResult =
  | FileInstrumentContentSubmitResult
  | FormContentSubmitResult
  | InteractiveContentSubmitResult;

export namespace InstrumentSubmitHandler {
  type ContextMixin<TResult extends { [key: string]: any }> = Simplify<
    TResult & {
      data: Json;
      instrumentId: string;
    }
  >;

  type FileContext = ContextMixin<FileInstrumentContentSubmitResult>;

  type FormContext = ContextMixin<FormContentSubmitResult>;

  type InteractiveContext = ContextMixin<InteractiveContentSubmitResult>;

  type SeriesContext = ContextMixin<{
    complete: boolean;
    index: number;
    kind: Extract<InstrumentKind, 'SERIES'>;
    /** The id of the series instrument orchestrating this submission (instrumentId is the scalar item). */
    seriesInstrumentId: string;
  }>;

  export type ScalarContext = FileContext | FormContext | InteractiveContext;

  export type AnyContext = ScalarContext | SeriesContext;
}

export type InstrumentSubmitHandler<TKind extends InstrumentKind = any> = (
  context: Extract<InstrumentSubmitHandler.AnyContext, { kind: TKind }>
) => Promisable<void>;

import type { Class } from 'type-fest';

import type { BuildFailure } from './vendor/esbuild.js';

type InstrumentBundlerErrorInstance =
  | {
      cause: BuildFailure;
      kind: 'ESBUILD_FAILURE';
    }
  | {
      cause?: unknown;
      kind?: undefined;
    };

type InstrumentBundlerErrorKind = InstrumentBundlerErrorInstance['kind'];

type InstrumentBundlerErrorOptions = ErrorOptions & { kind?: InstrumentBundlerErrorKind };

type InstrumentBundlerErrorClass = Class<
  Error & InstrumentBundlerErrorInstance,
  [string, InstrumentBundlerErrorOptions] | [string]
> & {
  isInstance<TKind extends InstrumentBundlerErrorKind>(
    arg: unknown,
    kind: TKind
  ): arg is Extract<InstrumentBundlerErrorInstance, { kind: TKind }>;
};

export const InstrumentBundlerError: InstrumentBundlerErrorClass = class extends Error {
  kind: any;
  constructor(message: string, options?: InstrumentBundlerErrorOptions) {
    super(message, options);
    this.kind = options?.kind;
    this.name = 'InstrumentBundlerError';
  }

  static isInstance<TKind extends InstrumentBundlerErrorKind>(
    arg: unknown,
    kind: TKind
  ): arg is Extract<InstrumentBundlerErrorInstance, { kind: TKind }> {
    return Boolean(arg instanceof this && arg.kind === kind);
  }
};

export type { BuildFailure as ESBuildFailure };

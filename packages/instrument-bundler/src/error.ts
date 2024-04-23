import type { BuildFailure } from './vendor/esbuild.js';

export abstract class InstrumentBundlerError extends Error {
  public abstract name: string;
}

export abstract class InstrumentBundlerInternalError extends InstrumentBundlerError {
  public abstract name: string;
}

/**
 * Thrown when the build process fails, likely due to a syntax error
 */
export class InstrumentBundlerBuildError extends InstrumentBundlerError {
  public cause: BuildFailure;
  public name = 'InstrumentBundlerBuildError' as const;

  private constructor(message: string, { cause, ...options }: { cause: BuildFailure } & ErrorOptions) {
    super(message, options);
    this.cause = cause;
  }

  static fromBuildFailure(buildFailure: BuildFailure) {
    return new this(buildFailure.message, { cause: buildFailure });
  }
}

export class InstrumentBundlerInputValidationError extends InstrumentBundlerInternalError {
  public name = 'InstrumentBundlerInputValidationError' as const;
}
/**
 * Thrown when the build process is successful, but the result does not match the expected structure,
 * which likely indicates a logic error in our code rather than user-error.
 */
export class InstrumentBundlerBuildValidationError extends InstrumentBundlerInternalError {
  public name = 'InstrumentBundlerBuildValidationError' as const;
}

export class InstrumentBundlerMiscInternalError extends InstrumentBundlerInternalError {
  public name = 'InstrumentBundlerMiscInternalError' as const;
}

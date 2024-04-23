import type { BuildFailure } from 'esbuild';

export class InstrumentBundlerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = InstrumentBundlerError.name;
  }
}

export class InstrumentBuildFailureError extends InstrumentBundlerError {
  cause: BuildFailure;

  constructor({ cause, ...options }: { cause: BuildFailure } & ErrorOptions) {
    super('Build Failure', options);
    this.cause = cause;
    this.name = InstrumentBuildFailureError.name;
  }

  get errors() {
    return this.cause.errors;
  }

  get warnings() {
    return this.cause.warnings;
  }
}

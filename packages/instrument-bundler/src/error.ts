export class InstrumentBundlerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = InstrumentBundlerError.name;
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
declare interface OpenDataCaptureContext {
  isRepo: typeof import('../../package.json') extends { __isODCRepo: NonNullable<unknown> } ? true : false;
}

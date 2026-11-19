// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- a consuming repo extends this global by declaration merging, which needs an interface
declare interface OpenDataCaptureContext {
  isRepo: typeof import('../../package.json') extends { __isODCRepo: NonNullable<unknown> } ? true : false;
}

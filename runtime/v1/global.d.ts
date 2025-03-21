declare type IsOpenDataCaptureRepo = typeof import('../../package.json') extends { __isODCRepo: NonNullable<unknown> }
  ? true
  : false;

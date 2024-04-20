export type BundleOptions = {
  source: string;
};

export type RequireResolve = (id: string) => any;

export type InstrumentBundlerOptions = {
  resolve?: RequireResolve;
};

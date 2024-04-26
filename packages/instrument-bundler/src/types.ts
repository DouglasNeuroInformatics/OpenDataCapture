export type BundlerInput = {
  content: string;
  name: string;
};

export type BundleOptions = {
  debug?: boolean;
  inputs: BundlerInput[];
};

export type BuildOutput = {
  css?: string;
  js: string;
};

export type BundlerInputFileExtension = '.css' | '.js' | '.jsx' | '.ts' | '.tsx';

export type BundlerInput = {
  content: string;
  name: string;
};

export type BundleOptions = {
  inputs: BundlerInput[];
};

export type BundlerInputFileExtension = '.css' | '.js' | '.jsx' | '.ts' | '.tsx';

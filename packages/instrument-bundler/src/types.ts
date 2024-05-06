export type BundlerInput = {
  content: Uint8Array | string;
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

export type BundlerInputFileExtension =
  | '.css'
  | '.html'
  | '.jpeg'
  | '.jpg'
  | '.js'
  | '.jsx'
  | '.png'
  | '.svg'
  | '.ts'
  | '.tsx'
  | '.webp';

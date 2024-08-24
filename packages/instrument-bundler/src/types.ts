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

export type BuildOutput = {
  css?: string;
  js: string;
};

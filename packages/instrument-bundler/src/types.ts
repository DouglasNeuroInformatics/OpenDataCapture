export type BundlerInputFileExtension =
  | '.css'
  | '.html'
  | '.jpeg'
  | '.jpg'
  | '.js'
  | '.json'
  | '.jsx'
  | '.mp4'
  | '.png'
  | '.svg'
  | '.ts'
  | '.tsx'
  | '.webp';

export type BuildOutput = {
  css?: string;
  js: string;
};
